# Threat model and security boundaries

## Actors and intended authority

- Sponsor: creates a campaign, selects the policy, escrows the capped pool, and may
  submit one counterevidence packet during the claim challenge window.
- Claimant: binds a submission to the calling wallet, provides a bounded set of
  Arbiscan transaction URLs, may revise one unresolved source set, and may appeal a
  rejection once.
- Permissionless assessor/settler: triggers review or moves an already approved
  fixed reward. They cannot change campaign criteria or recipient.
- GenLayer validators: independently judge the same bounded evidence/policy prompt;
  only a valid bounded result can unlock the approved state.
- Arbiscan page renderer: untrusted indexer and availability dependency, not a
  cryptographic authority.

## Protected properties

1. Only exact `reward_per_claim × max_awards` is accepted at campaign creation.
2. One wallet can submit once per campaign; a primary URL cannot back two claims.
3. Evidence content is length-capped and digest-locked at submission, then fetched
   again before assessment. Mutation, unavailability, malformed output, prompt-like
   markers, and validator disagreement do not produce payout.
4. Payout is a fixed amount to the original claimant, and state/accounting changes
   precede the transfer interaction. Repeated settlement cannot pay twice.
5. Campaign funds remain refundable only after expiry and when open claim count is
   zero; unresolved claims have a finalization path.

## Known limitations / not a security guarantee

- Hash-locking rendered text proves only that the page representation did not change
  between two reads. It does not prove the page represents the submitted transaction,
  that the requested chain is actually Arbitrum One, or that a log/sender/topic was
  verified against a canonical RPC receipt.
- Redirect destination and final page origin are not exposed/checked by this contract.
  Strict URL prefix validation does not stop the allowed host from redirecting.
- The transaction hash is syntactically checked but is not cryptographically tied to
  data returned by the explorer. A malicious or compromised provider can lie.
- The model is asked to infer claimant/event/policy semantics. It can hallucinate,
  misread or be influenced by prompt injection. A short string-marker scan catches
  only a few attacks and can both miss attacks and over-trigger.
- Sponsor-selected on-chain policy is the canonical campaign policy, but a sponsor
  may publish vague, unfair, or deceptive rules. This contract does not certify them.
- Native escrow transfer API/atomicity and decorators have not been exercised in a
  live GenLayer deployment. A rejection/failed recipient transfer must be verified
  in the actual runtime before claiming atomic safety.
- Campaign policy bytes are stored directly and can be large; storage/gas/runtime
  limits are not yet profiled.

## Deployment gate

Do not deploy with real funds until (a) transaction+receipt fields are verified from
chain-bound sources and redirects are handled safely, (b) independent adversarial
review confirms the semantic boundary, (c) native transfer/failure atomicity is
verified on GenLayer, (d) contract compiles/deploys in the current target runtime,
and (e) fresh, archived source fixtures and exact live tests are published.
