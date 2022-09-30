from sys import platform
from os import system, WEXITSTATUS, environ, getenv

class PackageManager:
	def __init__(self) -> None:
		pass

	def installPackages(self, *packages:str, assumeYes:bool = False) -> None:
		pass

class AptInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()
		system('sudo apt update')

	def installPackages(self, *packages:str, assumeYes:bool = False) -> None:
		super().installPackages(packages, assumeYes=assumeYes)
		aptAttempt = system(f'sudo apt install {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("EXIT CODE:", aptAttempt, WEXITSTATUS(aptAttempt))

class YumInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()
		system('sudo yum check-update')

	def installPackages(self, *packages: str, assumeYes: bool = False) -> None:
		super().installPackages(*packages, assumeYes=assumeYes)
		yumAttempt = system(f'sudo yum install {assumeYes == True and "-y" or ""} {" ".join(packages)}')

class ZypperInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()

	def installPackages(self, *packages: str, assumeYes: bool = False) -> None:
		super().installPackages(*packages, assumeYes=assumeYes)
		yumAttempt = system(f'sudo zypper install  {assumeYes == True and "-y" or ""} {" ".join(packages)}')

def on_startup(command, dirty:bool):
	if (getenv('ENABLED_SOCIAL') != None and bool(getenv('ENABLED_SOCIAL'))):
		# MkDocs social requirement
		if platform == "linux":
			AptInstall().installPackages('libcairo2-dev', 'libfreetype6-dev', 'libffi-dev', 'libjpeg-dev', 'libpng-dev', 'libz-dev', assumeYes=True)
			# YumInstall().installPackages('cairo-devel' 'freetype-devel' 'libffi-devel' 'libjpeg-devel' 'libpng-devel' 'zlib-devel', assumeYes=True)
			# ZypperInstall().installPackages('cairo-devel' 'freetype-devel' 'libffi-devel' 'libjpeg-devel' 'libpng-devel' 'zlib-devel', assumeYes=True)