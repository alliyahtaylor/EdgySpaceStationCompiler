module TSC {
    export class semanticAnalyzer{
        ast;
        log: Array<string>;
        errors: Array<string>;
        warnings: Array <string>;

        constructor(){
            this.log = [];
            this.errors = [];
            this.warnings = [];
            this.ast = new Tree();
        }

        //This will be the main function of semantic analysis
        public analyze(parseCST){
            //create AST will be recursive so we'll just call this on the root.
            this.createAST(parseCST.root);
        }

        //This is gonna go through the CST and figure out what's important enough to keep for the AST
        //Can you guess how many times I typed createCST, deleted it, and typed it again? the answer is *SPOILER ALERT* 6.
        public createAST(node){

            //Check if node is important enough to be on AST
            //If it is, add it to the AST and go down to children
            //when you finish traversing the node's children, go back up the AST unless we're at the root (I typed this as "rute")
            //Gonna have to go through the different productions somehow, either if/else or switch case
            //If statements for "Important" productions, else for everything else
            if(node.name = "Block"){
                //add "Block" node to the AST
                this.ast.addNode("Block", "branch");
                //Go through its children.
               for(var i = 0; i< node.children.length; i++){
                    this.createAST(node.children[i]);
                }
                if(this.ast.cur != null){
                   this.ast.endChildren();
                }
            }else if(node.name = "Print"){
                //add "Print" node to AST -- Print is PrintStatement child 0 in current CST config
                this.ast.addNode("Print", "branch");
                //create CST from expression. child 2 because 1 is (
                this.createAST(node.children[2]);
                //go back up the tree
                this.ast.endChildren();

            }else if(node.name = "Assign"){
                //add "Assign" node to AST
                this.ast.addNode("Assign", "branch");
                //Add the ID
                this.ast.addNode(node.children[0].children[0].name);
                //go back to assign
                this.ast.endChildren();
                //Add the expression to the AST
                this.createAST(node.children[1]);
                //go back up the tree
                this.ast.endChildren();

            }else if(node.name = "VariableDeclaration"){
                //Add "VarDecl" node to AST
                this.ast.addNode("VariableDeclaration", "branch");
                //Get Type and add to the AST
                this.ast.addNode(node.children[0].name, "leaf");
                //Go back up so that next node is added to VarDecl's children
                this.ast.endChildren();
                //Get ID and add to the AST
                this.ast.addNode(node.children[1].children[0].name, "leaf");
                //Go back up the ast
                this.ast.endChildren();
                //end VarDecl children
                this.ast.endChildren();

            }else if(node.name = "While"){
                //Add "While" node to AST
                this.ast.addNode("While", "branch");
                //Create AST for expression
                this.createAST(node.children[1]);
                //create ast for while block
                this.createAST(node.children[2]);

                //Not gonna lie, I'm just copy-pasting the stuff for while statements here
            }else if(node.name = "IfStatement"){
                //Add "IfStatement" node to AST
                this.ast.addNode("IfStatement", "branch");
                //Create AST for expression
                this.createAST(node.children[1]);
                //create ast for while block
                this.createAST(node.children[2]);

            }else if(node.name = "IntExpression"){
                //Add "IntExpression" node to AST
                this.ast.addNode("IntExpression", "branch");
            }else if(node.name = "StringExpression"){
                //Add "StringExpression" node to AST and STOP ADDING A SPACE, DUMB ALLIYAH
                this.ast.addNode("StringExpression", "branch");
            }else if(node.name = "BooleanExpression"){
                //Add "BooleanExpression" node to AST
                this.ast.addNode("BooleanExpression", "branch");
            }else if(node.name = "ID"){
                //Add the ID to the AST
                this.ast.addNode(node.children.name, "leaf");
                //go back up the tree;
                this.ast.endChildren();
            }else{

            }
    }

    //TODO: Scope Everything
        //TODO: Symbol Table :(

    }

}
