from mkdocs.config.base import Config
from pathlib import Path
from .ciSystem import CiSystem, CiSystemType
from shutil import copyfile

class PostSetup:
	def __init__(self) -> None:
		if (CiSystem() == CiSystemType.CLOUDFLARE):
			print("Cloudflare detected: running post setup")
			PostSetupCF()

class PostSetupCF:
	def __init__(self) -> None:
		oldPath = Path("_headers")
		newPath = Path(oldPath.resolve().parent.joinpath("site", oldPath.name))
		# copyfile(oldPath, newPath)
		print("Moved", oldPath, "to", newPath)

def on_post_build(config:Config) -> None:
	PostSetup()