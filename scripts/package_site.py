"""Copy only public assets to dist; never publish source, reports or local tools."""
from pathlib import Path
import shutil
from build import ROOT, build

output = ROOT / "dist"
output.mkdir(exist_ok=True)
build(output)
for name in ("main.css", "main.js", "robots.txt", "llms.txt", "llms-full.txt", "CNAME", ".nojekyll"):
    shutil.copy2(ROOT / name, output / name)
shutil.copytree(ROOT / "assets", output / "assets", dirs_exist_ok=True)
print("Packaged public website in dist/")
