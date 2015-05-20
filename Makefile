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
	@curl -o shell/osx.zip https://raw.githubusercontent.com/hachibasu/koko-shell/master/zip/osx.zip
	@unzip shell/osx.zip -d shell

clean-shell:
	@rm -rf ./shell

package: clean asar
	@if [ ! -d ./shell ]; then make download-shell; fi
	@cp -av shell/koko.app build/
	@mv build/app.asar build/koko.app/Contents/Resources/
	@echo "done"

.PHONY: run dep build clean
