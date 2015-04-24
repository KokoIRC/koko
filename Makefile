NODE_BIN=./node_modules/.bin
ELECTRON=$(NODE_BIN)/electron
BROWSERIFY=$(NODE_BIN)/browserify
TSC=$(NODE_BIN)/tsc
LESS=$(NODE_BIN)/lessc

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

clean:
	@rm -rf ./build

.PHONY: run dep build clean
