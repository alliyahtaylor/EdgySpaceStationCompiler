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

        }

        //This is gonna go through the CST and figure out what's important enough to keep for the AST
        //Can you guess how many times I typed createCST, deleted it, and typed it again? the answer is *SPOILER ALERT* 6.
        public createAST(node){

            //Check if node is important enough to be on AST

            //If it is, add it to the AST and go down to children

            //when you finish traversing the node's children, go back up the AST unless we're at the root (I typed this as "rute")

            //Gonna have to go through the different productions somehow, either if/else or switch case

            //I'm doing this as single line comments because there will be code between some of this stuff and I think better this way.

            //Don't green pen at me
    }
    }

}
