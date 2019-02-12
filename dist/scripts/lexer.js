/* lexer.ts  */
var TSC;
(function (TSC) {
    var Lexer = /** @class */ (function () {
        function Lexer() {
        }
        Lexer.lex = function () {
            // Grab the "raw" source code.
            var sourceCode = document.getElementById("taSourceCode").value;
            // Trim the leading and trailing spaces.
            sourceCode = TSC.Utils.trim(sourceCode);
            // TODO: remove all spaces in the middle; remove line breaks too.
            /*Stuff We'll Need
             *	Arrays and Variables */
            //Token Array
            var tokens = [];
            //Error Array
            var errors = [];
            //Warning Array
            var warnings = [];
            //Current line number
            var line = 1;
            //Current position in (on???) current line
            var position = 1;
            //Pointer for start of current thing being analyzed
            var startPoint = 0;
            //Pointer for end of ^
            var endPoint = 1;
            //Lets us know if we're at the end of the program
            var atEOP = false;
            //status for lexing - Lets us know if we're inside a comment, quote, or in a normal state
            var status = "normal";
            //mode for logging
            var mode = "normal";
            /* Regular Expressions
            *	Contains the RegEx for our grammar */
            //Types
            //Character
            var regChar = new RegExp('[a-z] | ');
            //ID
            var regID = new RegExp("[a-z]");
            //Digit
            var regDigit = new RegExp('[0-9]');
            //Symbols
            //EOP
            var regEOP = new RegExp('\$');
            //Left Brace
            var regLeftBrace = new RegExp('{');
            //Right Brace
            var regRightBrace = new RegExp('}');
            //Left Parenthesis
            var regLeftParen = new RegExp('\\(');
            //Right Parenthesis
            var regRightParen = new RegExp('\\)');
            //Quote
            var regQuote = new RegExp('"');
            //Assign
            var regAssign = new RegExp('=');
            //Boolop Equal
            var regBoolopEqual = new RegExp('==');
            //Boolop Not Equal
            var regBoolopNotEqual = new RegExp('!=');
            //Comment Start
            var regCommentStart = new RegExp('\/\\*');
            //Comment End
            var regCommentEnd = new RegExp('\\*\/');
            //IntOp
            var regIntOp = new RegExp('\\+');
            //Whitespace
            var regWhitespace = new RegExp('$|\t$|\n$\r$');
            //Newline
            var regNewline = new RegExp('\n');
            //Keywords
            //While
            var regWhile = new RegExp('while');
            //If
            var regIf = new RegExp('if');
            //Print
            var regPrint = new RegExp('print');
            //Int
            var regInt = new RegExp('int');
            //Boolean
            var regBool = new RegExp('boolean');
            //String
            var regStr = new RegExp('string');
            //True
            var regTrue = new RegExp('true');
            //False
            var regFalse = new RegExp('false');
            // TODO: CHANGE THIS RETURN STATEMENT
            //leaving for now so intellij doesn't yell at me. I don't like that.
            return sourceCode;
        };
        return Lexer;
    }());
    TSC.Lexer = Lexer;
    //Defining a Token object. Haven't decided if this will stay here.
    var Token = /** @class */ (function () {
        function Token(name, value, lineNumber, position) {
            this.name = name;
            this.value = value;
            this.lineNumber = lineNumber;
            this.position = position;
        }
        return Token;
    }());
    TSC.Token = Token;
    var Error = /** @class */ (function () {
        function Error(name, value, lineNumber, position) {
            this.name = name;
            this.value = value;
            this.lineNumber = lineNumber;
            this.position = position;
        }
        return Error;
    }());
    TSC.Error = Error;
    var Warning = /** @class */ (function () {
        function Warning(name, value, lineNumber, position) {
            this.name = name;
            this.value = value;
            this.lineNumber = lineNumber;
            this.position = position;
        }
        return Warning;
    }());
    TSC.Warning = Warning;
})(TSC || (TSC = {}));
