# Chinese & European Machine OEM Fault Investigation Matrix

**Purpose:** a practical index from manufacturer/model families to official documentation portals and structured symptom templates.

**Evidence status:** the case templates are not yet manufacturer-verified fault-code definitions. They intentionally contain no invented alarm numbers, parameter values, or universal reset procedures.

## How to turn a template into a verified case
1. Read the manufacturer and machine nameplate; capture exact model, serial range, control/drive model and firmware.
2. Record the alarm exactly as displayed and the machine state immediately before it occurred.
3. Open the official documentation link below and find the manual for that exact family/revision.
4. Record the manual title, revision/date, section/page, and the specific statement supporting the proposed cause/check.
5. Keep the case marked unverified until a competent reviewer checks it. Do not copy full manual text or PDFs into the repository without redistribution rights.

## Official manufacturer documentation index

| Region | Manufacturer / product family | Official documentation or service link | Scope |
|---|---|---|---|
| China | HuazhongCNC — HNC8 / HNC-808 / HNC-818 / HNC-848 CNC controls | [Official portal](https://en.huazhongcnc.com/download-center-of-huazhongcnc/)<br>[Official portal](https://www.huazhongcnc.com/portal/list/index/cid/74.html) | cnc, plc, servo, machine-tool |
| China | GSK CNC — 980TD / 928 / 218M CNC controls and DA98 servo drives | [Official portal](https://gskcnc.com/support.php) | cnc, servo, machine-tool |
| China | Inovance — MD-series AC drives; IS620 / IS810N / SV660 servo; H5U PLC and HMI | [Official portal](https://www.inovance.com/global/support/download-documentation.html)<br>[Official portal](https://www.inovance.eu/downloads) | vfd, servo, plc, hmi, motion |
| China | Leadshine — EL7 servo drives, stepper/closed-loop drives and motion controllers | [Official portal](https://www.leadshine.com/downloads.html) | servo, motion, cnc |
| Taiwan | LNC / Lynuc — N3 / N5 / U-series CNC controls and D-series drives | [Official portal](https://www.lynuc.cn/download.aspx) | cnc, servo, motion |
| Taiwan | Syntec — Syntec CNC controller and servo systems; confirm series on official portal | [Official portal](https://www.syntecamerica.com/download/) | cnc, servo, motion |
| Europe / Germany | Siemens — SINUMERIK CNC; SIMATIC PLC/HMI; SINAMICS drives | [Official portal](https://support.industry.siemens.com/) | cnc, plc, hmi, vfd, industrial-network |
| Europe / Germany | HEIDENHAIN — TNC / iTNC controls, encoders and PLC integration | [Official portal](https://www.heidenhain.com/service/technical-support) | cnc, encoder, plc, machine-tool |
| Europe / Germany | Beckhoff — TwinCAT, EtherCAT, IPC, EtherCAT I/O and drive systems | [Official portal](https://www.beckhoff.com/en-us/support/download-finder/) | plc, industrial-network, motion, hmi |
| Europe / Germany | Bosch Rexroth — ctrlX AUTOMATION / DRIVE, IndraDrive and MTX CNC | [Official portal](https://docs.automation.boschrexroth.com/) | servo, vfd, cnc, plc, hydraulic |
| Europe / France | Schneider Electric — Modicon PLC, Altivar drives, Harmony HMI and electrical protection | [Official portal](https://www.se.com/ww/en/download/) | plc, vfd, hmi, electrical-panel |
| Europe / Germany | SEW-EURODRIVE — MOVITRAC / MOVIDRIVE inverters, gearmotors and motion control | [Official portal](https://download.sew-eurodrive.com/) | vfd, electric-motor, conveyor, motion |
| Europe / Germany | Lenze — i-series drives, controllers and engineering tools | [Official portal](https://www.lenze.com/en-de/services/software-downloads) | vfd, servo, plc, conveyor |
| Europe / Germany | Festo — CPX / valve terminals, pneumatic valves and sensors | [Official portal](https://www.festo.com/) | pneumatic, valves, plc, instrumentation |
| Europe / Germany | TRUMPF — Laser cutting, punching and sheet-metal machines; machine type required | [Official portal](https://www.trumpf.com/en_INT/service/) | laser, cnc, machine-tool, cooling |
| Europe / Germany | HOMAG — Woodworking CNC, edge banding and panel processing machinery | [Official portal](https://www.homag.com/en/service) | cnc, conveyor, machine-tool, safety |
| Europe / Germany | KUKA — KR robots and KRC controller generations; controller generation required | [Official portal](https://www.kuka.com/en-us/services/downloads) | robotics, servo, safety, industrial-network |

## Structured case templates

### 1. CNC axis reference/homing lost

- **Template ID:** `cnc-axis-reference-lost`
- **Arabic:** قالب عطل قيد التحقق: CNC axis reference/homing lost
- **Français :** Modèle de panne à vérifier : CNC axis reference/homing lost
- **Relevant families:** HNC8; GSK 980/218; LNC N/U; Syntec CNC; SINUMERIK; HEIDENHAIN TNC
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 2. Axis following error or position deviation

- **Template ID:** `cnc-axis-following-error`
- **Arabic:** قالب عطل قيد التحقق: Axis following error or position deviation
- **Français :** Modèle de panne à vérifier : Axis following error or position deviation
- **Relevant families:** Inovance servo; Leadshine EL7; Huazhong HSV; SINAMICS; IndraDrive
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 3. Spindle not ready / drive enable missing

- **Template ID:** `cnc-spindle-not-ready`
- **Arabic:** قالب عطل قيد التحقق: Spindle not ready / drive enable missing
- **Français :** Modèle de panne à vérifier : Spindle not ready / drive enable missing
- **Relevant families:** HNC8; GSK; Syntec; SINUMERIK; MTX CNC
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 4. Tool change sequence timeout

- **Template ID:** `cnc-tool-change-sequence-timeout`
- **Arabic:** قالب عطل قيد التحقق: Tool change sequence timeout
- **Français :** Modèle de panne à vérifier : Tool change sequence timeout
- **Relevant families:** HNC8; GSK; SINUMERIK; HEIDENHAIN TNC; TRUMPF; HOMAG
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 5. Axis overtravel or limit input active

- **Template ID:** `cnc-axis-overtravel`
- **Arabic:** قالب عطل قيد التحقق: Axis overtravel or limit input active
- **Français :** Modèle de panne à vérifier : Axis overtravel or limit input active
- **Relevant families:** HNC8; GSK; LNC; Syntec; SINUMERIK; HEIDENHAIN
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 6. Servo encoder feedback missing/unstable

- **Template ID:** `servo-encoder-feedback-loss`
- **Arabic:** قالب عطل قيد التحقق: Servo encoder feedback missing/unstable
- **Français :** Modèle de panne à vérifier : Servo encoder feedback missing/unstable
- **Relevant families:** Huazhong HSV; GSK DA98; Inovance IS/SV; Leadshine EL7; SINAMICS; IndraDrive
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 7. Servo commutation/initialization alarm

- **Template ID:** `servo-motor-commutation-alarm`
- **Arabic:** قالب عطل قيد التحقق: Servo commutation/initialization alarm
- **Français :** Modèle de panne à vérifier : Servo commutation/initialization alarm
- **Relevant families:** Inovance IS/SV; Leadshine EL7; Huazhong HSV; Bosch Rexroth drives
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 8. Drive DC bus overvoltage during deceleration

- **Template ID:** `vfd-dc-bus-overvoltage`
- **Arabic:** قالب عطل قيد التحقق: Drive DC bus overvoltage during deceleration
- **Français :** Modèle de panne à vérifier : Drive DC bus overvoltage during deceleration
- **Relevant families:** Inovance MD; SINAMICS; Altivar; SEW MOVIDRIVE; Lenze i-series
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 9. Drive overcurrent during start or acceleration

- **Template ID:** `vfd-overcurrent-on-start`
- **Arabic:** قالب عطل قيد التحقق: Drive overcurrent during start or acceleration
- **Français :** Modèle de panne à vérifier : Drive overcurrent during start or acceleration
- **Relevant families:** Inovance MD; SINAMICS; Altivar; SEW; Lenze
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 10. Motor identification/autotune fails or is mismatched

- **Template ID:** `vfd-motor-autotune-mismatch`
- **Arabic:** قالب عطل قيد التحقق: Motor identification/autotune fails or is mismatched
- **Français :** Modèle de panne à vérifier : Motor identification/autotune fails or is mismatched
- **Relevant families:** Inovance MD; SINAMICS; Altivar; SEW; Lenze
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 11. PLC CPU STOP/fault state

- **Template ID:** `plc-cpu-stop-or-fault`
- **Arabic:** قالب عطل قيد التحقق: PLC CPU STOP/fault state
- **Français :** Modèle de panne à vérifier : PLC CPU STOP/fault state
- **Relevant families:** SIMATIC; Modicon; Beckhoff TwinCAT; Inovance H5U; Bosch Rexroth ctrlX
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 12. Remote I/O station or bus device lost

- **Template ID:** `plc-remote-io-device-lost`
- **Arabic:** قالب عطل قيد التحقق: Remote I/O station or bus device lost
- **Français :** Modèle de panne à vérifier : Remote I/O station or bus device lost
- **Relevant families:** SIMATIC PROFINET; Beckhoff EtherCAT; Modicon; ctrlX; Inovance
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 13. Device name, IP, node address or topology mismatch

- **Template ID:** `industrial-network-device-name-or-ip`
- **Arabic:** قالب عطل قيد التحقق: Device name, IP, node address or topology mismatch
- **Français :** Modèle de panne à vérifier : Device name, IP, node address or topology mismatch
- **Relevant families:** PROFINET/SIMATIC; EtherCAT/Beckhoff; Modbus/Modicon; ctrlX
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 14. HMI/SCADA tags stale or PLC connection lost

- **Template ID:** `hmi-plc-tag-communication-loss`
- **Arabic:** قالب عطل قيد التحقق: HMI/SCADA tags stale or PLC connection lost
- **Français :** Modèle de panne à vérifier : HMI/SCADA tags stale or PLC connection lost
- **Relevant families:** SIMATIC HMI; Modicon/Harmony; Beckhoff HMI; Inovance HMI
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 15. Guard/door/interlock condition not satisfied

- **Template ID:** `safety-interlock-not-satisfied`
- **Arabic:** قالب عطل قيد التحقق: Guard/door/interlock condition not satisfied
- **Français :** Modèle de panne à vérifier : Guard/door/interlock condition not satisfied
- **Relevant families:** TRUMPF; HOMAG; KUKA; Siemens; Schneider; HEIDENHAIN-integrated machines
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 16. Robot axis mastering/reference lost

- **Template ID:** `robot-axis-mastering-lost`
- **Arabic:** قالب عطل قيد التحقق: Robot axis mastering/reference lost
- **Français :** Modèle de panne à vérifier : Robot axis mastering/reference lost
- **Relevant families:** KUKA KR/KRC; use exact controller generation and robot model
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 17. Robot axis drive not enabled

- **Template ID:** `robot-drive-axis-not-enabled`
- **Arabic:** قالب عطل قيد التحقق: Robot axis drive not enabled
- **Français :** Modèle de panne à vérifier : Robot axis drive not enabled
- **Relevant families:** KUKA KR/KRC; servo system and safety chain must be identified
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 18. Hydraulic servo pressure/response abnormal

- **Template ID:** `hydraulic-servo-pressure-response`
- **Arabic:** قالب عطل قيد التحقق: Hydraulic servo pressure/response abnormal
- **Français :** Modèle de panne à vérifier : Hydraulic servo pressure/response abnormal
- **Relevant families:** Bosch Rexroth IndraDrive/ctrlX hydraulic applications; confirm valve/pump model
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 19. Valve terminal / pneumatic I/O communication fault

- **Template ID:** `pneumatic-valve-terminal-communication`
- **Arabic:** قالب عطل قيد التحقق: Valve terminal / pneumatic I/O communication fault
- **Français :** Modèle de panne à vérifier : Valve terminal / pneumatic I/O communication fault
- **Relevant families:** Festo CPX/valve terminal families; exact module and fieldbus required
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 20. Laser source/chiller interlock or temperature alarm

- **Template ID:** `machine-laser-chiller-interlock`
- **Arabic:** قالب عطل قيد التحقق: Laser source/chiller interlock or temperature alarm
- **Français :** Modèle de panne à vérifier : Laser source/chiller interlock or temperature alarm
- **Relevant families:** TRUMPF laser systems; exact laser and cooling unit model required
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 21. Axis/gantry synchronization or reference mismatch

- **Template ID:** `woodworking-machine-axis-sync`
- **Arabic:** قالب عطل قيد التحقق: Axis/gantry synchronization or reference mismatch
- **Français :** Modèle de panne à vérifier : Axis/gantry synchronization or reference mismatch
- **Relevant families:** HOMAG CNC/gantry machinery; machine and control generation required
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 22. Parameter/recipe/backup mismatch after service or replacement

- **Template ID:** `cnc-parameter-backup-mismatch`
- **Arabic:** قالب عطل قيد التحقق: Parameter/recipe/backup mismatch after service or replacement
- **Français :** Modèle de panne à vérifier : Parameter/recipe/backup mismatch after service or replacement
- **Relevant families:** HNC8; GSK; LNC; Syntec; SINUMERIK; HEIDENHAIN; never restore unverified backup
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 23. Servo/drive overtemperature or thermal model warning

- **Template ID:** `servo-drive-overtemperature`
- **Arabic:** قالب عطل قيد التحقق: Servo/drive overtemperature or thermal model warning
- **Français :** Modèle de panne à vérifier : Servo/drive overtemperature or thermal model warning
- **Relevant families:** Inovance; Leadshine; Huazhong HSV; SINAMICS; IndraDrive; Lenze
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

### 24. Cycle start blocked by permissive/sequence condition

- **Template ID:** `machine-cycle-blocked-by-permissive`
- **Arabic:** قالب عطل قيد التحقق: Cycle start blocked by permissive/sequence condition
- **Français :** Modèle de panne à vérifier : Cycle start blocked by permissive/sequence condition
- **Relevant families:** PLC/HMI-controlled CNC; packaging; woodworking and laser machines
- **Capture before diagnosis:** exact_alarm_text_or_code, machine_model_and_serial_range, controller_or_drive_model, firmware_or_software_version, operating_mode_and_recent_change, approved_event_log
- **Safe checks:** Capture the displayed alarm and event log before reset. Use the exact OEM manual and site-approved procedure. Do not bypass interlocks or change parameters without authorization.
- **Status:** `general-guidance-not-model-specific`; documentation links are discovery routes only.

## Safety and verification boundary

- A machine builder can combine components from several OEMs. Identify both the machine manufacturer and the controller/drive manufacturer.
- Chinese, Taiwanese, and European origin is not enough to infer an alarm meaning; families and firmware vary.
- Do not bypass door guards, emergency stops, light curtains, safe torque off, or other safety functions.
- Do not reset repeatedly, restore unknown parameter backups, or change drive parameters merely to clear a fault.
- For energized electrical diagnostics, motion systems, stored pressure, lasers, and hydraulic accumulators, follow lockout/isolation and competent-person procedures.

## Source links used for initial discovery

- HuazhongCNC publishes HNC8 controller manuals including parameter, programming, PLC, operation and commissioning manuals: https://en.huazhongcnc.com/download-center-of-huazhongcnc/
- GSK lists CNC controller and AC servo-driver manuals on its customer-support page: https://gskcnc.com/support.php
- Inovance lists downloads for drives, servo, PLC, HMI and CNC-related products: https://www.inovance.eu/downloads
- HEIDENHAIN describes technical support for controls, PLC integration, encoders and machine-tool service: https://www.heidenhain.com/service/technical-support
- Bosch Rexroth provides product documentation for ctrlX automation and drives: https://docs.automation.boschrexroth.com/
- Schneider Electric provides product documentation and software downloads: https://www.se.com/ww/en/download/
- Leadshine provides manuals and downloads for servo, stepper, controls and robot components: https://www.leadshine.com/downloads.html
