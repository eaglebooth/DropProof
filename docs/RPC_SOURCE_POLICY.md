# DropProof v0.4.0 — dual RPC receipt evidence

Status: deployed v0.4 at `0xc1B309a0F59AAa7F204CA20846f5F8129bE52ED7`, exact source
parity verified. Two real reports have entered CHALLENGE_WINDOW using GenVM RPC
ingestion; semantic assessment/payout remains pending the actual challenge.
v0.3.0 at `0xDad00e9acADa9Cc379Fa943D1B564aF70331D3FB` remains unchanged.
Its failed Arbiscan ingestion and successful refund are historical observations,
not proof of this new RPC source path.

Candidate contract SHA-256 (UTF-8/LF):
`6c9781e9cf0d142e450a22c59f195144385b1a0a95e5f3855df978dfe639a52b`.
Fresh local verification: **45 tests pass**, contract lint/validation/schema pass,
JavaScript scripts parse and `git diff --check` passes. Independent read-only review
found no blocking deterministic source-binding/accounting issue. This does not
alone establish runtime access from GenVM. Subsequent live submissions did establish
RPC ingestion; see [live evidence](LIVE_EVIDENCE.md) for the precise current boundary.

## Authority and binding

Arbiscan URLs remain user-facing transaction locators only. The contract never
fetches HTML. It derives the exact hash and sends JSON-RPC POST to two fixed
endpoints: `https://arb1.arbitrum.io/rpc` and `https://arbitrum.drpc.org`.
Callers cannot choose an endpoint or supply their own purported receipt facts.

For each provider it independently checks:

- chain ID 42161;
- exact transaction and receipt hash, chain, block hash/number and transaction index;
- matching sender/recipient in the transaction and receipt;
- the block at that height has the same hash and contains the transaction at its
  declared index;
- a provider-finalized head is at or beyond that block;
- every log has that transaction/block/index, removed=false and ordered unique
  log indices, bounded topics/data and valid hex;
- bounded response/input/log payloads, with no truncation to force success.

Both complete canonical fact objects must agree. Missing, pruned or inconsistent
data declines admission or makes an existing report unresolved; there is no
single-provider fallback. Agreement on a failure result never creates a claim.
Moving finalized heads, confirmations and provider metadata are excluded from the
commitment, while transaction, immutable block and complete log facts remain bound.
These are trusted RPC observations, **not cryptographic inclusion/finality proofs**.
Two providers and GenLayer validators do not eliminate provider collusion or routing
dependencies. Network-layer redirect/egress enforcement is not claimed.

## GenLayer judgment stays semantic

Deterministic code validates source identity, finality observations and accounting.
Independent LLM judgments assess whether the report's narrative and task conclusion
are supported by those facts. A success status is not proof of the reporter's
ownership, future reward eligibility, an economic outcome or arbitrary ABI/token
metadata. Raw selectors/logs do not by themselves establish token decimals, symbols
or verified function names; unsupported interpretations fail closed.

The report/payee binding and capacity-exhaustion fix are unchanged. No special
test-only time shortcut, fabricated receipt or model verdict was added.

## Verification and evidence

`python scripts/verify.py` runs controlled production-entrypoint tests and schema/
lint checks. RPC adversarial cases cover wrong chain/hash/block/membership, removed
or mismatched logs, unfinalized blocks, provider conflicts, oversized input, outage,
error envelopes and mutation after commitment. These are not live model/payout tests.

`python scripts/check-rpc-source.py` extracts the exact production helper AST and
executes it in CPython using real Node HTTP transport (the host's urllib received
HTTP403). It archives every real request/response and hash. It does **not** execute
GenVM's web transport or leader/validator consensus.

The initial PublicNode candidate denied archive receipts; it was not silently
accepted. The final pinned pair passed source preflight for the real public receipt
`0xa260fb7083ccfc0c54f88e0995e6bfc3b97a1adb6a1a20ebc0b887e47a7d3af6`:
[response archive](source-evidence/rpc-helper-preflight-0xa260fb7083ccfc0c54f88e0995e6bfc3b97a1adb6a1a20ebc0b887e47a7d3af6.json).
It belongs to an unrelated wallet; reporters are paid for analysis, not ownership.
Older/pruned receipts may remain unavailable and must not be represented as valid.

Before claiming reviewer completion, user must deploy this exact source, then
verify source parity, real GenVM ingestion and two actual semantic approvals before
any payout. Wait the real minimum one-hour challenge, record one payout plus one
FINAL_CAPACITY_EXHAUSTED, replay safety, closure/refund and native balance effects.
Main wallet deploys only; three secondary roles run that scenario.
