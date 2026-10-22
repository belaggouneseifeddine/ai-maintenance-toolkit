# Centrifugal Pump Troubleshooting — reviewed draft

> **Status:** draft for human review; not a substitute for the OEM manual.
> **Safety gate:** Before intervention, identify all energy sources and apply the site's lockout/tagout (LOTO) procedure. Do not open a pressurized line, remove a guard, or touch electrical equipment while energized.
> **Numeric limits:** No pressure, current, clearance, torque, or tolerance values are specified here. **راجع دليل المصنع / Consultez le manuel du fabricant / Consult the manufacturer's manual.**

## Source and evidence record

- Source: *Multistage Centrifugal Pump Fault Diagnosis Using Informative Ratio Principal Component Analysis*
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8747656/
- License recorded in registry: CC BY 4.0; verify the article's license statement and any third-party exclusions before republishing adapted content.
- Knowledge status: **needs review** — the content below is a general troubleshooting summary in original wording, not a verbatim extraction or a claim that every item appears in the cited paper.
- Last source update: not confirmed; publication date is not the same as last-updated date.
- Fetch date: not yet fetched by the script.
- Confidence: **عام / Général / General** for broad inspection guidance; **يحتاج مراجعة / À vérifier / Needs review** for equipment-specific conclusions.

## Search terms and synonyms

| Concept | العربية | Français | English |
|---|---|---|---|
| Centrifugal pump | مضخة طاردة مركزية؛ مضخة طرد مركزي | pompe centrifuge | centrifugal pump |
| No / low flow | انعدام التدفق؛ ضعف التدفق | absence de débit; débit faible | no flow; low flow |
| Low discharge pressure | ضغط الطرد منخفض | pression de refoulement faible | low discharge pressure |
| Cavitation-like noise | ضجيج يشبه التجويف؛ فرقعة داخل المضخة | bruit évoquant la cavitation | cavitation-like noise |
| Leakage | تسرّب | fuite | leakage |
| Bearing issue | عطل المحمل؛ تلف الرولمان بلي | défaut de roulement | bearing fault |
| Seal issue | عطل مانع التسرب؛ تلف الجلدة الميكانيكية | défaut de garniture mécanique | seal failure |
| Overheating | ارتفاع الحرارة | surchauffe | overheating |
| Motor overload | حمل زائد على المحرك | surcharge moteur | motor overload |
| Air ingress / loss of prime | دخول الهواء؛ فقدان التحضير | prise d’air; perte d’amorçage | air ingress; loss of prime |

## Fault patterns for preliminary triage

### 1. No flow or very low flow

**Symptoms**
- The pump runs but little or no liquid reaches the discharge.
- The expected process flow is not achieved.

**Possible causes — not a confirmed diagnosis**
- The pump is not primed, or air is present in the suction path.
- A suction or discharge valve is closed or incorrectly positioned.
- The suction path or strainer is obstructed.
- Rotation direction, speed command, or drive status is incorrect.
- The system operating point differs from the design conditions.

**General checks**
1. From a safe position, confirm the process demand and the indicated valve positions.
2. Review alarms, motor/drive status, and available flow/pressure indications.
3. Use the approved procedure to verify priming and inspect the suction path; do not loosen a pressurized connection.
4. If the cause remains unclear, compare the installation with the OEM manual and escalate to a qualified technician.

**Evidence/confidence:** General troubleshooting knowledge; **عام / Général / General**. The listed source is a research paper, not an OEM operating procedure.

### 2. Unusual noise or vibration

**Symptoms**
- A new or worsening sound, rattling, or abnormal movement compared with the machine's normal condition.

**Possible causes**
- Air entrainment or cavitation-like operating conditions.
- Bearing, coupling, alignment, mounting, or impeller-related problems.
- Operation outside the intended system conditions.

**General checks**
1. Do not touch rotating parts or remove guards while running.
2. Record the sound, operating state, recent maintenance, and available alarm/trend information from a safe location.
3. If noise is severe, rapidly worsening, or accompanied by leakage, overheating, or a protection trip, follow the site's shutdown/escalation procedure.
4. Inspect alignment, mounting, coupling, bearings, and internal parts only after isolation and under the OEM procedure.

**Evidence/confidence:** General triage only; **يحتاج مراجعة / À vérifier / Needs review** for the specific pump and fault.

### 3. Leakage around the shaft seal

**Symptoms**
- Visible liquid around the seal area or an increasing leak compared with the accepted normal condition.

**Possible causes**
- Seal wear or damage, incorrect installation, unsuitable operating conditions, or shaft/bearing-related movement.

**General checks**
1. Keep clear of hot, hazardous, or pressurized liquid.
2. Record the location and observed rate without approaching an unsafe leak.
3. Isolate and depressurize using the site's approved procedure before inspection.
4. Confirm seal type, compatibility, installation method, and replacement criteria in the OEM documentation.

**Evidence/confidence:** General triage only; **يحتاج مراجعة / À vérifier / Needs review**.

### 4. Motor overload or overheating

**Symptoms**
- Motor or drive reports an overload/temperature alarm, trips, or shows abnormal heating.

**Possible causes**
- Mechanical load or pump operating condition outside the expected range.
- Electrical supply, motor, cable, or drive issue.
- Cooling or ventilation problem.

**General checks**
1. Read and record the exact alarm code and available operating data; do not repeatedly reset a protective trip.
2. Check for external obstruction or cooling/ventilation issues only when safe.
3. Electrical tests and any intervention require qualified personnel, suitable isolation, and the applicable electrical safety procedure.
4. Compare measured values and protection settings against the nameplate, drive documentation, and OEM limits. Do not infer numeric limits from this knowledge file.

**Evidence/confidence:** General triage only; **عام / Général / General**.

## Retrieval and response rules

- Match the user's wording against the multilingual terms above, but do not treat a keyword match as proof of root cause.
- Present causes as hypotheses and ask for equipment model, operating state, alarms, recent changes, and relevant safe observations when missing.
- For numeric setpoints, electrical limits, torque, clearances, or acceptance tolerances, say: **راجع دليل المصنع / Consultez le manuel du fabricant / Consult the manufacturer's manual.**
- Cite the source record and label general guidance separately from source-confirmed facts.
- Do not reproduce source tables, figures, datasets, or long passages in this draft.
