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
            //Current position in current line
            var position = 1;
            //Pointer for start of current thing being analyzed
            var startPoint = 0;
            //Pointer for end
            var endPoint = 1;
            //Lets us know if we're at the end of the program
            var atEOP = false;
            //status for if we're in a quote, comment, or normal program
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
            var regLeftParen = new RegExp('\\x28');
            //Right Parenthesis
            var regRightParen = new RegExp('\\x29');
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
            var regWhitespace = new RegExp(' |\t|\n\r');
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
            console.log("test");
            //Iterating through the source code
            while (endPoint <= sourceCode.length) {
                var i = 0;
                console.log("where" + i);
                i++;
                atEOP = false;
                //TODO figure out if I can reduce this regex stuff because eww
                switch (status) {
                    case "comment": {
                        if (regNewline.test(sourceCode.substring(startPoint, endPoint))) {
                            //I don't actually know how verbose works but I'm gonna check
                            if (mode = "verbose") {
                                console.log("NEWLINE");
                            }
                            line++;
                            position = 0;
                        }
                        if (regCommentEnd.test(sourceCode.substring(startPoint, endPoint))) {
                            status = "normal";
                        }
                        endPoint++;
                        console.log("comment");
                        continue;
                    }
                    case "string": {
                        //Check for Character
                        if (regChar.test(sourceCode.charAt(endPoint - 1))) {
                            var token = new Token('TChar', sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                            position++;
                            //Check for an end quote
                        }
                        else if (regQuote.test(sourceCode.charAt(endPoint - 1))) {
                            var token = new Token('TQuote', sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                            position++;
                            status = "normal";
                            //TODO: Make enum for mode and status, also better var names
                            mode = "normal";
                            //Throw an error if we hit something that's not a character or a quote
                        }
                        else {
                            console.log("Error: Invalid token in String.");
                            var char = sourceCode.charAt(endPoint - 1);
                            var error = new Error("InvalidToken", char, line, position);
                            errors.push(error);
                            break;
                        }
                        endPoint++;
                        console.log("string");
                        continue;
                    }
                    case "normal": {
                        //Figure out what order to look for this stuff
                        //Left Brace - {
                        if (regLeftBrace.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TLeftBrace", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Right Brace - }
                        else if (regRightBrace.test(sourceCode.substring(startPoint, endPoint))) {
                            var token_1 = new Token("TRightBrace", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token_1);
                        }
                        //Left Paren - (
                        else if (regLeftParen.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TLeftParen", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Right Paren - )
                        else if (regRightParen.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TRightParen", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Quote
                        else if (regQuote.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TQuote", sourceCode.charAt(endPoint - 1), line, position);
                            status = "string";
                            tokens.push(token);
                        }
                        /*  Keyword time! */
                        //TODO Deal with adding tokens that aren't single chars to token item
                        //While
                        else if (regWhile.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TWhile", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //If
                        else if (regIf.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TIf", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Boolean True
                        else if (regTrue.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TTrue", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Boolean False
                        else if (regFalse.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TFalse", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Print
                        else if (regIf.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TPrint", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //"Int"
                        else if (regInt.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TInt", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //"String"
                        else if (regStr.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TString", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //"Boolean"
                        else if (regBool.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TBoolean", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //"Boolean"
                        else if (regBool.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TBoolean", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        /* End of Keywords */
                        //Assign
                        else if (regAssign.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TAssign", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //Boolean Equals - This maybe should go first with the same logic as the keyword placement? will run tests.
                        else if (regBoolopEqual.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TBooleanEquals", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //intop
                        else if (regIntOp.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TIntOp", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //digit
                        else if (regDigit.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TDigit", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //ID
                        else if (regID.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TID", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //whitespace
                        else if (regWhitespace.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TWhiteSpace", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //eop
                        else if (regEOP.test(sourceCode.substring(startPoint, endPoint))) {
                            var token = new Token("TBooleanEquals", sourceCode.charAt(endPoint - 1), line, position);
                            tokens.push(token);
                        }
                        //errors
                        else {
                            //this is just testing, please ignore
                            console.log("error");
                        }
                        endPoint++;
                        position++;
                        console.log("normal");
                        console.log(tokens);
                        continue;
                    }
                }
            }
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
