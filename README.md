# DropProof — Public Receipt Research Bounties

Version 0.4.0 is a contract-only research bounty. A sponsor funds fixed rewards,
commits analysis criteria and selects up to four public Arbitrum One receipts.
A researcher submits an immutable report about one selected receipt. GenLayer
judges whether independent receipt evidence supports the report and task criteria.
The reward recipient is the authenticated reporter, not the Arbitrum transaction's
owner. Reporters need no Arbitrum funds or personal transaction history.

This is not an airdrop eligibility service, ownership proof, originality detector,
Sybil defense or production escrow. Approval does not reserve money: first
successful settlements consume the funded slots. Excess approved reports terminate
as FINAL_CAPACITY_EXHAUSTED without payment, so the sponsor can close after expiry.

## Workflow

1. `create_campaign(..., target_urls_json)` seals the criteria and selected public
   receipts, with exact funding and a minimum one-hour challenge window.
2. `submit_claim(campaign_id, evidence_urls_json, report_text)` locks one selected
   receipt and an 80–1800 character report. One submission per wallet per campaign;
   exact report/receipt replays are blocked within that campaign.
3. Sponsor can challenge once. After the actual deadline, independent semantic
   assessments require report_supported, policy_satisfied, evidence_sufficient and
   no material conflict. Missing facts fail closed.
4. Rejected reports have one appeal. Unresolved reports can recapture the same
   receipt once, not replace their task or report.
5. Permissionless settlement pays the stored reporter. Excess eligible reports end
   without payout; all reports must terminate before expiry-based close/refund.

## Build and tests

```powershell
python -m pip install -r requirements-dev.txt
python scripts/verify.py
npm ci
```

Tests invoke production public methods through controlled runtime, web and model
fixtures. Transfer recording is not proof of actual native onchain transfers.
The verification command includes tests, contract lint/validation and schema output.

## Deployment status

**Current v0.4.0 is deployed at `0xc1B309a0F59AAa7F204CA20846f5F8129bE52ED7`.** It replaces explorer rendering with
two fixed RPC sources, chain/hash/canonical-block/finality checks and normalized
complete receipt facts. See [RPC source policy and verification](docs/RPC_SOURCE_POLICY.md).
Exact source parity and real GenVM RPC ingestion passed: two reports are locked in
CHALLENGE_WINDOW. Actual semantic assessment/payout regression remains pending the
real one-hour challenge. Old parity below applies
only to v0.3.0, not this current source.

**v0.3.0 is deployed at `0xDad00e9acADa9Cc379Fa943D1B564aF70331D3FB`** with
exact source parity. Live source ingestion failed before creating a report; the
1 wei test campaign was closed/refunded. Report assessment, payout and excess
capacity lifecycle are not yet verified live. See the current live evidence.
The previous address
`0x927614FD79B204FCA90083EadBD5b494664b04cB` is v0.2.0's personal-claim workflow,
not this bounty release. No historical transaction validates v0.3.0 payout.
Only the main wallet deploys; secondary wallets perform workflow tests.
After the user deploys the new source, check exact source parity before writes:

```powershell
$env:DROP_PROOF_CONTRACT = '<new v0.4.0 address>'
npm run preflight
```

See [bounty specification](docs/PUBLIC_RECEIPT_BOUNTY.md),
[reviewer remediation](docs/REVIEWER_REMEDIATION.md),
[test resources](docs/TEST_RESOURCES.md), [matrix](docs/TEST_MATRIX.md) and
[historical evidence](docs/LIVE_EVIDENCE.md).

## Important limitations

The contract now reads bounded JSON-RPC data from two fixed sources; Arbiscan is
only a locator. RPC agreement is not a cryptographic receipt proof. Missing archive
data, a provider outage or conflicting responses can pause admission/resolution.
Redirect/egress enforcement, provider independence/collusion and full prompt-
injection resistance are not claimed. Do not fund production campaigns without
independent security review and actual GenLayer runtime verification.

Source availability, semantic classification, native payouts, actual waiting and
fund-liveness require fresh live verification on this release. Do not substitute
mocked results or old deployment evidence for those observations.
