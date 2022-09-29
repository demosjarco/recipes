import os
import subprocess
from .ciSystem import CiSystem
from .cookLang import CookLang
from .cookDocs import CookDocs
import shutil

class Docs:
	def __init__(self) -> None:
		# self.systemDebug()
		CookLang()
		CookDocs()
	
	def systemDebug(self) -> None:
		print('Detected CI system', self.systemType, flush=True)
		print('CI_SYSTEM_OVERRIDE', os.getenv('CI_SYSTEM_OVERRIDE'), flush=True)
		print('CF_PAGES', os.getenv('CF_PAGES'), flush=True)
		print('GITHUB_ACTIONS', os.getenv('GITHUB_ACTIONS'), flush=True)