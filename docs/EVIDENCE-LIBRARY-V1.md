# Evidence Library v1 — bounded scientific references

## What this slice adds

- An offline-first registry of identifiable technical and regulatory sources.
- Simple lexical matching for Arabic, French, and English text; it does not call an external service.
- Stable citation IDs that map to registered source records.
- Explicit scope, jurisdiction, and limitation text with each returned source.
- A clear no-match result. No citation is invented when the registry has no match.

## Current starter references

1. **OSHA 29 CFR 1910.147 — Control of hazardous energy (lockout/tagout)**  
   https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147  
   This is a U.S. regulation, not a substitute for Algerian law, employer procedures, or site-specific isolation steps.

2. **U.S. Department of Energy — Improving Pumping System Performance: A Sourcebook for Industry, Second Edition**  
   https://www.energy.gov/sites/prod/files/2014/05/f16/pump.pdf  
   This is system-level pump guidance, not a model-specific OEM manual and not proof of a particular failure cause.

## How reasoning and references work together

1. The diagnostic engine proposes preliminary hypotheses from observed symptoms.
2. The evidence library finds relevant registered references by topic.
3. The UI/agent must show the source's actual title, publisher, URL, scope, and limitations.
4. A reference is not automatically evidence that a hypothesis is true. The agent must distinguish:
   - observed facts supplied by the technician;
   - a possible cause inferred from symptoms;
   - a source that provides general background or a relevant procedure;
   - a cause verified by measurements or an approved diagnostic procedure.
5. If no matching source is found, the answer must say so rather than manufacture a citation.

## Limitations

- This is a deliberately small seed registry, not a complete scientific knowledge base.
- Search is lexical, not semantic; synonyms and technical phrases may be missed.
- The module does not fetch URLs, parse PDFs, or verify document revisions at runtime.
- No source in this registry establishes model-specific pressure, temperature, vibration, or electrical limits.
- For real intervention, use the exact equipment manual, site procedures, and applicable local requirements.

## Test

Run the repository's existing Node test command for the evidence-library test file, or run it directly with Node's built-in test runner. A test passing locally or in CI must be reported only when the actual result is available.
