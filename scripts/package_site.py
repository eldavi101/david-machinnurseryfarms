"""Copy only public assets to dist; never publish source, reports or local tools."""
from pathlib import Path
import shutil
from build import ROOT, build
from security_policy import write_edge_policy

output = ROOT / "dist"
if output.is_symlink() or output.resolve() != ROOT.resolve() / "dist":
    raise ValueError("Refusing to package outside the project's dist directory")
if output.exists():
    shutil.rmtree(output)
output.mkdir()
build(output)
for name in ("main.css", "main.js", "robots.txt", "llms.txt", "llms-full.txt", "CNAME", ".nojekyll"):
    shutil.copy2(ROOT / name, output / name)
shutil.copytree(ROOT / "assets", output / "assets", dirs_exist_ok=True)
write_edge_policy(output, ROOT)
print("Packaged public website in dist/")
