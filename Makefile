atom=/Applications/Atom.app/Contents/MacOS/Atom
node_modules=./node_modules/.bin

all: dep build

run: build
	@$(atom) .

dep:
	@npm install

build: clean
	@mkdir build
	@$(node_modules)/browserify ./frontend/js/app.js -o build/built.js \
															-t reactify --ignore ipc ;\

clean:
	@rm -rf ./build

.PHONY: run dep build clean
