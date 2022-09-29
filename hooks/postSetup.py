from mkdocs.config.base import Config
from pathlib import Path
from shutil import copyfile

class PostSetup:
	def __init__(self) -> None:
		PostSetupCF.moveHeaders()
			

class PostSetupCF:
	def moveHeaders() -> None:
		oldPath = Path("_headers")
		newPath = Path(oldPath.resolve().parent.joinpath("site", oldPath.name))
		copyfile(oldPath, newPath)
		print("Moved", oldPath, "to", newPath, flush=True)

def on_post_build(config:Config) -> None:
	PostSetup()