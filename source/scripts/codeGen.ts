module TSC{
    export class codeGen{

        /*Stuff we need from Semantic Analysis*/
        scope;
        ast;

        /*Logging Stuff For code gen*/
        log: Array<String>;
        errors: Array<String>;

        /*Tables and Pointers*/
        code: Array<String>;
        staticTable;
        jumpTable;
        heapTable;

        scopePointer = -1;
        staticID = 0;
        staticStartPointer;
        jumpID = 0;
        heapStartPointer;
        opPointer = 0;
        scopeNodes;

        constructor(){
            this.code = [];
            this.staticTable = [];
            this.jumpTable = [];
            this.heapTable = [];
            //this.symbolTable = [];
            this.log = [];
            this.errors = [];
            for(let i = 0; i < 256; i ++){
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

        public generate(analysis){
            console.log("Do we start code gen at all?");
            let ast = analysis.ast;
            let scope = analysis.scopeTree;
            console.log("scope" + scope);
            this.scopeNodes = scope.traverseTree();
            let scopePointer = -1;
            this.traverse(ast.root);
            console.log(this.log);

            this.staticArea();
            this.backpatch();

            let results = new cgResults(this.log, this.errors, this.code);
            return results;
        }

        private setCode(op){
            this.code[this.opPointer++] = op;
            this.log.push("Generating op code " + op);

            if(this.opPointer >= 256){
                this.errors.push("Code Generation Error. No More Code Memory.");
            }
        }

        private traverse(node){
            //TODO look at how I handled productions in AST to have the correct spelling/capitalization
            if(node.name == "VariableDeclaration"){
                this.log.push("Generating Variable Declaration code.");
                var temp = "T" + this.staticID;
                let tempStaticOb = new staticObject(temp, node.children[1].name, node.children[1].type,"", this.scopePointer);
                //Push the object to the static table
                this.staticTable.push(tempStaticOb);
                this.setCode("8D");
                this.setCode("T" + this.staticID);
                this.setCode("00");
                this.staticID++;
            }else if(node.name == "Assign"){
                this.log.push("Generating Assignment Code");
                if(node.children[1].type == "Digit"){
                    this.setCode("A9");
                    this.setCode("0" + node.children[1].name);
                }else if(node.children[1].type == "String"){
                    let stringPointer = this.allocateString(node.children[1].name);
                    this.setCode("A9");
                    this.setCode(stringPointer);
                }else if(node.children[1].type == "Boolean"){
                    if(node.children[1].name == "True"){
                        this.setCode("A9");
                        this.setCode((245).toString(16).toUpperCase());
                    }else{
                        //False
                        this.setCode("A9");
                        this.setCode((250).toString(16).toUpperCase());
                    }
                }else if(node.children[1].type == "ID"){
                    this.setCode("AD");
                    var ID = node.children[1].name;
                    let scope = node.children[1].scope;
                    let address = this.findInStatic(ID, scope);
                    this.setCode(address);
                    this.setCode("00");

                }else if(node.children[1].type == "Addition"){
                    this.additionGen(node.children[1]);
                }else if(node.children[1].type == "EqualTo"){
                    let address = this.equalGen(node.children[1]);
                    this.setCode("EC");
                    this.setCode(address);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode((250).toString(16).toUpperCase());
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode((245).toString(16).toUpperCase());

                }else if(node.children[1].type == "NotEqual"){
                    let address = this.equalGen(node.children[1]);
                    this.setCode("EC");
                    this.setCode(address);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode("01");
                    this.setCode("A2");
                    this.setCode("00");
                    let temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    this.setCode("EC");
                    this.setCode(temp);
                    this.setCode("00");
                    this.setCode("A9");
                    this.setCode((250).toString(16).toUpperCase());
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode((245).toString(16).toUpperCase());
                }
                let temp = node.children[0].name;
                let scope = node.children[0].scope;
                let address = this.findInStatic(temp, scope);
                this.setCode("8D");
                this.setCode(address);
                this.setCode("00");
            }else if(node.name == "Print"){
                this.log.push("Generating Print code in scope " + this.scopePointer);

                if(node.children[0].name == "Digit"){
                    this.setCode("A0");
                    this.setCode("0" + node.children[0].name);
                    this.setCode("A2");
                    this.setCode("01");
                }else if(node.children[0].type == "String"){
                    //console.log("Just checking if we're getting here");
                    let stringPointer = this.allocateString(node.children[0].name);
                    this.setCode("A0");
                    //console.log("what is the string pointer?" + stringPointer);
                    this.setCode(stringPointer);
                    this.setCode("A2");
                    this.setCode("02");
                }else if(node.children[0].type == "ID"){
                    this.setCode("AC");
                    //variable for the ID
                    let temp = node.children[0].name;
                    //scope for the id
                    let scope = node.children[0].scope
                    let tempAddress = this.findInStatic(temp, scope);
                    this.setCode(tempAddress);
                    this.setCode("00");
                    this.setCode("A2");
                    //TODO: Load X reg with 1 or 2 depending on var type (if string or bool, 2 otherwise 1)
                    if(this.findTypeInStatic(temp, scope) == "String"|| this.findTypeInStatic(temp, scope) == "BooleanValue"){
                        this.setCode("02");
                    }else{
                        this.setCode("01");
                    }

                }else if(node.children[0].name == "BooleanValue"){
                    this.setCode("A0");

                    if(node.children[0].name == "True"){
                        this.setCode((245).toString(16).toUpperCase());
                    }else{
                        //False
                        this.setCode((250).toString(16).toUpperCase());
                    }
                    this.setCode("A2");
                    this.setCode("02");
                }else if(node.children[0].name == "Addition"){
                    let add = this.additionGen(node.children[0]);
                    this.setCode("AC");
                    this.setCode(add);
                    this.setCode("00");
                    this.setCode("A2");
                    this.setCode("01");
                }else if(node.children[0].name == "EqualTo"){
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

                }else if(node.children[0].name == "NotEqual"){
                    let address = this.equalGen(node.children[0]);
                    this.setCode("EC");
                    this.setCode(address);
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

            }else if(node.name == "Block"){
                this.scopePointer++;
                for(let i = 0; i <node.children.length; i++){
                    this.traverse(node.children[i]);
                }
                //Traverse the block
                //TODO: While and If, but I wanna get some logic for other stuff working before I tackle that stuff
            }else if(node.name == "While"){
                console.log("Do we get to while?");
                this.log.push("Generating op codes for a While Statement");
                //A pointer to the start of the while statement
                let whileStart = this.opPointer;
                var addr;
                //Set the Zflag
                if(node.children[0].type == "BooleanValue"){
                    if(node.children[0].name == "True"){
                        addr = (245).toString(16).toUpperCase();
                        this.setCode("AE");
                        this.setCode(addr);
                        this.setCode("00");
                    }else{
                        //False
                        addr= (250).toString(16).toUpperCase();
                        this.setCode("AE");
                        this.setCode(addr);
                        this.setCode("00")
                    }
                    this.setCode("EC");
                    this.setCode((245).toString(16).toUpperCase());
                    this.setCode("00");

                }else if(node.children[0].type == "EqualTo"){
                    addr = this.equalGen(node.children[0]);
                    //compare x reg to addr
                    this.setCode("EC");
                    this.setCode(addr);
                    this.setCode("00");

                }else if(node.children[0].type == "NotEqual"){
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
                let startBranch = this.opPointer;

                this.setCode("D0");
                this.setCode(endJump);

                //Generate code for the rest of While
                //console.log(node.children[0]);
               this.traverse(node.children[0].children[0]);

               this.setCode("A9");
               this.setCode("00");

               let tem = "00";
               this.setCode("8D");
               this.setCode(tem);
               this.setCode("00");
               this.setCode("A2");
               this.setCode("01");
               this.setCode("EC");
               this.setCode(tem);
               this.setCode("00");

               let startWhile = "J" + this.jumpID;
               this.jumpID++;
               this.setCode("D0");
               this.setCode(startWhile);

               let jumpAmt = (((this.code.length - this.opPointer) + whileStart)).toString(16).toUpperCase();
               if(jumpAmt.length < 2){
                   jumpAmt = "0" + jumpAmt;
               }

               let jumpEntry = new jumpObject(startWhile, jumpAmt);
               this.jumpTable.push(jumpEntry);
               jumpAmt = (this.opPointer -(startBranch + 2)).toString(16).toUpperCase();
                if(jumpAmt.length < 2){
                    jumpAmt = "0" + jumpAmt;
                }
                jumpEntry = new jumpObject(endJump, jumpAmt);
                this.jumpTable.push(jumpEntry);


            }else if(node.name == "IfStatement") {
                this.log.push("Generating op codes for If Statement");
                if(node.children[0].type == "Boolean Value"){
                    if(node.children[0].name == "True"){
                    this.setCode("AE");
                    this.setCode((245).toString(16).toUpperCase());
                    this.setCode("00");
                    }else{
                        this.setCode("AE");
                        this.setCode((250).toString(16).toUpperCase());
                        this.setCode("00");}
                    this.setCode("EC");
                    this.setCode((245).toString(16).toUpperCase());
                    this.setCode("00");
                }else if(node.children[0].type == "EqualTo"){
                    let address = this.equalGen(node.children[0]);
                    this.setCode("EC");
                    this.setCode(address);
                    this.setCode("00");
                }else if(node.children[0].type == "NotEqual"){
                    let address = this.equalGen(node.children[0]);
                    this.setCode("EC");
                    this.setCode(address);
                    this.setCode("A9");
                    this.setCode("00");
                    this.setCode("D0");
                    this.setCode("02");
                    this.setCode("A9");
                    this.setCode("01");
                    this.setCode("A2");
                    this.setCode("00");


                    let temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    this.setCode("EC");
                    this.setCode(temp);
                    this.setCode("00");
                }

                let tempJump = "J" + this.jumpID;
                //pointer for the start of the branch
                let branchStart = this.opPointer;
                this.setCode("D0");
                this.setCode(tempJump);
                //increment the jump ID
                this.jumpID++;
                this.traverse(node.children[0].children[0]);

                let jumpAmt = (this.opPointer -(branchStart + 2)).toString(16).toUpperCase();

                if(jumpAmt.length < 2){
                    jumpAmt = "0" + jumpAmt;
                }

                let jumpEntry = new jumpObject(tempJump, jumpAmt);
                this.jumpTable.push(jumpEntry);

            }else{
                return false;
            }

        }

        private additionGen(node){
            this.log.push("Generating addition op codes");
            var temp = "00";
            if(node.children[1].type == "Digit"){
                this.setCode("A9");
                this.setCode("0" + node.children[1].name);
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
            }else if(node.children[1].type == "ID"){
                let id = node.children[1].name;
                let scope = node.children[1].scope;
                let address = this.findInStatic(id, scope);
                this.setCode("AD");
                this.setCode(address);
                this.setCode("00");
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
            }else if(node.children[1].type == "Addition"){
                var result = this.additionGen(node.children[1]);
                temp = result;
            }
            if(node.children[0].type == "Digit"){
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
        }

        private equalGen(node){
            this.log.push("Generating Op Codes for an EqualTo Boolean Expression");
            if(node.children[0].type == "Digit"){
                this.setCode("A2");
                this.setCode("0" + node.children[0].name);
            }else if(node.children[0].type == "String"){
                let stringPointer = this.allocateString(node.children[0].name);
                this.setCode("A2");
                this.setCode(stringPointer);
            }else if(node.children[0].type == "BooleanValue"){
                if(node.children[0].name == "True"){
                    this.setCode("A2");
                    this.setCode((245).toString(16).toUpperCase());
                }else{
                    this.setCode("A2");
                    this.setCode((250).toString(16).toUpperCase());
                }
            }else if(node.children[0].type == "ID"){
                this.setCode("AE");
                let temp = node.children[0].name;
                let scope = node.children[0].scope;
                let address = this.findInStatic(temp, scope);
                if (address!= false){
                    this.setCode(address);
                    this.setCode("00");
                }else{
                    this.errors.push("Code Generation Error: Variable not found in Static Table.");
                }

            }else if(node.children[0].type == "Addition"){
                let address = this.additionGen(node.children[0]);
                this.setCode("AE");
                this.setCode(address);
                this.setCode("00")
            }else{
                this.errors.push("Code Generation Error: Unsupported Boolean Comparison.");
            }

            if(node.children[1].type == "Digit"){
                this.setCode("A9");
                this.setCode("0" + node.children[1].name);
                let temp = "00";
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
                return temp;
            }else if(node.children[1].type == "String"){
                let stringPointer = this.allocateString(node.children[1].name);
                this.setCode("A9");
                this.setCode(stringPointer);
                var temp = ("00");
                this.setCode("8D");
                this.setCode(temp);
                this.setCode("00");
                return temp;
            }else if(node.children[1].type == "BooleanValue"){
                if(node.children[1].name == "True"){
                    this.setCode("A9");
                    this.setCode((245).toString(16).toUpperCase());
                    var temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    return temp;
                }else{
                    //False
                    this.setCode("A9");
                    this.setCode((250).toString(16).toUpperCase());
                    var temp = "00";
                    this.setCode("8D");
                    this.setCode(temp);
                    this.setCode("00");
                    return temp;
                }

            }else if(node.children[1].type == "ID"){
                let temp = node.children[1].name;
                let scope = node.children[1].scope;
                let address = this.findInStatic(temp, scope);
                return address;

            }else if(node.children[1].type == "Addition"){
                let address = this.additionGen(node.children[1]);
                return address;

            }
        }

        private staticArea(){
            this.staticStartPointer = this.opPointer + 1;
            let vars = this.staticTable.length;
            if(this.staticStartPointer + vars >= this.heapStartPointer){
                this.errors.push("Code Generation Error: No More Stack Memory");
                return;
            }
            for(var i = 0; i<vars; i++){
                let address = this.staticStartPointer.toString(16).toUpperCase();
                if(address.length < 2){
                    address = "0" + address;
                }
                this.staticTable[i].loc = address;
                this.staticStartPointer++;
            }
        }

        private findInStatic(variable, scope){
            var currentScope = scope;
            console.log("var:" + variable + "scope: " +scope);
            console.log("stattbl" + this.staticTable.length);

            for(let i = 0; i < this.staticTable.length; i++){
                console.log(" in tblvar" + this.staticTable[i].name + "scope" + this.staticTable[i].scope);
                if(variable == this.staticTable[i].name && scope == this.staticTable[i].scope){
                    return this.staticTable[i].tempAddr;
                }
            }
            if(currentScope.parent != null){
                return this.findInStatic(variable, currentScope.parent);
            }
            console.log("should be returning false until we have an actual static tbl");
            return false;
        }
        private findTypeInStatic(variable, scope){
            var currentScope = scope;
            console.log("var:" + variable + "scope: " +scope);
            console.log("stattbl" + this.staticTable.length);

            for(let i = 0; i < this.staticTable.length; i++){
                console.log(" in tblvar" + this.staticTable[i].name + "scope" + this.staticTable[i].scope);
                if(variable == this.staticTable[i].name && scope == this.staticTable[i].scope){
                    return this.staticTable[i].type;
                }
            }
            if(currentScope.parent != null){
                return this.findTypeInStatic(variable, currentScope.parent);
            }
            console.log("should be returning false until we have an actual static tbl");
            return false;
        }

        private allocateString(string){
            string = string.substring(1, string.length - 1);

            if(this.checkHeap(string) != false){
                return this.checkHeap(string);
            }else{
                let length = string.length;
                this.heapStartPointer = this.heapStartPointer - (length + 1);
                let stringPointer = this.heapStartPointer;

                for(let i = this.heapStartPointer; i < this.heapStartPointer + length; i ++){
                    console.log("Are we placing the code?");
                    this.code[i] = string.charCodeAt(i - this.heapStartPointer).toString(16).toUpperCase();
                }
                let tempHeapObj = new heapObject(string, stringPointer.toString(16).toUpperCase());
                this.heapTable.push(tempHeapObj);

                if(this.opPointer >= this.heapStartPointer){
                    this.errors.push("Code Generation Error: No Remaining Memory in Heap.");
                }
                //console.log("Are we getting to the end or allocate string?" + stringPointer);
                return stringPointer.toString(16).toUpperCase();
            }
        }

        private checkHeap(string){
            for(let i = 0; i < this.heapTable.length; i++){
                if(this.heapTable[i].string = string){
                    return this.heapTable[i].pointer;
                }
            }
            return false;
        }
        //TODO: BackPatch Function
        private backpatch(){
            for(let i = 0; i < this.code.length; i++){
                if(this.code[i].charAt(0) == 'T'){
                    let tempAddr = this.code[i];
                    let finalAddr = this.getFinal(tempAddr);

                    this.code[i] = finalAddr;
                }
            }

            console.log("AFTER GETTING RID OF TEMP");

            for(let j = 0; j <this.code.length; j++){
                if(this.code[j].charAt(0) == 'J'){
                    let tempAddr = this.code[j];
                    let finalAddr = this.getJumpFinal(tempAddr);

                    this.code[j] = finalAddr;
                }
            }
        }

        private getFinal(temp){
            for(let i = 0; i < this.staticTable.length; i++){
                if (this.staticTable[i].tempAddr == temp){
                    return this.staticTable[i].finalAddr;
                }
            }
        }
        private getJumpFinal(temp){
            console.log("Just wanna make sure we're trying to backpatch jump");
            for(let i = 0; i < this.jumpTable.length; i++){
                if (this.jumpTable[i].type == temp){
                    return this.jumpTable[i].value;
                }
            }
        }


    }

    export class heapObject{
        string;
        pointer;

        constructor(string, pointer){
          this.string = string;
          this.pointer = pointer;
        }

    }

    export class jumpObject{
        type;
        value;
        constructor(type, value){
            this.type = type;
            this.value = value;
        }
    }

    export class staticObject{
        tempAddr;
        name;
        type;
        finalAddr;
        scope;
        constructor(tempAddr ,name, type, finalAddr, scope){
            this.tempAddr = tempAddr;
            this.name = name;
            this.type = type;
            this.finalAddr = finalAddr;
            this.scope = scope;
        }
    }
    export class cgResults{
        log: Array<String>;
        errors: number;
        code;

        constructor(log, errors, code){
            this.log = log;
            this.errors = errors;
            this.code = code;
        }

    }

}

