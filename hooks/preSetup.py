from sys import platform
from distro import id as distroId
from os import system, WEXITSTATUS, getenv

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
		if WEXITSTATUS(aptAttempt):
			aptFixAttempt = system(f'sudo apt install {assumeYes == True and "-y" or ""} --fix-broken')
			print("EXIT CODE:", aptFixAttempt, WEXITSTATUS(aptFixAttempt))

class YumInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()
		system('sudo yum check-update')

	def installPackages(self, *packages: str, assumeYes: bool = False) -> None:
		super().installPackages(*packages, assumeYes=assumeYes)
		yumAttempt = system(f'sudo yum install {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("EXIT CODE:", yumAttempt, WEXITSTATUS(yumAttempt))

class ZypperInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()

	def installPackages(self, *packages: str, assumeYes: bool = False) -> None:
		super().installPackages(*packages, assumeYes=assumeYes)
		zypperAttempt = system(f'sudo zypper install  {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("EXIT CODE:", zypperAttempt, WEXITSTATUS(zypperAttempt))

def on_startup(command, dirty:bool):
	if (getenv('ENABLED_SOCIAL') != None and bool(getenv('ENABLED_SOCIAL'))):
		# MkDocs social requirement
		if platform == "linux":
			if distroId() == "ubuntu" or distroId() == "debian":
				AptInstall().installPackages('libcairo2-dev', 'libfreetype6-dev', 'libffi-dev', 'libjpeg-dev', 'libpng-dev', 'libz-dev', assumeYes=True)
			elif distroId() == "fedora":
				YumInstall().installPackages('cairo-devel' 'freetype-devel' 'libffi-devel' 'libjpeg-devel' 'libpng-devel' 'zlib-devel', assumeYes=True)
			elif distroId() == "opensuse":
				ZypperInstall().installPackages('cairo-devel' 'freetype-devel' 'libffi-devel' 'libjpeg-devel' 'libpng-devel' 'zlib-devel', assumeYes=True)