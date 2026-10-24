// Read-only: does not retrieve signers, send transactions or deploy.
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const contract=process.env.DROP_PROOF_CONTRACT;
if(!/^0x[0-9a-fA-F]{40}$/.test(contract||''))throw Error('Set DROP_PROOF_CONTRACT');
const client=createClient({chain:studionet});
const local=readFileSync('contracts/drop_proof.py');
const remote=Buffer.from(await client.getContractCode(contract),'utf8');
const sha=x=>createHash('sha256').update(x).digest('hex');
const read=async(functionName,args=[])=>JSON.parse(String(await client.readContract({address:contract,functionName,args,transactionHashVariant:'latest-final'})));
const report={checked_at:new Date().toISOString(),contract,chain_id:studionet.id,
 source_parity:{byte_for_byte:local.equals(remote),local_sha256:sha(local),deployed_sha256:sha(remote),local_bytes:local.length,deployed_bytes:remote.length},
 version:await read('get_version'),accounting:await read('get_accounting'),campaign_zero:await read('get_campaign',['0'])};
mkdirSync('docs/live-evidence',{recursive:true});
writeFileSync(`docs/live-evidence/deployment-preflight-${contract.toLowerCase()}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.source_parity.byte_for_byte||report.version.version!=='0.4.0'||report.version.source_policy!=='dual-rpc-finalized-receipts-v4'||report.version.workflow!=='public-receipt-report-bounty-v3'||report.version.capacity_policy!=='terminal-excess-approvals-v2')process.exitCode=1;
