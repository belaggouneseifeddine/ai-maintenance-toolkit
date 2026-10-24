# OEM and Machine Platform Index — Arabic / French / English

**Purpose:** a maintained directory of official OEM portals plus a structured intake method for future model-specific fault records. This document is a discovery index, **not an OEM alarm-code database**.

## Evidence status

| Status | Meaning | May the app state a manufacturer-confirmed cause? |
|---|---|---|
| `portal-only` | Official portal located; no model manual inspected for this fault | No |
| `manual-found` | Candidate manual located; relevant passage not yet checked | No |
| `claim-reviewed` | Reviewer checked a specific claim against a passage in the source | Only for the exact claim and applicable product family |
| `model-verified` | Exact model/variant and controller match, manual revision and passage recorded | Yes, within the recorded scope only |

All 29 entries in the structured platform index remain `portal-only`, with zero field-verified alarm-code records. Separately, 66 model-scoped records have been reviewed against cited manuals, but are manual-claim-reviewed—not field-verified. A manufacturer's support page is not evidence for the meaning of a particular alarm.

## China and Asia — machine builders and control platforms

| Manufacturer | Equipment / platform scope | Official documentation or service portal |
|---|---|---|
| INOVANCE | MD-series VFDs; IS/SV servo; H5U/AC-series PLC; HMI and motion control | [Open official portal](https://www.inovance.com/global/support/download-documentation.html) |
| Delta Electronics | AS/DVP PLC; MS300 and other VFD families; ASDA servo; HMI/CNC/motion | [Open official portal](https://downloadcenter.delta-china.com.cn/en-US/DownloadCenter) |
| XINJE | XD/XG/XL PLC; DS servo; HMI; VFD and motion control | [Open official portal](https://en.xinje.com/web/downloadCenter/index) |
| HuazhongCNC (HNC) | HNC8 CNC; HSV servo drives; CNC PLC and machine parameters | [Open official portal](https://en.huazhongcnc.com/download-center-of-huazhongcnc/) |
| GSK CNC | CNC controllers; Servo drives and motors | [Open official portal](https://gskcnc.com/support.php) |
| Syntec | CNC controllers; Motion control and machine-tool integration | [Open official portal](https://syntecclub.com/) |
| LNC / Lynuc | CNC controllers; Drive, I/O and parameter documentation | [Open official portal](https://www.lynuc.cn/download.aspx) |
| Leadshine | Servo and stepper drives; Motion controllers; Robot motion components | [Open official portal](https://www.leadshine.com/downloads.html) |
| Mitsubishi Electric FA China | MELSEC PLC; MELSERVO; FREQROL inverters; CNC; GOT HMI; MELFA robots | [Open official portal](https://www.mitsubishielectric-fa.cn/site/file-center) |
| YIZUMI | Injection moulding; die casting; rubber machinery; automation | [Open official portal](https://www.yizumi.com/en/service) |
| Haitian International | Servo-hydraulic and all-electric injection moulding machines | [Open official portal](https://haitianinter.com/service/) |
| Bodor Laser | Laser cutting and welding machines | [Open official portal](https://www.bodor.com/en/service/) |

## Europe — machine builders and control platforms

| Manufacturer | Equipment / platform scope | Official documentation or service portal |
|---|---|---|
| Siemens | SIMATIC PLC; SINUMERIK CNC; SINAMICS drives; WinCC HMI/SCADA; PROFINET | [Open official portal](https://support.industry.siemens.com/) |
| Bosch Rexroth | IndraDrive; ctrlX AUTOMATION; MTX CNC; hydraulic control | [Open official portal](https://docs.automation.boschrexroth.com/) |
| Beckhoff | TwinCAT; EtherCAT; IPC; I/O and motion control | [Open official portal](https://www.beckhoff.com/en-us/support/download-finder/) |
| HEIDENHAIN | TNC CNC controls; Encoders; Machine-tool feedback systems | [Open official portal](https://www.heidenhain.com/service/technical-support) |
| Schneider Electric | Modicon PLC; Altivar drives; HMI; electrical protection | [Open official portal](https://www.se.com/ww/en/download/) |
| ABB | ACS drives; low-voltage motors; robotics; motion control | [Open official portal](https://www.abb.com/) |
| SEW-EURODRIVE | Gearmotors; drive inverters; motion control | [Open official portal](https://download.sew-eurodrive.com/) |
| Lenze | Drives; controllers; motion and automation | [Open official portal](https://www.lenze.com/en-de/services/downloads) |
| KUKA | KR industrial robots; KRC controllers | [Open official portal](https://www.kuka.com/en-us/services/downloads) |
| TRUMPF | Laser cutting; punching; machine tools | [Open official portal](https://www.trumpf.com/en_INT/service/) |
| HOMAG | Woodworking and panel processing machinery | [Open official portal](https://www.homag.com/en/services) |
| Pilz | Safety relays; safety PLC; sensors and machine safety | [Open official portal](https://www.pilz.com/en-INT/support) |

## Existing fault records to connect first

| Fault record ID | Suggested source IDs to consult | Why these sources fit |
|---|---|---|
| `chinese-cnc-controller-unknown-alarm` | `huazhongcnc-download-center`, `gsk-cnc-support`, `syntec-download-library`, `lynuc-download-center` | Several CNC controller families are plausible; exact installed controller must decide which manual applies. |
| `chinese-vfd-parameter-loss` | `inovance-global-downloads`, `delta-industrial-download-center`, `xinje-download-center` | Drive make/model and parameter backup method must be identified before giving recovery steps. |
| `chinese-servo-encoder-alarm` | `inovance-global-downloads`, `leadshine-downloads`, `xinje-download-center` | Encoder alarm semantics differ by drive series and feedback interface. |
| `chinese-packaging-photoeye-fault` | `festo-support-portal`, plus the machine builder's manual | Sensor and PLC wiring/logic may come from different suppliers. |
| `injection-molding-hydraulic-pressure-low` | `yizumi-machine-service`, `haitian-machine-service` | Use only if the machine is confirmed as the named builder; hydraulic circuit options vary by model. |
| `laser-cutter-chiller-alarm` | `bodor-laser-service`, `trumpf-service` | Select the actual laser machine builder and cooling package; do not mix brands. |
| `european-cnc-tool-magazine-fault` | `siemens-industrial-support`, `bosch-rexroth-documentation`, `heidenhain-technical-support` | First identify the CNC/controller; tool magazine sequence may be machine-builder PLC logic. |
| `european-robot-axis-reference-lost` | `kuka-downloads`, `abb-drive-manuals` | Confirm robot brand/controller generation and whether the fault is from robot control or external drive. |
| `european-packaging-safety-door-fault` | `pilz-machine-safety-support`, `siemens-industrial-support` | Safety device and PLC diagnostics are separate evidence sources; do not bypass an interlock. |
| `european-conveyor-synchronization-error` | `beckhoff-downloads`, `siemens-industrial-support`, `sew-eurodrive-documentation` | Check motion controller/network/drive separately and match each model. |

These are source suggestions, not proof that a specific record applies to a manufacturer's machine. The structured index in `oem-platform-index.json` is the authoritative mapping for the current portal directory.

## Required intake fields for an OEM-specific fault record

Capture the following before adding a fault-code entry:

1. Machine builder / brand and exact machine model.
2. Serial number or variant only when needed to select the correct configuration; do not expose personal/customer secrets.
3. Controller type and exact model (CNC, PLC, HMI, robot controller).
4. Drive, servo, inverter, sensor, or safety-device manufacturer and model where relevant.
5. Exact alarm code and original screen text, including punctuation; attach a translation separately rather than replacing the original.
6. Firmware/software version and the machine/control configuration if relevant.
7. Official manual title, document number, revision/date, section and page.
8. Exact statement supported by that passage, reviewer, review date and evidence status.
9. Safe checks and stop/escalation conditions reviewed by a qualified person.

## Proposed data shape for future model-specific entries

```json
{
  "id": "oem-<brand>-<model>-<controller>-<alarm-code>",
  "machineBuilder": "exact brand",
  "machineModel": "exact model or family with applicability noted",
  "controller": { "brand": "exact brand", "model": "exact model", "firmware": "if known" },
  "alarm": { "code": "verbatim code", "textOriginal": "verbatim display text", "language": "en" },
  "source": { "sourceRef": "registered-source-id", "documentTitle": "exact title", "revision": "exact revision/date", "section": "exact section", "page": "exact page", "url": "official document URL" },
  "supportedClaim": "only the claim supported by the cited passage",
  "evidenceStatus": "claim-reviewed",
  "reviewedBy": "reviewer role or identifier",
  "reviewedOn": "YYYY-MM-DD"
}
```

This schema supports future additions. The runtime retrieves the 66 source-linked summaries from the Worker-loaded markdown knowledge file, but exact OEM alarm-code matching by installed machine/controller/firmware is not yet implemented. Do not present general fault records as manufacturer-confirmed, and do not treat manual-claim-reviewed summaries as field-verified.

## Safety and licensing

- Never recommend bypassing guards, emergency stops, safety relays, door interlocks or protective circuits.
- Do not download firmware or write controller parameters as a first-line diagnostic action.
- Before intrusive inspection, use the site's approved lockout/tagout and verify absence of hazardous energy through qualified personnel.
- Link to manuals rather than copying them into this repository unless redistribution terms explicitly permit reuse.
- Do not auto-fetch portals or PDFs based only on a URL; check terms, access rules, and exact product applicability.
- Do not invent alarm-code meanings, pinouts, parameter numbers, thresholds, torque values, pressure limits, or part numbers.

## Official-source verification notes

Selected portals were checked as official manufacturer or official regional support pages during this work. Portal availability can change; a portal check does not verify any particular alarm claim. Examples include INOVANCE documentation downloads, XINJE's download center, Delta's download center, Mitsubishi Electric FA China's file center, YIZUMI service, Haitian global service, Bodor service, Siemens Industry Support and Pilz support.

External portal pages: [INOVANCE](https://www.inovance.com/global/support/download-documentation.html), [XINJE](https://en.xinje.com/web/downloadCenter/index), [Delta](https://downloadcenter.delta-china.com.cn/en-US/DownloadCenter), [Mitsubishi Electric FA China](https://www.mitsubishielectric-fa.cn/site/file-center), [YIZUMI](https://www.yizumi.com/en/service), [Haitian](https://haitianinter.com/service/), [Bodor](https://www.bodor.com/en/service/), [Siemens](https://support.industry.siemens.com/), [Pilz](https://www.pilz.com/en-INT/support).


## Newly indexed manufacturers — 2026-10-24

- **OMRON** — [official Europe downloads](https://industrial.omron.eu/en/services-support/support/downloads): PLC, HMI, servo, VFD, sensors and safety. Select the exact series and document revision.
- **Yaskawa** — [official drive manuals](https://www.yaskawa.com/products/drives/drive-manuals): industrial drives. Robot/servo cases still require the exact controller and product documentation.
- **Fagor Automation** — [official manuals](https://www.fagorautomation.com/en/categoria_descargas/manuals-en/): CNC, drives and feedback systems; the library includes installation and error-solving manuals.
- **FANUC** — [official MyPortal support](https://www.fanucamerica.com/support/myportal): CNC and robotics documentation/alarm lookup; access and regional availability may differ.

These four entries in this supplemental portal list remain `portal-only`; no field-verified alarm has been recorded for these four profiles. The separate structured evidence file contains selected manual-claim-reviewed records for other listed product families.