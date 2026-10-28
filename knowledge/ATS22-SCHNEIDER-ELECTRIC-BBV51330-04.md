# Schneider Electric Altistart 22 (ATS22) — Evidence-backed maintenance record

**Status:** draft extracted from the Notion document record; not yet runtime-integrated or independently validated against the original PDF in this repository.
**Document:** `ATS22_user_manual_EN_BBV51330_04.pdf`
**Manufacturer/product:** Schneider Electric Altistart 22 soft starter for induction motors
**Manual reference/revision:** BBV51330, 09/2015; 85 pages as recorded in the Notion index
**Source record:** [Notion document record](https://app.notion.com/p/4071e53cfb9d8057b39ff71d1e213fe9)
**Source status:** a summary and page references were available in Notion; the original PDF itself was not exposed as a downloadable attachment in the fetched page response. Verify every item against the original manual before promoting this draft to approved knowledge.

## Applicability and model guardrails

| Family | Line voltage stated in source record | Control supply | Logic supply | Inside-delta connection |
|---|---:|---:|---:|---|
| ATS22…Q | 230–440 Vac | 230 Vac | 24 Vdc | Supported only under the manual's stated conditions |
| ATS22…S6 | 208–600 Vac | 230 Vac | 24 Vdc | Not supported |
| ATS22…S6U | 208–600 Vac | 110 Vac | 110 Vac | Not supported |

For inside-delta use, the source record specifies Q-family only, parameter `dLtA=dLt`, line voltage no higher than 440 Vac, phase sequence 1-2-3, and the exact manufacturer wiring diagram. The source record says the `In` setting is motor nameplate current divided by √3 for inside-delta wiring; for in-line wiring use the motor's rated nameplate current. Page references recorded: pp. 43 and 47.

**Do not infer family compatibility from “ATS22” alone.** Confirm the full ATS22 catalog number, supply variant, wiring arrangement, motor nameplate, and matching diagram first.

## Safety constraints

- Work is for qualified personnel under the site's approved procedure.
- Before inspection or maintenance, isolate every energy source, including external control power, and apply lockout/tagout (LOTO). Semiconductor switching does not provide complete isolation; hazardous voltage may remain on the load side while the line side is energized.
- Do not bypass a trip circuit. The source record says assign relay `R1` or `R2` to `trIP` and connect it to the line disconnecting device according to the applicable manufacturer diagram.
- Do not install power-factor-correction capacitors on the soft-starter output.
- Disconnect the ATS22 before insulation-resistance or high-voltage tests.
- Do not clear and restart after a short-circuit indication without the approved isolation and inspection process.
- Prevent unexpected restart: verify the control mode and start/stop input wiring before re-energizing.

These are safety gates, not optional diagnostic suggestions. The exact model manual and local electrical-safety rules take precedence.

## Fault-code extraction (manual troubleshooting section, pp. 75–76 as recorded)

The table below captures only the meaning/checks recorded in Notion. It is not a diagnosis for a particular unit and must be cross-checked against the original manual before being treated as approved knowledge.

| Code | Recorded interpretation / next verification |
|---|---|
| `OCF` | Overcurrent. Check application-appropriate settings/limits `OId` and `OIt` against the manual. |
| `OLF` | Motor overload. Check mechanical load, starter sizing, and settings `tHP` and `In`. |
| `OHF` | Starter overtemperature. Check ventilation, ambient temperature, and installation conditions. |
| `OSF` | Overvoltage. The code alone does not establish the root cause. |
| `PHF` | Phase loss. Check line/motor connections and disconnecting devices against the exact wiring diagram. |
| `PIF` | Phase sequence/reversal. Verify phase sequence against the manual's wiring requirements. |
| `SCF` | Short circuit. Stop and follow the approved isolation/inspection procedure; do not restart merely because the fault was cleared. |
| `SLF` | Modbus communication timeout. Check communication wiring and configuration for the installed network. |
| `SnbF`, `tbS` | Excessive starts/start frequency. The Notion record notes a wait before restarting: 5 minutes for frames A and 15 minutes for frames B–E for `tbS`; verify exact applicability in the original manual. |
| `StF` | Start time exceeded. Check the driven mechanism, compatibility of `tLS` with `ACC`, starter sizing, and `ILt`. |
| `UCF` | Undercurrent. Interpret in the context of the application and configuration; do not infer a cause from the code alone. |
| `USF` | Undervoltage. Verify line supply and operating conditions before any restart. |

## Minimum evidence to collect before a case-specific recommendation

1. Full ATS22 catalog number and supply variant.
2. Motor nameplate voltage/current and the actual wiring arrangement (in-line or inside-delta).
3. Exact displayed fault code and when it occurs (power-up, start, acceleration, running, or stop).
4. Relevant readings and observed conditions, recorded only by qualified personnel using approved safe procedures.
5. Confirmation of LOTO/isolation before physical inspection.

## Data quality and integration notes

- Evidence class: **manual-derived summary, pending primary-PDF verification**.
- Page anchors: applicability/settings pp. 43 and 47; troubleshooting pp. 75–76 (as reported by the Notion record).
- No unsupported numeric protection settings have been added.
- Do not generalize ATS22…Q wiring/settings to S6/S6U variants.
- Do not treat this Markdown file as a runtime knowledge source until the app's loader/index and tests are updated to consume it.
- Next validation step: obtain/inspect the original PDF, verify code labels and page anchors, then add automated tests for exact model gating, citation presence, and safety escalation.
