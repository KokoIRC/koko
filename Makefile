NODE_BIN=./node_modules/.bin
ELECTRON=$(NODE_BIN)/electron
TSC=$(NODE_BIN)/tsc
LESS=$(NODE_BIN)/lessc
ELECTRON_PKG=$(NODE_BIN)/electron-packager

all: dep build

run: build
	@$(ELECTRON) .

dep:
	@npm install
	@typings install

build: clean
	@mkdir build
	@mkdir build/browser
	@mkdir build/renderer
	# move config
	cp -r config build/
	# build renderer scripts
	$(TSC) --jsx react --module commonjs -p ./renderer
	# build browser scripts
	$(TSC) -p ./browser
	# build styles
	$(LESS) ./style/main.less > build/built.css

clean:
	@rm -rf ./build ./staging

copy-resources: clean build
	@mkdir staging
	@cp ./main.js staging/
	@cp ./index.html staging/
	@cp ./package.json staging/
	@cp -r ./build staging/
	@cp -r ./config staging/
	@cp -r ./resource staging/
	@cp -r ./typings staging/
	@cd staging; npm install --production --registry=https://registry.npm.taobao.org; cd ..

download-shell: clean-shell
	@mkdir shell
	@curl -o shell/osx.zip https://raw.githubusercontent.com/noraesae/koko-shell/master/zip/osx.zip
	@curl -o shell/win32.zip https://raw.githubusercontent.com/noraesae/koko-shell/master/zip/win32.zip
	@curl -o shell/win64.zip https://raw.githubusercontent.com/noraesae/koko-shell/master/zip/win64.zip

clean-shell:
	@rm -rf ./shell

package: package-mac package-win

package-mac: copy-resources
	@echo "packaging an executable for OS X executable"
	@if [ ! -d ./shell ]; then make download-shell; fi
	@unzip shell/osx.zip -d build/osx
	$(ELECTRON_PKG) ./staging/. Koko --platform=darwin --out=build/osx --icon=resource/image/koko.icns
	@echo "done"

package-win: copy-resources
	@echo "packaging executables for Windows done"
	@if [ ! -d ./shell ]; then make download-shell; fi
	@unzip shell/win32.zip -d build/win32
	@unzip shell/win64.zip -d build/win64
	$(ELECTRON_PKG) ./staging Koko --platform=win32 --arch=ia32 --out=build/win32 --icon=resource/image/logo.png
	$(ELECTRON_PKG) ./staging Koko --platform=win32 --arch=x64 --out=build/win64 --icon=resource/image/logo.png
	@echo "done"

.PHONY: run dep build clean
