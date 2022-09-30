import os
import subprocess
from .ciSystem import CiSystem
from .cookLang import CookLang
from .cookDocs import CookDocs
import shutil

class Docs:
	def __init__(self) -> None:
		CookLang()
		CookDocs()