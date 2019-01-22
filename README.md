# EdgySpaceStationCompiler
A Babylon 5 / Deep Space 9 themed compiler written in Typescript.


Setup TypeScript/Gulp
=====================

1. Install [npm](https://www.npmjs.org/), if you don't already have it
2. `npm install -g typescript` to get the TypeScript Compiler
3. `npm install -g gulp` to get the Gulp Task Runner
4. `npm install -g gulp-tsc` to get the Gulp TypeScript plugin

Your Workflow
=============

Just run `gulp` at the command line in the root directory of this project! Edit your TypeScript files in the source/scripts directory in your favorite editor. Visual Studio has some additional tools that make debugging, syntax highlighting, and more very easy. WebStorm looks like a nice option as well.

Gulp will automatically:

* Watch for changes in your source/scripts/ directory for changes to .ts files and run the TypeScript Compiler on it
* Watch for changes to your source/styles/ directory for changes to .css files and copy them to the dist/ folder

Running
=============
1. Open index.html in the browser. (I recommend Chrome, personally.)
