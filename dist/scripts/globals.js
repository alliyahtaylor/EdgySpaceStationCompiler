/*
var onDocumentLoad = function() {
    TSOS.Control.hostInit();
};
*/
var _Lexer = TSC.Lexer;
var _Parser = TSC.Parser;
var _Analyzer = TSC.semanticAnalyzer;
var _CodeGen = TSC.codeGen;
// Global variables
var tokens = "";
var tokenIndex = 0;
var currentToken = "";
var errorCount = 0;
var EOF = "$";
