atom=/Applications/Atom.app/Contents/MacOS/Atom
node_modules=./node_modules/.bin

run: build
	@$(atom) .

npminstall:
	@npm install

build: clean npminstall
	@mkdir build
	@$(node_modules)/browserify ./frontend/js/app.js -o build/built.js \
															-t reactify --ignore ipc ;\

clean:
	@rm -rf ./build
