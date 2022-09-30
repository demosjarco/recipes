from sys import platform
from os import system, WEXITSTATUS, environ, getenv

class AptInstall:
	def __init__(self) -> None:
		system(f'sudo apt update')

	def installPackages(self, *packages:str, assumeYes:bool = False) -> None:
		aptAttempt = system(f'sudo apt install {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("EXIT CODE:", aptAttempt, WEXITSTATUS(aptAttempt))

def on_startup(command, dirty:bool):
	if (getenv('ENABLED_SOCIAL') != None and bool(getenv('ENABLED_SOCIAL'))):
		# MkDocs social requirement
		if platform == "linux":
			AptInstall().installPackages('libcairo2-dev', 'libfreetype6-dev', 'libffi-dev', 'libjpeg-dev', 'libpng-dev', 'libz-dev', assumeYes=True)