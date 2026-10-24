// Real SDK workflow only. No deployment, fabricated verdicts or modified chain time.
import {createClient,createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const contract=process.env.DROP_PROOF_CONTRACT;
if(!/^0x[0-9a-fA-F]{40}$/.test(contract||''))throw Error('Set DROP_PROOF_CONTRACT');
const phase=process.argv[2]||'prepare';
const submissionAttempt=process.env.DROP_PROOF_SUBMISSION_ATTEMPT||'1';
if(!['1','2'].includes(submissionAttempt))throw Error('At most two explicit source-ingestion attempts');
if(!['prepare','finish','cleanup','inspect'].includes(phase))throw Error('Use prepare, finish, cleanup or inspect');
const hash=x=>createHash('sha256').update(x).digest('hex');
const publicClient=createClient({chain:studionet});
const local=readFileSync('contracts/drop_proof.py');
if(!local.equals(Buffer.from(await publicClient.getContractCode(contract),'utf8')))throw Error('Source mismatch; no signing');
const read=async(functionName,args=[])=>JSON.parse(String(await createClient({chain:studionet}).readContract({address:contract,functionName,args,transactionHashVariant:'latest-final'})));
const version=await read('get_version');
if(version.version!=='0.4.0'||version.source_policy!=='dual-rpc-finalized-receipts-v4'||version.workflow!=='public-receipt-report-bounty-v3')throw Error('Wrong workflow/source policy');
const keytar=createRequire('C:/Users/admin/AppData/Roaming/npm/node_modules/genlayer/dist/index.js')('keytar');
const names=['lifecycle-a','dbl-owner','dbl-adapter'];
const keys=await Promise.all(names.map(name=>keytar.getPassword('genlayer-cli',`account:${name}`)));
if(keys.some(k=>!k))throw Error('Missing authorized secondary signer');
const actors=keys.map(k=>createAccount(k.startsWith('0x')?k:`0x${k}`));
const expected=['0xfed97e2ae1a8c1983b7ca206b3545e6a2c685e43','0xeb57bc7125fa60d7482ce12058397369ab3581f8','0x2da5393d7bbb9a037dc3abb56dbbc5c150fc843f'];
if(!actors.every((a,i)=>a.address.toLowerCase()===expected[i]))throw Error('Test signer mismatch');
const clients=actors.map(account=>createClient({chain:studionet,account}));
const txHash='0xa260fb7083ccfc0c54f88e0995e6bfc3b97a1adb6a1a20ebc0b887e47a7d3af6';
const url=`https://arbiscan.io/tx/${txHash}`;
const policy='Research bounty for a sponsor-selected public Arbitrum One receipt. Explain execution status, distinguish the transaction destination from its event emitter, and explain why a successful execution or observed log is not evidence of personal ownership or future reward entitlement. Ground specific facts in the normalized RPC receipt. Do not invent token symbols, decimals or function names. The researcher need not own the source wallet. One fixed award is allocated by first successful settlement.';
const reports=[
 'The selected Arbitrum receipt has status 1, meaning the execution succeeded rather than reverted. Its transaction destination is 0xaf88d065e77c8cc2239327c5edb3a432268e5831; the single log was emitted by that same address. The native transaction value is zero. Success describes this execution, not ownership by the researcher or a promise of future rewards. Raw event data alone does not establish a token symbol or decimals.',
 'This receipt confirms successful execution and one event, whose emitting address matches the transaction destination 0xaf88d065e77c8cc2239327c5edb3a432268e5831. No native ETH value was attached. An observed event is a record of this transaction, not authorization for this reporter to claim assets. I do not infer current eligibility, token units or a named function merely from the log and input selector.'
];
mkdirSync('docs/live-evidence',{recursive:true});
const path=`docs/live-evidence/bounty-${contract.toLowerCase()}.json`;
const report=existsSync(path)?JSON.parse(readFileSync(path)):{started_at:new Date().toISOString(),contract,source_sha256:hash(local),chain_id:studionet.id,actors:names.map((name,i)=>({name,address:actors[i].address,role:i?'reporter':'sponsor'})),source_url:url,policy,reports,steps:[],claims:[]};
if(report.source_sha256!==hash(local)||report.contract!==contract||JSON.stringify(report.reports)!==JSON.stringify(reports))throw Error('Resume context changed');
const save=()=>{
 writeFileSync(path,JSON.stringify(report,(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
 const rows=report.steps.map(s=>`| ${s.label} | [tx](https://explorer-studio.genlayer.com/transactions/${s.hash}) | ${s.transaction?.statusName||'pending'} | ${s.transaction?.result_name||'pending'} |`).join('\n');
 writeFileSync(path.replace(/\.json$/,'.md'),`# DropProof v0.3 live bounty attempt\n\nContract: ${contract}\n\nSource SHA-256: ${report.source_sha256}\n\nStatus: ${report.completed_at?'completed':report.prepared_at?'prepared; actual challenge waiting required':report.error?'BLOCKED; not a passing lifecycle':'in progress'}\n\n| Step | Explorer | Status | Consensus |\n|---|---|---|---|\n${rows}\n\n[Raw receipts, RPC source archive and readbacks](${path.split('/').pop()}).\n\nNo real semantic approval, excess-claim finalization or payout is claimed unless the corresponding actual transactions and readbacks are present.\n`);
};
const check=(ok,message)=>{if(!ok)throw Error(message)};
const list=x=>Array.isArray(x)?x:Object.values(x||{});
async function send(label,actor,method,args,value=0n){
 let s=report.steps.find(x=>x.label===label);
 if(!s){s={label,actor:actors[actor].address,method,args,value:String(value),submitted_at:new Date().toISOString()};report.steps.push(s);save()}
 check(s.actor===actors[actor].address&&s.method===method&&JSON.stringify(s.args)===JSON.stringify(args)&&s.value===String(value),'Resume input mismatch');
 if(!s.hash){const raw=await createClient({chain:studionet,account:actors[actor]}).writeContract({address:contract,functionName:method,args,value});s.hash=typeof raw==='string'?raw:raw.txId;save()}
 console.log(`${label}: ${s.hash}`);
 const txClient=createClient({chain:studionet});
 let tx=await txClient.getTransaction({hash:s.hash});
 if(tx.statusName!=='FINALIZED'){
  await txClient.waitForTransactionReceipt({hash:s.hash,status:'FINALIZED',interval:2500,retries:120});
  tx=await createClient({chain:studionet}).getTransaction({hash:s.hash});
 }
 s.transaction=tx;s.explorer=`https://explorer-studio.genlayer.com/transactions/${s.hash}`;save();
 const leaders=list(tx.consensus_data?.leader_receipt),leader=leaders.find(x=>x.mode==='leader')||leaders[0];
 check(tx.from_address?.toLowerCase()===actors[actor].address.toLowerCase()&&tx.to_address?.toLowerCase()===contract.toLowerCase(),'Receipt identity mismatch');
 check(tx.statusName==='FINALIZED'&&tx.result_name==='MAJORITY_AGREE',`${label}: consensus not accepted`);
 check(!leader?.genvm_result?.error_code&&leader?.execution_result==='SUCCESS',`${label}: execution failed`);
 const payload=leader?.result?.payload;
 s.return_value=payload&&typeof payload==='object'&&typeof payload.readable==='string'?JSON.parse(payload.readable):payload;
 save();return s.return_value;
}
save();
try{
 if(phase==='prepare'){
  if(!report.source_rpc){
   const endpoint='https://arb1.arbitrum.io/rpc';
   const rpc=async(method,params)=>{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(15000)});const raw=await response.text();const parsed=JSON.parse(raw);check(!parsed.error&&parsed.result!==null,`${method}: source unavailable`);return {raw,sha256:hash(raw),result:parsed.result}};
   report.source_rpc={endpoint,captured_at:new Date().toISOString(),chain:await rpc('eth_chainId',[]),receipt:await rpc('eth_getTransactionReceipt',[txHash]),transaction:await rpc('eth_getTransactionByHash',[txHash])};save();
  }
  check(report.source_rpc.chain.result==='0xa4b1'&&report.source_rpc.receipt.result.status==='0x1'&&report.source_rpc.transaction.result.hash===txHash,'Canonical source fact mismatch');
  if(!report.deadline){report.deadline=Math.floor(Date.now()/1000)+900;save()}
  const cid=await send('create',0,'create_campaign',['Public receipt analysis regression',policy,42161,1,1,report.deadline,3600,JSON.stringify([url])],1n);
  check(/^\d+$/.test(String(cid)),`No campaign created: ${String(cid)}`);report.campaign_id=String(cid);save();
  for(let i=0;i<2;i++){
   const id=await send(`report-${i+1}${submissionAttempt==='2'?'-retry-2':''}`,i+1,'submit_claim',[report.campaign_id,JSON.stringify([url]),reports[i]]);
   check(/^\d+$/.test(String(id)),`No claim created: ${String(id)}`);
   report.claims[i]=await read('get_claim',[String(id)]);save();
   check(report.claims[i].status==='CHALLENGE_WINDOW'&&report.claims[i].claimant===actors[i+1].address.toLowerCase(),'Claim readback mismatch');
  }
  report.campaign=await read('get_campaign',[report.campaign_id]);report.accounting=await read('get_accounting');
  report.assess_after_unix=Math.max(...report.claims.map(c=>Number(c.challenge_deadline)))+1;
  report.assess_after_utc=new Date(report.assess_after_unix*1000).toISOString();
  report.prepared_at=new Date().toISOString();delete report.error;save();console.log(`PREPARED; assess after ${report.assess_after_utc}`);
 }else if(phase==='finish'){
  check(report.prepared_at&&Date.now()/1000>report.assess_after_unix,'Real challenge window has not elapsed');
  for(let i=0;i<2;i++){const id=report.claims[i].claim_id;check(await send(`assess-${i+1}`,i+1,'assess_claim',[id])==='APPROVED','Actual semantic assessment did not approve report');report.claims[i]=await read('get_claim',[id]);save()}
  const balances=async()=>{
   const addresses=[contract,...actors.slice(1).map(a=>a.address)];
   const out={};for(const address of addresses)out[address]=String(BigInt(await createClient({chain:studionet}).request({method:'eth_getBalance',params:[address,'latest']})));
   return out;
  };
  if(!report.balance_before_payout){report.balance_before_payout=await balances();save()}
  check(await send('pay-first',0,'settle_claim',[report.claims[0].claim_id])==='PAID','Missing actual payout');
  for(let i=0;i<6;i++){
   report.balance_after_payout=await balances();save();
   if(BigInt(report.balance_after_payout[contract])===BigInt(report.balance_before_payout[contract])-1n&&BigInt(report.balance_after_payout[actors[1].address])===BigInt(report.balance_before_payout[actors[1].address])+1n)break;
   await new Promise(resolve=>setTimeout(resolve,2000));
  }
  check(BigInt(report.balance_after_payout[contract])===BigInt(report.balance_before_payout[contract])-1n,'Contract native balance did not decrease by reward');
  check(BigInt(report.balance_after_payout[actors[1].address])===BigInt(report.balance_before_payout[actors[1].address])+1n,'Reporter native balance did not increase by reward');
  check(await send('finalize-excess',0,'settle_claim',[report.claims[1].claim_id])==='FINAL_CAPACITY_EXHAUSTED','Excess did not terminate');
  report.balance_after_excess=await balances();save();
  check(report.balance_after_excess[contract]===report.balance_after_payout[contract]&&report.balance_after_excess[actors[2].address]===report.balance_after_payout[actors[2].address],'Excess terminal path moved funds');
  report.final_claims=await Promise.all(report.claims.map(c=>read('get_claim',[c.claim_id])));
  report.campaign=await read('get_campaign',[report.campaign_id]);save();
  check(report.campaign.open_claims==='0'&&report.campaign.awards_paid==='1'&&report.final_claims[1].paid_amount==='0','Final accounting mismatch');
  const snapshot=async()=>JSON.stringify({campaign:await read('get_campaign',[report.campaign_id]),claims:await Promise.all(report.claims.map(c=>read('get_claim',[c.claim_id]))),accounting:await read('get_accounting')});
  const beforeReplays=await snapshot();
  check(await send('replay-paid',0,'settle_claim',[report.claims[0].claim_id])==='CLAIM_NOT_APPROVED','Paid replay unexpectedly accepted');
  check(await send('replay-excess',0,'settle_claim',[report.claims[1].claim_id])==='CLAIM_NOT_APPROVED','Excess replay unexpectedly accepted');
  check(beforeReplays===await snapshot(),'Replay changed state');
  check(await send('close',0,'close_campaign',[report.campaign_id])==='CLOSED','Campaign cannot close');
  report.campaign=await read('get_campaign',[report.campaign_id]);report.accounting=await read('get_accounting');report.completed_at=new Date().toISOString();delete report.error;save();
 }else if(phase==='inspect'){
  report.inspection={at:new Date().toISOString(),campaign:await read('get_campaign',[report.campaign_id||'0']),first_claim:await read('get_claim',['0']),accounting:await read('get_accounting')};save();console.log(JSON.stringify(report.inspection,null,2));
 }else{
  check(report.campaign_id!==undefined,'No campaign recorded');
  const c=await read('get_campaign',[report.campaign_id]);
  check(c.open_claims==='0'&&Date.now()/1000>Number(c.deadline),'Cannot refund while claims open or before expiry');
  check(await send('cleanup-close',0,'close_campaign',[report.campaign_id])==='CLOSED','Cleanup close failed');
  report.cleanup={at:new Date().toISOString(),campaign:await read('get_campaign',[report.campaign_id]),accounting:await read('get_accounting')};save();
 }
}catch(e){report.error=String(e.stack||e);save();console.error(report.error);process.exitCode=1}
