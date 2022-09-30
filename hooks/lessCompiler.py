from mkdocs.config.base import Config
from pathlib import Path
from io import StringIO
import lesscpy

class LessCompiler:
	def compileCSS(cssFilePath:Path, lessFilePath:Path) -> None:
		with open(lessFilePath, 'r') as lessFile:
			lessFileText = lessFile.read()
		
		cssFileText = lesscpy.compile(StringIO(lessFileText), tabs=True, spaces=False)
		with open(cssFilePath, 'w') as cssFile:
			cssFile.write(cssFileText)
		print(f"Compiled {lessFilePath} to {cssFilePath}", flush=True)

# Run `on_config` because it runs before `get_files`
def on_config(config:Config) -> Config:
	for extraCssFilePath in config.extra_css:
		cssFilePath = Path("recipes").joinpath(Path(extraCssFilePath))
		lessFilePath = cssFilePath.with_suffix('.less')

		if lessFilePath.exists():
			LessCompiler.compileCSS(cssFilePath, lessFilePath)