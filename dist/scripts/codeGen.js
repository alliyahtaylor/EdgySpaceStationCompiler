var TSC;
(function (TSC) {
    var codeGen = /** @class */ (function () {
        function codeGen() {
            this.scopePointer = -1;
            this.opPointer = 0;
            this.code = [];
            this.staticTable = [];
            this.jumpTable = [];
            this.heapTable = [];
            //this.symbolTable = [];
            this.log = [];
            this.errors = [];
            for (var i = 0; i < 256; i++) {
                this.code.push("00");
            }
            //Load accumulator with 0
            this.setCode("A9");
            this.setCode("00");
            this.code[254] = "e".charCodeAt(0).toString(16).toUpperCase();
            this.code[253] = "s".charCodeAt(0).toString(16).toUpperCase();
            this.code[252] = "l".charCodeAt(0).toString(16).toUpperCase();
            this.code[251] = "a".charCodeAt(0).toString(16).toUpperCase();
            this.code[250] = "f".charCodeAt(0).toString(16).toUpperCase();
            this.code[248] = "e".charCodeAt(0).toString(16).toUpperCase();
            this.code[247] = "u".charCodeAt(0).toString(16).toUpperCase();
            this.code[246] = "r".charCodeAt(0).toString(16).toUpperCase();
            this.code[245] = "t".charCodeAt(0).toString(16).toUpperCase();
            this.heapStartPointer = 245;
        }
        codeGen.prototype.generate = function (analysis) {
            console.log("Do we start code gen at all?");
            var ast = analysis.ast;
            var scope = analysis.scopeTree;
            console.log("scope" + scope);
            this.scopeNodes = scope.traverseTree();
            var symbolTable = analysis.symbols;
            var scopePointer = -1;
            this.traverse(ast.root);
            console.log(this.log);
            this.staticArea();
            //backpatch
            return this.code;
        };
        codeGen.prototype.setCode = function (op) {
            this.code[this.opPointer++] = op;
            this.log.push("Generating op code " + op);
            if (this.opPointer >= 256) {
                this.errors.push("Code Generation Error. No More Code Memory.");
            }
        };
        codeGen.prototype.traverse = function (node) {
            //TODO look at how I handled productions in AST to have the correct spelling/capitalization
            if (node.name == "VarDecl") {
                this.log.push("Generating Variable Declaration code in scope" + this.scope[this.scopePointer].value.name);
                var temp = "T" + this.staticID;
                var tempStaticOb = new staticObject(temp, node.children[0].value.name, node.children[0].value.type, "", this.scopePointer);
                //Push the object to the static table
                this.staticTable.push(tempStaticOb);
                this.setCode("8D");
                this.setCode("T" + this.staticID);
                this.setCode("00");
                this.staticID++;
            }
            else if (node.name == "Assign") {
                //TODO: Logging stuff blah blah blah, less important than getting the logic on the page t b h
                if (node.children[1].type == "Digit") {
                    this.setCode("A9");
                    this.setCode("0" + node.children[1].name);
                }
                else if (node.children[1].type == "String") {
                    var stringPointer = this.allocateString(node.children[1].name);
                    this.setCode("A9");
                    this.setCode(stringPointer);
                }
                else if (node.children[1].type == "Boolean") {
                    if (node.children[1].name == "True") {
                        this.setCode("A9");
                        this.setCode((245).toString(16).toUpperCase());
                    }
                    else {
                        //False
                        this.setCode("A9");
                        this.setCode((250).toString(16).toUpperCase());
                    }
                }
                else if (node.children[1].type == "ID") {
                    this.setCode("AD");
                    //TODO: Add scope to AST ugh
                    var ID = node.children[1].name;
                    var scope = node.children[1].scope;
                    var address = this.findInStatic(ID, scope);
                    this.setCode(address);
                    this.setCode("00");
                }
                else if (node.children[1].type == "Addition") {
                    //todo generate addition
                }
                //TODO: Go back and handle Equals and NotEquals properly.
            }
            else if (node.name == "Print") {
                this.log.push("Generating Print code in scope " + this.scopePointer);
                if (node.children[0].name == "Digit") {
                    this.setCode("A0");
                    this.setCode("0" + node.children[0].name);
                    this.setCode("A2");
                    this.setCode("01");
                }
                else if (node.children[0].type == "String") {
                    //console.log("Just checking if we're getting here");
                    var stringPointer = this.allocateString(node.children[0].name);
                    this.setCode("A0");
                    //console.log("what is the string pointer?" + stringPointer);
                    this.setCode(stringPointer);
                    this.setCode("A2");
                    this.setCode("02");
                }
                else if (node.children[0].name == "ID") {
                    this.setCode("AC");
                    //variable for the ID
                    //scope for the id
                    //TODO: Find Variable in static table
                    //this.setCode(tempAddress);
                    this.setCode("00");
                    //TODO: Load X reg with 1 or 2 depending on var type (if string or bool, 2 otherwise 1)
                }
                else if (node.children[0].name == "True" || node.children[0].name == "False") {
                    this.setCode("A0");
                    if (node.children[0].name == "True") {
                        this.setCode((245).toString(16).toUpperCase());
                    }
                    else {
                        //False
                        this.setCode((250).toString(16).toUpperCase());
                    }
                    this.setCode("A2");
                    this.setCode("02");
                }
                else if (node.children[0].name == "Addition") {
                    var add = this.additionGen(node.children[0]);
                    this.setCode("AC");
                    this.setCode(add);
                    this.setCode("00");
                    this.setCode("A2");
                    this.setCode("01");
                }
                //System Call
                this.setCode("FF");
                //should I be able to print boolean equals and not equals? I mean probably
                //am I going to write that? IDK I apparently fucked that up back in parse
                //and I'm already cutting it close
                //and honestly I gave up on getting into the Hall of Fame a long time ago
                //wow this should be a multiline comment
                //I'm gonna rant here and like this because I already started but I just got diagnosed with ADHD
                //which honestly explains a LOT about me but like,,, I am TWENTY TWO
                //I AM GRADUATING COLLEGE. How did so many people miss this in my early education
                //smh if I could focus I would be so powerful academically
                //anyway, back to the project
            }
            else if (node.name == "Block") {
                this.scopePointer++;
                for (var i = 0; i < node.children.length; i++) {
                    this.traverse(node.children[i]);
                }
                //Traverse the block
                //TODO: While and If, but I wanna get some logic for other stuff working before I tackle that stuff
                //"IfStatement" "WhileStatement"
            }
            else {
                return false;
            }
        };
        codeGen.prototype.additionGen = function (node) {
            this.log.push("Generating addition op codes");
            var temp = "00";
            if (node.children[1].type == "Digit") {
                this.setCode("A9");
                this.setCode("0" + node.children[1].name);
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
            }
            else if (node.children[1].type == "ID") {
                var id = node.children[1].name;
                var scope = node.children[1].scope;
                var address = this.findInStatic(id, scope);
                this.setCode("AD");
                this.setCode(address);
                this.setCode("00");
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
            }
            else if (node.children[1].type == "Addition") {
                var result = this.additionGen(node.children[1]);
                temp = result;
            }
            if (node.children[0].type == "Digit") {
                this.setCode("A9");
                this.setCode("0" + node.children[0].name);
            }
            this.setCode("6D");
            this.setCode(temp);
            this.setCode("00");
            var temp = "00";
            this.setCode("8D");
            this.setCode(temp);
            this.setCode("00");
            return temp;
        };
        codeGen.prototype.staticArea = function () {
            this.staticStartPointer = this.opPointer + 1;
            var vars = this.staticTable.length;
            if (this.staticStartPointer + vars >= this.heapStartPointer) {
                this.errors.push("Code Generation Error: No More Stack Memory");
                return;
            }
            for (var i = 0; i < vars; i++) {
                var address = this.staticStartPointer.toString(16).toUpperCase();
                if (address.length < 2) {
                    address = "0" + address;
                }
                this.staticTable[i].loc = address;
                this.staticStartPointer++;
            }
        };
        codeGen.prototype.findInStatic = function (variable, scope) {
            var currentScope = scope;
            for (var i = 0; i < this.staticTable.length; i++) {
                if (variable == this.staticTable[i].name && scope == this.staticTable[i].scope) {
                    return this.staticTable[i].tempAddr;
                }
            }
            if (currentScope.parent != null) {
                return this.findInStatic(variable, currentScope.parent);
            }
            console.log("should be returning false until we have an actual static tbl");
            return false;
        };
        codeGen.prototype.allocateString = function (string) {
            string = string.substring(1, string.length - 1);
            if (this.checkHeap(string) != false) {
                return this.checkHeap(string);
            }
            else {
                var length_1 = string.length;
                this.heapStartPointer = this.heapStartPointer - (length_1 + 1);
                var stringPointer = this.heapStartPointer;
                for (var i = this.heapStartPointer; i < this.heapStartPointer + length_1; i++) {
                    //console.log("Are we placing the code?");
                    this.code[i] = string.charCodeAt(i - this.heapStartPointer).toString(16).toUpperCase();
                }
                var tempHeapObj = new heapObject(string, stringPointer.toString(16).toUpperCase());
                this.heapTable.push(tempHeapObj);
                if (this.opPointer >= this.heapStartPointer) {
                    this.errors.push("Code Generation Error: No Remaining Memory in Heap.");
                }
                //console.log("Are we getting to the end or allocate string?" + stringPointer);
                return stringPointer.toString(16).toUpperCase();
            }
        };
        codeGen.prototype.checkHeap = function (string) {
            for (var i = 0; i < this.heapTable.length; i++) {
                if (this.heapTable[i].string = string) {
                    return this.heapTable[i].pointer;
                }
            }
            return false;
        };
        return codeGen;
    }());
    TSC.codeGen = codeGen;
    var heapObject = /** @class */ (function () {
        function heapObject(string, pointer) {
            this.string = string;
            this.pointer = pointer;
        }
        return heapObject;
    }());
    TSC.heapObject = heapObject;
    var jumpObject = /** @class */ (function () {
        function jumpObject(type, value) {
            this.type = type;
            this.value = value;
        }
        return jumpObject;
    }());
    TSC.jumpObject = jumpObject;
    var staticObject = /** @class */ (function () {
        function staticObject(tempAddr, name, type, finalAddr, scope) {
            this.tempAddr = tempAddr;
            this.name = name;
            this.type = type;
            this.finalAddr = finalAddr;
            this.scope = scope;
        }
        return staticObject;
    }());
    TSC.staticObject = staticObject;
})(TSC || (TSC = {}));
