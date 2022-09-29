from enum import IntEnum
from os import getenv

class CiSystemType(IntEnum):
	CLOUDFLARE = 0
	GITHUB = 1

class CiSystem:
	def getSystem() -> CiSystemType:
		if (getenv('CI_SYSTEM_OVERRIDE') != None and int(getenv('CI_SYSTEM_OVERRIDE')) >= 0):
			return CiSystemType(int(getenv('CI_SYSTEM_OVERRIDE')))
		else:
			if (getenv('CF_PAGES') != None and int(getenv('CF_PAGES')) == 1):
				return CiSystemType.CLOUDFLARE
			elif (getenv('GITHUB_ACTIONS') != None and bool(getenv('GITHUB_ACTIONS')) == True):
				return CiSystemType.GITHUB