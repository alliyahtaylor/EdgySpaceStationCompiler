/*parser.ts*/

module TSC
{
    export class Parser {

        log: Array<String>;
        nt: Array<String>;
        cst;
        currToken: number;
        tokenList: Array<Token>;
        error: boolean;
        currentProg: number;

        constructor(tokens, progNumber){
            this.log = [];
            this.cst = new Tree();
            this.currToken = 0;
            this.error = false;
            this.tokenList = tokens;
            this.currentProg = progNumber;
            this.nt = [];
        }

        public parse(){
            if(this.parseProg()){

            }else{

            }
            let results = new ParseResults(this.log, this.error, this.cst);
            return results;
        }

        public parseProg(){
            if(this.error != true) {
                this.cst.addNode("Program", "branch");

                this.parseBlock();

                if (this.match("TEOP") && !this.error) {
                    this.cst.addNode("$", "leaf");
                    this.consume()
                    return true;
                } else {
                    this.log.push("PARSE ERROR - No EOP Found.");
                    this.error = true;
                }
            }
        }

        public parseBlock(){
            let cheat = false;
            if(this.error != true) {
                this.cst.addNode("Block", "branch");

                if (this.match("TLeftBrace")) {
                    this.cst.addNode("{", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - EXPECTED { FOUND " + this.tokenList[this.currToken].value);
                    this.error = true;
                }

                this.parseStatementList();

                console.log("Are we looping back here or just within the if?");
                if(this.error != true){
                if (this.match("TRightBrace")) {
                    this.cst.addNode("}", "leaf");
                    this.consume();
                    //this.cst.endChildren();
                    cheat = true;
                }else if(!cheat){
                    console.log("why we get here?");
                    this.log.push("PARSE ERROR - EXPECTED TRightBrace FOUND " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                }

            }
            this.cst.endChildren();
        }

        public parseStatementList(){
           if(this.error != true){
               this.cst.addNode("StatementList", "branch");
            if (this.tokenList[this.currToken].name == "TPrint" ||this.tokenList[this.currToken].name == "TID" ||
                this.tokenList[this.currToken].name == "TInt" ||this.tokenList[this.currToken].name == "TString" ||
                this.tokenList[this.currToken].name == "TBoolean" || this.tokenList[this.currToken].name == "TWhile" ||
                this.tokenList[this.currToken].name == "TIf" || this.tokenList[this.currToken].name == "TLeftBrace"){

                this.parseStatement();
            }
            this.cst.endChildren();
               if(!this.error){
            if (this.tokenList[this.currToken].name == "TPrint" ||this.tokenList[this.currToken].name == "TID" ||
                this.tokenList[this.currToken].name == "TInt" ||this.tokenList[this.currToken].name == "TString" ||
                this.tokenList[this.currToken].name == "TBoolean" || this.tokenList[this.currToken].name == "TWhile" ||
                this.tokenList[this.currToken].name == "TIf" || this.tokenList[this.currToken].name == "TLeftBrace"){

                this.parseStatementList();
            }else{
                //lambda
            }}}
            //this.cst.endChildren();

        }

        public parseStatement(){
            if (this.error != true) {
                this.cst.addNode("Statement", "branch");
                if (this.tokenList[this.currToken].name == "TPrint") {
                    this.parsePrint();
                } else if (this.tokenList[this.currToken].name == "TID") {
                    this.parseAssignment();
                } else if (this.tokenList[this.currToken].name == "TInt" || this.tokenList[this.currToken].name == "TString" || this.tokenList[this.currToken].name == "TBoolean") {
                    this.parseVarDecl();
                } else if (this.tokenList[this.currToken].name == "TWhile") {
                    this.parseWhile();
                } else if (this.tokenList[this.currToken].name == "TIf") {
                    this.parseIf();
                } else if (this.tokenList[this.currToken].name == "TLeftBrace") {
                    this.parseBlock();
                } else {
                    this.error = true;
                    this.log.push("PARSE ERROR - Expecting one of: [print | TID | TInt | TString | TBoolean | TWhile | TIf | {");
                }
                this.cst.endChildren();
            }
        }

        public parsePrint(){
            if (this.error != true) {
                this.cst.addNode("printStatement", "branch");

                if (this.match("TPrint")) {
                    this.cst.addNode("Print", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected print Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                if (this.match("TLeftParen")) {
                    this.cst.addNode("(", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected ( Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.parseExpr();

                if (this.match("TRightParen") && !this.error) {
                    this.cst.addNode(")", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected ) Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.cst.endChildren();
            }
        }

        public parseAssignment(){
            if(this.error != true) {
                this.cst.addNode("AssignmentStatement", "branch");

                if (this.match("TID")) {
                    this.log.pop();
                    this.parseID();
                } else {
                    this.log.push("PARSE ERROR - Expected TID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }


                if(this.match("TAssign") && !this.error) {
                    this.cst.addNode("=", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected = Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.parseExpr();

                this.cst.endChildren();
            }

        }

        public parseVarDecl(){
            if (this.error != true) {
                this.cst.addNode("VariableDeclaration", "branch");

                if (this.tokenList[this.currToken].name == "TInt" || this.tokenList[this.currToken].name == "TString" || this.tokenList[this.currToken].name == "TBoolean") {
                    this.parseType();
                } else {
                    this.log.push("PARSE ERROR - Expected: Boolean | String | Int Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                if (this.match("TID")) {
                    this.log.pop();
                    this.parseID();
                } else {
                    this.log.push("PARSE ERROR - Expected ID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.cst.endChildren();
            }
        }

        public parseWhile(){
            if (this.error != true) {
                this.cst.addNode("WhileStatement", "branch");

                if (this.match("TWhile")) {
                    this.cst.addNode("while", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected while Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.parseBoolean();

                this.parseBlock();

                this.cst.endChildren();
            }
        }

        public parseIf(){
            if(this.error != true) {
                this.cst.addNode("IfStatement", "branch");

                if (this.match("TIf")) {
                    this.cst.addNode("if", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected if Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                if(!this.error){this.parseBoolean();}

                if(!this.error) {
                    this.parseBlock();
                }
                this.cst.endChildren();
            }
        }

        public parseExpr(){
            if(this.error != true) {
                this.cst.addNode("Expression", "branch");
                if (this.match("TDigit")) {
                    this.log.pop();
                    this.parseInt();
                } else if (this.match("TQuote")) {
                    this.parseString();
                } else if (this.match("TLeftParen")) {
                    this.parseBoolean();
                } else if (this.match("TTrue") || this.match("TFalse")) {
                    this.parseBoolean();
                } else if (this.match("TID")) {
                    this.log.pop();
                    this.parseID();
                } else {
                    this.log.push("PARSE ERROR - Expected Int | String | Bool | ID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        }

        public parseInt(){
            if(this.error != true) {
                this.cst.addNode("IntExpression", "branch");
                if (this.match("TDigit") && this.matchNext("TIntOp")) {
                    this.parseDigit();
                    this.parseIntOp();
                    this.parseExpr();
                } else if (this.match("TDigit")) {
                    this.log.pop();
                    this.parseDigit()
                } else {
                    this.log.push("PARSE ERROR - Expected TDigit | TDigit & IntOp Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        }

        public parseString(){
            if(this.error != true) {
                this.cst.addNode("StringExpression", "branch");

                if (this.match("TQuote")) {
                    this.cst.addNode("\"", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected \" Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.parseCharList();

                if (this.match("TQuote")) {
                    this.cst.addNode("\"", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected \" Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.cst.endChildren();
            }
        }

        public parseBoolean(){
            //if(this.error ! = true) {
                this.cst.addNode("BooleanExpression", "branch");
                console.log("We before here?");

                if(this.match("TLeftParen")){
                    console.log("We here?");
                    this.cst.addNode("(", "leaf");
                    this.consume();
                    this.parseExpr();
                    this.parseBoolOp();
                    this.parseExpr();

                    if (this.match("TRightParen")) {
                        this.cst.addNode(")", "leaf");
                        this.consume();
                    } else {
                        this.log.push("PARSE ERROR - Expected ) Found " + this.tokenList[this.currToken].name);
                        this.error = true;
                    }
                } else if (this.tokenList[this.currToken].name == "TTrue" || this.tokenList[this.currToken].name == "TFalse"){
                    this.parseBoolVal();
                } //else {
                   // this.log.push("PARSE ERROR - Expected true | false Found " + this.tokenList[this.currToken].name);
                    //this.error = true;
                //}

                this.cst.endChildren();
           // }
        }

        public parseID(){
            if(this.error != true) {
                this.cst.addNode("ID", "branch");

                if (this.match("TID")) {
                    this.cst.addNode(this.tokenList[this.currToken].value.toString(), "leaf");
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected ID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }

                this.cst.endChildren();
            }
        }

        public parseCharList(){
            if(this.error != true) {
                if (this.match("TChar")) {
                    //moved so we don't get a terminal blank charlist
                    this.cst.addNode("CharacterList", "branch");
                    this.parseChar();
                    this.parseCharList();
                } else {
                    //lambda
                }
                this.cst.endChildren();
            }
        }

        public parseType(){
            if(this.error != true) {
                if (this.match("TInt") || this.match("TString") || this.match("TBoolean")) {
                    this.cst.addNode(this.tokenList[this.currToken].value.toString(), "leaf");
                    this.consume();
                }
            }
        }

        public parseChar(){
            if(this.error != true) {
                this.cst.addNode("Char", "branch");
                if (this.match("TChar")) {
                    this.cst.addNode(this.tokenList[this.currToken].value.toString(), "leaf");
                    this.consume();
                    //this.parseCharList()
                } else if(this.match("TSpace")){
                 this.cst.addnode(" ", "leaf");
                 this.consume();
                }else{
                    this.log.push("PARSE ERROR - Expected CHAR Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren()
            }
        }

        public parseDigit(){
            if(this.error != true) {
                if (this.match("TDigit")) {
                    this.cst.addNode("Digit", "branch");
                    this.cst.addNode(this.tokenList[this.currToken].value, "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected DIGIT Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        }

        public parseBoolOp(){
            if(this.error != true) {
                if (this.match("TBooleanEquals")) {
                    this.cst.addNode("==", "leaf");
                    this.consume();
                } else if (this.match("TBooleanNotEquals")) {
                    this.cst.addNode("!=", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected == | != Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
        }

        public parseBoolVal(){
            if(this.error != true) {
                if (this.match("TTrue")) {
                    this.cst.addNode("true", "leaf");
                    this.consume();
                } else if (this.match("TFalse")) {
                    this.cst.addNode("false", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected true | false Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
        }
        public parseIntOp(){
            if(this.error != true) {
                if (this.match("TIntOp")) {
                    this.cst.addNode("intOp", "branch");
                    this.cst.addNode("+", "leaf");
                    this.consume();
                } else {
                    this.log.push("PARSE ERROR - Expected + Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
            this.cst.endChildren();
        }

        public match(expected: String){
            console.log("expected: " + expected);
            if(this.error == true){
                console.log("something here?" + this.tokenList[this.currToken].name);
                return false;
            }
           // console.log("What number we getting to?" + this.currToken);
           // console.log("" + this.tokenList[this.currToken].name + expected);
            if(this.tokenList[this.currToken].name == expected){
                this.log.push("VALID - Expected " + expected + " found " + this.tokenList[this.currToken].name + " at " + this.tokenList[this.currToken].lineNumber);
                return true;
            }else{
                console.log("Or here?" + this.tokenList[this.currToken].name);
                return false;}
        }
        public matchNext(expected){
            if (this.error){
                return false;
            }
            if(this.tokenList[this.currToken + 1].name == expected){
                this.log.push("VALID - Expected " + expected + " found " + this.tokenList[this.currToken + 1].name + " at " + this.tokenList[this.currToken + 1].lineNumber);
                return true;
            }else{
                return false;
            }
        }

        public consume(){
            if (this.currToken != this.tokenList.length){
            this.currToken++;}
        }

    }
    export class ParseResults{
        log: Array<String>;
        cst;
        error: boolean;

        constructor(log, error, cst){
            this.log = log;
            this.error = error;
            this.cst = cst;
        }

    }

}
