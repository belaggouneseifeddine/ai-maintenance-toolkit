test("compressor overheating adaptive flow collects cooling, oil, and load evidence in all supported languages", () => {
  for (const language of ["ar", "en", "fr"]) {
    let session = engine.createSession({equipment:"compressor",symptom:"overheat",language});
    assert.equal(session.ok,true);
    assert.equal(session.hypotheses.length,3);
    assert.equal(session.nextQuestion.id,"compressor_cooling");
    assert.ok(session.nextQuestion.text.length > 0);

    let result = engine.answer(session,"cooler-airflow-restricted");
    assert.equal(result.ok,true);
    session = result.session;
    assert.equal(session.nextQuestion.id,"compressor_oil");

    result = engine.answer(session,"oil-level-low-indicated");
    assert.equal(result.ok,true);
    session = result.session;
    assert.equal(session.nextQuestion.id,"compressor_load");

    result = engine.answer(session,"demand-or-load-high");
    assert.equal(result.ok,true);
    session = result.session;
    assert.equal(session.status,"evidence_review");
    assert.equal(session.nextQuestion,null);
    assert.equal(session.evidence.length,3);
    assert.equal(session.summary.confirmedCause,"");
    assert.equal(session.summary.requiresMoreEvidence,true);
  }
});

