#!/usr/bin/env python3
"""Manually download selected licensed benchmarks; never called by app/runtime."""
from __future__ import annotations
import argparse, hashlib, io, json, sys, urllib.request, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BENCHMARK_ROOT=ROOT/"data"/"benchmarks"
UCI_URL="https://archive.ics.uci.edu/static/public/447/condition+monitoring+of+hydraulic+systems.zip"
ZENODO_API="https://zenodo.org/api/records/19109150"
URMA_FILE="URMA_Database.mat"
URMA_SIZE=47340410
URMA_SHA256="e0e976d1298dfdab98d6935b789b4483b47c357469fc4643a14bda70095e88d2"
MAX_UCI_ARCHIVE=120*1024*1024
MAX_UCI_EXTRACTED=650*1024*1024

def request_bytes(url,limit):
 req=urllib.request.Request(url,headers={"User-Agent":"MaintenanceAIToolkit-BenchmarkFetcher/1.0"})
 with urllib.request.urlopen(req,timeout=90) as response:
  declared=response.headers.get("Content-Length")
  if declared and int(declared)>limit: raise ValueError(f"Refusing oversized download ({declared} bytes)")
  data=response.read(limit+1)
 if len(data)>limit: raise ValueError("Download exceeded configured size limit")
 return data

def safe_extract_uci(archive,destination):
 destination.mkdir(parents=True,exist_ok=True); written=0
 def extract(blob,depth=0):
  nonlocal written
  if depth>2: raise ValueError("Unexpected nested archive depth")
  with zipfile.ZipFile(io.BytesIO(blob)) as zf:
   bad=zf.testzip()
   if bad: raise ValueError(f"ZIP CRC failure: {bad}")
   for info in zf.infolist():
    if info.is_dir(): continue
    name=Path(info.filename.replace("\\\\","/")).name
    if name.lower().endswith(".zip"):
     extract(zf.read(info),depth+1); continue
    if not name.lower().endswith(".txt"): continue
    if info.file_size<0 or written+info.file_size>MAX_UCI_EXTRACTED: raise ValueError("Extracted data exceeds size limit")
    if not name or name in {".",".."}: raise ValueError("Unsafe archive member")
    target=destination/name
    if target.exists(): raise ValueError(f"Duplicate archive filename: {name}")
    payload=zf.read(info); target.write_bytes(payload); written+=len(payload)
 extract(archive)
 if not (destination/"profile.txt").exists(): raise ValueError("Expected profile.txt not found")
 return written

def download_uci():
 dest=BENCHMARK_ROOT/"uci-hydraulic"/"raw"
 if (dest/"profile.txt").exists(): print(f"Already present: {dest}"); return
 print("UCI archive is about 73 MB compressed and about 530 MB extracted.")
 size=safe_extract_uci(request_bytes(UCI_URL,MAX_UCI_ARCHIVE),dest)
 print(f"Extracted {size:,} bytes to {dest}")

def download_urma():
 dest=BENCHMARK_ROOT/"urma-crti"/"raw"; target=dest/URMA_FILE
 if target.exists():
  if hashlib.sha256(target.read_bytes()).hexdigest()==URMA_SHA256: print(f"Already present and verified: {target}"); return
  raise ValueError("Existing URMA file has unexpected SHA-256")
 meta=json.loads(request_bytes(ZENODO_API,2*1024*1024).decode("utf-8"))
 item=next((x for x in meta.get("files",[]) if x.get("key")==URMA_FILE),None)
 if not item: raise ValueError(f"{URMA_FILE} not found in Zenodo record")
 if int(item.get("size",-1))!=URMA_SIZE: raise ValueError("Zenodo file size changed; review manifest first")
 links=item.get("links") or {}; url=links.get("self") or links.get("content")
 if not url: raise ValueError("Zenodo API has no file URL")
 payload=request_bytes(url,URMA_SIZE+1024)
 digest=hashlib.sha256(payload).hexdigest()
 if digest!=URMA_SHA256: raise ValueError(f"SHA-256 mismatch: {digest}")
 dest.mkdir(parents=True,exist_ok=True); target.write_bytes(payload)
 print(f"Downloaded and checksum-verified: {target}")

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument("dataset",choices=("uci-hydraulic","urma-crti")); args=parser.parse_args()
 try: download_uci() if args.dataset=="uci-hydraulic" else download_urma()
 except Exception as exc: print(f"Benchmark download failed: {exc}",file=sys.stderr); return 1
 return 0
if __name__=="__main__": raise SystemExit(main())
