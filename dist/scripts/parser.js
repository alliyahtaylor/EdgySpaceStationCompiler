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
            this.cst.addNode("Program", "branch");
            this.parseBlock();
            if (this.match("TEOP")) {
                this.cst.addNode("$", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - No EOP Found.");
                this.error = true;
            }
        };
        Parser.prototype.parseBlock = function () {
            this.cst.addNode("Block", "branch");
            if (this.match("TLeftBrace")) {
                this.cst.addNode("{", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - EXPECTED { FOUND " + this.tokenList[currentToken]);
                this.error = true;
            }
            this.parseStatementList();
            if (this.match("TRightBrace")) {
                this.cst.addNode("}", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - EXPECTED } FOUND " + this.tokenList[currentToken]);
                this.error = true;
            }
            this.cst.endChildren();
        };
        Parser.prototype.parseStatementList = function () {
            this.cst.addNode("StatementList", "branch");
            if (this.tokenList[currentToken].name == "TPrint" || this.tokenList[currentToken].name == "TID" ||
                this.tokenList[currentToken].name == "TInt" || this.tokenList[currentToken].name == "TString" ||
                this.tokenList[currentToken].name == "Boolean" || this.tokenList[currentToken].name == "TWhile" ||
                this.tokenList[currentToken].name == "TIf" || this.tokenList[currentToken].name == "TLeftBrace") {
                this.parseStatement();
            }
            this.cst.endChildren();
            if (this.tokenList[currentToken].name == "TPrint" || this.tokenList[currentToken].name == "TID" ||
                this.tokenList[currentToken].name == "TInt" || this.tokenList[currentToken].name == "TString" ||
                this.tokenList[currentToken].name == "Boolean" || this.tokenList[currentToken].name == "TWhile" ||
                this.tokenList[currentToken].name == "TIf" || this.tokenList[currentToken].name == "TLeftBrace") {
                this.parseStatementList();
            }
            else {
                //lambda
            }
        };
        Parser.prototype.parseStatement = function () {
            this.cst.addNode("Statement", "branch");
            if (this.tokenList[currentToken].name == "TPrint") {
                this.parsePrint();
            }
            else if (this.tokenList[currentToken].name == "TID") {
                this.parseAssignment();
            }
            else if (this.tokenList[currentToken].name == "TInt" || this.tokenList[currentToken].name == "TString" || this.tokenList[currentToken].name == "Boolean") {
                this.parseVarDecl();
            }
            else if (this.tokenList[currentToken].name == "TWhile") {
                this.parseWhile();
            }
            else if (this.tokenList[currentToken].name == "TIf") {
                this.parseIf();
            }
            else if (this.tokenList[currentToken].name == "TLeftBrace") {
                this.parseBlock();
            }
            else {
                this.error = true;
                this.log.push("PARSE ERROR - Expecting one of: [print | TID | TInt | TString | TBoolean | TWhile | TIf | {");
            }
            this.cst.endChildren();
        };
        Parser.prototype.parsePrint = function () {
            this.cst.addNode("printStatement", "branch");
            if (this.match("TPrint")) {
                this.cst.addNode("print", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - Expected print Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            if (this.match("TLeftParen")) {
                this.cst.addNode("(", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - Expected ( Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            this.parseExpr();
            if (this.match("TRightParen")) {
                this.cst.addNode(")", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - Expected ) Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            this.cst.endChildren();
        };
        Parser.prototype.parseAssignment = function () {
            this.cst.addNode("AssignmentStatement", "branch");
            if (this.match("TID")) {
                this.parseID();
            }
            else {
                this.log.push("PARSE ERROR - Expected TID Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            if (this.match("TAssign")) {
                this.cst.addNode("=", "leaf");
            }
            else {
                this.log.push("PARSE ERROR - Expected = Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            this.parseExpr();
            this.cst.endChildren();
        };
        Parser.prototype.parseVarDecl = function () {
            this.cst.addNode("VariableDeclaration", "branch");
            if (this.tokenList[currentToken].name == "TInt" || this.tokenList[currentToken].name == "TString" || this.tokenList[currentToken].name == "Boolean") {
                this.parseType();
            }
            else {
                this.log.push("PARSE ERROR - Expected: Boolean | String | Int Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            if (this.match("TID")) {
                this.parseID();
            }
            else {
                this.log.push("PARSE ERROR - Expected ID Found " + this.tokenList[currentToken].name);
                this.error = true;
            }
            this.cst.endChildren();
        };
        Parser.prototype.parseWhile = function () {
            this.cst.addNode("WhileStatement", "branch");
            if (this.match("TWhile")) {
            }
        };
        Parser.prototype.parseIf = function () {
            this.nt.pop();
            this.nt.push("If Statement");
            if (this.match("TIf") && this.parseBoolean() && this.parseBlock()) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseExpr = function () {
            this.nt.push("Expression");
            console.log("do we parse expression?");
            if (this.parseInt() || this.parseString() || this.parseBoolean() || this.parseID()) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseInt = function () {
            this.nt.push("Integer");
            if (this.parseDigit()) {
                if (this.parseIntOp() && this.parseExpr()) {
                    this.cst.endChildren();
                    return true;
                }
                else {
                    this.cst.endChildren();
                    return true;
                }
            }
            return false;
        };
        Parser.prototype.parseString = function () {
            this.nt.push("String");
            if (this.match("TQuote") && this.parseCharList() && this.match("TQuote")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseBoolean = function () {
            this.nt.push("Boolean");
            if (this.parseBoolVal()) {
                this.cst.endChildren();
                return true;
            }
            else if (this.match("TLeftParen") && this.parseExpr() && this.parseBoolOp() && this.parseExpr() && this.match("TRightParen")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseID = function () {
            this.nt.push("ID");
            console.log("Are we getting to parse ID?");
            if (this.match("TID")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseCharList = function () {
            this.nt.push("Character List");
            if (this.parseChar() && this.parseCharList()) {
                this.cst.endChildren();
                return true;
            }
            else if (this.parseSpace() && this.parseCharList()) {
                this.cst.endChildren();
                return true;
            }
            else {
                return true;
            }
        };
        Parser.prototype.parseType = function () {
            this.nt.push("Type");
            console.log("Are we getting to parse type?");
            if (this.match("TInt") || this.match("TString") || this.match("TBoolean")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseChar = function () {
            this.nt.push("Character");
            if (this.match("TChar")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseSpace = function () {
            //this.nt.push("Space");
            if (this.match("TSpace")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseDigit = function () {
            this.nt.push("Digit");
            if (this.match("TDigit")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseBoolOp = function () {
            this.nt.push("Boolean Operation");
            if (this.match("TBoolOp")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseBoolVal = function () {
            this.nt.push("Boolean Value");
            if (this.match("TTrue") || this.match("TFalse")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.parseIntOp = function () {
            this.nt.push("Integer Operation");
            if (this.match("TIntOp")) {
                this.cst.endChildren();
                return true;
            }
            return false;
        };
        Parser.prototype.match = function (expected) {
            if (this.error) {
                return false;
            }
            if (this.tokenList[this.currToken].name == expected) {
                this.log.push("VALID - Expected " + expected + " found " + expected + " at " + this.tokenList[this.currToken].lineNumber);
                for (var i = 0; i < this.nt.length; i++) {
                    this.cst.addNode(this.nt[i], "branch");
                }
                this.cst.addNode(this.tokenList[this.currToken].value, "leaf");
                this.currToken++;
                this.nt = [];
                console.log(this.currToken);
                console.log(this.tokenList);
                return true;
            }
            else {
                return false;
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
