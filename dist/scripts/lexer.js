/* lexer.ts  */
var TSC;
(function (TSC) {
    var Lexer = /** @class */ (function () {
        function Lexer() {
        }
        Lexer.lex = function (progNumber, remain, lastError) {
            // Grab the "raw" source code.
            var sourceCode = remain;
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
            var position = 0;
            //Pointer for start of current thing being analyzed
            var startPoint = 0;
            //Pointer for end
            var endPoint = 1;
            //Quote Position
            var quotePosition = 0;
            //Quote Line
            var quoteLine = 0;
            //Comment Position
            var commentPosition = 0;
            //Comment Line
            var commentLine = 0;
            //Booleans
            var quote = false;
            var comment = false;
            var remainder = "";
            //Lets us know if we're at the end of the program
            var atEOP = false;
            //Track if we've found $
            var foundEOP = false;
            /* Regular Expressions
            *	Contains the RegEx for our grammar */
            //Types
            //Character
            var regChar = new RegExp('[a-z]$');
            //ID
            var regID = new RegExp('[a-z]$');
            //Digit
            var regDigit = new RegExp('[0-9]$');
            //Symbols
            //EOP
            var regEOP = new RegExp('\\$$');
            //Left Brace
            var regLeftBrace = new RegExp('{$');
            //Right Brace
            var regRightBrace = new RegExp('}$');
            //Left Parenthesis
            var regLeftParen = new RegExp('\\x28$');
            //Right Parenthesis
            var regRightParen = new RegExp('\\x29$');
            //Quote
            var regQuote = new RegExp('"$');
            //Assign
            var regAssign = new RegExp('=$');
            //Boolop Equal
            var regBoolopEqual = new RegExp('==$');
            //Boolop Not Equal
            var regBoolopNotEqual = new RegExp('!=$');
            //Comment Start
            var regCommentStart = new RegExp('\/\\*$');
            //Comment End
            var regCommentEnd = new RegExp('\\*\/$');
            //IntOp
            var regIntOp = new RegExp('\\+$');
            //Whitespace
            var regWhitespace = new RegExp(' $|\n$|\r$');
            //Newline
            var regNewline = new RegExp('\n$');
            //Single Space
            var regSpace = new RegExp(' $');
            //Keywords
            //While
            var regWhile = new RegExp('while$');
            //If
            var regIf = new RegExp('if$');
            //Print
            var regPrint = new RegExp('print$');
            //Int
            var regInt = new RegExp('int$');
            //Boolean
            var regBool = new RegExp('boolean$');
            //String
            var regStr = new RegExp('string$');
            //True
            var regTrue = new RegExp('true$');
            //False
            var regFalse = new RegExp('false$');
            var k = 0;
            //Iterating through the source code
            while (endPoint <= sourceCode.length && atEOP == false) {
                atEOP = false;
                //TODO figure out if I can reduce this regex stuff because eww
                if (comment != false) {
                    if (regNewline.test(sourceCode.substring(startPoint, endPoint))) {
                        line++;
                        position = 0;
                    }
                    if (regCommentEnd.test(sourceCode.substring(startPoint, endPoint))) {
                        comment = false;
                    }
                    endPoint++;
                    console.log("comment");
                    continue;
                }
                if (quote != false) {
                    //Check for Character
                    if (regChar.test(sourceCode.charAt(endPoint - 1))) {
                        var token = new Token('TChar', sourceCode.charAt(endPoint - 1), line, position);
                        tokens.push(token);
                        position++;
                    }
                    else if (regSpace.test(sourceCode.charAt((endPoint - 1)))) {
                        var token = new Token("TSpace", sourceCode.charAt(endPoint - 1), line, position);
                        tokens.push(token);
                        position++;
                    }
                    else if (regQuote.test(sourceCode.charAt(endPoint - 1))) {
                        var token = new Token('TQuote', sourceCode.charAt(endPoint - 1), line, position);
                        tokens.push(token);
                        position++;
                        quote = false;
                        //Throw an error if we hit something that's not a character or a quote
                    }
                    else {
                        if (lastError) {
                            endPoint++;
                            continue;
                        }
                        console.log("Error: Invalid token in String.");
                        var error = new Error("InvalidToken", sourceCode.charAt(endPoint - 1), line, position);
                        errors.push(error);
                        quote = false;
                        break;
                    }
                    endPoint++;
                    console.log("string");
                    continue;
                }
                //Figure out what order to look for this stuff
                //Left Brace - {
                if (regLeftBrace.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TLeftBrace", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regRightBrace.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TRightBrace", '}', line, position);
                    tokens.push(token);
                }
                else if (regLeftParen.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TLeftParen", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regRightParen.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TRightParen", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regQuote.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TQuote", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                    quote = true;
                    quoteLine = line;
                    quotePosition = position;
                }
                else if (regWhile.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TWhile", "while", line, position - 3);
                    var sliced = tokens.slice(0, tokens.length - 4);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regIf.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TIf", "if", line, position - 1);
                    var sliced = tokens.slice(0, tokens.length - 1);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regTrue.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TTrue", "true", line, position - 3);
                    var sliced = tokens.slice(0, tokens.length - 3);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regFalse.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TFalse", "false", line, position - 4);
                    var sliced = tokens.slice(0, tokens.length - 4);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regPrint.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TPrint", "print", line, position - 4);
                    var sliced = tokens.slice(0, tokens.length - 4);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regInt.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TInt", "int", line, position - 2);
                    var sliced = tokens.slice(0, tokens.length - 2);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regStr.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TString", "string", line, position - 5);
                    var sliced = tokens.slice(0, tokens.length - 5);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regBool.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TBoolean", "boolean", line, position - 6);
                    var sliced = tokens.slice(0, tokens.length - 6);
                    tokens = sliced;
                    tokens.push(token);
                }
                else if (regBoolopEqual.test(sourceCode.substring(startPoint, endPoint))) {
                    if (tokens[tokens.length - 1].name == "TAssign") {
                        var token = new Token("TBooleanEquals", "==", line, position);
                        tokens.pop();
                        tokens.push(token);
                    }
                    else {
                        var token = new Token("TAssign", sourceCode.charAt(endPoint - 1), line, position);
                        tokens.push(token);
                    }
                }
                else if (regAssign.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TAssign", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regIntOp.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TIntOp", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regDigit.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TDigit", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regID.test(sourceCode.substring(startPoint, endPoint))) {
                    var token = new Token("TID", sourceCode.charAt(endPoint - 1), line, position);
                    tokens.push(token);
                }
                else if (regWhitespace.test(sourceCode.substring(startPoint, endPoint))) {
                    if (regNewline.test(sourceCode.substring(startPoint, endPoint))) {
                        line++;
                        position = -1;
                    }
                    //startPoint = endPoint;
                }
                else if (regEOP.test(sourceCode.substring(startPoint, endPoint))) {
                    //If the last program we dealt with had an error, ignore the EOP
                    if (lastError) {
                        //endPoint++;
                        //position++;
                        //Done dealing with error from last program, next EOP belongs to current
                        lastError = false;
                    }
                    else {
                        var token = new Token("TEOP", sourceCode.charAt(endPoint - 1), line, position);
                        tokens.push(token);
                        startPoint = endPoint;
                        atEOP = true;
                        foundEOP = true;
                    }
                }
                else {
                    if (endPoint >= sourceCode.length) {
                        atEOP = true;
                        if (regCommentStart.test(sourceCode.substring(startPoint, endPoint + 1))) {
                            var error = new Error("MissingCommentEnd", "*/", commentLine, commentPosition);
                            errors.push(error);
                            break;
                        }
                        else {
                            var error = new Error("InvalidToken", sourceCode.charAt(endPoint - 1), line, position);
                            errors.push(error);
                            console.log("or this one?");
                            break;
                        }
                    }
                    endPoint++;
                    if (regBoolopNotEqual.test(sourceCode.substring(startPoint, endPoint))) {
                        var token = new Token("TBooleanNotEquals", "!=", line, position);
                        tokens.push(token);
                    }
                    else if (regCommentStart.test(sourceCode.substring(startPoint, endPoint))) {
                        comment = true;
                        commentLine = line;
                        commentPosition = position;
                        continue;
                    }
                    else {
                        var error = new Error("InvalidToken", sourceCode.charAt(endPoint - 2), line, position);
                        errors.push(error);
                        console.log("this one?");
                        break;
                    }
                }
                endPoint++;
                position++;
            }
            atEOP = true;
            if (errors.length == 0) {
                if (quote) {
                    var error = new Error("MissingEndQuote", '"', quoteLine, quotePosition);
                    errors.push(error);
                }
                else if (comment) {
                    var error = new Error("MissingCommentEnd", "*/", commentLine, commentPosition);
                    errors.push(error);
                }
                else if (!foundEOP && errors.length == 0) {
                    var warning = new Warning("MissingEOP", "$", line, position);
                    warnings.push(warning);
                    //console.log("WARNING");
                    //console.log(warnings);
                }
            }
            remainder = sourceCode.substring(endPoint + 1, sourceCode.length);
            //return results
            var lexResults = new LexResults(tokens, errors, warnings, atEOP, remainder);
            //console.log(lexResults.tokens);
            //console.log(lexResults.errors);
            return lexResults;
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
    var LexResults = /** @class */ (function () {
        function LexResults(tokens, errors, warnings, atEnd, remainder) {
            this.tokens = tokens;
            this.errors = errors;
            this.warnings = warnings;
            this.atEnd = atEnd;
            this.remainder = remainder;
        }
        return LexResults;
    }());
    TSC.LexResults = LexResults;
})(TSC || (TSC = {}));
