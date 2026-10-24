# Test resource and provenance manifest

## Current v0.4.0 source

The contract derives an exact transaction hash from the Arbiscan locator but reads
chain-bound receipt facts from two fixed RPC sources instead of rendering the page.
See [RPC policy, authority limits and real HTTP preflight](RPC_SOURCE_POLICY.md).
Controlled unit RPC envelopes/log contents remain synthetic; no local test fixture
is represented as a real receipt. Source archives are explicitly separate from
GenVM consensus, semantic adjudication and payout evidence.

## v0.3.0 report-bounty scope

The current contract judges a report about sponsor-selected public receipts. The
test reporter intentionally differs from the fixture's Arbitrum sender. This is
legitimate reporting of third-party activity, NOT impersonation or personal reward
eligibility. The source supports only assertions visible in that receipt; it does
not establish originality of the analysis or Sybil resistance. Campaign/report
text alone cannot prove the report's material claims.

Existing normalized fixtures below remain local controlled web/model inputs; they
are not fresh runtime observations. New live tests may use public third-party
receipts only with disclosed ownership, independent retrieval and exact source
binding. All older claimant-owner lifecycle assumptions are historical.

## Real public primary reference

| Field | Value |
|---|---|
| Source | Arbiscan Arbitrum One transaction page |
| URL | <https://arbiscan.io/tx/0x7eb854a91808ba9a717ad4d2c4dd54e4eb99bf61d183378497fe969fed475c42> |
| Network | Arbitrum One, chain ID 42161 |
| Block/time observed | 212409708 / 2024-05-18 04:28:54 UTC |
| Sender | `0xfAbc55b4155CC327DB70aEffEb7F32fF7fdd76c8` |
| Status/action | Success; `claim(uint256,bytes32[])` |
| Event | `AirdropRewardsClaim(user=0xfAbc55b4155CC327DB70aEffEb7F32fF7fdd76c8, amount=10879202650000000000)` |
| Accessed | 2026-10-19 (web read) |
| Capture form | Normalized excerpt in `tests/fixtures/sources/arb-airdrop-claim.json`; **not raw HTTP bytes** |
| SHA-256 | See fixture for the normalized excerpt digest; it is not the digest of a live page or RPC receipt |
| Adversarial class | Historical positive-shaped receipt reference; not proof that a configurable DropProof policy is authoritative or that this user merits a new reward |

The transaction page is a third-party indexer, not an RPC proof. It reports the sender,
success status, call, and `AirdropRewardsClaim` event. The semantic harness fixture is
an excerpt derived from the page, and test web responses are deterministic local
mocks. They are not fresh evidence fetched during tests.

## Official lifecycle authority

The Arbitrum DAO's airdrop specification identifies its document as a public preview,
states the snapshot and claim-start blocks, and says claiming ended on 2023-09-24 and
ARB is no longer claimable: <https://docs.arbitrum.foundation/airdrop-eligibility-distribution>.
Consequently, this source is used only as a historical parser/evidence example, not
as an active campaign or a currently valid reward opportunity.

## Synthetic/adversarial test material

The following are deliberately generated test values, not chain evidence: transaction
URL `TX2`, second wallet addresses, page-mutation suffix, unavailable indexer exception,
counter page variation, and prompt-injection text. Their tests verify failure handling
only. The campaign policy and the adjudicator's expected outputs are also harness
fixtures, not Arbitrum rules or actual model/validator results.

## Reproduction and freshness

Run `python scripts/verify.py`. The tests do not contact Arbiscan or other network
endpoints. Before treating any receipt as current evidence, retrieve it from an
independent chain RPC, compare transaction and receipt fields against the submitted
hash/chain/sender, and archive exact response bytes, timestamp, provider, and digest.
Do not describe fixture-derived assertions as live end-to-end tests.
