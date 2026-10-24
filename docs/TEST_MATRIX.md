# Behavioral test matrix

| Scenario | Public entrypoints | Assertion | Evidence type |
|---|---|---|---|
| Funded happy path | `create_campaign`, `submit_claim`, `assess_claim`, `settle_claim` | Exact pool; sender-bound claim; third party can settle once; fixed payment and pool accounting | Local semantic fixture + mocked pages |
| Underfunded campaign | `create_campaign` | Rejects value not equal to reward × cap | Deterministic local test |
| Unauthorized challenge | `submit_counterevidence` | Non-sponsor cannot challenge | Deterministic local test |
| Wallet replay | `submit_claim` | One claim per wallet/campaign | Deterministic local test |
| Proof replay | `submit_claim` | Primary receipt URL cannot be claimed twice | Deterministic local test |
| Source changed after commitment | `assess_claim`, `revise_unresolved_claim` | Digest mismatch becomes unresolved; one revision permitted; no payout | Mutated mocked page |
| Source unavailable | `assess_claim`, `finalize_unresolved` | Bounded unresolved result can be closed; no payout and no permanently locked open-claim counter | Raised local exception |
| Prompt-injection content | `assess_claim`, `settle_claim` | Known instruction-like marker routes to unresolved; no payout | Synthetic hostile page |
| Leader/validator disagreement | `assess_claim`, `settle_claim` | Consensus rejection becomes unresolved; no payout | Two different local semantic fixtures |
| Challenge and appeal | `submit_counterevidence`, `assess_claim`, `appeal_claim` | Sponsor/claimant role boundaries and one appeal | Local semantic fixtures |
| Campaign refund | `close_campaign`, `settle_claim` | No early close; no close while claims open; remainder refunded after resolution/expiry | Deterministic local test |
| Missing GenVM return wrapper | `assess_claim` | Fail closed if validator callback receives unexpected result type | Runtime-shape harness regression |
| Fixture integrity | local fixture check | SHA-256 matches the normalized excerpt; fixture explicitly says not active eligibility evidence | Local integrity check |

Current local verification: `python scripts/verify.py` — 11 passed;
`genvm-lint lint contracts/drop_proof.py` — passed; and
`genvm-lint validate contracts/drop_proof.py` — passed against the pinned v0.2.16
runner. These are direct-entrypoint unit tests in a fake GenLayer runtime. They are not live
GenLayer, RPC, wallet, explorer, deployment, or real multi-validator E2E tests. The
available evidence corpus has one genuine historical Arbiscan reference and no live
campaign/proof of reward eligibility. See `TEST_RESOURCES.md`.
# Current v0.3.0 scope

The current workflow is a public-receipt report bounty; any personal receipt-owner
assumptions in the older matrix above are superseded. Current regressions exercise
selected-task URL binding, immutable report commitment, reporter/payee sender
binding, unsupported/malformed/legacy verdicts, instruction-like report content,
campaign-scoped report replay, independent reuse of public receipts, rejected-report
non-censorship and excess approved-report termination. All are controlled-runtime
tests, not live consensus. See [current specification](PUBLIC_RECEIPT_BOUNTY.md).
