from pathlib import Path
from shutil import copyfile
from urllib.parse import urlparse, urlunparse

from mkdocs.config.defaults import MkDocsConfig

class CSPGenerator:
	def __init__(self) -> None:
		self.directives: dict[str, str] = {}
		self.setupCSP()

	def _validate_domain(self, domain: str) -> bool:
		if domain.startswith("https://*."):
			parsed = urlparse(domain.replace("*.", ""))
		else:
			parsed = urlparse(domain)

		return all([parsed.scheme == "https", parsed.netloc])

	def _add_source(self, directive: str, domains: list[str], none_: bool, all_: bool, self_: bool, data_: bool = False, unsafe_inline_: bool = False, unsafe_hashes_: bool = False, unsafe_eval_: bool = False) -> None:
		flagsToAdd: list[str] = []
		domainsToAdd: set[str] = set()

		if self_:
			flagsToAdd.append("'self'")
		if all_:
			flagsToAdd.append("*")
		if none_:
			flagsToAdd.append("'none'")
		if data_:
			flagsToAdd.append("data:")
		if unsafe_inline_:
			flagsToAdd.append("'unsafe-inline'")
		if unsafe_hashes_:
			flagsToAdd.append("'unsafe-hashes'")
		if unsafe_eval_:
			flagsToAdd.append("'unsafe-eval'")

		for domain in domains:
			if self._validate_domain(domain):
				parsed = urlparse(domain)
				origin = urlunparse((parsed.scheme, parsed.netloc, "", "", "", ""))
				domainsToAdd.add(origin)
			else:
				print(f"Invalid domain: {domain}")

		if len(domainsToAdd) > 0:
			flagsToAdd.extend(sorted(domainsToAdd))

		if len(flagsToAdd) > 0 or len(domainsToAdd) > 0:
			self.directives[directive] = " ".join(flagsToAdd)

	def generate_csp(self) -> str:
		csp: list[str] = []

		for directive, value in self.directives.items():
			if value:
				csp.append(f"{directive} {value}")
			else:
				csp.append(directive)

		generatedCSP = "; ".join(csp)
		print("Content-Security-Policy:", generatedCSP, flush=True)
		return generatedCSP

	def save_to_file(self, filepath: Path = Path("_headers")) -> None:
		csp = self.generate_csp()
		new_lines: list[str] = []
		csp_written = False
		try:
			with open(filepath, 'r') as headerFile:
				lines = headerFile.readlines()

			in_root_selector = False
			for line in lines:
				stripped_line = line.strip()
				if stripped_line == "/*":
					new_lines.append(line)
					in_root_selector = True
				elif in_root_selector and stripped_line.startswith("Content-Security-Policy"):
					new_lines.append(f"  Content-Security-Policy: {csp}\n")
					csp_written = True
					in_root_selector = False
				else:
					new_lines.append(line)

			if not csp_written:
				new_lines.insert(new_lines.index("/*") + 1, f"  Content-Security-Policy: {csp}\n")

			with open(filepath, 'w') as headerFile:
				headerFile.writelines(new_lines)
		except FileNotFoundError:
			with open(filepath, 'w') as headerFile:
				headerFile.write("/*\n")
				headerFile.write(f"  Content-Security-Policy: {csp}\n")

	def add_default_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False, data_: bool = False, unsafe_inline_: bool = False, unsafe_hashes_: bool = False, unsafe_eval_: bool = False) -> None:
		self._add_source('default-src', domains, none_, all_, self_, data_, unsafe_inline_, unsafe_hashes_, unsafe_eval_)

	def add_script_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False, data_: bool = False, unsafe_inline_: bool = False, unsafe_hashes_: bool = False, unsafe_eval_: bool = False) -> None:
		self._add_source('script-src', domains, none_, all_, self_, data_, unsafe_inline_, unsafe_hashes_, unsafe_eval_)

	def add_style_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False, data_: bool = False, unsafe_inline_: bool = False, unsafe_hashes_: bool = False, unsafe_eval_: bool = False) -> None:
		self._add_source('style-src', domains, none_, all_, self_, data_, unsafe_inline_, unsafe_hashes_, unsafe_eval_)

	def add_image_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False, data_: bool = False) -> None:
		self._add_source('img-src', domains, none_, all_, self_, data_)

	def add_font_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False, data_: bool = False) -> None:
		self._add_source('font-src', domains, none_, all_, self_, data_)

	def add_connect_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('connect-src', domains, none_, all_, self_)

	def add_media_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('media-src', domains, none_, all_, self_)

	def add_object_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('object-src', domains, none_, all_, self_)

	def add_prefetch_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('prefetch-src', domains, none_, all_, self_)

	def add_child_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('child-src', domains, none_, all_, self_)

	def add_frame_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('frame-src', domains, none_, all_, self_)

	def add_worker_src(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('worker-src', domains, none_, all_, self_)

	def add_frame_ancestors(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('frame-ancestors', domains, none_, all_, self_)

	def add_form_action(self, domains: list[str], none_: bool = False, all_: bool = False, self_: bool = False) -> None:
		self._add_source('form-action', domains, none_, all_, self_)

	def add_upgrade_insecure_requests(self, enabled: bool = True) -> None:
		self.directives['upgrade-insecure-requests'] = ""

	def add_block_all_mixed_content(self) -> None:
		self.directives['block-all-mixed-content'] = ""

	def setupCSP(self) -> None:
		self.add_default_src([], False, False, True)
		self.add_script_src(["https://cdnjs.cloudflare.com", "https://giscus.app", "https://static.cloudflareinsights.com", "https://recipes-demosjarco-dev.translate.goog", "https://vic--recipes-pages-dev.translate.goog"], False, False, True, False, True, False, True)
		self.add_style_src(["https://giscus.app", "https://fonts.googleapis.com"], False, False, True, False, True)
		self.add_image_src(["https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://github.githubassets.com", "https://translate.google.com"], False, False, True, True)
		self.add_font_src(["https://fonts.gstatic.com"], False, False, True)
		self.add_connect_src(["https://cloudflareinsights.com", "https://api.github.com"], False, False, True)
		self.add_frame_src(["https://giscus.app"])
		self.add_upgrade_insecure_requests()

class PostSetup:
	def __init__(self) -> None:
		PostSetupCF.moveHeaders()

class PostSetupCF:
	def moveHeaders() -> None:
		oldPath = Path("_headers")
		newPath = Path(oldPath.resolve().parent.joinpath("site", oldPath.name))
		copyfile(oldPath, newPath)
		print("Moved", oldPath, "to", newPath, flush=True)

def on_post_build(config: MkDocsConfig) -> None:
	CSPGenerator().save_to_file()
	PostSetup()
