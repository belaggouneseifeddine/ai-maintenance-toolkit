# Industrial Ops RAG Agent — metadata-only review

This folder intentionally stores metadata and review notes only. No upstream knowledge-base file, fault text, code, standards extract or pump-fault extract is retained.

- Upstream: https://github.com/yilin-2511/industrial-ops-rag-agent
- Repository code license: MIT.
- Embedded data license: no separate license found during review.
- Data rights: unresolved. The upstream knowledge records cite GB/T/JB/T standards and generic manuals without a complete claim-to-edition/page/model provenance chain.
- Review date: 2026-11-18.
- Decision: discovery-only; no fault-text import.

The previous candidate snapshot and derived pump extract were removed from this branch because the root MIT license does not establish reuse rights for embedded data. See [REVIEW.md](REVIEW.md).

Additional code review: integrated_agent.py and four_channel_retriever.py were inspected; the LLM generation branch is a prompt-only stub and the documented retrieval weights differ from implementation. No code was executed or copied.
