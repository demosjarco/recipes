from mkdocs.config.base import Config
from subprocess import run
from os import getenv

class CookDocs:
	def __init__(self) -> None:
		self.download()
		self.reshim()
		self.run()

	def reshim(self) -> None:
		reshim_attempt = run("asdf reshim golang", capture_output=True, shell=True, check=False, text=True)
		print(reshim_attempt.stdout, flush=True)
		print(reshim_attempt.stderr, flush=True)
	
	def download(self) -> None:
		goInstallAttempt = run(["go", "install", "github.com/nicholaswilde/cook-docs/cmd/cook-docs@latest"], capture_output=True, check=True, text=True)
		print(goInstallAttempt.stdout, flush=True)
		print(goInstallAttempt.stderr, flush=True)

	def run(self) -> None:
		if (getenv('GITHUB_ACTIONS') != None and bool(getenv('GITHUB_ACTIONS')) == True):
			gopath = ''
		elif (getenv('CF_PAGES') != None and int(getenv('CF_PAGES')) == 1):
			gopath = ''

		ls1 = '$GOBIN'
		print(f"Before {ls1}")
		ls_attempt = run(f"ls -lia {ls1}", capture_output=True, shell=True, check=False, text=True)
		print(ls_attempt.stdout, flush=True)
		print(ls_attempt.stderr, flush=True)
		print(f"After {ls1}")

		print(f"Before {gopath}")
		ls_attempt2 = run(f"ls -lia {gopath}", capture_output=True, shell=True, check=False, text=True)
		print(ls_attempt2.stdout, flush=True)
		print(ls_attempt2.stderr, flush=True)
		print(f"After {gopath}")

		ls3 = '$HOME/go/bin'
		print(f"Before {ls3}")
		whereIs_attempt = run(f"ls -lia {ls3}", capture_output=True, shell=True, check=False, text=True)
		print(whereIs_attempt.stdout, flush=True)
		print(whereIs_attempt.stderr, flush=True)
		print(f"After {ls3}")

		whereIs = 'cook-docs'
		print(f"Before {whereIs}")
		whereIs_attempt = run(f"whereis {whereIs}", capture_output=True, shell=True, check=False, text=True)
		print(whereIs_attempt.stdout, flush=True)
		print(whereIs_attempt.stderr, flush=True)
		print(f"After {whereIs}")

		print(f"Before find {whereIs}")
		whereIs_attempt = run(f"find / -iname {whereIs}", capture_output=True, shell=True, check=False, text=True)
		print(whereIs_attempt.stdout, flush=True)
		print(whereIs_attempt.stderr, flush=True)
		print(f"After find {whereIs}")

		cookDocsAttempt = run([f"{gopath}cook-docs"], capture_output=True, shell=True, check=True, text=True)
		print(cookDocsAttempt.stdout, flush=True)
		print(cookDocsAttempt.stderr, flush=True)

def on_config(config: Config) -> Config:
	CookDocs()
