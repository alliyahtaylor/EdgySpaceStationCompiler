module TSC{
    export class codeGen{

        /*Stuff we need from Semantic Analysis*/
        scope;
        ast;

        /*Logging Stuff For code gen*/
        log: Array<String>;
        errors: Array<String>;
        warnings: Array<String>;

        /*Tables and Pointers*/
        code: Array<String>;
        staticTable;
        stringTable;
        jumpTable;


        constructor(){
            this.code = [];
            this.staticTable = [];
            this.jumpTable = [];
            this.log = [];
            this.errors = [];
            for(let i = 0; i < 256; i ++){
                this.code.push("00");
            }
            //Load accumulator with 0
        }

        public generate(analysis){
            let ast = analysis.ast;
            let scope = analysis.scopeTree;
            let scopePointer = -1;
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
            if(node.name == "VarDecl"){
                this.log.push("Generating Variable Declaration code in scope" + this.scope[this.scopePointer].value.id);
                var temp = "T" + this.statID;
            }else if(node.name == "Assign"){

            }else if(node.name == "Print"){
                this.log.push("Generating Print code in scope " + this.scope[this.scopePointer].value.id);

                if(node.children[0].value.name == "Digit"){
                    this.setCode("A0");
                    this.setCode("0" + node.children[0].value.value);
                    this.setCode("A2");
                    this.setCode("01");
                }else if(node.children[0].value.name == "String"){
                    //TODO: Allocate space for string in the heap
                    this.setCode("A0");
                    //put address in commented out section when it's possible to generate the address
                    //this.setCode()
                    this.setCode("A2");
                    this.setCode("02");
                }else if(node.children[0].value.name == "ID"){
                    this.setCode("AC");
                    //TODO: Find Variable in static table
                }

            }else if(node.name == "Block"){
                this.scopePointer++;
                for(let i = 0; i <node.children.length; i++){
                    this.traverse(node.children[i]);
                }
                //Traverse the block

            }else if(node.name == "True"){

            }

        }

        //TODO: Find Variable in the Static Table Function
        //TODO: Allocate String in Heap Function
        //TODO: BackPatch Function
        //TODO: Create Static area


    }

}

