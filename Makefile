NODE_MODULES=./node_modules/.bin
ATOM=$(NODE_MODULES)/atom-shell
BROWSERIFY=$(NODE_MODULES)/browserify

all: dep build

run: build
	@$(ATOM) .

dep:
	@npm install

build: clean
	@mkdir build
	@$(BROWSERIFY) ./frontend/js/app.js -o build/built.js -t reactify --ignore ipc

clean:
	@rm -rf ./build

.PHONY: run dep build clean
