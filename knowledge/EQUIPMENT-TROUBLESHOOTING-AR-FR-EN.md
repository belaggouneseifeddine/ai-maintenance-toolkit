# Equipment Troubleshooting Knowledge Pack — Review Required

> **Evidence status:** Original-worded conservative triage, not a manufacturer-approved service instruction. No model-specific OEM manual has been matched to the user's equipment. Equipment-specific claims must not be labeled manufacturer-verified until the exact model and applicable manual revision are recorded.
>
> **Safety gate:** Assess hazards first. Apply site lockout/tagout (LOTO), isolate electrical, hydraulic, pneumatic, thermal, gravity and process energy as applicable, verify zero-energy state, and depressurize only by the approved method. Never defeat interlocks/protection, open a pressurized circuit, enter guarded areas while moving, or repeatedly reset a trip.
>
> **Numeric limits:** No pressure, current, torque, clearance, temperature, speed, timing or tolerance values are specified. For model-specific values: **راجع دليل المصنع / Consultez le manuel du fabricant / Consult the manufacturer's manual.**

## Evidence and review protocol

- **Source status:** General safety-first triage written for this project; not a verbatim extraction from an OEM manual.
- **Confidence:** **عام / Général / General** for broad observations; **يحتاج مراجعة / À vérifier / Needs review** for diagnoses and repairs.
- **Manufacturer verification:** Pending exact manufacturer, model, serial/variant, manual title, document ID, revision/date and relevant page/section.
- OEM manuals are reference links only unless the specific document explicitly grants reuse rights. A downloadable manual is not automatically licensed for redistribution.
- A verified claim requires equipment model, OEM document URL, document ID/revision/date, page/section, claim checked, reviewer/date, confidence and reuse permission.
- Do not use vibration numerical datasets, copied tables/figures, guessed setpoints or generic values presented as OEM limits.

## 1. Water and centrifugal pumps

| Concept | العربية | Français | English |
|---|---|---|---|
| Pump | مضخة مياه؛ مضخة طاردة مركزية | pompe à eau; pompe centrifuge | water pump; centrifugal pump |
| No/low flow | انعدام التدفق؛ ضعف التدفق | absence de débit; débit faible | no flow; low flow |
| Low discharge pressure | ضغط الطرد منخفض | faible pression de refoulement | low discharge pressure |
| Loss of prime / air | فقدان التحضير؛ دخول الهواء | perte d'amorçage; prise d'air | loss of prime; air ingress |
| Seal leakage | تسرب مانع التسرب | fuite de garniture | seal leakage |
| Bearing | محمل؛ رولمان بلي | roulement | bearing |

### No or low flow
**Possible hypotheses, not a diagnosis:** loss of prime/air in suction path; valve closed or mispositioned; suction path obstruction; incorrect drive status/rotation/speed command; operating conditions different from design.
**General checks:** Read alarms and safe local indications; confirm approved valve line-up and process demand; inspect suction conditions only under site procedure; compare the installation with the exact pump manual. Never loosen a connection to check flow.

### Leakage, unusual noise or overheating
Possible hypotheses include seal/gasket wear, air/cavitation-like conditions, bearing/coupling/alignment issue, obstruction, load or drive fault. The symptom alone cannot confirm the cause. Keep clear of hazardous liquid; record the location and alarm; isolate/depressurize before inspection; use the correct parts list and manual. Stop/escalate under site rules if a condition worsens rapidly.
**OEM verification:** exact pump/motor/VFD model and current manual required.

## 2. Valves, check valves and actuators

| Concept | العربية | Français | English |
|---|---|---|---|
| Valve | صمام | vanne | valve |
| Check/non-return valve | صمام عدم رجوع | clapet anti-retour | check valve; non-return valve |
| Control valve | صمام تحكم | vanne de régulation | control valve |
| Stuck valve | صمام عالق | vanne bloquée | stuck valve |
| Actuator | مشغل؛ محرك صمام | actionneur | actuator |
| Position feedback | إشارة موضع الصمام | retour de position | valve position feedback |
| Solenoid valve | صمام كهرومغناطيسي | électrovanne | solenoid valve |

