NODE_BIN=./node_modules/.bin
ELECTRON=$(NODE_BIN)/electron
BROWSERIFY=$(NODE_BIN)/browserify
TSC=$(NODE_BIN)/tsc
LESS=$(NODE_BIN)/lessc
ASAR=$(NODE_BIN)/asar

all: dep build

run: build
	@$(ELECTRON) .

dep:
	@npm install

build: clean
	@mkdir build
	@mkdir build/browser
	@mkdir build/renderer
	# move config
	cp -r config build/
	# build renderer scripts
	$(TSC) -p ./renderer
	$(BROWSERIFY) ./build/renderer/app.js -o build/renderer.js --ignore ipc --debug
	# build browser scripts
	$(TSC) -p ./browser
	# build styles
	$(LESS) ./style/main.less > build/built.css

clean: clean-asar
	@rm -rf ./build

asar: clean-asar build
	@mkdir asar
	@cp ./main.js asar/
	@cp ./index.html asar/
	@cp ./package.json asar/
	@cp -r ./build asar/
	@cp -r ./config asar/
	@cp -r ./resource asar/
	@cd asar; npm install --production; cd ..
	$(ASAR) pack asar build/app.asar

clean-asar:
	@rm -rf ./asar

download-shell: clean-shell
	@mkdir shell
	@curl -o shell/osx.zip https://raw.githubusercontent.com/noraesae/koko-shell/master/zip/osx.zip
	@curl -o shell/win32.zip https://raw.githubusercontent.com/noraesae/koko-shell/master/zip/win32.zip
	@curl -o shell/win64.zip https://raw.githubusercontent.com/noraesae/koko-shell/master/zip/win64.zip

clean-shell:
	@rm -rf ./shell

package: package-mac package-win

package-mac: clean asar
	@echo "packaging an executable for OS X executable"
	@if [ ! -d ./shell ]; then make download-shell; fi
	@unzip shell/osx.zip -d build
	@cp build/app.asar build/Koko.app/Contents/Resources/
	@echo "done"

package-win: clean asar
	@echo "packaging executables for Windows done"
	@if [ ! -d ./shell ]; then make download-shell; fi
	@unzip shell/win32.zip -d build/win32
	@unzip shell/win64.zip -d build/win64
	@cp build/app.asar build/win32/resources/
	@cp build/app.asar build/win64/resources/
	@echo "done"

.PHONY: run dep build clean
