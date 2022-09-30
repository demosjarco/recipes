from sys import platform
from os import system, WEXITSTATUS, environ, geteuid, getenv

class AptInstall:
	def __init__(self) -> None:
		system(f'{self.isSudo() == True and "" or "sudo"} apt update')

	def isSudo(self) -> bool:
		if not environ.get("SUDO_UID") and geteuid() != 0:
			return False
		else:
			return True

	def installPackages(self, *packages:str, assumeYes:bool = False) -> None:
		aptAttempt = system(f'{self.isSudo() == True and "" or "sudo"} apt install {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("Exit", WEXITSTATUS(aptAttempt))

def on_startup(command, dirty:bool):
	if (getenv('ENABLED_SOCIAL') != None and bool(getenv('ENABLED_SOCIAL'))):
		# MkDocs social requirement
		if platform == "linux":
			AptInstall().installPackages('libcairo2-dev', 'libfreetype6-dev', 'libffi-dev', 'libjpeg-dev', 'libpng-dev', 'libz-dev', assumeYes=True)