### Valve fails to move or feedback disagrees
Possible hypotheses: invalid/missing command, unavailable electrical/pneumatic/hydraulic supply, actuator fault, mechanical binding, position sensor/limit-switch fault, wiring or logic issue.
General checks: compare command, feedback and alarms; check permissives and utility indicators without bypassing interlocks; inspect externally only when safe; consult the exact valve/actuator manual for permitted tests and fail position. Do not force the stem or manually override a safety-related actuator without approved procedure.

### Check valve suspected of leaking back
Possible hypotheses: debris, wear, damaged sealing surfaces, incorrect installation/orientation or unsuitable valve selection.
General checks: confirm flow arrow and model from markings/drawings; use safe indicators; isolate/depressurize before removal; verify seat/material/orientation/part number from the OEM document.
**OEM verification:** valve type, size/class, material code, actuator model and manual revision required.

## 3. Hydraulic systems

| Concept | العربية | Français | English |
|---|---|---|---|
| Hydraulic pump | مضخة هيدروليكية | pompe hydraulique | hydraulic pump |
| Pressure loss | فقدان الضغط | perte de pression | pressure loss |
| Internal/external leakage | تسرب داخلي/خارجي | fuite interne/externe | internal/external leakage |
| Relief valve | صمام تنفيس الضغط | soupape de décharge | pressure relief valve |
| Cylinder drift | انجراف الأسطوانة | dérive du vérin | cylinder drift |
| Oil overheating | ارتفاع حرارة الزيت | surchauffe de l'huile | oil overheating |

### Weak movement or loss of force
Possible hypotheses: fluid supply/level issue, leakage, air contamination, filter restriction, pump wear, relief/control-valve issue, or mechanical binding. Symptoms alone do not distinguish causes.
General checks: stop if a hose is damaged or a high-pressure leak is suspected; hydraulic injection injury requires urgent medical assessment even if the wound looks small. Read safe indicators; inspect fluid level/leaks only under site procedure; use the circuit schematic and OEM pressure-test procedure. Never use a hand to locate a leak or loosen a pressurized fitting.

### Oil overheating or foaming
Possible hypotheses: operating conditions, cooling issue, wrong/low fluid, air ingress or component fault. Verify fluid specification and operating range in the machine documentation; do not top up with unverified oil.
**OEM verification:** machine model, hydraulic schematic, fluid specification and pump/valve manuals required.

## 4. Pneumatic systems

| Concept | العربية | Français | English |
|---|---|---|---|
| Compressed air | هواء مضغوط | air comprimé | compressed air |
| Pressure regulator | منظم ضغط | régulateur de pression | pressure regulator |
| Pneumatic cylinder | أسطوانة هوائية | vérin pneumatique | pneumatic cylinder |
| Solenoid valve | صمام كهرومغناطيسي | électrovanne | solenoid valve |
| Air leak | تسرب هواء | fuite d'air | air leak |
| Filter/regulator/lubricator | وحدة ترشيح وتنظيم وتزييت | unité filtre-régulateur-lubrificateur | FRL unit |

### Cylinder slow or not moving
Possible hypotheses: air supply unavailable/outside allowed range, blocked or misconnected tubing, valve/coil/control fault, cylinder binding, exhaust restriction or leakage.
General checks: read controller alarms and air-preparation indicators; listen for leaks only from a safe position; isolate and exhaust stored pneumatic energy before disconnecting tubing; verify porting, seal kit and lubrication rules in the component manual. Secure suspended loads: motion can occur when air returns.
**OEM verification:** component series/order code and circuit diagram required.

## 5. SCADA, HMI, PLC, sensors and drives

