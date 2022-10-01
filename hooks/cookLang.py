from mkdocs.config.base import Config
from ghapi.all import GhApi
import re
from pathlib import Path
from urllib.parse import ParseResult, urlparse
from requests import get
from io import DEFAULT_BUFFER_SIZE
from zipfile import ZipFile

class CookLang:
	def __init__(self) -> None:
		self.download(self.getDownloadLink())

	def getDownloadLink(self) -> ParseResult:
		ghAssets = GhApi().repos.get_latest_release('cooklang', 'CookCLI').assets
		for ghAsset in ghAssets:
			if re.search(r'CookCLI_\d+\.\d+\.\d+_linux_amd64\.zip', ghAsset.name):
				return urlparse(ghAsset.browser_download_url)

	def download(self, downloadUrl:ParseResult) -> None:
		zipFileLocation = Path(Path(downloadUrl.path).name)
		downloadAttempt = get(downloadUrl.geturl(), stream = True)
		with open(zipFileLocation, "wb") as zipFile:
			for chunk in downloadAttempt.iter_content(chunk_size=DEFAULT_BUFFER_SIZE):
				if chunk:
					zipFile.write(chunk)
		print(f"Downloaded {downloadUrl.geturl()} to {zipFileLocation.resolve().relative_to(Path.cwd())}")
		self.unzip(zipFileLocation)

	def unzip(self, zipLocation:Path) -> None:
		with ZipFile(zipLocation) as zip:
			zip.extractall(path=zipLocation.parent)
			print(f"Unzipped {len(zip.namelist())} file(s) from {zipLocation.resolve().relative_to(Path.cwd())} to {zipLocation.parent.resolve().relative_to(Path.cwd())}")
		self.delzip(zipLocation)

	def delzip(self, zipLocation:Path) -> None:
		zipLocation.unlink()
		print(f"Deleted {zipLocation}")

def on_config(config:Config) -> Config:
	CookLang()