from mkdocs.config.base import Config
from pathlib import Path
from systemInfo import CiSystem, CiSystemType
from shutil import copyfile

class PostSetup:
	def __init__(self) -> None:
		if (CiSystem.getSystem() == CiSystemType.CLOUDFLARE):
			print("Cloudflare detected: running post setup", flush=True)
			PostSetupCF()

class PostSetupCF:
	def __init__(self) -> None:
		oldPath = Path("_headers")
		newPath = Path(oldPath.resolve().parent.joinpath("site", oldPath.name))
		copyfile(oldPath, newPath)
		print("Moved", oldPath, "to", newPath, flush=True)

def on_post_build(config:Config) -> None:
	PostSetup()