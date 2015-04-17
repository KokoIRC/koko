NODE_BIN=./node_modules/.bin
ATOM=$(NODE_BIN)/atom-shell
BROWSERIFY=$(NODE_BIN)/browserify
TSC=$(NODE_BIN)/tsc
LESS=$(NODE_BIN)/lessc

all: dep build

run: build
	@$(ATOM) .

dep:
	@npm install

build: clean
	@mkdir build
	@mkdir build/browser
	# build renderer scripts
	# FIXME
	# $(BROWSERIFY) ./renderer/app.js -o build/renderer.js --ignore ipc
	# build browser scripts
	$(TSC) -p ./browser
	# build styles
	$(LESS) ./style/main.less > build/built.css

clean:
	@rm -rf ./build

.PHONY: run dep build clean
