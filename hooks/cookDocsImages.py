from mkdocs.structure.files import Files
from mkdocs.config.base import Config
from pathlib import Path
from urllib.parse import unquote
import re
import shutil

class CookDocsImages:	
	def standardizeName(self, filename) -> str:
		# Matching https://github.com/nicholaswilde/cook-docs/blob/main/pkg/document/template.go#L50
		noSpaces = re.sub(r"\s", "-", filename)
		lowercase = noSpaces.lower()
		return lowercase
	
	def moveAsset(self, originalPath:Path, originalFileName:str) -> None:
		originalPathParts = list(originalPath.parent.parts)
		del originalPathParts[0]
		newPath = Path("site").joinpath("/".join(originalPathParts), "assets", "images", f"{self.standardizeName(originalFileName)}{originalPath.suffix}")
		# Check if assets folder exists
		if not newPath.parent.is_dir():
			# CF
			# drwxr-xr-x 2 buildbot nogroup    4096 Sep  4 22:48 .
			# GH
			# drwxr-xr-x 2 runner docker    4096 Sep  4 22:48 .
			# 
			# Keep base folder perms of 755
			newPath.parent.mkdir(mode=0o755, parents=True)
			print("Created", newPath.parent, flush=True)
		# Check if image exists
		if not newPath.is_file():
			shutil.copyfile(originalPath, newPath)
			print("Moved", originalPath, "to", newPath, flush=True)

def on_files(files:Files, config:Config) -> Files:
	newFiles = []
	for oldFile in files:
		newFile = oldFile
		if oldFile.is_media_file():
			oldFilePath = Path("recipes").joinpath(Path(unquote(oldFile.url)))
			if oldFilePath.suffix == ".png" or oldFilePath.suffix == ".jpg":
				if oldFile.name != "icon" and oldFile.name != "favicon":
					CookDocsImages().moveAsset(originalPath=oldFilePath, originalFileName=oldFile.name)
					# Skip appending to newFiles for custom copied files
					continue
		newFiles.append(newFile)
	return Files(newFiles)