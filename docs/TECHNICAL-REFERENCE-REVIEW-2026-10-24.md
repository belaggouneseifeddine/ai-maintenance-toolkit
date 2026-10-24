# Technical Reference Review — 2026-10-24

## Review rules

A source is marked **verified for a claim** only after the exact document is inspected and its equipment/model scope and relevant page or section are recorded. A manufacturer's document library is a source-discovery portal, not proof that a particular fault record is correct. A general safety regulation may support safety guidance, but it must not be used to validate a mechanical/electrical fault cause.

## Source reviewed: general hazardous-energy control

- **Publisher:** U.S. Occupational Safety and Health Administration (OSHA), U.S. Department of Labor
- **Document / regulation:** 29 CFR 1910.147, *The control of hazardous energy (lockout/tagout)*
- **Official URL:** https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147
- **Relevant sections:** 1910.147(a) scope and purpose; 1910.147(c)(4) energy-control procedures; 1910.147(d)(5)-(6) stored energy and verification of isolation.
- **Review date:** 2026-10-24
- **Status:** Verified for general LOTO principles only.
- **Allowed use:** Support general safety messaging about controlling hazardous energy, stored energy, and verifying isolation before maintenance, where applicable.
- **Not allowed:** Treat this U.S. regulation as a manufacturer manual, a substitute for local Algerian/site requirements, or evidence that a fault cause in `faults.json` is correct.

## OEM source candidates — not yet validated against app fault claims

### Pump system

- **Publisher:** Grundfos
- **Document title:** *Grundfos firefighting systems — Hydro EN, Installation and operating instructions*
- **Official PDF:** https://api.grundfos.com/literature/Grundfosliterature-6819528.pdf
- **Visible sections:** 13.1 “The electric pump does not start”; 13.4 “The flow rate of the system is not as desired”; 13.6 “Leaks from the mechanical seal”, listed on PDF page 32 in the indexed document text.
- **Status:** **Review-needed / scope-limited.** The document is for a Hydro EN firefighting system. The app's pump records are generic and do not identify this model/system, so these sections cannot be applied to all pump records. Before using it for a claim, verify the exact pump/controller variant and inspect the corresponding PDF page and procedure.
- **Candidate claims to compare after model confirmation:** pump fails to start; flow rate below expectation; mechanical-seal leakage. No fault record is marked verified from this candidate in the evidence register.

### Compressor

- **Publisher:** Ingersoll Rand
- **Official document portal:** https://www.ingersollrand.com/en-us/resources/knowledge-hub/reciprocating-compressor-documents/
- **Portal evidence:** the official page lists multiple operator manuals, installation manuals, parts lists, and quick-start manuals for distinct compressor families/models.
- **Status:** **Review-needed.** No exact compressor model/nameplate or document revision was supplied for the app's generic compressor records. Do not select a model-specific manual by guess. Once the exact model is known, record the manual title, document/part number, revision/date, relevant page/section, and the precise claim supported.

## Current verified-content boundary

- The evidence register has one general safety reference verified for its limited LOTO scope.
- **No fault cause in the 152-record fault library has been verified against an OEM manual in this review.**
- The per-fault records remain `source-not-recorded` until an exact, relevant reference is checked. This is intentional and safer than falsely marking generic records as verified.
- The official links above are source-discovery/review entries, not a claim that every linked document is applicable to every machine.

## What is needed to continue model-specific verification

For each priority asset, capture the manufacturer, exact model/type, serial/product family where appropriate, and the fault/condition being checked. Start with the equipment used by the intended audience and with safety-critical risks. Do not publish numerical limits, OEM alarm interpretations, torque values, lubricant grades, wiring steps, or repair procedures until the matching source is confirmed.
