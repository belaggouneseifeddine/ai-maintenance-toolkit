# Optional AI Integration Plan

## Current state
The current prototype uses fixed, rule-based guidance in the browser. No AI provider is connected.

## Recommended architecture
1. Keep the current local workflow usable without an AI connection.
2. Add a server-side endpoint or trusted serverless function as the only place that calls an AI provider.
3. Store provider credentials only in server-side environment secrets; never place API keys in `index.html`, public GitHub files, or browser JavaScript.
4. Send only the minimum fault details required. Warn users not to submit personal, confidential, or sensitive plant information.
5. Ask the model for structured output: uncertainty, plausible causes, safe checks, required evidence, and escalation conditions.
6. Validate model output before displaying it. Never accept invented machine specifications or instructions to bypass safety systems.
7. Keep safety-critical guidance grounded in manufacturer manuals and approved site procedures.

## Minimum request context
- Equipment category and model, if known
- Symptom and alarm code exactly as displayed
- Operating conditions and recent changes
- Observations and measurements, with units and source
- Applicable manual/reference, if available

## Required response fields
- Summary and uncertainty
- Plausible causes, ranked only when evidence supports ranking
- Safe, non-invasive initial checks
- Measurements needed and the approved measurement method
- Stop-work / isolation warnings
- Information still missing
- Clear instruction to verify against the manufacturer manual and site procedure

## Free-tier evaluation checklist
Before choosing a provider, verify current pricing and free quota, regional availability, data retention/privacy terms, rate limits, terms of use, and whether a backend can be hosted at zero cost. Free tiers can change or be discontinued.

## Release gate
Do not label the product “AI-powered” until a real provider integration is implemented, tested, and visible to the user. If the provider is unavailable, the rule-based mode should remain usable and clearly labelled.
