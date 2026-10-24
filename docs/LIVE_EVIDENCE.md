# Live deployment and transaction evidence

## v0.4.0 — RPC ingestion passed; actual challenge waiting

Deployment: `0xc1B309a0F59AAa7F204CA20846f5F8129bE52ED7`.
Exact source parity passed with SHA-256
`6c9781e9cf0d142e450a22c59f195144385b1a0a95e5f3855df978dfe639a52b`.
[Preflight](live-evidence/deployment-preflight-0xc1b309a0f59aaa7f204ca20846f5f8129be52ed7.json).

The secondary sponsor funded campaign 0 with 1 wei. Two independent secondary
reporters successfully submitted distinct reports concerning the selected public
receipt. All three transactions finalized with MAJORITY_AGREE. Actual readbacks
show both claims in CHALLENGE_WINDOW, not APPROVED or PAID. RPC snapshot ingestion
therefore executed successfully in GenVM, not just in the local HTTP preflight.

Assess both only after `2026-10-24T08:33:54Z` (15:33:54 UTC+7).
No semantic verdict, native payout, excess-approved terminal path or closure is
claimed for v0.4 until corresponding actual future transactions/readbacks exist.
The 1 wei remains intentionally funded while these two claims are open.

- Create: [transaction](https://explorer-studio.genlayer.com/transactions/0xccff5a1499f2629d43dbebf2dbfc4bcd0f1caad868d7d712384c6a6ac5c7b91e)
- Report 1: [transaction](https://explorer-studio.genlayer.com/transactions/0xed7608c363534270cf908694a7ee0434abc9d995d7f5e38f694d95f3bf573e96)
- Report 2: [transaction](https://explorer-studio.genlayer.com/transactions/0x667da4316dc5b263ebe18d04da314c7a191faa6e3ec7a91c16b0e923a82b2aae)
- [Raw receipts, source archive and claim readbacks](live-evidence/bounty-0xc1b309a0f59aaa7f204ca20846f5f8129be52ed7.json)

Continue after the real challenge expires, using the saved hashes/context:

```powershell
$env:DROP_PROOF_CONTRACT = '0xc1B309a0F59AAa7F204CA20846f5F8129bE52ED7'
node scripts/live-bounty.mjs finish
```

## v0.3.0 actual attempt — 2026-10-24

New deployment: `0xDad00e9acADa9Cc379Fa943D1B564aF70331D3FB`.
Exact source parity passed with SHA-256
`2cf693775187837afcd3331cb0669767e0fe707669abbf8a07f52a57ddffb9cc`.
[Preflight](live-evidence/deployment-preflight-0xdad00e9acada9cc379fa943d1b564af70331d3fb.json).

A secondary sponsor funded campaign 0 with 1 wei. The first secondary reporter
submission finalized with MAJORITY_DISAGREE; the leader's capture eq_output was
`{"items":[],"status":"UNAVAILABLE"}` and its public return was
EVIDENCE_UNAVAILABLE_OR_NONDETERMINISTIC. The swallowed renderer exception does
not establish the precise underlying network/renderer failure. Independent
readback showed CLAIM_NOT_FOUND, open_claims=0 and no award paid. This did not
reach actual semantic report adjudication.

After campaign expiry the secondary sponsor closed it successfully. Readback:
status CLOSED, remaining_pool=0, open_claims=0; total_funded=1, total_paid=0,
total_refunded=1. The sponsor's 1 wei test pool is no longer held by the campaign.

- Create: [transaction](https://explorer-studio.genlayer.com/transactions/0xbaecef41301df2b9d3530709e63c089ee5f98bfb8fedb8cd0d8808fcc559c7a2)
- Failed source ingestion: [transaction](https://explorer-studio.genlayer.com/transactions/0x7d5e88fdd46cb4af77004ca29ec7f40c7ee8b5ffe1e3e1cbf0e94c0c5cdb11ca)
- Close/refund: [transaction](https://explorer-studio.genlayer.com/transactions/0x328f015dc64398a4a70ed2052c646c25da7edaee02e2bbf6a912fd4536f171b7)
- [Raw source RPC archive, receipts and readbacks](live-evidence/bounty-0xdad00e9acada9cc379fa943d1b564af70331d3fb.json)
- [Transaction table](live-evidence/bounty-0xdad00e9acada9cc379fa943d1b564af70331d3fb.md)

Status: **source parity, funding and empty-campaign refund observed; full report
assessment/payout/excess-capacity regression BLOCKED by source ingestion.**
The local 31 controlled tests are not live evidence for those missing branches.

## Historical release notes below

> The notes below concern older workflows. They do not prove the new report-bounty
> path. See the v0.3.0 attempt above and [current specification](PUBLIC_RECEIPT_BOUNTY.md).

> Historical workflow evidence below is for the original source only. The v0.2.0
> correction is deployed at `0x927614FD79B204FCA90083EadBD5b494664b04cB` and has
> passed [exact source preflight](live-evidence/deployment-preflight.json), but its
> payout/excess-approval lifecycle is not yet verified live. See
> [reviewer remediation](REVIEWER_REMEDIATION.md). Old source comparison and smoke
> transactions below do not validate the new excess-approved-claim terminal path.

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
