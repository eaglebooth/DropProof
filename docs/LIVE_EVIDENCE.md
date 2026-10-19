# Live deployment and transaction evidence

Status: **StudioNet readback verified; live payable funding, invalid-evidence failure, and campaign-refund path verified. Claim adjudication/payout lifecycle remains untested live.**

Read-only verification performed 2026-10-19 through the GenLayer CLI, configured
for StudioNet:

- Network / chain ID: GenLayer StudioNet / `61999`
- Contract address: `0x282D02C3549CCD15C03C9A87A475817DCEEe2fE1`
- Schema: read successfully; constructor has no parameters; schema exposes the
  documented campaign, claim, challenge, appeal, retry, settlement, close, and view
  methods.
- Source: `genlayer code <address>` returned DropProof source with the pinned
  `v0.2.16` runner header.
- Source comparison: local and returned source text match after normalizing line
  endings and trailing newlines; SHA-256 of normalized UTF-8 text on both sides:
  `268c7893f4b438c57e4dbfe7c1c60fc1e6a09b72d5ec23410feced0d35a2106c`. This is a
  normalized source-text comparison, **not** a bytecode parity proof.
- Live readback: `get_accounting()` returned `{"total_funded":"0","total_paid":"0","total_refunded":"0"}`;
  `get_campaign("0")` returned `CAMPAIGN_NOT_FOUND`.
- Deployment transaction hash: not yet recorded.

## Live transaction evidence (2026-10-19)

One intentionally invalid claim was submitted from the secondary tester account
`lifecycle-a` to verify the missing-campaign failure path:

