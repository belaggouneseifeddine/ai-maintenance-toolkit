# Open-source industrial maintenance inventory — 2026-11-20

This is a research register, not an approval to copy code or datasets. README and repository licences do not automatically license upstream datasets, pretrained weights, or third-party documents.

## 1. eunsoo-suk/bearing-dataset

- Repository: https://github.com/eunsoo-suk/bearing-dataset
- Owner: eunsoo-suk
- Files inspected: `README.md`, `LICENSE`, `docs/datasets.md`
- Content: curated catalogue of bearing diagnosis/prognostics datasets, including CWRU, XJTU-SY, SEU, HUST, Paderborn, KAIST, NASA IMS, FEMTO/PRONOSTIA, and rotating machinery/gearbox collections.
- Repository code/document licence: MIT, as stated by the checked-in LICENSE.
- Dataset licences: not granted collectively by this repository. The dataset descriptions point to original university, challenge, and publisher sources; each dataset's terms must be checked at its original source before download or reuse.
- Source provenance: the catalogue identifies original institutions and source links per dataset. It is a secondary index, not the data origin.
- Quality observations: useful scope map; dataset operating conditions and fault-generation methods vary. The README and detailed descriptions can contain inconsistent counts/conditions; verify each source. Artificially seeded faults must not be treated as natural field prevalence.
- Leakage risk: bearing segments from the same physical bearing/run can leak across random train/test splits. Split by physical bearing, experiment, rig, or run-to-failure unit as appropriate.
- Runtime/Android: do not bundle raw vibration data or the Python tooling in the Android runtime. Use selected, legally cleared datasets only in offline evaluation on a development machine.
- Decision: **reference only** for the catalogue; individual datasets remain **pending primary-source licence verification**.
- Not imported.

## 2. CJR1-eng/industrial-anomaly-detection-benchmark

- Repository: https://github.com/CJR1-eng/industrial-anomaly-detection-benchmark
- Owner: CJR1-eng
- Files inspected: `README.md`, `requirements.txt`, `THIRD_PARTY_NOTICES.md`, `docs/evaluation_pitfalls.md`, `datasets/README.md`.
- Content: reproducible PaDiM industrial visual-anomaly evaluation, preprocessing and postprocessing audits, image-score aggregation experiments, dataset integrity checks, and leakage/evaluation protocol documentation.
- Code licence: no LICENSE file; README/THIRD_PARTY_NOTICES explicitly state no outbound licence has been chosen. Treat code as all-rights-reserved; do not copy.
- Data licence: MVTec AD and MVTec AD 2 are stated as CC BY-NC-SA 4.0 in THIRD_PARTY_NOTICES and datasets/README. The repository does not redistribute those datasets; users must obtain them from MVTec. Pretrained ImageNet weights have separate upstream terms.
- Original data source: MVTec AD / MVTec AD 2.
- Quality observations: useful, quantified examples of preprocessing errors, postprocessing ties, illumination/domain shift, aggregation sensitivity, and grouped evaluation. Results are specific to the declared Anomalib/PyTorch versions and MVTec visual-inspection task.
- Leakage risk: the repository explicitly audits content-level train/test leakage and grouped scene comparisons. Do not transfer image anomaly AUROC to machine fault diagnosis or root-cause accuracy.
- Dependencies: Python 3.12.7, PyTorch 2.14.1+CUDA, torchvision, Anomalib 2.7.0, Lightning 2.6.6, NumPy/SciPy/scikit-learn/Pandas and plotting dependencies. Far too heavy for the target Android runtime.
- Runtime/Android: no direct integration. Potentially use its evaluation discipline as a reference for future visual-inspection benchmarks, not as a diagnostic knowledge source.
- Decision: **reference only**; no code or dataset import.
- Not imported.

## 3. Existing benchmark interpretation rules reinforced

- MIMII/MIMII DUE audio labels support anomaly-detection benchmarking, not automatic root-cause truth.
- UCI hydraulic telemetry labels are benchmark states from a test rig, not generic repair instructions.
- NASA Prognostics and bearing run-to-failure datasets can support prognostic research only after unit-level splits, operating-regime checks and target definition.
- A model's anomaly score, classifier score, heuristic support score, posterior probability and RUL estimate are different quantities and must remain separately named.

## Next inventory targets

Rotate the next review through electric motors/VFD, gearboxes, compressors and fans. Inspect repository tree, source data records, code/data licences, original publishers, split methodology, dependencies, and Android/Worker feasibility before any import decision.
