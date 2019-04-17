/*parser.ts*/
var TSC;
(function (TSC) {
    var Parser = /** @class */ (function () {
        function Parser(tokens, progNumber) {
            this.log = [];
            this.cst = new TSC.Tree();
            this.currToken = 0;
            this.error = false;
            this.tokenList = tokens;
            this.currentProg = progNumber;
            this.nt = [];
        }
        Parser.prototype.parse = function () {
            if (this.parseProg()) {
            }
            else {
            }
            var results = new ParseResults(this.log, this.error, this.cst);
            return results;
        };
        Parser.prototype.parseProg = function () {
            if (this.error != true) {
                this.cst.addNode("Program", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                this.parseBlock();
                if (this.match("TEOP") && !this.error) {
                    this.cst.addNode("$", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                    return true;
                }
                else {
                    this.log.push("PARSE ERROR - No EOP Found.");
                    this.error = true;
                }
            }
        };
        Parser.prototype.parseBlock = function () {
            var cheat = false;
            if (this.error != true) {
                this.cst.addNode("Block", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TLeftBrace")) {
                    this.cst.addNode("{", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - EXPECTED { FOUND " + this.tokenList[this.currToken].value);
                    this.error = true;
                }
                this.parseStatementList();
                if (this.error != true) {
                    if (this.match("TRightBrace")) {
                        this.cst.addNode("}", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                        this.consume();
                        //this.cst.endChildren();
                        cheat = true;
                    }
                    else if (!cheat) {
                        this.log.push("PARSE ERROR - EXPECTED TRightBrace FOUND " + this.tokenList[this.currToken].name);
                        this.error = true;
                    }
                }
            }
            this.cst.endChildren();
        };
        Parser.prototype.parseStatementList = function () {
            if (this.error != true) {
                this.cst.addNode("StatementList", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.tokenList[this.currToken].name == "TPrint" || this.tokenList[this.currToken].name == "TID" ||
                    this.tokenList[this.currToken].name == "TInt" || this.tokenList[this.currToken].name == "TString" ||
                    this.tokenList[this.currToken].name == "TBoolean" || this.tokenList[this.currToken].name == "TWhile" ||
                    this.tokenList[this.currToken].name == "TIf" || this.tokenList[this.currToken].name == "TLeftBrace") {
                    this.parseStatement();
                }
                this.cst.endChildren();
                if (!this.error) {
                    if (this.tokenList[this.currToken].name == "TPrint" || this.tokenList[this.currToken].name == "TID" ||
                        this.tokenList[this.currToken].name == "TInt" || this.tokenList[this.currToken].name == "TString" ||
                        this.tokenList[this.currToken].name == "TBoolean" || this.tokenList[this.currToken].name == "TWhile" ||
                        this.tokenList[this.currToken].name == "TIf" || this.tokenList[this.currToken].name == "TLeftBrace") {
                        this.parseStatementList();
                    }
                    else {
                        //lambda
                    }
                }
            }
            //this.cst.endChildren();
        };
        Parser.prototype.parseStatement = function () {
            if (this.error != true) {
                this.cst.addNode("Statement", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.tokenList[this.currToken].name == "TPrint") {
                    this.parsePrint();
                }
                else if (this.tokenList[this.currToken].name == "TID") {
                    this.parseAssignment();
                }
                else if (this.tokenList[this.currToken].name == "TInt" || this.tokenList[this.currToken].name == "TString" || this.tokenList[this.currToken].name == "TBoolean") {
                    this.parseVarDecl();
                }
                else if (this.tokenList[this.currToken].name == "TWhile") {
                    this.parseWhile();
                }
                else if (this.tokenList[this.currToken].name == "TIf") {
                    this.parseIf();
                }
                else if (this.tokenList[this.currToken].name == "TLeftBrace") {
                    this.parseBlock();
                }
                else {
                    this.error = true;
                    this.log.push("PARSE ERROR - Expecting one of: [print | TID | TInt | TString | TBoolean | TWhile | TIf | {");
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parsePrint = function () {
            if (this.error != true) {
                this.cst.addNode("printStatement", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TPrint")) {
                    this.cst.addNode("Print", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected print Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                if (this.match("TLeftParen")) {
                    this.cst.addNode("(", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected ( Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.parseExpr();
                if (this.match("TRightParen") && !this.error) {
                    this.cst.addNode(")", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected ) Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseAssignment = function () {
            if (this.error != true) {
                this.cst.addNode("AssignmentStatement", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TID")) {
                    this.log.pop();
                    this.parseID();
                }
                else {
                    this.log.push("PARSE ERROR - Expected TID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                if (this.match("TAssign") && !this.error) {
                    this.cst.addNode("=", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected = Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.parseExpr();
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseVarDecl = function () {
            if (this.error != true) {
                this.cst.addNode("VariableDeclaration", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.tokenList[this.currToken].name == "TInt" || this.tokenList[this.currToken].name == "TString" || this.tokenList[this.currToken].name == "TBoolean") {
                    this.parseType();
                }
                else {
                    this.log.push("PARSE ERROR - Expected: Boolean | String | Int Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                if (this.match("TID")) {
                    this.log.pop();
                    this.parseID();
                }
                else {
                    this.log.push("PARSE ERROR - Expected ID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseWhile = function () {
            if (this.error != true) {
                this.cst.addNode("WhileStatement", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TWhile")) {
                    this.cst.addNode("while", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected while Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.parseBoolean();
                this.parseBlock();
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseIf = function () {
            if (this.error != true) {
                this.cst.addNode("IfStatement", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TIf")) {
                    this.cst.addNode("if", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected if Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                if (!this.error) {
                    this.parseBoolean();
                }
                if (!this.error) {
                    this.parseBlock();
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseExpr = function () {
            if (this.error != true) {
                this.cst.addNode("Expression", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TDigit")) {
                    this.log.pop();
                    this.parseInt();
                }
                else if (this.match("TQuote")) {
                    this.parseString();
                }
                else if (this.match("TLeftParen")) {
                    this.parseBoolean();
                }
                else if (this.match("TTrue") || this.match("TFalse")) {
                    this.parseBoolean();
                }
                else if (this.match("TID")) {
                    this.log.pop();
                    this.parseID();
                }
                else {
                    this.log.push("PARSE ERROR - Expected Int | String | Bool | ID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseInt = function () {
            if (this.error != true) {
                this.cst.addNode("IntExpression", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TDigit") && this.matchNext("TIntOp")) {
                    this.parseDigit();
                    this.parseIntOp();
                    this.parseExpr();
                }
                else if (this.match("TDigit")) {
                    this.log.pop();
                    this.parseDigit();
                }
                else {
                    this.log.push("PARSE ERROR - Expected TDigit | TDigit & IntOp Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseString = function () {
            if (this.error != true) {
                this.cst.addNode("StringExpression", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TQuote")) {
                    this.cst.addNode("\"", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected \" Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.parseCharList();
                if (this.match("TQuote")) {
                    this.cst.addNode("\"", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected \" Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseBoolean = function () {
            //if(this.error ! = true) {
            this.cst.addNode("BooleanExpression", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
            if (this.match("TLeftParen")) {
                this.cst.addNode("(", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                this.consume();
                this.parseExpr();
                this.parseBoolOp();
                this.parseExpr();
                if (this.match("TRightParen")) {
                    this.cst.addNode(")", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected ) Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
            else if (this.tokenList[this.currToken].name == "TTrue" || this.tokenList[this.currToken].name == "TFalse") {
                this.parseBoolVal();
            } //else {
            // this.log.push("PARSE ERROR - Expected true | false Found " + this.tokenList[this.currToken].name);
            //this.error = true;
            //}
            this.cst.endChildren();
            // }
        };
        Parser.prototype.parseID = function () {
            if (this.error != true) {
                this.cst.addNode("ID", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TID")) {
                    this.cst.addNode(this.tokenList[this.currToken].value.toString(), "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected ID Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseCharList = function () {
            if (this.error != true) {
                if (this.match("TChar")) {
                    //moved so we don't get a terminal blank charlist
                    this.cst.addNode("CharacterList", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.parseChar();
                    this.parseCharList();
                }
                else {
                    //lambda
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseType = function () {
            if (this.error != true) {
                if (this.match("TInt") || this.match("TString") || this.match("TBoolean")) {
                    this.cst.addNode(this.tokenList[this.currToken].value.toString(), "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
            }
        };
        Parser.prototype.parseChar = function () {
            if (this.error != true) {
                this.cst.addNode("Char", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                if (this.match("TChar")) {
                    this.cst.addNode(this.tokenList[this.currToken].value.toString(), "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                    //this.parseCharList()
                }
                else if (this.match("TSpace")) {
                    this.cst.addnode(" ", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected CHAR Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseDigit = function () {
            if (this.error != true) {
                if (this.match("TDigit")) {
                    this.cst.addNode("Digit", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.cst.addNode(this.tokenList[this.currToken].value, "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected DIGIT Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
                this.cst.endChildren();
            }
        };
        Parser.prototype.parseBoolOp = function () {
            if (this.error != true) {
                if (this.match("TBooleanEquals")) {
                    this.cst.addNode("==", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else if (this.match("TBooleanNotEquals")) {
                    this.cst.addNode("!=", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected == | != Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
        };
        Parser.prototype.parseBoolVal = function () {
            if (this.error != true) {
                if (this.match("TTrue")) {
                    this.cst.addNode("true", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else if (this.match("TFalse")) {
                    this.cst.addNode("false", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected true | false Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
        };
        Parser.prototype.parseIntOp = function () {
            if (this.error != true) {
                if (this.match("TIntOp")) {
                    this.cst.addNode("intOp", "branch", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.cst.addNode("+", "leaf", this.tokenList[this.currToken].lineNumber, this.currentProg);
                    this.consume();
                }
                else {
                    this.log.push("PARSE ERROR - Expected + Found " + this.tokenList[this.currToken].name);
                    this.error = true;
                }
            }
            this.cst.endChildren();
        };
        Parser.prototype.match = function (expected) {
            if (this.error == true) {
                return false;
            }
            // console.log("What number we getting to?" + this.currToken);
            // console.log("" + this.tokenList[this.currToken].name + expected);
            if (this.tokenList[this.currToken].name == expected) {
                this.log.push("VALID - Expected " + expected + " found " + this.tokenList[this.currToken].name + " at " + this.tokenList[this.currToken].lineNumber);
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.matchNext = function (expected) {
            if (this.error) {
                return false;
            }
            if (this.tokenList[this.currToken + 1].name == expected) {
                this.log.push("VALID - Expected " + expected + " found " + this.tokenList[this.currToken + 1].name + " at " + this.tokenList[this.currToken + 1].lineNumber);
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.consume = function () {
            if (this.currToken != this.tokenList.length) {
                this.currToken++;
            }
        };
        return Parser;
    }());
    TSC.Parser = Parser;
    var ParseResults = /** @class */ (function () {
        function ParseResults(log, error, cst) {
            this.log = log;
            this.error = error;
            this.cst = cst;
        }
        return ParseResults;
    }());
    TSC.ParseResults = ParseResults;
})(TSC || (TSC = {}));
