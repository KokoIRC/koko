NODE_BIN=./node_modules/.bin
ATOM=$(NODE_BIN)/atom-shell
BROWSERIFY=$(NODE_BIN)/browserify
BABEL=$(NODE_BIN)/babel
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
	$(BROWSERIFY) ./renderer/app.js -o build/renderer.js -t babelify --ignore ipc
	# build browser scripts
	$(BABEL) ./browser/*.js -d build
	$(BABEL) ./common/*.js -d build
	# build styles
	$(LESS) ./style/main.less > build/built.css

clean:
	@rm -rf ./build

.PHONY: run dep build clean
