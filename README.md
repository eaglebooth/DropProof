# DropProof

DropProof is a contract-only prototype for sponsor-funded, one-wallet-at-a-time
incentive claim reviews. A sponsor commits campaign rules and deposits an exact,
fixed-payout pool. Each claimant commits one or more Arbitrum One transaction URLs;
the source page is captured and hash-locked before a challenge window. Semantic
eligibility is bounded to `ELIGIBLE`, `INELIGIBLE`, or `UNRESOLVED`; only an eligible
claim can be permissionlessly settled for the fixed reward. The sponsor can challenge
once, a claimant can appeal one rejection, and an unresolved source can be revised
once. Pool refunds wait for expiry and all claims to resolve.

This is a distinct architecture from ballot/translation workflows: the unit of review
is a separately funded claim, rather than a proposal edition or electorate. It is an
experimental prototype, not an airdrop, Sybil-resistance oracle, legal decision-maker,
or production escrow.

## Build and tests

```powershell
python -m pip install -r requirements-dev.txt
python scripts/verify.py
genvm-lint lint contracts/drop_proof.py
genvm-lint validate contracts/drop_proof.py
```

The tests invoke public contract entrypoints with distinct sponsor, claimant, and
third-party accounts. The deterministic harness replaces GenLayer and web access;
it does not prove live consensus or real RPC receipt verification. Separate live
StudioNet transactions are recorded in [live evidence](docs/LIVE_EVIDENCE.md),
including payable campaign creation, invalid-evidence rejection, refund, and an
Arbiscan ingestion attempt that ended `UNDETERMINED`. See also the [source
manifest](docs/TEST_RESOURCES.md), [test matrix](docs/TEST_MATRIX.md), and
[threat model](docs/THREAT_MODEL.md).

## Important limitations

The contract reads rendered Arbiscan pages. A page digest detects changed rendered
content between capture and assessment but is not a cryptographic receipt proof,
does not authenticate the final URL after redirects, and does not guarantee the
claimant identity/event fields. A browser/indexer outage can pause resolution. The
prompt-injection scan is a narrow heuristic, not a sanitizer or complete defense.
Do not fund a live campaign until these oracle and redirect limitations have been
replaced with independently verified, chain-bound receipt data and reviewed in the
actual GenLayer runtime.

The contract is deployed on StudioNet and its schema/source were read back. The
live smoke tests verified a funded campaign, invalid-evidence failure, and refund;
they did **not** verify successful claim adjudication, challenge/appeal, or reward
payout. The recorded Arbiscan ingestion attempt was nondeterministic and created no
claim. Source-text matching is normalized text comparison, not bytecode parity.
See [live evidence and transaction links](docs/LIVE_EVIDENCE.md) for exact observed
results and outstanding limitations.
