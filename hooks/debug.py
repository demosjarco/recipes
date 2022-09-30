from os import getenv

class Debug:
	def systemDebug(self) -> None:
		print('Detected CI system', self.systemType, flush=True)
		print('CI_SYSTEM_OVERRIDE', os.getenv('CI_SYSTEM_OVERRIDE'), flush=True)
		print('CF_PAGES', os.getenv('CF_PAGES'), flush=True)
		print('GITHUB_ACTIONS', os.getenv('GITHUB_ACTIONS'), flush=True)

def on_startup(command, dirty:bool):
	if getenv('DEBUG') != None and bool(getenv('DEBUG')):
		Debug.systemDebug()