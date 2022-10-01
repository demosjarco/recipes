from sys import platform
from distro import id as distroId
# Must import full os or WEXITSTATUS crashes other systems
import os

class PackageManager:
	def __init__(self) -> None:
		pass

	def installPackages(self, *packages:str, assumeYes:bool = False) -> None:
		pass

class AptInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()
		os.system('sudo apt update')

	def installPackages(self, *packages:str, assumeYes:bool = False) -> None:
		super().installPackages(packages, assumeYes=assumeYes)
		aptAttempt = os.system(f'sudo apt install {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		if os.WEXITSTATUS(aptAttempt) >= 100:
			print(f'Error {os.WEXITSTATUS(aptAttempt)}', f'Failed to install {" ".join(packages)}')

class YumInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()
		os.system('sudo yum check-update')

	def installPackages(self, *packages: str, assumeYes: bool = False) -> None:
		super().installPackages(*packages, assumeYes=assumeYes)
		yumAttempt = os.system(f'sudo yum install {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("EXIT CODE:", yumAttempt, os.WEXITSTATUS(yumAttempt))

class ZypperInstall(PackageManager):
	def __init__(self) -> None:
		super().__init__()

	def installPackages(self, *packages: str, assumeYes: bool = False) -> None:
		super().installPackages(*packages, assumeYes=assumeYes)
		zypperAttempt = os.system(f'sudo zypper install  {assumeYes == True and "-y" or ""} {" ".join(packages)}')
		print("EXIT CODE:", zypperAttempt, os.WEXITSTATUS(zypperAttempt))

def on_startup(command, dirty:bool):
	# MkDocs social requirement
	if (os.getenv('ENABLED_SOCIAL') != None and bool(os.getenv('ENABLED_SOCIAL'))):
		if platform == "linux":
			if distroId() == "ubuntu" or distroId() == "debian":
				AptInstall().installPackages('libcairo2-dev', 'libfreetype6-dev', 'libffi-dev', 'libjpeg-dev', 'libpng-dev', 'libz-dev', assumeYes=True)
			elif distroId() == "fedora":
				YumInstall().installPackages('cairo-devel' 'freetype-devel' 'libffi-devel' 'libjpeg-devel' 'libpng-devel' 'zlib-devel', assumeYes=True)
			elif distroId() == "opensuse":
				ZypperInstall().installPackages('cairo-devel' 'freetype-devel' 'libffi-devel' 'libjpeg-devel' 'libpng-devel' 'zlib-devel', assumeYes=True)