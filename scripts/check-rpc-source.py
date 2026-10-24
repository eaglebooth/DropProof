"""Read-only CPython preflight of the exact production receipt helper functions.

Uses real HTTP POST with Node instead of GenVM transport. Not a live contract,
model/consensus or payout test. No deployment or signing occurs.
"""
import ast
import hashlib
import json
from pathlib import Path
import types
import typing
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "contracts/drop_proof.py").read_bytes()
tree = ast.parse(source.decode("utf-8"))
names = {"_canonical", "_sha256", "_valid_tx_url", "_hex_data", "_quantity", "_rpc", "_provider_receipt", "_receipt_facts", "SourceError"}
constants = {"RPC_ENDPOINTS", "MAX_RPC_BYTES", "MAX_FACT_CHARS", "ARBISCAN_TX_PREFIX"}
selected = [node for node in tree.body if (
    isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name in names
) or (isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id in constants for t in node.targets))]
calls = []
transport_errors = []
def post(endpoint, *, headers, body):
    try:
        process = subprocess.run(["node", str(ROOT / "scripts/rpc-http.mjs")],
            input=json.dumps({"endpoint": endpoint, "request": json.loads(body)}), text=True,
            capture_output=True, check=True, timeout=25)
        response = json.loads(process.stdout)
        raw = response["body"].encode()
        calls.append({"endpoint": endpoint, "request": json.loads(body), "http_status": response["status"],
                      "response_utf8": raw.decode(), "response_sha256": hashlib.sha256(raw).hexdigest()})
        return types.SimpleNamespace(status=response["status"], body=raw)
    except Exception as exc:
        transport_errors.append({"endpoint": endpoint, "method": json.loads(body)["method"], "error": str(exc)})
        raise

namespace = {"json": json, "hashlib": hashlib, "typing": typing,
             "gl": types.SimpleNamespace(nondet=types.SimpleNamespace(web=types.SimpleNamespace(post=post)))}
exec(compile(ast.Module(body=selected, type_ignores=[]), "contracts/drop_proof.py", "exec"), namespace)
tx_hash = sys.argv[1] if len(sys.argv) > 1 else "0xa260fb7083ccfc0c54f88e0995e6bfc3b97a1adb6a1a20ebc0b887e47a7d3af6"
url = "https://arbiscan.io/tx/" + tx_hash
if not namespace["_valid_tx_url"](url):
    raise SystemExit("Invalid transaction hash")
report = {"checked_at": datetime.now(timezone.utc).isoformat(), "source_sha256": hashlib.sha256(source).hexdigest(),
          "scope": "Exact production RPC helpers in CPython with real Node HTTP transport; not GenVM/consensus/model/payout", "url": url}
code = 0
try:
    facts = namespace["_receipt_facts"](url)
    report.update(result="PASS", facts=json.loads(facts), facts_sha256=hashlib.sha256(facts.encode()).hexdigest())
except Exception as exc:
    report.update(result="FAIL", error=str(exc))
    code = 1
report["calls"] = calls
report["transport_errors"] = transport_errors
out = ROOT / ("docs/source-evidence/rpc-helper-preflight-" + tx_hash + ".json")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps({k: v for k, v in report.items() if k not in ("calls", "facts")}, indent=2))
raise SystemExit(code)
