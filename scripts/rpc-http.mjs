// Read-only JSON-RPC HTTP transport for the CPython production-helper preflight.
let raw='';for await(const chunk of process.stdin)raw+=chunk;
const {endpoint,request}=JSON.parse(raw);
if(!['https://arb1.arbitrum.io/rpc','https://arbitrum.drpc.org'].includes(endpoint))throw Error('Fixed RPC endpoints only');
const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(20000)});
const body=await response.text();
if(Buffer.byteLength(body)>262144)throw Error('Oversize RPC response');
process.stdout.write(JSON.stringify({status:response.status,body}));
