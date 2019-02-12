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
			//Current position in (on???) current line
			let position = 1;
			//Pointer for start of current thing being analyzed
			let startPoint = 0;
			//Pointer for end of ^
			let endPoint = 1;


			//Lets us know if we're at the end of the program
			let atEOP: boolean = false;
			//status for lexing - Lets us know if we're inside a comment, quote, or in a normal state
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
			let regLeftParen = new RegExp('\\(');
			//Right Parenthesis
			let regRightParen = new RegExp('\\)');
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
			let regWhitespace = new RegExp('$|\t$|\n$\r$');
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


