var TSC;
(function (TSC) {
    var semanticAnalyzer = /** @class */ (function () {
        function semanticAnalyzer() {
            this.log = [];
            this.errors = [];
            this.warnings = [];
            this.ast = new TSC.Tree();
            this.scopeTree = new TSC.scopeTree();
            this.str = "";
            this.scope = -1;
            this.scopelvl = -1;
        }
        //This will be the main function of semantic analysis
        semanticAnalyzer.prototype.analyze = function (parseCST) {
            //create AST will be recursive so we'll just call this on the root.
            this.createAST(parseCST.root);
            return this.ast;
        };
        //This is gonna go through the CST and figure out what's important enough to keep for the AST
        //Can you guess how many times I typed createCST, deleted it, and typed it again? the answer is *SPOILER ALERT* 6.
        semanticAnalyzer.prototype.createAST = function (node) {
            //console.log("WE ARE TRYING TO FIGURE OUT WHAT THE NODE IS" + node.name);
            //Check if node is important enough to be on AST
            //If it is, add it to the AST and go down to children
            //when you finish traversing the node's children, go back up the AST unless we're at the root (I typed this as "rute")
            //Gonna have to go through the different productions somehow, either if/else or switch case
            //If statements for "Important" productions, else for everything else
            if (node != null) {
                if (node.name == "Block") {
                    //Adding new scope
                    this.scopelvl++;
                    this.scope++;
                    this.scopeTree.addNode(this.scope, "branch");
                    //add "Block" node to the AST
                    this.ast.addNode("Block", "branch");
                    console.log(this.scopeTree.toScopeString());
                    //Go through its children.
                    for (var i = 0; i < node.children.length; i++) {
                        this.createAST(node.children[i]);
                    }
                    if (node.parent != null) {
                        this.ast.endChildren();
                    }
                    if (this.scopeTree.cur.parent != null && this.scopeTree.cur.parent != undefined) {
                        this.scopelvl--;
                        this.scopeTree.endChildren();
                        console.log("AREWEENDINGSCOPECHILDREN?");
                    }
                }
                else if (node.name == "Print") {
                    //add "Print" node to AST -- Print is PrintStatement child 0 in current CST config
                    this.ast.addNode("Print", "branch", node.position, node.program);
                    //create CST from expression. child 2 because 1 is (
                    this.createAST(node.children[2]);
                    //go back up the tree
                    //this.ast.endChildren();
                }
                else if (node.name == "AssignmentStatement") {
                    //add "Assign" node to AST
                    this.ast.addNode("Assign", "branch", node.position, node.program);
                    //Add the ID
                    this.ast.addNode(node.children[0].children[0].name, "leaf", node.position, node.program);
                    this.createAST(node.children[2].children[0]);
                    this.ast.endChildren();
                    console.log("ASSIGN" + node.children[0].children[0].name);
                    console.log(this.scopeTree.cur);
                    //console.log("test" + this.checkName(this.scopeTree.cur, node.children[0].children[0].name));
                    if (this.checkName(this.scopeTree.cur, node.children[0].children[0].name) != null) {
                        console.log("ASSIGNMENT STATEMENT" + node.children[0].children[0].name);
                        var id = this.checkName(this.scopeTree.cur, node.children[0].children[0].name);
                        if (this.checkType(this.scopeTree.cur, id) != null) {
                            var type = this.translateType(this.checkType(this.scopeTree.cur, id));
                            console.log(type);
                            console.log(node.children[2].children[0].name);
                            if (type == node.children[2].children[0].name) {
                                //TODO: Initialize symbol
                                console.log("TYpe match");
                            }
                        }
                    }
                    else {
                        console.log("Error, cannot assign undeclared variable" + node.children[0].children[0].name);
                    }
                    /*  if(this.checkDecl(this.scopeTree.cur, node.children[0].name != null)){
                          console.log("HEY DOES THIS DO ANYTHING YET?");
                          let sym = this.checkDecl(this.scopeTree.cur, node.children[0].name);
                      }*/
                    //check if the type matches the declared variable
                    //mark variable as initialized
                }
                else if (node.name == "VariableDeclaration") {
                    //Push symbol to array
                    //Add "VarDecl" node to AST
                    this.ast.addNode("VariableDeclaration", "branch", node.position, node.program);
                    //Get Type and add to the AST
                    this.ast.addNode(node.children[0].name, "leaf", node.children[0].position, node.children[0].program);
                    //Go back up so that next node is added to VarDecl's children
                    //this.ast.endChildren();
                    //Get ID and add to the AST
                    this.ast.addNode(node.children[1].children[0].name, "leaf", node.children[1].children[0].position, node.children[1].children[0].program);
                    //Go back up the ast
                    //this.ast.endChildren();
                    //end VarDecl children
                    //Check if this variable had been declared in this scope
                    console.log("VARDECL" + this.scopeTree.cur.symbols + node.children[1].children[0].name);
                    if (this.checkName(this.scopeTree.cur, node.children[1].children[0].name) == null) {
                        console.log("ARE WE GETTING HERE A SECOND TIME?");
                        var symbol = new Symbol(node.children[1].program, node.children[1].children[0].name, node.children[1].position, node.children[0].name, this.scopelvl);
                        this.scopeTree.cur.symbols.push(symbol);
                        console.log("SYM ARRAY" + this.scopeTree.cur.symbols);
                        //throw error if it has
                    }
                    else {
                        this.errors.push("SEMANTIC ANALYSIS - ERROR: Variable" + node.children[1].name + "already declared in current scope.");
                    }
                    this.ast.endChildren();
                }
                else if (node.name == "WhileStatement") {
                    //Add "While" node to AST
                    this.ast.addNode("While", "branch", node.position, node.program);
                    //Create AST for expression
                    this.createAST(node.children[1]);
                    //create ast for while block
                    this.createAST(node.children[2]);
                    //Not gonna lie, I'm just copy-pasting the stuff for while statements here
                }
                else if (node.name == "IfStatement") {
                    //Add "IfStatement" node to AST
                    this.ast.addNode("IfStatement", "branch", node.position, node.location);
                    //Create AST for expression
                    this.createAST(node.children[1]);
                    //create ast for while block
                    this.createAST(node.children[2]);
                    this.ast.endChildren();
                }
                else if (node.name == "IntExpression") {
                    //Add "IntExpression" node to AST
                    //this.ast.addNode("IntExpression", "branch");
                    if (node.children.length < 2) {
                        //Add the digit to the tree
                        this.ast.addNode(node.children[0].children[0].name, "leaf", node.children[0].children[0].position, node.children[0].children[0].program);
                        //go up the tree
                        this.ast.endChildren();
                    }
                    else {
                        this.ast.addNode("Addition", "branch", node.position, node.program);
                        this.ast.addNode(node.children[0].children[0].name, "leaf", node.children[0].children[0].position, node.children[0].children[0].program);
                        // this.ast.endChildren();
                        this.createAST(node.children[2]);
                        this.ast.endChildren();
                    }
                    //This makes me wanna die.
                }
                else if (node.name == "StringExpression") {
                    //Add "StringExpression" node to AST and STOP ADDING A SPACE, DUMB ALLIYAH
                    var finalString = "\"";
                    finalString += this.expand(node.children[1]);
                    finalString += "\"";
                    this.ast.addNode(finalString, "leaf", node.children[1].position, node.children[1].program);
                    //  this.ast.endChildren();
                    //reset str so we can do multiple strings in one program.
                    this.str = "";
                }
                else if (node.name == "BooleanExpression") {
                    //Add "BooleanExpression" node to AST
                    //this.ast.addNode("BooleanExpression", "branch");
                    console.log("ARE WE GETTING TO BOOLEAN SEMATINCS?");
                    if (node.children.length < 2) {
                        console.log("ARE WE GETTING TO BOOLVAL");
                        //if it's just one it's a boolval
                        this.ast.addNode(node.children[0].name, "leaf", node.children[0].position, node.children[0].program);
                        //   this.ast.endChildren();
                    }
                    else {
                        if (node.children[2].name == "==") {
                            this.ast.addNode("EqualTo", "branch", node.position, node.program);
                        }
                        else {
                            this.ast.addNode("NotEqual", "branch", node.position, node.program);
                        }
                        this.createAST(node.children[1]);
                        this.createAST(node.children[3]);
                        //this.ast.endChildren();
                    }
                }
                else if (node.name == "ID") {
                    //Add the ID to the AST
                    // console.log("ADDING ID");
                    this.ast.addNode(node.children[0].name, "leaf", node.children[0].position, node.children[0].program);
                    //go back up the tree;
                    //this.ast.endChildren();
                    //TODO: check if declared in current or parent scopes
                    //Mark as used
                    //error if 'used' but uninitiated
                }
                else {
                    for (var i_1 = 0; i_1 < node.children.length; i_1++) {
                        this.createAST(node.children[i_1]);
                    }
                }
            }
        };
        //I AM SO HAPPY THAT THIS SOLUTION WORKED YOU HAVE NO IDEA HOW LONG IT TOOK ME TO GET FED UP ENOUGH TO REUSE THIS CODE
        //Traverse the part of the tree that makes up a string expression
        semanticAnalyzer.prototype.expand = function (node) {
            //console.log("ARE WE EXPANDING");
            //str = "";
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
                if (node != "\"") {
                    // console.log(node.name + "WHY???");
                    this.str += node.name;
                    // console.log(this.str);
                }
                //console.log(node.name);
            }
            else {
                // There are children, so note these interior/branch nodes and ...
                //traversalResult += "<" + node.name + "> \n";
                // .. recursively expand them.
                for (var i = 0; i < node.children.length; i++) {
                    this.expand(node.children[i]);
                }
            }
            return this.str;
        };
        //check if a variable exists in scope
        semanticAnalyzer.prototype.checkDecl = function (node, id) {
            for (var i = 0; i < node.symbols.length; i++) {
                if (id == node.symbols[i].name) {
                    return node.symbols[i];
                }
            }
        };
        //Check if a name has been declared
        semanticAnalyzer.prototype.checkName = function (node, id) {
            //console.log("NODE" + node.name);
            // console.log("MORE THAN ONE OR INSTANT REASSIGN?")
            if (node.name != undefined && node != null) {
                //console.log("Are we getting here?");
                if (node.symbols.length > 0) {
                    for (var i = 0; i < node.symbols.length; i++) {
                        if (node.symbols[i].id == id) {
                            console.log(i + " NAME" + node.symbols[i]);
                            return node.symbols[i].id;
                        }
                        else if (node.parent != undefined && node.parent != null) {
                            this.checkName(node.parent, id);
                        }
                    }
                }
                else if (node.parent != undefined && node.parent != null) {
                    this.checkName(node.parent, id);
                }
                else {
                    console.log("UNDECLARED VAR" + id);
                    return null;
                }
            }
        };
        semanticAnalyzer.prototype.checkType = function (node, id) {
            if ((node.parent != undefined || node.parent != null) && node.symbols.length > 0) {
                for (var i = 0; i < node.symbols.length; i++) {
                    if (node.symbols[i].id == id) {
                        return node.symbols[i].type;
                    }
                    else if (i == node.symbols.length - 1 && (node.parent != undefined || node.parent != null)) {
                        this.checkType(node.parent, id);
                        break;
                    }
                }
            }
            else {
                console.log("ERROR FINDING TYPE");
            }
        };
        semanticAnalyzer.prototype.translateType = function (type) {
            if (type == "int") {
                return "IntExpression";
            }
            else if (type == "string") {
                return "StringExpression";
            }
            else if (type == "boolean") {
                return "BooleanExpression";
            }
            else {
                return "ID";
            }
        };
        return semanticAnalyzer;
    }());
    TSC.semanticAnalyzer = semanticAnalyzer;
    var Symbol = /** @class */ (function () {
        function Symbol(program, id, position, type, scope) {
            this.program = program;
            this.id = id;
            this.position = position;
            this.type = type;
            this.scopes = scope;
            this.initialized = false;
            this.used = false;
        }
        return Symbol;
    }());
    TSC.Symbol = Symbol;
})(TSC || (TSC = {}));
