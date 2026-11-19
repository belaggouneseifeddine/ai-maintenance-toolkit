const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","diagnostic-chat.js"),"utf8");
test("unmatched technician notes are retained and evaluated by the general diagnostic engine",()=>{
 const start=source.indexOf("function handleMessage");
 const block=source.slice(source.indexOf("const result = root.MaintenanceDiagnosticSessionUI.answerText",start),source.indexOf("const updated = currentSession()",start));
 assert.match(block,/notes\.push\(value\)/);
 assert.match(block,/runLocalDiagnosticAssessment\(\)\.catch/);
});
test("new notes after guided flow completion trigger a separate general reassessment",()=>{
 const start=source.indexOf("if (!session || !session.nextQuestion)",source.indexOf("function handleMessage"));
 const end=source.indexOf("const result = root.MaintenanceDiagnosticSessionUI.answerText",start);
 const block=source.slice(start,end);
 assert.match(block,/notes\.push\(value\)/);
 assert.match(block,/runLocalDiagnosticAssessment\(\)/);
 assert.match(block,/guided-flow hypotheses remain separate|فرضيات المسار الموجّه منفصلة/);
});
