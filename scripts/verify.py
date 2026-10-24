from __future__ import annotations

import ast
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
contract = ROOT / "contracts" / "drop_proof.py"
tree = ast.parse(contract.read_text(encoding="utf-8"))
public_methods = {
    node.name
    for node in tree.body
    if isinstance(node, ast.ClassDef) and node.name == "DropProof"
    for node in node.body
    if isinstance(node, ast.FunctionDef)
}
required = {
    "create_campaign", "submit_claim", "submit_counterevidence", "assess_claim",
    "appeal_claim", "revise_unresolved_claim", "settle_claim", "close_campaign",
}
missing = sorted(required - public_methods)
if missing:
    raise SystemExit(f"Missing contract entrypoints: {', '.join(missing)}")

result = subprocess.call([
    sys.executable, "-m", "pytest", "-q", "--tb=short", "-p", "no:cacheprovider",
    str(ROOT / "tests"),
], cwd=ROOT)
if result:
    raise SystemExit(result)
for args in [
    ["check", "contracts/drop_proof.py"],
    ["schema", "contracts/drop_proof.py", "-o", "docs/schema.json"],
]:
    result = subprocess.call([sys.executable, "-X", "utf8", "-m", "genvm_linter.cli", *args], cwd=ROOT)
    if result:
        raise SystemExit(result)
