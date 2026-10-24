# Public-receipt analysis bounty — v0.3.0

> Current local release is v0.4.0 with a new RPC source policy. The report-bounty
> semantics below remain; old source SHA/deployment facts are historical v0.3.0.
> See [current RPC policy](RPC_SOURCE_POLICY.md). Explorer-rendering limitations
> below describe the superseded ingestion path.

Deployment-ready source SHA-256 (UTF-8/LF):
`2cf693775187837afcd3331cb0669767e0fe707669abbf8a07f52a57ddffb9cc`.
Local verification: 31 controlled-runtime tests, contract lint/validation and schema
generation pass. These results are not real model or native-transfer evidence.

Current deployment: `0xDad00e9acADa9Cc379Fa943D1B564aF70331D3FB`, exact source
parity verified. The actual first report ingestion failed before creating a claim;
the empty campaign's 1 wei was subsequently refunded. Full payout/fund-liveness
evidence remains blocked, as recorded in [live evidence](LIVE_EVIDENCE.md).

## Deliberate product change

The user authorized changing personal incentive claims into research bounties.
Sponsor selects public receipts and required findings; reporter submits analysis.
The consequence is payment for supported analysis, not ownership of the original
transaction, its assets or its airdrop benefits.

Example task: explain a receipt's status, called action and relevant event, and
distinguish a historical claim from current eligibility. The independent public
receipt supplies facts. Sponsor/report text are declarations to assess, not
authoritative evidence for their own assertions.

Campaigns expose exact policy, selected receipts and task digest. Claims expose
their immutable report, report digest, source URLs and evidence digest. Reporter
and payee are authenticated by GenLayer transaction sender; no address argument
redirects rewards. Assessment uses report_supported, not claimant_match. The old
verdict schema fails closed. Reports and source excerpts are untrusted data.

## Replay and recovery

- One report per wallet per campaign; sponsor cannot claim its own bounty.
- Same receipt/report digest cannot be submitted twice within one campaign.
  This is exact-content replay protection, not originality or Sybil safety.
- Independent analyses of the same public receipt are allowed. A bad report or
  unrelated campaign cannot globally consume the receipt and censor other reports.
- Counter/appeal evidence replay checks apply within that claim, not globally.
- Retry recaptures the same selected receipt; no task or report substitution.
- Existing challenge, appeal and retry bounds remain; no test-only time setters.
- First successful settlement gets a funded slot. Eligible excess reports end
  FINAL_CAPACITY_EXHAUSTED, so no perpetual open counter or duplicate payout.

The storage model and method signatures changed. Deploy a **new instance** using
the main wallet only. Do not upgrade old storage assuming records have new fields.
Do not describe historical preflight or transactions as v0.3.0 validation.

## Live evidence required after deployment

1. Check exact source bytes and version0.3.0 / workflow policy before signing.
2. Retrieve real public receipt facts independently (hash, chain, status and logs),
   archive responses/digests and verify GenLayer can read the selected source.
   Disclose third-party ownership; do not impersonate the historical sender.
3. Test sponsor funds one award. Two non-sponsor reporters submit distinct analyses
   of sponsor-selected receipts before any settlement. Neither needs Arbitrum funds.
4. Wait for both actual challenge deadlines (minimum one hour). Real independent
   leader/validator assessments must approve both reports; no stubbed verdicts.
5. Verify one native payout and one FINAL_CAPACITY_EXHAUSTED, retained ELIGIBLE,
   open_claims=0, replay protection, then campaign closure after actual expiry.
6. Also verify a nonzero unused-pool refund in an underfilled campaign and the
   contract/recipient balances and accounting. Publish source and tx tables together.

This scenario needs sponsor + two distinct non-sponsor reporters: use a third
authorized test account, never the main deployer, alongside the two known test
wallets. Arbitrum funds are unnecessary; the StudioNet pool and real time waits
still apply. Source ingestion remains an external gate and cannot be promised
before live execution. Bounded rendered-page hashes may be nondeterministic;
redirect/indexer limitations are unchanged and are not cryptographic receipt proof.