| Concept | العربية | Français | English |
|---|---|---|---|
| SCADA/HMI | نظام SCADA؛ واجهة تشغيل | SCADA; IHM | SCADA; HMI |
| Communication loss | فقدان الاتصال | perte de communication | communication loss |
| Stale value | قراءة قديمة/مجمّدة | valeur figée | stale/frozen value |
| Sensor fault | عطل حساس | défaut capteur | sensor fault |
| VFD trip | فصل مغير التردد | déclenchement du variateur | VFD trip |
| Interlock/permissive | تعشيق أمان؛ شرط تشغيل | interverrouillage; permissif | interlock; permissive |
| Alarm history | سجل الإنذارات | historique des alarmes | alarm history |

### HMI value frozen/implausible or communication lost
Possible hypotheses: sensor/power/wiring issue, PLC/controller state, network/protocol problem, stale tag, scaling/configuration error or HMI display issue.
General checks: record timestamp, tag, quality/status, related alarms and whether local instruments agree; determine if one tag, one device or multiple devices are affected; follow approved OT/network process. Do not force PLC I/O, disable alarms or write setpoints just to make a display look normal.

### VFD/drive trip
Possible hypotheses: protection detected a motor, load, supply, temperature, wiring or configuration condition. The exact code must be interpreted using the correct drive model and firmware manual.
General checks: record the complete code/text and operating context before any reset; do not repeatedly reset a trip; compare machine and drive alarms; electrical measurements and parameter changes require qualified personnel and approved isolation. Never bypass protection.
**OEM verification:** SCADA/HMI/PLC/VFD manufacturer, model, firmware, architecture and exact alarm required.

## 6. Air compressors

| Concept | العربية | Français | English |
|---|---|---|---|
| Compressor | ضاغط هواء | compresseur d'air | air compressor |
| Low discharge pressure | انخفاض ضغط الطرد | pression de refoulement faible | low discharge pressure |
| High temperature | ارتفاع الحرارة | température élevée | high temperature |
| Oil carryover | حمل الزيت مع الهواء | entraînement d'huile | oil carryover |
| Intake filter | مرشح السحب | filtre d'admission | intake filter |
| Separator | فاصل الزيت/الهواء | séparateur air/huile | air/oil separator |
| Emergency stop | إيقاف طارئ | arrêt d'urgence | emergency stop |

### Low output/pressure
Possible hypotheses: air demand/leakage exceeds output, intake restriction, control/unloading issue, separator/filter restriction or internal fault. Applicability depends on compressor type and model.
General checks: record exact alarm, controller state and history; inspect external leaks only where safe; check service indicators and maintenance records; use the exact service manual for filter, separator, lubrication and control procedures. Never open a pressurized receiver/separator, defeat a safety valve or apply generic reset instructions.

### High temperature, oil alarm or repeated shutdown
Possible hypotheses: cooling/ventilation issue, fluid/lubrication issue, operating condition, sensor fault or component malfunction. Follow the exact controller's alarm definition and shutdown/cool-down procedure; record the alarm before reset; verify fluids and parts against the manual; escalate repeated safety-related alarms.
**OEM verification:** compressor make/model/serial, controller/software, alarm code and service manual required.

## 7. Cross-equipment response contract

1. State observed symptoms separately from possible causes.
2. Label general hypotheses **عام / Général / General**. Mark a claim manufacturer-verified only when the applicable OEM manual and page/section have been checked.
3. Begin intervention guidance with energy isolation and hazard controls.
4. Ask for make/model, exact alarm, operating state, recent changes and safe observations when missing.
5. Never invent setpoints, limits, torque, tolerances, part compatibility or maintenance intervals.
6. If model-specific information is missing say: **راجع دليل المصنع / Consultez le manuel du fabricant / Consult the manufacturer's manual.**
7. Do not claim an online source was fetched or verified without a fetch record and human review.
