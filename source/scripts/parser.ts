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

        constructor(tokens, prognumber){
            this.log = [];
            this.cst = new Tree();
            this.currToken = 0;
            this.error = false;
            this.tokenList = tokens;
            this.currentProg = prognumber;
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
            this.nt.push("Program");
            if(this.parseBlock()){
                if(this.match("TEOP")){
                return true;
                }
                return false;
            }
            return false;
        }

        public parseBlock(){
            if (this.nt[this.nt.length-1] == "If Statement"){
                this.nt.pop();
            }
            this.nt.push("Block");
            if(this.match("TLeftBrace"){
                if(this.parseStatementList(){
                    if (this.match("TRightBrace")) {
                        this.cst.endChildren();
                        return true;
                    }
                return false;
                }
                return false;
            }
            return false;

        }

        public parseStatementList(){
            this.nt.push("Statement List");
            if(this.parseStatement() && this.parseStatementList()){
                this.cst.endChildren();
                return true;
            }
            //Allow empty statement.
            else{
                return true;
            }
        }

        public parseStatement(){
            this.nt.push("Statement");
            if(this.parsePrint() || this.parseAssignment() || this.parseWhile() ||
                this.parseVarDecl() || this.parseIf() || this.parseBlock()){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parsePrint(){
            this.nt.push("Print");
            if(this.match("TPrint") && this.match("TLeftParen") && this.parseExpr() && this.match("TRightParen")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseAssignment(){
            this.nt.pop();
            this.nt.push("Assignment");
            console.log("are we getting back to Assignment?");
            if(this.parseID() && this.match("TAssign") && this.parseExpr()){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseVarDecl(){
            this.nt.pop();
            this.nt.push("Variable Declaration");
            if (this.parseType() && this.parseID()){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseWhile(){
            this.nt.pop();
            this.nt.push("While Statement");
            if(this.match("TWhile") && this.parseBoolean() && this.parseBlock()){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseIf(){
            this.nt.pop();
            this.nt.push("If Statement");
            if(this.match("TIf") && this.parseBoolean() && this.parseBlock()){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseExpr(){
            this.nt.push("Expression");
            console.log("do we parse expression?");
            if(this.parseInt() || this.parseString() || this.parseBoolean() || this.parseID()){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseInt(){
            this.nt.push("Integer");
            if(this.parseDigit()){
                if(this.parseIntOp() && this.parseExpr()){
                    this.cst.endChildren();
                    return true;
                }else{
                    this.cst.endChildren();
                    return true;
                }
            }
            return false;
        }

        public parseString(){
            this.nt.push("String");
            if(this.match("TQuote") && this.parseCharList() && this.match("TQuote")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseBoolean(){
            this.nt.push("Boolean");
            if(this.parseBoolVal()){
                this.cst.endChildren();
                return true;
            }else if(this.match("TLeftParen") && this.parseExpr()&& this.parseBoolOp() && this.parseExpr() && this.match("TRightParen")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseID(){
            this.nt.push("ID");
            console.log("Are we getting to parse ID?");
            if(this.match("TID")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseCharList(){
            this.nt.push("Character List");
            if(this.parseChar() && this.parseCharList()){
                this.cst.endChildren();
                return true;
            }else if(this.parseSpace() && this.parseCharList()){
                this.cst.endChildren();
                return true
            }else{
                return true;
            }
        }

        public parseType(){
            this.nt.push("Type");
            console.log("Are we getting to parse type?");
            if(this.match("TInt") || this.match("TString") || this.match("TBoolean")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseChar(){
            this.nt.push("Character");
            if (this.match("TChar")){
                this.cst.endChildren();
                return true
            }
            return false;
        }

        public parseSpace(){
            //this.nt.push("Space");
            if(this.match("TSpace")){
                this.cst.endChildren();
                return true;
            }
            return false
        }

        public parseDigit(){
            this.nt.push("Digit");
            if(this.match("TDigit")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseBoolOp(){
            this.nt.push("Boolean Operation");
            if(this.match("TBoolOp")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public parseBoolVal(){
            this.nt.push("Boolean Value");
            if(this.match("TTrue") || this.match("TFalse")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }
        public parseIntOp(){
            this.nt.push("Integer Operation");
            if(this.match("TIntOp")){
                this.cst.endChildren();
                return true;
            }
            return false;
        }

        public match(expected){

            if(this.error){
                return false;
            }
            if(this.tokenList[this.currToken].name == expected){
                this.log.push("VALID - Expected " + expected + " found " + expected+ " at " + this.tokenList[this.currToken].lineNumber);
               for (var i = 0; i < this.nt.length; i++){
                   this.cst.addNode(this.nt[i], "branch");
               }
                this.cst.addNode(this.tokenList[this.currToken].value, "leaf");

                this.currToken++;
                this.nt = [];
                console.log(this.currToken);
                console.log(this.tokenList);
                return true;
            }else{
            return false;}
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
