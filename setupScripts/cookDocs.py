import subprocess
import os

class CookDocs:
	def __init__(self) -> None:
		self.download()
		self.run()

	def download(self) -> None:
		testdebug = subprocess.run(["go", "install", "github.com/nicholaswilde/cook-docs/cmd/cook-docs@latest"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True, text=True)
		print(testdebug)

	def run(self) -> None:
		if (os.getenv('GITHUB_ACTIONS') != None and bool(os.getenv('GITHUB_ACTIONS')) == True):
			gopath = ''
		elif (os.getenv('CF_PAGES') != None and int(os.getenv('CF_PAGES')) == 1):
			gopath = '$GOPATH/bin/'

		print('running:', f'{gopath}cook-docs', flush=True)
		subprocess.run([f"{gopath}cook-docs"], capture_output=True, shell=True, check=True, text=True)