- Network: StudioNet, chain ID `61999`.
- Contract: `0x282D02C3549CCD15C03C9A87A475817DCEEe2fE1`.
- Sender: `0xFeD97e2aE1A8C1983b7cA206B3545e6A2c685E43` (`lifecycle-a`; not the deployer).
- Method / args: `submit_claim("999", "[]")`.
- Transaction hash: `0xae359f0624f85900d854784bccbdb90bea5285100ffccea7fad4668f5b5195bc`.
- Explorer: [StudioNet transaction](https://explorer-studio.genlayer.com/tx/0xae359f0624f85900d854784bccbdb90bea5285100ffccea7fad4668f5b5195bc).
- Consensus receipt: transaction `ACCEPTED`, `result_name=MAJORITY_AGREE`; GenVM result
  was rollback with payload `CAMPAIGN_NOT_FOUND` (the expected contract failure).
- Post-transaction reads: `get_accounting()` remained
  `{"total_funded":"0","total_paid":"0","total_refunded":"0"}` and
  `get_campaign("999")` returned `{"error":"CAMPAIGN_NOT_FOUND"}`.
- No campaign, claim, or escrow value was created. This is live evidence for one
  failure path only, not a success or lifecycle test.

### SDK payable + campaign close/refund smoke test

The GenLayerJS SDK signed the payable transaction directly from the unlocked
secondary account `lifecycle-a` (the private key was used in memory from the CLI
OS keychain and was not printed or written to the repository). A test campaign
was created with the minimum pool of 1 wei and a short deadline; no test funds
remain locked.

- Create tx: [0x541c026d780aee8da70a60eae4be990bf032e5f5dffe84a07df1395789c6c564](https://explorer-studio.genlayer.com/tx/0x541c026d780aee8da70a60eae4be990bf032e5f5dffe84a07df1395789c6c564)
  — `ACCEPTED`, `MAJORITY_AGREE`, campaign ID `0`, payable value `1` wei.
- Invalid evidence tx: [0xc901a96ffbe400516554620eb5ced133ea9244b51eb957105c96a711e236e8c9](https://explorer-studio.genlayer.com/tx/0xc901a96ffbe400516554620eb5ced133ea9244b51eb957105c96a711e236e8c9)
  — sent by secondary account `lifecycle-b` with `submit_claim("0", "[]")`;
  `ACCEPTED`, `MAJORITY_AGREE`, contract returned `INVALID_ARBISCAN_TX_LIST`.
- Close/refund tx: [0xa031a2d89296a51b62bac894e05e5cf9f4f849588ba864df07400fa15dc21d6c](https://explorer-studio.genlayer.com/tx/0xa031a2d89296a51b62bac894e05e5cf9f4f849588ba864df07400fa15dc21d6c)
  — sent by sponsor `lifecycle-a` after the deadline; `ACCEPTED`,
  `MAJORITY_AGREE`, contract returned `CLOSED`.
- Final readback: campaign `0` is `CLOSED`, `remaining_pool=0`,
  `open_claims=0`; accounting is `total_funded=1`, `total_paid=0`,
  `total_refunded=1` (all values in wei).
- This smoke test verifies the payable SDK path and one failure + refund path.
  It does **not** test a valid claim, GenLayer's adjudication of real Arbiscan
  content, sponsor challenge, appeal, retry, or reward payout.

## Remaining live E2E blocker

The CLI `genlayer write` still lacks transaction `msg.value`, but the SDK path
has been proven and used. The remaining blocker is a valid, real Arbiscan
receipt suitable for a claimant policy and matching test role; the previously
available historical receipt belongs to an unrelated wallet. Do not fabricate
receipt evidence or claim an adjudication/payout test without the corresponding
real source and transaction. A full lifecycle also requires waiting for the
minimum one-hour challenge window before assessment and settlement.

### Public unrelated-wallet receipt ingestion attempt (2026-10-19)

Arbiscan publicly reports the following unrelated-wallet transaction as
successful and sequencer-confirmed: [0xf00b02913fde570611a330ca72fa4d370392a85bc46b222e967921ec443bb344](https://arbiscan.io/tx/0xf00b02913fde570611a330ca72fa4d370392a85bc46b222e967921ec443bb344),
block `503149829`, sender `0x7c5FdA70b034742f73b7B373e1E96df1F8BC7d39`,
recipient `0xADDfc3a4c50E99BC0eF418696573DCffeE2EA8B4`, value `0 ETH`. The live
claimant was `lifecycle-b` (`0xc67532aef9d2879cba9375a02e6217a3524657b8`), so
this was intentionally **not** a claimant-matching receipt.

- Campaign `1` creation: [0x71ba76c48b7ba0dc8e783e9ee7ea0afd818d2df1e3001e89c1c2e1cfc978c831](https://explorer-studio.genlayer.com/tx/0x71ba76c48b7ba0dc8e783e9ee7ea0afd818d2df1e3001e89c1c2e1cfc978c831)
  — `ACCEPTED`, `MAJORITY_AGREE`, 1 wei pool; policy required the receipt sender
  to equal the bound claimant.
- Claim submission: [0xac8615854ac25f01ab323e38d15879360eca665212d564b2750787d83d28419f](https://explorer-studio.genlayer.com/tx/0xac8615854ac25f01ab323e38d15879360eca665212d564b2750787d83d28419f)
  — `UNDETERMINED`, `MAJORITY_DISAGREE`, payload
  `EVIDENCE_UNAVAILABLE_OR_NONDETERMINISTIC`.
- Independent readback: campaign `1` remains `OPEN`, `open_claims=0`,
  `remaining_pool=1`; accounting is `total_funded=2`, `total_paid=0`,
  `total_refunded=1`. `get_claim("0")` returned `CLAIM_NOT_FOUND`. No claim was
  created, so no claimant-mismatch adjudication was reached.
- Campaign `1` has a 1 wei pool and deadline `2026-10-19 03:40:37 UTC`. Since
  there is no open claim, sponsor `lifecycle-a` must call `close_campaign("1")`
  after that deadline to return the 1 wei; record the resulting transaction and
  readback before treating this smoke-test campaign as cleaned up.

No successful claimant submission, sponsor challenge, assessment, appeal, or
reward payout lifecycle has been tested live. The repository's unit tests use a
fake runtime and local page/semantic fixtures only. Do not present the smoke test
as proof of claim adjudication or the full lifecycle.

Do not submit local unit-test output as live evidence. For any further live run,
record observed values only:

- Deployment transaction hash:
- Explorer transaction link:
- Exact source commit and compiler/runtime version:
- Bytecode parity method and result:
- Deployment receipt status and observed block:
- Test wallet roles and each actual transaction hash:
- Independent readback before/after each transaction:
- Evidence archive paths and SHA-256 digests:

Never invent/predict transaction hashes or describe a simulated call as a live test.
