from sys import platform
from os import system, environ, geteuid, getenv

class AptInstall:
	def __init__(self) -> None:
		system(f'{self.isSudo() == True and "" or "sudo"} apt update')

	def isSudo(self) -> bool:
		if not environ.get("SUDO_UID") and geteuid() != 0:
			return False
		else:
			return True

	def installPackages(self, *packages:str, accept:bool = False) -> None:
		system(f'{self.isSudo() == True and "" or "sudo"} apt install {accept == True and "-y" or ""} {packages}')
		print("RUNNING:", f'{self.isSudo() == True and "" or "sudo"} apt install {accept == True and "-y" or ""} {packages}', flush=True)

def on_startup(command, dirty:bool):
	if (getenv('ENABLED_SOCIAL') != None and bool(getenv('ENABLED_SOCIAL'))):
		# MkDocs social requirement
		if platform == "linux":
			AptInstall().installPackages('libcairo2-dev', 'libfreetype6-dev', 'libffi-dev', 'libjpeg-dev', 'libpng-dev', 'libz-dev', accept=True)