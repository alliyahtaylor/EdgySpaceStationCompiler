module TSC {
    export class semanticAnalyzer{
        ast;
        scopeTree;
        log: Array<string>;
        errors: number;
        warnings: number;
        str: string;
        scope: number;
        scopelvl: number;

        constructor(){
            this.log = [];
            this.errors = 0;
            this.warnings = 0;
            this.ast = new Tree();
            this.scopeTree = new scopeTree();
            this.str = "";
            this.scope = -1;
            this.scopelvl = -1;
        }

        //This will be the main function of semantic analysis
        public analyze(parseCST){
            //create AST will be recursive so we'll just call this on the root.
            this.createAST(parseCST.root);
            this.checkUsed(this.scopeTree.root);
            this.checkInit(this.scopeTree.root);

           let arr = this.scopeTree.findSyms(this.scopeTree.root);
           console.log(arr);

            console.log(this.log);
            console.log(this.scopeTree.toScopeString());
           // return this.ast;
            let results = new saResults(this.log,this.errors, this.ast, this.warnings, arr, this.scopeTree);

            return results;
        }

        //This is gonna go through the CST and figure out what's important enough to keep for the AST
        //Can you guess how many times I typed createCST, deleted it, and typed it again? the answer is *SPOILER ALERT* 6.
        public createAST(node){
            //console.log("WE ARE TRYING TO FIGURE OUT WHAT THE NODE IS" + node.name);
            //Check if node is important enough to be on AST
            //If it is, add it to the AST and go down to children
            //when you finish traversing the node's children, go back up the AST unless we're at the root (I typed this as "rute")
            //Gonna have to go through the different productions somehow, either if/else or switch case
            //If statements for "Important" productions, else for everything else
           if(node != null){
            if(node.name == "Block"){
                //Adding new scope
                this.scopelvl++;
                this.scope++;
                this.scopeTree.addNode(this.scope, "branch");
                //add "Block" node to the AST
                this.ast.addNode("Block", "branch", node.position, node.program, this.scope, "Block");
                //Go through its children.
               for(var i = 0; i< node.children.length; i++){
                    this.createAST(node.children[i]);
                }
                if(node.parent!=null){
                   this.ast.endChildren();
                }
                if(this.scopeTree.cur.parent != null && this.scopeTree.cur.parent != undefined){
                    this.scopelvl --;
                    this.scopeTree.endChildren();
                }

            }else if(node.name == "Print"){
                //add "Print" node to AST -- Print is PrintStatement child 0 in current CST config
                this.ast.addNode("Print", "branch", node.position, node.program, this.scope, "Print");
                //create CST from expression. child 2 because 1 is (
                this.createAST(node.children[2]);
                //go back up the tree
                //this.ast.endChildren();

            }else if(node.name == "AssignmentStatement"){
                //add "Assign" node to AST
                this.ast.addNode("Assign", "branch", node.position, node.program, this.scope, "Assign");
                //Add the ID
                this.ast.addNode(node.children[0].children[0].name, "leaf", node.position, node.program, this.scope, "ID");

                this.createAST(node.children[2].children[0]);
                this.ast.endChildren();

                if(this.checkName(this.scopeTree.cur, node.children[0].children[0].name)!= null){
                    let id = this.checkName(this.scopeTree.cur, node.children[0].children[0].name);
                    if(this.checkType(this.scopeTree.cur, id) != null){

                        let type = this.translateType(this.checkType(this.scopeTree.cur, id));
                        if (type == node.children[2].children[0].name){
                            this.setInit(this.scopeTree.cur, id);
                            this.log.push("Semantic Analysis - VALID - Variable " + id + " assigned successfully.");
                        }else{
                            this.log.push("Semantic Analysis Error: Type mismatch " + type + " and " +node.children[2].children[0].name +" are not compatible");
                        }
                    }
                }else{
                    this.log.push("Semantic Analysis Error: variable "+node.children[0].children[0].name+ "has not been declared.");
                    this.errors++;
                }

              /*  if(this.checkDecl(this.scopeTree.cur, node.children[0].name != null)){
                    console.log("HEY DOES THIS DO ANYTHING YET?");
                    let sym = this.checkDecl(this.scopeTree.cur, node.children[0].name);
                }*/
                //check if the type matches the declared variable
                //mark variable as initialized

            }else if(node.name == "VariableDeclaration"){
                //Push symbol to array
                //Add "VarDecl" node to AST
                this.ast.addNode("VariableDeclaration", "branch", node.position, node.program, this.scope, "VariableDeclaration");
                //Get Type and add to the AST
                this.ast.addNode(node.children[0].name, "leaf", node.children[0].position, node.children[0].program, this.scope, node.children[0].name);
                //Go back up so that next node is added to VarDecl's children
                //this.ast.endChildren();
                //Get ID and add to the AST
                this.ast.addNode(node.children[1].children[0].name, "leaf", node.children[1].children[0].position, node.children[1].children[0].program, this.scope, "ID");
                //Go back up the ast
                //this.ast.endChildren();
                //end VarDecl children


                //Check if this variable had been declared in this scope

                if (this.checkName(this.scopeTree.cur, node.children[1].children[0].name) == null){
                    //console.log("ARE WE GETTING HERE A SECOND TIME?");
                    let symbol = new Symbol(node.children[1].program ,node.children[1].children[0].name,node.children[1].position, node.children[0].name, this.scopelvl);
                    this.scopeTree.cur.symbols.push(symbol);

                    //throw error if it has
                }else{
                    this.errors++;
                    this.log.push("Semantic Analysis - Error: Variable " + node.children[1].children[0].name + " already declared in current scope.");
                }
                this.ast.endChildren();

            }else if(node.name == "WhileStatement"){
                //Add "While" node to AST
                this.ast.addNode("While", "branch", node.position, node.program, this.scope, "WhileStatement");
                //Create AST for expression
                this.createAST(node.children[1]);
                //create ast for while block
                this.createAST(node.children[2]);

                //Not gonna lie, I'm just copy-pasting the stuff for while statements here
            }else if(node.name == "IfStatement"){
                //Add "IfStatement" node to AST
                this.ast.addNode("IfStatement", "branch", node.position, node.location, this.scope, "IfStatement");
                //Create AST for expression
                this.createAST(node.children[1]);
                //create ast for while block
                this.createAST(node.children[2]);
                this.ast.endChildren();

            }else if(node.name == "IntExpression"){
                //Add "IntExpression" node to AST
                //this.ast.addNode("IntExpression", "branch");
                if(node.children.length < 2){
                    //Add the digit to the tree
                    this.ast.addNode(node.children[0].children[0].name, "leaf", node.children[0].children[0].position, node.children[0].children[0].program, this.scope, "Digit");
                    //go up the tree
                  this.ast.endChildren();
                }else{
                    this.ast.addNode("Addition", "branch", node.position, node.program);
                    this.ast.addNode(node.children[0].children[0].name, "leaf", node.children[0].children[0].position, node.children[0].children[0].program, this.scope, "Addition");
                   // this.ast.endChildren();
                    this.createAST(node.children[2]);
                   this.ast.endChildren();
                }
            //This makes me wanna die.
            }else if(node.name == "StringExpression"){
                //Add "StringExpression" node to AST and STOP ADDING A SPACE, DUMB ALLIYAH
               let finalString = "\"";

               finalString+= this.expand(node.children[1]);

               finalString+="\"";
               this.ast.addNode(finalString, "leaf", node.children[1].position, node.children[1].program, this.scope, "String");
             //  this.ast.endChildren();
               //reset str so we can do multiple strings in one program.
               this.str = "";

            }else if(node.name == "BooleanExpression"){
                //Add "BooleanExpression" node to AST
                //this.ast.addNode("BooleanExpression", "branch");

                if(node.children.length < 2){
                    //if it's just one it's a boolval
                    this.ast.addNode(node.children[0].name ,"leaf",node.children[0].position, node.children[0].program, this.scope, "BooleanValue");
                 //   this.ast.endChildren();
                }else{
                    if(node.children[2].name == "=="){
                        this.ast.addNode("EqualTo", "branch", node.position, node.program, this.scope, "EqualTo");
                    }else{
                        this.ast.addNode("NotEqual", "branch", node.position, node.program, this.scope, "NotEqual");
                    }
                    this.createAST(node.children[1]);
                    this.createAST(node.children[3]);
                    //this.ast.endChildren();
                }

            }else if(node.name == "ID"){
                //Add the ID to the AST
                this.ast.addNode(node.children[0].name, "leaf", node.children[0].position, node.children[0].program, this.scope, "ID");
                this.setUsed(this.scopeTree.cur, node.children[0].name);
                this.log.push("Semantic Analysis - VALID - variable " + node.children[0].name + " has been used successfully");
            }else{
                for(let i = 0; i<node.children.length; i++){
                    this.createAST(node.children[i]);
                }
            }
    }}
    //I AM SO HAPPY THAT THIS SOLUTION WORKED YOU HAVE NO IDEA HOW LONG IT TOOK ME TO GET FED UP ENOUGH TO REUSE THIS CODE
    //Traverse the part of the tree that makes up a string expression
     public expand(node):string {
        //console.log("ARE WE EXPANDING");
        //str = "";
            // Space out based on the current depth so
            // this looks at least a little tree-like.

            // If there are no children (i.e., leaf nodes)...

         if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
               if (node != "\""){
               // console.log(node.name + "WHY???");
                this.str += node.name;
                  // console.log(this.str);
               }

                //console.log(node.name);
            } else {
                // There are children, so note these interior/branch nodes and ...
                //traversalResult += "<" + node.name + "> \n";
                // .. recursively expand them.
                for (var i = 0; i < node.children.length; i++) {
                    this.expand(node.children[i]);

                }
            }
            return this.str;
    }

    //Check if a name has been declared
    public checkName(node, id){
       // console.log("MORE THAN ONE OR INSTANT REASSIGN?")
        if(node.name!= undefined && node!= null){
            //console.log("Are we getting here?");
        if(node.symbols.length >0){
            for (let i = 0; i <node.symbols.length; i++){
                if(node.symbols[i].id == id){
                return node.symbols[i].id;
                }else if(node.parent!= undefined && node.parent!=null){
                    this.checkName(node.parent, id);
                }
            }
        }else if(node.parent != undefined && node.parent != null){
            this.checkName(node.parent, id);
        }else{
            return null;
        }}
    }

    public checkType(node, id){
        if((node.parent != undefined || node.parent !=null) && node.symbols.length > 0){
            for(let i = 0; i < node.symbols.length; i++){
                if(node.symbols[i].id == id){
                    return node.symbols[i].type;
                }else if(i == node.symbols.length -1 && (node.parent != undefined || node.parent !=null)){
                    this.checkType(node.parent, id);
                    break;
                }
            }
        }else{
            this.log.push("Semantic Analysis Error - Could not find a type.");
        }
    }
    public translateType(type){
        if(type == "int"){
            return "IntExpression";
    }else if(type == "string"){
        return "StringExpression";
    }else if(type == "boolean"){
        return "BooleanExpression"
    }else{
        return "ID";
        }
    }

    public setUsed(node, id){
        if(node.name!= undefined && node!= null){
            if(node.symbols.length >0){
                for (let i = 0; i <node.symbols.length; i++){
                    if(node.symbols[i].id == id) {
                        node.symbols[i].used = true;
                    }
                }
            }else if(node.parent != undefined && node.parent != null){
                this.setUsed(node.parent, id);
            }
        }
    }

    public setInit(node, id){
        if(node.name!= undefined && node!= null){
            if(node.symbols.length > 0){
                for (let i = 0; i < node.symbols.length; i++){
                    if(node.symbols[i].id == id){
                        node.symbols[i].init = true;
                    }
                }
            }else if(node.parent != undefined && node.parent != null){
                this.setInit(node.parent, id);

            }
        }

    }
    public checkUsed(node){
        if(node.name!= undefined && node!= null){
            if(node.symbols.length >0){
                for (let i = 0; i <node.symbols.length; i++){
                    if(node.symbols[i].init == true && node.symbols[i].used == false){
                        this.warnings++;
                        this.log.push("Semantic Analysis - Warning: Variable " +node.symbols[i].id + " initialized but not used.");
                    }
                    if(node.children.length!= 0){
                        for (let j = 0; j< node.children.length; j++){
                            this.checkUsed(node.children[j]);
                        }
                    }else {
                    }
        }
            }
        }
    }
    public checkInit(node){
        if(node.name!= undefined && node!= null){
            if(node.symbols.length >0){
                for (let i = 0; i <node.symbols.length; i++){
                    if(node.symbols[i].init == false){
                        this.warnings++;
                        this.log.push("Semantic Analysis - Warning: Variable " +node.symbols[i].id + " declared but not initialized.");
                    }
                    if(node.children.length!= 0){
                        for (let j = 0; j< node.children.length; j++){
                            this.checkInit(node.children[j]);
                        }
                    }else {
                    }
                }
            }
        }
    }
    }

    export class Symbol{
        program: number;
        id;
        position: number;
        type;
        scopes;
        init: boolean;
        used: boolean;

        constructor(program, id, position, type, scope){
           this.program = program;
           this.id = id;
           this.position = position;
           this.type = type;
           this.scopes = scope;
           this.init = false;
           this.used = false;
        }

    }
    export class saResults{
        log: Array<String>;
        ast;
        symbols: Array<Symbol>;
        errors: number;
        warnings: number;
        scopeTree;

        constructor(log, errors, ast, warnings, symbols, scopeTree){
            this.log = log;
            this.errors = errors;
            this.warnings = warnings;
            this.ast = ast;
            this.symbols = symbols;
            this.scopeTree = scopeTree;
        }

    }


}
