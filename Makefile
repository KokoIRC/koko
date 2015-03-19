atom=/Applications/Atom.app/Contents/MacOS/Atom
node_modules=./node_modules/.bin

run: build
	@$(atom) .

build: clean
	@mkdir build
	@$(node_modules)/browserify ./frontend/js/app.js -o build/built.js -t reactify

clean:
	@rm -rf ./build
