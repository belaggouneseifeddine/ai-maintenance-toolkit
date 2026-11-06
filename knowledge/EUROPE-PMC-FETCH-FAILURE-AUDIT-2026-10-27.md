# Europe PMC full-text fetch failure audit — 2026-10-27

## Current finding

The allowlisted registry contains two Europe PMC full-text XML URLs:
- `https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8234243/fullTextXML`
- `https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8747656/fullTextXML`

The repository's live fetch-validation path has previously failed when trying to access these sources. The offline registry checks are not proof that the remote endpoints are reachable. The current fetcher deliberately rejects redirects away from HTTPS, unexpected content types, oversized responses, unexpectedly short extracted text, and sources whose license evidence is incomplete.

## Guardrails retained

- Do not lower the source-license allowlist or infer reuse rights from a successful HTTP response.
- Do not mark either source as verified knowledge merely because the endpoint becomes reachable.
- Do not publish fetched raw text to the repository or to the diagnostic knowledge base.
- Keep human review, attribution, source hashing, and response/content validation mandatory.
- A failed network fetch must remain visible as a failed fetch; an offline validation pass must not be reported as a live-fetch pass.

## Safe next diagnostic step

The next code change should isolate transport diagnosis from knowledge acceptance: test the exact URLs and response metadata in CI, capture HTTP status, final HTTPS URL, content type, and a bounded response excerpt/hash (never the full article), then assess a documented Europe PMC endpoint or API fallback. Any fallback must map to the same article identifier, retain the existing license evidence checks, and pass the same size/content/HTTPS validation. Only then should the production fetcher be changed.

## Status

Audit/documentation only. No endpoint was declared fixed and no live fetch was claimed successful in this commit. The current acceptance criteria remain unchanged.
