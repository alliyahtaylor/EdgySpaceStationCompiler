var TSC;
(function (TSC) {
    var semanticAnalyzer = /** @class */ (function () {
        function semanticAnalyzer() {
            this.log = [];
            this.errors = [];
            this.warnings = [];
            this.ast = new TSC.Tree();
        }
        //This will be the main function of semantic analysis
        semanticAnalyzer.prototype.analyze = function (parseCST) {
            //create AST will be recursive so we'll just call this on the root.
            this.createAST(parseCST.root);
        };
        //This is gonna go through the CST and figure out what's important enough to keep for the AST
        //Can you guess how many times I typed createCST, deleted it, and typed it again? the answer is *SPOILER ALERT* 6.
        semanticAnalyzer.prototype.createAST = function (node) {
            //Check if node is important enough to be on AST
            //If it is, add it to the AST and go down to children
            //when you finish traversing the node's children, go back up the AST unless we're at the root (I typed this as "rute")
            //Gonna have to go through the different productions somehow, either if/else or switch case
            //If statements for "Important" productions, else for everything else
            if (node.name = "Block") {
                //add "Block" node to the AST
                this.ast.addNode("Block", "branch");
                //Go through its children.
                for (var i = 0; i < node.children.length; i++) {
                    this.createAST(node.children[i]);
                }
                if (this.ast.cur != null) {
                    this.ast.endChildren();
                }
            }
            else if (node.name = "Print") {
                //add "Print" node to AST
                this.ast.addNode("Print", "branch");
                //TODO: Figure out which child
                this.createAST(node.children[1]);
                //go back up the tree
                this.ast.endChildren();
            }
            else if (node.name = "Assign") {
                //add "Assign" node to AST
                this.ast.addNode("Assign", "branch");
            }
            else if (node.name = "VariableDeclaration") {
                //Add "VarDecl" node to AST
                this.ast.addNode("VariableDeclaration", "branch");
                this.ast.addNode(node.children[0].children[0].name);
                this.ast.addNode(node.children[0].children[1].name);
                //Go back up the ast
                this.ast.endChildren();
            }
            else if (node.name = "While") {
                //Add "While" node to AST
                this.ast.addNode("While", "branch");
            }
            else if (node.name = "IfStatement") {
                //Add "IfStatement" node to AST
                this.ast.addNode("IfStatement", "branch");
            }
            else if (node.name = "IntExpression") {
                //Add "IntExpression" node to AST
                this.ast.addNode("IntExpression", "branch");
            }
            else if (node.name = "StringExpression") {
                //Add "StringExpression" node to AST and STOP ADDING A SPACE, DUMB ALLIYAH
                this.ast.addNode("StringExpression", "branch");
            }
            else if (node.name = "BooleanExpression") {
                //Add "BooleanExpression" node to AST
                this.ast.addNode("BooleanExpression", "branch");
            }
            else if (node.name = "ID") {
                this.ast.addNode("ID", "branch");
            }
            else {
            }
        };
        return semanticAnalyzer;
    }());
    TSC.semanticAnalyzer = semanticAnalyzer;
})(TSC || (TSC = {}));
