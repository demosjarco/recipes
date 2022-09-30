from mkdocs.config.base import Config
from subprocess import run
from os import getenv

class CookDocs:
	def __init__(self) -> None:
		self.download()
		self.run()

	def download(self) -> None:
		pass

	def run(self) -> None:
		pass

def on_config(config:Config) -> Config:
	CookDocs()