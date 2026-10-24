# Chinese & European Machine OEM Fault Investigation Matrix

**Purpose:** a practical index from manufacturer/model families to official documentation portals and structured symptom templates.

**Evidence status:** the case templates are not yet manufacturer-verified fault-code definitions. They intentionally contain no invented alarm numbers, parameter values, or universal reset procedures. Do not infer an alarm meaning from a support portal or product-family name.

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
| China | XINJE — XD/XG/XL PLC, DS servo, HMI and VFD families | [Official portal](https://en.xinje.com/web/downloadCenter/index) | plc, servo, vfd, hmi, motion |
| China | Delta Electronics — AS/DVP PLC, ASDA servo, VFD and HMI | [Official portal](https://downloadcenter.delta-china.com.cn/en-US/DownloadCenter) | plc, servo, vfd, hmi, cnc |
| China | YIZUMI — injection moulding, die casting and automation | [Official service portal](https://www.yizumi.com/en/service) | injection-moulding, hydraulic, servo |
| China | Haitian International — servo-hydraulic and all-electric injection moulding | [Official service portal](https://haitianinter.com/service/) | injection-moulding, hydraulic, servo |
| China | Bodor Laser — laser cutting/welding machinery and cooling interlocks | [Official service portal](https://www.bodor.com/en/service/) | laser, cooling, cnc, safety |
| Japan / China support | Mitsubishi Electric FA China — MELSEC PLC, MELSERVO, FREQROL, CNC, GOT HMI, MELFA robots | [Official file center](https://www.mitsubishielectric-fa.cn/site/file-center) | plc, servo, vfd, cnc, hmi, robotics |
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
| Europe / Germany | Pilz — safety relays, safety PLC, sensors and machine safety | [Official support portal](https://www.pilz.com/en-INT/support) | safety, safety-circuit, sensors, plc |

| Europe / Japan | OMRON — NX/NJ/CJ/CP PLC, 1S/G5 servo, MX2/RX2 drives | [Official downloads](https://industrial.omron.eu/en/services-support/support/downloads) | plc, hmi, servo, vfd, sensors, safety |
| Japan / Europe support | Yaskawa — GA/FP/HV drives, Sigma servo, MOTOMAN robots | [Official drive manuals](https://www.yaskawa.com/products/drives/drive-manuals) | vfd, servo, robotics, motion |
| Europe / Spain | Fagor Automation — CNC 8055/8060/8065/8070/CNCelite, DDS/QC drives | [Official manuals](https://www.fagorautomation.com/en/categoria_descargas/manuals-en/) | cnc, servo, feedback, machine-tool |
| Japan / global regional support | FANUC — Series 0i/30i CNC, servo amplifiers, ROBODRILL, robots/R-30i | [Official support portal](https://www.fanucamerica.com/support/myportal) | cnc, servo, robotics; portal access may be required |

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


### 25. VFD parameters missing after replacement or power event
- **Template ID:** `chinese-vfd-parameter-backup-check`
- **Arabic:** فقدان معلمات مغير التردد بعد الاستبدال أو انقطاع الطاقة
- **Français :** Paramètres du variateur manquants après remplacement ou coupure
- **Relevant families:** INOVANCE MD, Delta VFD, XINJE VFD; exact installed drive decides
- **Sources:** [INOVANCE](https://www.inovance.com/global/support/download-documentation.html), [Delta](https://downloadcenter.delta-china.com.cn/en-US/DownloadCenter), [XINJE](https://en.xinje.com/web/downloadCenter/index)
- **Safe checks:** Preserve the current state and backup evidence. Do not load a parameter set from another model or machine.
- **Status:** `general-guidance-not-model-specific`; no alarm code or recovery parameter is inferred.

### 26. Unknown CNC alarm on a Chinese-built machine
- **Template ID:** `chinese-cnc-alarm-identity-check`
- **Arabic:** إنذار CNC غير معروف في ماكينة مصنّعة في الصين
- **Français :** Alarme CNC inconnue sur une machine fabriquée en Chine
- **Relevant families:** HuazhongCNC/HNC, GSK, LNC and Syntec; machine origin does not identify the controller.
- **Sources:** [HuazhongCNC](https://en.huazhongcnc.com/download-center-of-huazhongcnc/), [GSK CNC](https://gskcnc.com/support.php), [LNC](https://www.lynuc.cn/download.aspx), [Syntec](https://syntecclub.com/)
- **Safe checks:** Record the original alarm text/code, exact CNC model, firmware and machine builder before searching the manual.
- **Status:** `general-guidance-not-model-specific`; never translate an unknown code into a guessed cause.

### 27. Injection moulding hydraulic pressure low
- **Template ID:** `chinese-injection-hydraulic-pressure-low`
- **Arabic:** انخفاض الضغط الهيدروليكي في آلة الحقن
- **Français :** Pression hydraulique basse sur presse à injecter
- **Relevant families:** YIZUMI or Haitian only when the machine nameplate confirms that builder and exact model.
- **Sources:** [YIZUMI service](https://www.yizumi.com/en/service), [Haitian service](https://haitianinter.com/service/)
- **Safe checks:** Read the pressure and alarm history through approved interfaces; do not loosen hydraulic fittings or adjust pressure settings without the exact manual and qualified authorization.
- **Status:** `general-guidance-not-model-specific`; hydraulic circuit options vary by machine.

### 28. Laser machine cooling/interlock alarm
- **Template ID:** `chinese-laser-cooling-interlock`
- **Arabic:** إنذار التبريد أو التعشيق في آلة ليزر
- **Français :** Alarme de refroidissement ou d’interverrouillage sur machine laser
- **Relevant families:** Bodor laser systems only if the machine brand is confirmed; other laser builders need their own manuals.
- **Source:** [Bodor service](https://www.bodor.com/en/service/)
- **Safe checks:** Capture the exact alarm and cooling-unit model. Never bypass laser, door, coolant-flow or temperature interlocks.
- **Status:** `general-guidance-not-model-specific`; no generic reset sequence is recommended.

### 29. Servo feedback or encoder alarm on a Chinese machine
- **Template ID:** `chinese-servo-feedback-alarm`
- **Arabic:** إنذار تغذية راجعة أو مشفر سيرفو في ماكينة صينية
- **Français :** Alarme de retour ou de codeur servo sur machine chinoise
- **Relevant families:** INOVANCE, Leadshine, XINJE or Huazhong HSV; exact drive family required.
- **Sources:** [INOVANCE](https://www.inovance.com/global/support/download-documentation.html), [Leadshine](https://www.leadshine.com/downloads.html), [XINJE](https://en.xinje.com/web/downloadCenter/index), [HuazhongCNC servo manuals](https://www.huazhongcnc.com/portal/list/index/cid/74.html)
- **Safe checks:** Record drive and motor model, encoder type, exact alarm and recent cable/motor changes. Intrusive inspection requires approved isolation.
- **Status:** `general-guidance-not-model-specific`; encoder alarm meanings differ by drive series.

### 30. Safety door/interlock chain not satisfied
- **Template ID:** `european-safety-door-loop`
- **Arabic:** شروط دائرة باب السلامة أو التعشيق غير مستوفاة
- **Français :** Chaîne de porte de sécurité ou d’interverrouillage non satisfaite
- **Relevant families:** Pilz safety components and Siemens PLC/safety architecture; identify the installed safety device and wiring.
- **Sources:** [Pilz support](https://www.pilz.com/en-INT/support), [Siemens Industry Support](https://support.industry.siemens.com/)
- **Safe checks:** Read safety diagnostics and status indicators using approved procedures. Never bypass a guard, safety relay or interlock to resume production.
- **Status:** `general-guidance-not-model-specific`; safety functions require competent review.

### 31. Conveyor synchronization or drive communication fault
- **Template ID:** `european-conveyor-drive-sync`
- **Arabic:** خلل مزامنة الناقل أو اتصال مغيرات التردد
- **Français :** Défaut de synchronisation du convoyeur ou de communication des variateurs
- **Relevant families:** Beckhoff TwinCAT/EtherCAT, Siemens SIMATIC/SINAMICS and SEW-EURODRIVE; exact topology required.
- **Sources:** [Beckhoff](https://www.beckhoff.com/en-us/support/download-finder/), [Siemens](https://support.industry.siemens.com/), [SEW-EURODRIVE](https://download.sew-eurodrive.com/)
- **Safe checks:** Capture PLC/network/drive diagnostics and topology before changing node names, addresses or parameters.
- **Status:** `general-guidance-not-model-specific`; identify whether the issue originates in control, network or drive before assigning a cause.

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


## Additional model-family investigation templates (not verified alarm definitions)

The following are structured starting points for capturing evidence. Their manufacturer names identify likely documentation routes only; they do **not** assert that a symptom is a known fault for every model in the family.

### OMRON — PLC I/O or fieldbus device missing
- **Template ID:** `omron-plc-io-or-fieldbus-loss`
- **Arabic:** فقدان وحدة دخل/خرج PLC أو جهاز على الشبكة الصناعية
- **French:** Module E/S API ou équipement de bus de terrain absent
- **Capture:** exact CPU, I/O/network module, network topology, displayed diagnostic, firmware, event log, manual revision/page.
- **Safe triage:** record the diagnostic and module/network status; check only approved indicators and connectors under site electrical safety rules; do not force outputs or bypass interlocks.
- **Evidence:** `general-guidance-not-model-specific`.

### OMRON — Servo not ready or position following error
- **Template ID:** `omron-servo-ready-or-following-error`
- **Arabic:** السيرفو غير جاهز أو خطأ تتبع الموضع
- **French:** Servo non prêt ou erreur de poursuite de position
- **Capture:** servo drive/motor model, controller, exact code/text, operating mode, recent mechanical changes, manual revision/page.
- **Safe triage:** retain alarm history; inspect only approved status indications and mechanical obstruction after safe isolation; no parameter edits or repeated resets without procedure.
- **Evidence:** `general-guidance-not-model-specific`.

### Yaskawa — Drive overcurrent or motor overload trip
- **Template ID:** `yaskawa-drive-overcurrent-or-overload`
- **Arabic:** فصل مغير التردد بسبب زيادة التيار أو حمل المحرك
- **French:** Déclenchement du variateur par surintensité ou surcharge moteur
- **Capture:** exact drive family/model, displayed code, motor nameplate, load condition, trip timing, manual revision/page.
- **Safe triage:** record the fault before reset; inspect load/mechanical binding only under approved isolation; do not change current limits or protection settings by guesswork.
- **Evidence:** `general-guidance-not-model-specific`.

### Yaskawa MOTOMAN — Robot servo alarm or safety stop
- **Template ID:** `yaskawa-motoman-servo-or-safety-stop`
- **Arabic:** إنذار سيرفو الروبوت أو توقف دائرة السلامة
- **French:** Alarme servo robot ou arrêt de sécurité
- **Capture:** robot/controller generation, exact alarm, axis, mode, safety-device state and event log.
- **Safe triage:** keep personnel outside the safeguarded space; do not defeat safety circuits or jog the robot until the OEM procedure and cell safety state are confirmed.
- **Evidence:** `general-guidance-not-model-specific`.

### Fagor Automation — CNC axis feedback/reference alarm
- **Template ID:** `fagor-cnc-axis-feedback-or-reference`
- **Arabic:** إنذار مرجع محور CNC أو تغذية راجعة
- **French:** Alarme de référence ou de retour d’axe CNC
- **Capture:** exact CNC model, drive and feedback device, exact alarm, axis, firmware, manual revision/page.
- **Safe triage:** preserve alarm history; use the matching Fagor error-solving/installation manual; do not alter axis parameters or reference offsets without authorization.
- **Evidence:** `general-guidance-not-model-specific`.

### FANUC — CNC servo amplifier alarm
- **Template ID:** `fanuc-servo-amplifier-alarm`
- **Arabic:** إنذار مضخم السيرفو في CNC
- **French:** Alarme d’amplificateur servo CNC
- **Capture:** CNC series, amplifier model, exact alarm number and text, axis, LEDs/status, software generation and manual revision/page.
- **Safe triage:** record the complete alarm and status before reset; follow the exact FANUC control/amplifier manual; board-level checks and replacement require qualified personnel and ESD/electrical procedures.
- **Evidence:** `general-guidance-not-model-specific`.

### FANUC — Robot controller alarm or axis unavailable
- **Template ID:** `fanuc-robot-controller-alarm`
- **Arabic:** إنذار متحكم الروبوت أو تعذر حركة أحد المحاور
- **French:** Alarme du contrôleur robot ou axe indisponible
- **Capture:** robot model, R-30i controller generation, exact alarm, axis, operation mode, safety state, software version and manual revision/page.
- **Safe triage:** preserve the alarm history; keep the robot cell safe and guarded; never bypass interlocks or reset safety faults without the approved procedure.
- **Evidence:** `general-guidance-not-model-specific`.
