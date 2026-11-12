# Semantic Retrieval — P1/P2 foundation

This folder adds a provider-neutral embedding boundary and a cosine-similarity vector index. It is isolated from the stable diagnostic engine and current Worker retrieval path.

## Current scope

- embedding-adapter.js accepts an injected embed(text) function and optional embedBatch(texts) function. It validates finite, non-zero vectors, L2-normalizes them, and locks vector dimensions.
- vector-index.js provides an in-memory index with cosine similarity, metadata filters, deterministic tie-breaking, batch validation, capacity limits, and versioned JSON snapshots.
- Both modules are UMD/CommonJS-compatible and have no network, DOM, storage, provider-key, or Ollama dependency.

## Integration example

The application supplies its own embedding implementation. The interface does not bundle a model or select a runtime.

    const embedding = createEmbeddingAdapter({
      dimensions: 384,
      embed: async text => localEmbeddingRuntime(text)
    });
    const index = createVectorIndex({ dimensions: embedding.getDimensions() });
    const vector = await embedding.embed("pump vibration with low flow");
    index.add({
      id: "source-chunk-001",
      vector,
      text: "Retrieved source excerpt",
      metadata: { equipment: "pump", language: "en", sourceId: "OEM-MANUAL-1" }
    });

## Important limitations

- P1/P2 do not select or bundle an embedding model.
- The vector index is in-memory. Snapshot export/import is provided for later storage integration, but IndexedDB persistence and Service Worker integration are not part of this change.
- Semantic similarity is not technical verification. Keep source provenance, exact model/revision checks, BM25, and exact identifier search.
- This foundation does not modify the diagnostic flow, Bayesian scoring, Worker, safety gate, or production app shell.

## Next validation gates

1. Benchmark candidate multilingual embedding runtimes on representative Arabic/French/English maintenance queries and Android memory/latency constraints.
2. Evaluate retrieval against a labeled set with exact alarm-code/model queries and paraphrased symptoms.
3. Add IndexedDB persistence only after storage quota, schema versioning, corruption recovery, and offline lifecycle tests are specified.
4. Integrate hybrid ranking only after measured gains over the existing BM25 baseline.
