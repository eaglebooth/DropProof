# DropProof fund-liveness correction

> Superseded workflow: current local source is v0.3.0 public-receipt research bounty,
> not the personal-claim v0.2.0 deployment described below. The same fund-liveness
> terminal branch is retained. See [current specification](PUBLIC_RECEIPT_BOUNTY.md).
> v0.3.0 requires a new user deployment and fresh source/live evidence. SHA-256 and
> source parity below are historical v0.2.0 facts, not current source parity.

Status: corrected deployment source verified; full payout regression **pending**.
New address: `0x927614FD79B204FCA90083EadBD5b494664b04cB`.
[Read-only deployment preflight](live-evidence/deployment-preflight.json) confirms
exact byte-for-byte source parity, version 0.2.0, the corrected policy, zero
accounting counters and no campaign 0 at observation. No workflow transaction was
sent during this preflight. The previous address
`0x282D02C3549CCD15C03C9A87A475817DCEEe2fE1` is not this corrected release.
Do not reuse historical funding/refund smoke tests as proof of the new claim path.

Corrected source SHA-256 (UTF-8 bytes, LF line endings):
`72f0e224887d221b142d13e2a1af27dfbb33fecd8d2356736e2efaaec512ec6b`.
Repository attributes preserve LF for the contract to support exact source parity.

The four historical secondary test addresses each returned nonce 0 from Arbitrum's
RPC (see [claimant readiness](live-evidence/claimant-readiness.json)). This proves
no sent transactions at observation, not absence of incoming/internal activity.
No qualifying claimant-bound receipt pair has been established. Full E2E needs two
distinct non-sponsor claimant wallets with appropriate authentic evidence and
authorized signing, then the actual one-hour minimum challenge wait. An unrelated
wallet's receipt cannot be relabelled as a test wallet's own activity. Do not claim
the excess-approval payout path has run live until the necessary cases exist.

## Reported failure reproduced

A campaign funds one award. Two independent wallets submit distinct proofs before
either award is paid. Both claims are assessed APPROVED. The first settlement pays
the only award. The second previously returned POOL_INVARIANT_BROKEN forever,
leaving APPROVED and open_claims=1. Even after campaign expiry the sponsor could
not close. The new regression failed against the old production contract with that
exact return value before the fix was applied.

## Chosen remedy: safe terminal path, not admission reservation

The allocation rule is now explicitly exposed as FIRST_SUCCESSFUL_SETTLEMENT.
Approval certifies evidence eligibility; **it does not reserve a reward**. This
preserves the previous settlement-order allocation rather than silently promising
every approved claimant a funded slot. Permissionless settlement means anyone can
submit the settlement transaction, but its payout address is always the recorded
claimant. This is not a fairness or FIFO guarantee; transaction ordering matters.

In `settle_claim`, an APPROVED / ELIGIBLE claim can now end as
FINAL_CAPACITY_EXHAUSTED if and only if all max_awards are already paid and the
campaign remaining_pool is exactly zero. That transition:

- preserves decision=ELIGIBLE instead of pretending the claim was ineligible;
- sets reason_code=AWARD_CAP_EXHAUSTED and leaves paid_amount=0;
- decrements open_claims exactly once;
- never transfers or changes total_paid, total_refunded, awards_paid, or the pool;
- cannot re-enter assessment, appeal, revision, payment or another finalizer.

An empty pool before reaching the award cap, or inconsistent pool/cap state, still
returns POOL_INVARIANT_BROKEN without changing state. Capacity exhaustion is not a
fallback for arbitrary accounting corruption.

Storage fields are unchanged. `get_version` identifies version 0.2.0 and policy
terminal-excess-approvals-v2. Existing historical deployment state is not repaired
by editing this repository. Only the user deploys the corrected source.

## Accounting and regression scope

Tests call production public methods, with controlled web/semantic responses only
to isolate deterministic capacity accounting. The harness transfer list is not
proof of native onchain transfers or GenLayer consensus.

- One funded award / two approved claims: one PAID, one terminal exhausted;
  open_claims=0, sponsor closes after expiry.
- Two awards / three approved claims, three settlement orders: at most two fixed
  payouts, every claim terminal, no open-count underflow or double finalization.
- Replay payment and alternate finalizers: no counter or accounting change.
- Exhaustion cannot terminate unassessed claims or drain another campaign.
- Corrupt insufficient pool / cap states: unchanged and no transfer.
- Existing funded residual-pool regression: sponsor receives the unspent remainder
  only after expiry and all claims resolve; repeated close does not refund twice.

For all reachable steps the accounting obligation remains:

`total_funded = total_paid + total_refunded + sum(campaign.remaining_pool)`.

For each open, exactly funded campaign:

`remaining_pool = reward_per_claim * (max_awards - awards_paid)`.

## Corrected deployment and live verification checklist

1. User main wallet deploys the exact `contracts/drop_proof.py` source, without
   changing challenge duration or adding test-only state setters.
2. Read getContractCode and get_version; verify exact source SHA-256 and policy.
   Record deployment tx and deployer. The main wallet performs no test actions.
3. A test sponsor funds a bounded campaign; two distinct non-sponsor test claimants
   submit independent, sender-matching Arbitrum primary receipts before any payout.
   Historical third-party receipts must not be presented as the test wallet's own
   activity. If valid source ingestion is unavailable, record the blocker honestly.
4. Wait for actual challenge deadlines (minimum 3600 seconds); real assessments
   must approve both claims. Do not backdate chain time or substitute model verdicts
   and call that live evidence.
5. Settle both: verify exactly one fixed payout and one FINAL_CAPACITY_EXHAUSTED,
   eligible decision retained, zero payment to the excess claim, open_claims=0.
6. Repeat both settlements and alternate finalizers: confirm full state unchanged.
7. After actual campaign deadline, sponsor closes; verify zero remaining pool, final
   accounting and contract/recipient balance effects. A separate underfilled
   campaign should exercise a nonzero sponsor remainder refund.
8. Retain transaction hashes, finalized execution/consensus results, balances,
   readbacks and source parity. Link every tx in a Markdown report and publish
   source plus tests/evidence together. Until then this is not submission-ready.
