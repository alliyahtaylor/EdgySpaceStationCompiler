var TSC;
(function (TSC) {
    var codeGen = /** @class */ (function () {
        function codeGen() {
            this.scopePointer = -1;
            this.staticID = 0;
            this.jumpID = 0;
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
            if (node.name == "VariableDeclaration") {
                this.log.push("Generating Variable Declaration code.");
                var temp = "T" + this.staticID;
                var tempStaticOb = new staticObject(temp, node.children[1].name, node.children[1].type, "", this.scopePointer);
                //Push the object to the static table
                this.staticTable.push(tempStaticOb);
                this.setCode("8D");
                this.setCode("T" + this.staticID);
                this.setCode("00");
                this.staticID++;
            }
            else if (node.name == "Assign") {
                this.log.push("Generating Assignment Code");
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
                    var ID = node.children[1].name;
                    var scope_1 = node.children[1].scope;
                    var address_1 = this.findInStatic(ID, scope_1);
                    this.setCode(address_1);
                    this.setCode("00");
                }
                else if (node.children[1].type == "Addition") {
                    this.additionGen(node.children[1]);
                }
                else if (node.children[1].type == "EqualTo") {
                    var address_2 = this.equalGen(node.children[1]);
                    this.setCode("EC");
                    this.setCode(address_2);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode((250).toString(16).toUpperCase());
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode((245).toString(16).toUpperCase());
                }
                else if (node.children[1].type == "NotEqual") {
                    var address_3 = this.equalGen(node.children[1]);
                    this.setCode("EC");
                    this.setCode(address_3);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode("01");
                    this.setCode("A2");
                    this.setCode("00");
                    var temp_1 = "00";
                    this.setCode("8D");
                    this.setCode(temp_1);
                    this.setCode("00");
                    this.setCode("EC");
                    this.setCode(temp_1);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode((250).toString(16).toUpperCase());
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode((245).toString(16).toUpperCase());
                }
                var temp_2 = node.children[0].name;
                var scope = node.children[0].scope;
                var address_4 = this.findInStatic(temp_2, scope);
                this.setCode("8D");
                this.setCode(address_4);
                this.setCode("00");
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
                else if (node.children[0].type == "ID") {
                    this.setCode("AC");
                    //variable for the ID
                    var temp_3 = node.children[0].name;
                    //scope for the id
                    var scope = node.children[0].scope;
                    var tempAddress = this.findInStatic(temp_3, scope);
                    this.setCode(tempAddress);
                    this.setCode("00");
                    this.setCode("A2");
                    //TODO: Load X reg with 1 or 2 depending on var type (if string or bool, 2 otherwise 1)
                    if (this.findTypeInStatic(temp_3, scope) == "String" || this.findTypeInStatic(temp_3, scope) == "BooleanValue") {
                        this.setCode("02");
                    }
                    else {
                        this.setCode("01");
                    }
                }
                else if (node.children[0].name == "BooleanValue") {
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
                else if (node.children[0].name == "EqualTo") {
                    var address = this.equalGen(node.children[0]);
                    this.setCode("EC");
                    this.setCode(address);
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("0A");
                    this.setCode("A0");
                    this.setCode((245).toString(16).toUpperCase());
                    this.setCode("AE");
                    this.setCode("FF");
                    this.setCode("00");
                    this.setCode("EC");
                    this.setCode("FE");
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A0");
                    this.setCode((250).toString(16).toUpperCase());
                    this.setCode("A2");
                    this.setCode("02");
                }
                else if (node.children[0].name == "NotEqual") {
                    var address_5 = this.equalGen(node.children[0]);
                    this.setCode("EC");
                    this.setCode(address_5);
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("0A");
                    this.setCode("A0");
                    this.setCode((250).toString(16).toUpperCase());
                    this.setCode("AE");
                    this.setCode("FF");
                    this.setCode("00");
                    this.setCode("EC");
                    this.setCode("FE");
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A0");
                    this.setCode((245).toString(16).toUpperCase());
                    this.setCode("A2");
                    this.setCode("02");
                }
                //System Call
                this.setCode("FF");
            }
            else if (node.name == "Block") {
                this.scopePointer++;
                for (var i = 0; i < node.children.length; i++) {
                    this.traverse(node.children[i]);
                }
                //Traverse the block
                //TODO: While and If, but I wanna get some logic for other stuff working before I tackle that stuff
            }
            else if (node.name == "While") {
                console.log("Do we get to while?");
                this.log.push("Generating op codes for a While Statement");
                //A pointer to the start of the while statement
                var whileStart = this.opPointer;
                var addr;
                //Set the Zflag
                if (node.children[0].type == "BooleanValue") {
                    if (node.children[0].name == "True") {
                        addr = (245).toString(16).toUpperCase();
                        this.setCode("AE");
                        this.setCode(addr);
                        this.setCode("00");
                    }
                    else {
                        //False
                        addr = (250).toString(16).toUpperCase();
                        this.setCode("AE");
                        this.setCode(addr);
                        this.setCode("00");
                    }
                    this.setCode("EC");
                    this.setCode((245).toString(16).toUpperCase());
                    this.setCode("00");
                }
                else if (node.children[0].type == "EqualTo") {
                    addr = this.equalGen(node.children[0]);
                    //compare x reg to addr
                    this.setCode("EC");
                    this.setCode(addr);
                    this.setCode("00");
                }
                else if (node.children[0].type == "NotEqual") {
                    //this sucks
                    addr = this.equalGen(node.children[0]);
                    this.setCode("EC");
                    this.setCode(addr);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode("01");
                    this.setCode("A2");
                    this.setCode("00");
                    var temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    this.setCode("EC");
                    this.setCode(temp);
                    this.setCode("00");
                }
                this.setCode("A9");
                this.setCode("01");
                this.setCode("D0");
                this.setCode("02");
                this.setCode("A9");
                this.setCode("00");
                this.setCode("A2");
                this.setCode("00");
                var temp = "00";
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
                this.setCode("EC");
                this.setCode(temp);
                this.setCode("00");
                var endJump = "J" + this.jumpID;
                //increment the JumpID.
                this.jumpID++;
                var startBranch = this.opPointer;
                this.setCode("D0");
                this.setCode(endJump);
                //Generate code for the rest of While
                //console.log(node.children[0]);
                this.traverse(node.children[0].children[0]);
                this.setCode("A9");
                this.setCode("00");
                var tem = "00";
                this.setCode("8D");
                this.setCode(tem);
                this.setCode("00");
                this.setCode("A2");
                this.setCode("01");
                this.setCode("EC");
                this.setCode(tem);
                this.setCode("00");
                var startWhile = "J" + this.jumpID;
                this.jumpID++;
                this.setCode("D0");
                this.setCode(startWhile);
                var jumpAmt = (((this.code.length - this.opPointer) + whileStart)).toString(16).toUpperCase();
                if (jumpAmt.length < 2) {
                    jumpAmt = "0" + jumpAmt;
                }
                var jumpEntry = new jumpObject(startWhile, jumpAmt);
                this.jumpTable.push(jumpEntry);
                jumpAmt = (this.opPointer - (startBranch + 2)).toString(16).toUpperCase();
                if (jumpAmt.length < 2) {
                    jumpAmt = "0" + jumpAmt;
                }
                jumpEntry = new jumpObject(endJump, jumpAmt);
                this.jumpTable.push(jumpEntry);
            }
            else if (node.name == "IfStatement") {
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
        codeGen.prototype.equalGen = function (node) {
            this.log.push("Generating Op Codes for an EqualTo Boolean Expression");
            if (node.children[0].type == "Digit") {
                this.setCode("A2");
                this.setCode("0" + node.children[0].name);
            }
            else if (node.children[0].type == "String") {
                var stringPointer = this.allocateString(node.children[0].name);
                this.setCode("A2");
                this.setCode(stringPointer);
            }
            else if (node.children[0].type == "BooleanValue") {
                if (node.children[0].name == "True") {
                    this.setCode("A2");
                    this.setCode((245).toString(16).toUpperCase());
                }
                else {
                    this.setCode("A2");
                    this.setCode((250).toString(16).toUpperCase());
                }
            }
            else if (node.children[0].type == "ID") {
                this.setCode("AE");
                var temp_4 = node.children[0].name;
                var scope = node.children[0].scope;
                var address = this.findInStatic(temp_4, scope);
                if (address != false) {
                    this.setCode(address);
                    this.setCode("00");
                }
                else {
                    this.errors.push("Code Generation Error: Variable not found in Static Table.");
                }
            }
            else if (node.children[0].type == "Addition") {
                var address = this.additionGen(node.children[0]);
                this.setCode("AE");
                this.setCode(address);
                this.setCode("00");
            }
            else {
                this.errors.push("Code Generation Error: Unsupported Boolean Comparison.");
            }
            if (node.children[1].type == "Digit") {
                this.setCode("A9");
                this.setCode("0" + node.children[1].name);
                var temp_5 = "00";
                this.setCode("8D");
                this.setCode(temp_5);
                this.setCode("00");
                return temp_5;
            }
            else if (node.children[1].type == "String") {
                var stringPointer = this.allocateString(node.children[1].name);
                this.setCode("A9");
                this.setCode(stringPointer);
                var temp = ("00");
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
                return temp;
            }
            else if (node.children[1].type == "BooleanValue") {
                if (node.children[1].name == "True") {
                    this.setCode("A9");
                    this.setCode((245).toString(16).toUpperCase());
                    var temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    return temp;
                }
                else {
                    //False
                    this.setCode("A9");
                    this.setCode((250).toString(16).toUpperCase());
                    var temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    return temp;
                }
            }
            else if (node.children[1].type == "ID") {
                var temp_6 = node.children[1].name;
                var scope = node.children[1].scope;
                var address = this.findInStatic(temp_6, scope);
                return address;
            }
            else if (node.children[1].type == "Addition") {
                var address = this.additionGen(node.children[1]);
                return address;
            }
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
            console.log("var:" + variable + "scope: " + scope);
            console.log("stattbl" + this.staticTable.length);
            for (var i = 0; i < this.staticTable.length; i++) {
                console.log(" in tblvar" + this.staticTable[i].name + "scope" + this.staticTable[i].scope);
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
        codeGen.prototype.findTypeInStatic = function (variable, scope) {
            var currentScope = scope;
            console.log("var:" + variable + "scope: " + scope);
            console.log("stattbl" + this.staticTable.length);
            for (var i = 0; i < this.staticTable.length; i++) {
                console.log(" in tblvar" + this.staticTable[i].name + "scope" + this.staticTable[i].scope);
                if (variable == this.staticTable[i].name && scope == this.staticTable[i].scope) {
                    return this.staticTable[i].type;
                }
            }
            if (currentScope.parent != null) {
                return this.findTypeInStatic(variable, currentScope.parent);
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
                    console.log("Are we placing the code?");
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
        //TODO: BackPatch Function
        codeGen.prototype.backpatch = function () {
            for (var i = 0; i < this.code.length; i++) {
                if (this.code[i].charAt(0) == 'T') {
                    var tempAddr = this.code[i];
                    var finalAddr = this.getFinal(tempAddr);
                    this.code[i] = finalAddr;
                }
            }
        };
        codeGen.prototype.getFinal = function (temp) {
            for (var i = 0; i < this.staticTable.length; i++) {
                if (this.staticTable[i].tempAddr == temp) {
                    return this.staticTable[i].finalAddr;
                }
            }
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
