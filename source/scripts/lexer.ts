/* lexer.ts  */

module TSC
	{
	export class Lexer {
		public static lex() {


			// Grab the "raw" source code.
			var sourceCode = (<HTMLInputElement>document.getElementById("taSourceCode")).value;
			// Trim the leading and trailing spaces.
			sourceCode = TSC.Utils.trim(sourceCode);
			// TODO: remove all spaces in the middle; remove line breaks too.

			/*Stuff We'll Need
             *	Arrays and Variables */

			//Token Array
			let tokens = [];
			//Error Array
			let errors = [];
			//Warning Array
			let warnings = [];

			//Current line number
			let line = 1;
			//Current position in current line
			let position = 1;
			//Pointer for start of current thing being analyzed
			let startPoint = 0;
			//Pointer for end
			let endPoint = 1;

			//Lets us know if we're at the end of the program
			let atEOP: boolean = false;
			//status for if we're in a quote, comment, or normal program
			let status = "normal";
			//mode for logging
			let mode = "normal";

			/* Regular Expressions
            *	Contains the RegEx for our grammar */

			//Types

			//Character
			let regChar = new RegExp('[a-z] | ');
			//ID
			let regID = new RegExp(`[a-z]`);
			//Digit
			let regDigit = new RegExp('[0-9]');


			//Symbols

			//EOP
			let regEOP = new RegExp('\$');
			//Left Brace
			let regLeftBrace = new RegExp('{');
			//Right Brace
			let regRightBrace = new RegExp('}');
			//Left Parenthesis
			let regLeftParen = new RegExp('\\x28');
			//Right Parenthesis
			let regRightParen = new RegExp('\\x29');
			//Quote
			let regQuote = new RegExp('"');
			//Assign
			let regAssign = new RegExp('=');
			//Boolop Equal
			let regBoolopEqual = new RegExp('==');
			//Boolop Not Equal
			let regBoolopNotEqual = new RegExp('!=');
			//Comment Start
			let regCommentStart = new RegExp('\/\\*');
			//Comment End
			let regCommentEnd = new RegExp('\\*\/');
			//IntOp
			let regIntOp = new RegExp('\\+');
			//Whitespace
			let regWhitespace = new RegExp(' |\t|\n\r');
			//Newline
			let regNewline = new RegExp('\n');

			//Keywords

			//While
			let regWhile = new RegExp('while');
			//If
			let regIf = new RegExp('if');
			//Print
			let regPrint = new RegExp('print');
			//Int
			let regInt = new RegExp('int');
			//Boolean
			let regBool = new RegExp('boolean');
			//String
			let regStr = new RegExp('string');
			//True
			let regTrue = new RegExp('true');
			//False
			let regFalse = new RegExp('false');
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
							var token: Token = new Token('TChar', sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
							position++;
							//Check for an end quote
						} else if (regQuote.test(sourceCode.charAt(endPoint - 1))) {
							var token: Token = new Token('TQuote', sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
							position++;
							status = "normal"
							//TODO: Make enum for mode and status, also better var names
							mode = "normal";
							//Throw an error if we hit something that's not a character or a quote
						} else {
							console.log("Error: Invalid token in String.");
							let char = sourceCode.charAt(endPoint - 1);
							var error: Error = new Error("InvalidToken", char, line, position);
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
							var token: Token = new Token("TLeftBrace", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Right Brace - }
						else if (regRightBrace.test(sourceCode.substring(startPoint, endPoint))) {
							let token: Token = new Token("TRightBrace", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Left Paren - (
						else if (regLeftParen.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TLeftParen", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Right Paren - )
						else if (regRightParen.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TRightParen", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Quote
						else if (regQuote.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TQuote", sourceCode.charAt(endPoint - 1), line, position);
							status = "string";
							tokens.push(token);
						}
						/*  Keyword time! */
						//TODO Deal with adding tokens that aren't single chars to token item
						//While
						else if (regWhile.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TWhile", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//If
						else if (regIf.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TIf", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Boolean True
						else if (regTrue.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TTrue", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Boolean False
						else if (regFalse.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TFalse", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Print
						else if (regIf.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TPrint", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//"Int"
						else if (regInt.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TInt", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//"String"
						else if (regStr.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TString", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//"Boolean"
						else if (regBool.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TBoolean", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//"Boolean"
						else if (regBool.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TBoolean", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}

						/* End of Keywords */
						//Assign
						else if (regAssign.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TAssign", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//Boolean Equals - This maybe should go first with the same logic as the keyword placement? will run tests.
						else if (regBoolopEqual.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TBooleanEquals", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//intop
						else if (regIntOp.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TIntOp", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//digit
						else if (regDigit.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TDigit", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//ID
						else if (regID.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TID", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//whitespace
						else if (regWhitespace.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TWhiteSpace", sourceCode.charAt(endPoint - 1), line, position);
							tokens.push(token);
						}
						//eop
						else if (regEOP.test(sourceCode.substring(startPoint, endPoint))) {
							var token: Token = new Token("TBooleanEquals", sourceCode.charAt(endPoint - 1), line, position);
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
			}
		}

		//Defining a Token object. Haven't decided if this will stay here.
		export class Token{
			name: String;
			value: String;
			lineNumber: number;
			position: number;

			constructor(name: String, value: String, lineNumber: number, position: number){
				this.name = name;
				this.value = value;
				this.lineNumber = lineNumber;
				this.position = position;
			}
		}


		export class Error{
			name: String;
			value: String;
			lineNumber: number;
			position: number;

			constructor(name: String, value: String, lineNumber: number, position: number){
				this.name = name;
				this.value = value;
				this.lineNumber = lineNumber;
				this.position = position;
			}
		}

		export class Warning{
			name: String;
			value: String;
			lineNumber: number;
			position: number;

			constructor(name: String, value: String, lineNumber: number, position: number){
				this.name = name;
				this.value = value;
				this.lineNumber = lineNumber;
				this.position = position;
			}
		}
	}


