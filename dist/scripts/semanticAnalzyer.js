var TSC;
(function (TSC) {
    var semanticAnalyzer = /** @class */ (function () {
        function semanticAnalyzer() {
            this.log = [];
            this.errors = [];
            this.warnings = [];
            this.ast = new TSC.Tree();
            this.str = "";
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
                    //add "Block" node to the AST
                    this.ast.addNode("Block", "branch");
                    //Go through its children.
                    for (var i = 0; i < node.children.length; i++) {
                        this.createAST(node.children[i]);
                    }
                    if (node.parent != null) {
                        this.ast.endChildren();
                    }
                }
                else if (node.name == "Print") {
                    //add "Print" node to AST -- Print is PrintStatement child 0 in current CST config
                    this.ast.addNode("Print", "branch");
                    //create CST from expression. child 2 because 1 is (
                    this.createAST(node.children[2]);
                    //go back up the tree
                    this.ast.endChildren();
                }
                else if (node.name == "AssignmentStatement") {
                    //add "Assign" node to AST
                    this.ast.addNode("Assign", "branch");
                    //Add the ID
                    this.createAST(node.children[0]);
                    //go back to assign
                    // this.ast.endChildren();
                    //Add the expression to the AST
                    //this.createAST(node.children[1]);
                    //go back up the tree
                    //this.ast.endChildren();
                    this.createAST(node.children[2].children[0]);
                    this.ast.endChildren();
                }
                else if (node.name == "VariableDeclaration") {
                    //Add "VarDecl" node to AST
                    this.ast.addNode("VariableDeclaration", "branch");
                    //Get Type and add to the AST
                    this.ast.addNode(node.children[0].name, "leaf");
                    //Go back up so that next node is added to VarDecl's children
                    //this.ast.endChildren();
                    //Get ID and add to the AST
                    this.createAST(node.children[1]);
                    //Go back up the ast
                    //this.ast.endChildren();
                    //end VarDecl children
                    this.ast.endChildren();
                }
                else if (node.name == "WhileStatement") {
                    //Add "While" node to AST
                    this.ast.addNode("While", "branch");
                    //Create AST for expression
                    this.createAST(node.children[1]);
                    //create ast for while block
                    this.createAST(node.children[2]);
                    //Not gonna lie, I'm just copy-pasting the stuff for while statements here
                }
                else if (node.name == "IfStatement") {
                    //Add "IfStatement" node to AST
                    this.ast.addNode("IfStatement", "branch");
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
                        this.ast.addNode(node.children[0].children[0].name);
                        //go up the tree
                        this.ast.endChildren();
                    }
                    else {
                        this.ast.addnode("Addition", "branch");
                        this.ast.addnode(node.children[0].children[0].name);
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
                    this.ast.addNode(finalString, "leaf");
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
                        this.ast.addNode(node.children[0].name, "leaf");
                        //   this.ast.endChildren();
                    }
                    else {
                        if (node.children[2].name == "==") {
                            this.ast.addNode("EqualTo", "branch");
                        }
                        else {
                            this.ast.addNode("NotEqual", "branch");
                        }
                        this.createAST(node.children[1]);
                        this.createAST(node.children[3]);
                        this.ast.endChildren();
                    }
                }
                else if (node.name == "ID") {
                    //Add the ID to the AST
                    console.log("ADDING ID");
                    this.ast.addNode(node.children[0].name, "leaf");
                    //go back up the tree;
                    //  this.ast.endChildren();
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
            console.log("ARE WE EXPANDING");
            //str = "";
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
                if (node != "\"") {
                    console.log(node.name + "WHY???");
                    this.str += node.name;
                    console.log(this.str);
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
            console.log("RESULT BITCH" + this.str);
            return this.str;
        };
        return semanticAnalyzer;
    }());
    TSC.semanticAnalyzer = semanticAnalyzer;
})(TSC || (TSC = {}));
