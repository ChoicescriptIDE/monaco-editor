/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { TokenType, Scanner } from './cssScanner.js';
import * as nodes from './cssNodes.js';
import { ParseError } from './cssErrors.js';
import { standardCommandList, flowCommandList } from '../data/commands.js';
/// <summary>
/// A parser for the css core specification. See for reference:
/// https://www.w3.org/TR/CSS21/grammar.html
/// http://www.w3.org/TR/CSS21/syndata.html#tokenization
/// </summary>
var Parser = /** @class */ (function () {
    function Parser(scnr) {
        if (scnr === void 0) { scnr = new Scanner(); }
        this.scanner = scnr;
        this.token = null;
        this.prevToken = null;
    }
    Parser.prototype.peekIdent = function (text) {
        return TokenType.Ident === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
    };
    Parser.prototype.peekKeyword = function (text) {
        return TokenType.AtKeyword === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
    };
    Parser.prototype.peekDelim = function (text) {
        return TokenType.Delim === this.token.type && text === this.token.text;
    };
    Parser.prototype.peek = function (type) {
        return type === this.token.type;
    };
    Parser.prototype.peekRegExp = function (type, regEx) {
        if (type !== this.token.type) {
            return false;
        }
        return regEx.test(this.token.text);
    };
    Parser.prototype.hasWhitespace = function () {
        return this.prevToken && (this.prevToken.offset + this.prevToken.len !== this.token.offset);
    };
    Parser.prototype.consumeToken = function () {
        this.prevToken = this.token;
        this.token = this.scanner.scan();
    };
    Parser.prototype.mark = function () {
        return {
            prev: this.prevToken,
            curr: this.token,
            pos: this.scanner.pos()
        };
    };
    Parser.prototype.restoreAtMark = function (mark) {
        this.prevToken = mark.prev;
        this.token = mark.curr;
        this.scanner.goBackTo(mark.pos);
    };
    Parser.prototype.try = function (func) {
        var pos = this.mark();
        var node = func();
        if (!node) {
            this.restoreAtMark(pos);
            return null;
        }
        return node;
    };
    Parser.prototype.acceptOneKeyword = function (keywords) {
        if (TokenType.Builtin === this.token.type) {
            for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
                var keyword = keywords_1[_i];
                if (keyword.length === this.token.text.length && keyword === this.token.text.toLowerCase()) {
                    this.consumeToken();
                    return true;
                }
            }
        }
        return false;
    };
    Parser.prototype.accept = function (type) {
        if (type === this.token.type) {
            this.consumeToken();
            return true;
        }
        return false;
    };
    Parser.prototype.acceptIdent = function (text) {
        if (this.peekIdent(text)) {
            this.consumeToken();
            return true;
        }
        return false;
    };
    Parser.prototype.acceptKeyword = function (text) {
        if (this.peekKeyword(text)) {
            this.consumeToken();
            return true;
        }
        return false;
    };
    Parser.prototype.acceptDelim = function (text) {
        if (this.peekDelim(text)) {
            this.consumeToken();
            return true;
        }
        return false;
    };
    Parser.prototype.acceptUnquotedString = function () {
        var pos = this.scanner.pos();
        this.scanner.goBackTo(this.token.offset);
        var unquoted = this.scanner.scanUnquotedString();
        if (unquoted) {
            this.token = unquoted;
            this.consumeToken();
            return true;
        }
        this.scanner.goBackTo(pos);
        return false;
    };
    Parser.prototype.resync = function (resyncTokens, resyncStopTokens) {
        while (true) {
            if (resyncTokens && resyncTokens.indexOf(this.token.type) !== -1) {
                this.consumeToken();
                return true;
            }
            else if (resyncStopTokens && resyncStopTokens.indexOf(this.token.type) !== -1) {
                return true;
            }
            else {
                if (this.token.type === TokenType.EOF) {
                    return false;
                }
                this.token = this.scanner.scan();
            }
        }
    };
    Parser.prototype.createNode = function (nodeType) {
        return new nodes.Node(this.token.offset, this.token.len, nodeType);
    };
    Parser.prototype.create = function (ctor) {
        var obj = Object.create(ctor.prototype);
        ctor.apply(obj, [this.token.offset, this.token.len]);
        return obj;
    };
    Parser.prototype.finish = function (node, error, resyncTokens, resyncStopTokens) {
        // parseNumeric misuses error for boolean flagging (however the real error mustn't be a false)
        // + nodelist offsets mustn't be modified, because there is a offset hack in rulesets for smartselection
        if (!(node instanceof nodes.Nodelist)) {
            if (error) {
                this.markError(node, error, resyncTokens, resyncStopTokens);
            }
            // set the node end position
            if (this.prevToken !== null) {
                // length with more elements belonging together
                var prevEnd = this.prevToken.offset + this.prevToken.len;
                node.length = prevEnd > node.offset ? prevEnd - node.offset : 0; // offset is taken from current token, end from previous: Use 0 for empty nodes
            }
        }
        return node;
    };
    Parser.prototype.markError = function (node, error, resyncTokens, resyncStopTokens) {
        if (this.token !== this.lastErrorToken) { // do not report twice on the same token
            node.addIssue(new nodes.Marker(node, error, nodes.Level.Error, null, this.token.offset, this.token.len));
            this.lastErrorToken = this.token;
        }
        if (resyncTokens || resyncStopTokens) {
            this.resync(resyncTokens, resyncStopTokens);
        }
    };
    Parser.prototype.parseScene = function (textDocument) {
        var versionId = textDocument.version;
        var textProvider = function (offset, length) {
            if (textDocument.version !== versionId) {
                throw new Error('Underlying model has changed, AST is no longer valid');
            }
            return textDocument.getText().substr(offset, length);
        };
        return this.internalParse(textDocument.getText(), this._parseScene, textProvider);
    };
    Parser.prototype.internalParse = function (input, parseFunc, textProvider) {
        this.scanner.setSource(input);
        this.token = this.scanner.scan();
        var node = parseFunc.bind(this)();
        if (node) {
            if (textProvider) {
                node.textProvider = textProvider;
            }
            else {
                node.textProvider = function (offset, length) { return input.substr(offset, length); };
            }
        }
        return node;
    };
    Parser.prototype._parseScene = function () {
        var node = this.create(nodes.Scene);
        do {
            var hasMatch = false;
            do {
                hasMatch = false;
                var line = this._parseLine();
                // Hmm...
                if (line) {
                    node.addChild(line);
                    while (!this.accept(TokenType.EOL) && !this.accept(TokenType.EOF)) {
                        this.consumeToken();
                    }
                    hasMatch = true;
                }
            } while (hasMatch);
            if (this.peek(TokenType.EOF)) {
                break;
            }
            this.consumeToken();
        } while (!this.peek(TokenType.EOF));
        return this.finish(node);
    };
    Parser.prototype._parseLine = function () {
        if (this.peek(TokenType.SingleLineComment)) {
            var node = this.create(nodes.Node);
            this.consumeToken();
            return this.finish(node);
        }
        else if (this.peek(TokenType.Builtin) || this.peek(TokenType.Invalid)) {
            return this._parseChoiceScriptStatement();
        }
        else {
            return this._parseTextLine();
        }
    };
    Parser.prototype._parseTextLine = function () {
        var node = this.createNode(nodes.NodeType.TextLine);
        while (this.peek(TokenType.Word)) {
            var noder = this.createNode(nodes.NodeType.RealWord);
            node.addChild(noder);
            this.consumeToken();
            this.finish(noder);
        }
        if (node.hasChildren()) {
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._parseChoiceScriptStatement = function () {
        return this._parseChoiceScriptCommand();
    };
    Parser.prototype._parseChoiceScriptCommand = function () {
        return this._parseChoiceCommand()
            || this._parseFlowCommand()
            || this._parseStandardCommand()
            || this._parseInvalidCommand();
    };
    Parser.prototype._parseFlowCommand = function () {
        var node = this.create(nodes.FlowCommand);
        if (this.acceptOneKeyword(flowCommandList.map(function (cmd) { return '*' + cmd; }))) {
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._parseChoiceOption = function () {
        if (!this.peek(TokenType.Hash) && !this.peekDelim('#')) {
            return null;
        }
        var node = this.create(nodes.ChoiceOption);
        if (this.acceptDelim('#')) {
            return this.finish(node);
        }
        else {
            this.consumeToken(); // TokenType.Hash
            while (!this.peek(TokenType.EOL) && !this.peek(TokenType.EOF)) {
                this.consumeToken();
            }
        }
        return this.finish(node);
    };
    Parser.prototype._parseChoiceCommand = function () {
        var node = this.create(nodes.ChoiceCommand);
        if (this.acceptOneKeyword(["*choice"])) {
            if (this.accept(TokenType.EOL)) {
                while (node.addChild(this._parseChoiceOption())) {
                    this.accept(TokenType.EOL); // EOL
                }
                if (node.hasChildren()) {
                    return this.finish(node);
                }
                else {
                    return this.finish(node, ParseError.NoChoiceOption);
                }
            }
            return this.finish(node, ParseError.NoChoiceOption);
        }
        return null;
    };
    Parser.prototype._parseStandardCommand = function () {
        var node = this.create(nodes.StandardCommand);
        if (this.acceptOneKeyword(standardCommandList.map(function (cmd) { return '*' + cmd; }))) {
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._parseInvalidCommand = function () {
        var node = this.create(nodes.Command);
        this.markError(node, ParseError.UnknownCommand);
        this.consumeToken();
        return this.finish(node);
    };
    Parser.prototype._parseStylesheetAtStatement = function () {
        return this._parseDocument();
    };
    /**
     * Parses declarations like:
     *   @apply --my-theme;
     *
     * Follows https://tabatkins.github.io/specs/css-apply-rule/#using
     */
    Parser.prototype._parseAtApply = function () {
        if (!this.peekKeyword('@apply')) {
            return null;
        }
        var node = this.create(nodes.AtApplyRule);
        this.consumeToken();
        if (!node.setIdentifier(this._parseIdent([nodes.ReferenceType.Variable]))) {
            return this.finish(node, ParseError.IdentifierExpected);
        }
        return this.finish(node);
    };
    Parser.prototype._needsSemicolonAfter = function (node) {
        switch (node.type) {
            case nodes.NodeType.Keyframe:
            case nodes.NodeType.ViewPort:
            case nodes.NodeType.Media:
            case nodes.NodeType.Namespace:
            case nodes.NodeType.If:
            case nodes.NodeType.For:
            case nodes.NodeType.Each:
            case nodes.NodeType.While:
            case nodes.NodeType.FunctionDeclaration:
                return false;
            case nodes.NodeType.VariableDeclaration:
            case nodes.NodeType.MixinContent:
            case nodes.NodeType.ReturnStatement:
            case nodes.NodeType.MediaQuery:
            case nodes.NodeType.Import:
            case nodes.NodeType.AtApplyRule:
            case nodes.NodeType.CustomPropertyDeclaration:
                return true;
        }
        return false;
    };
    Parser.prototype._parseDeclarations = function (parseDeclaration) {
        var node = this.create(nodes.Declarations);
        if (!this.accept(TokenType.CurlyL)) {
            return null;
        }
        var decl = parseDeclaration();
        while (node.addChild(decl)) {
            if (this.peek(TokenType.CurlyR)) {
                break;
            }
            if (this._needsSemicolonAfter(decl) && !this.accept(TokenType.SemiColon)) {
                return this.finish(node, ParseError.SemiColonExpected, [TokenType.SemiColon, TokenType.CurlyR]);
            }
            while (this.accept(TokenType.SemiColon)) {
                // accept empty statements
            }
            decl = parseDeclaration();
        }
        if (!this.accept(TokenType.CurlyR)) {
            return this.finish(node, ParseError.RightCurlyExpected, [TokenType.CurlyR, TokenType.SemiColon]);
        }
        return this.finish(node);
    };
    Parser.prototype._parseBody = function (node, parseDeclaration) {
        if (!node.setDeclarations(this._parseDeclarations(parseDeclaration))) {
            return this.finish(node, ParseError.LeftCurlyExpected, [TokenType.CurlyR, TokenType.SemiColon]);
        }
        return this.finish(node);
    };
    Parser.prototype._parsePropertyIdentifier = function () {
        return this._parseIdent();
    };
    Parser.prototype._parseCharset = function () {
        if (!this.peek(TokenType.Charset)) {
            return null;
        }
        var node = this.create(nodes.Node);
        this.consumeToken(); // charset
        if (!this.accept(TokenType.String)) {
            return this.finish(node, ParseError.IdentifierExpected);
        }
        if (!this.accept(TokenType.SemiColon)) {
            return this.finish(node, ParseError.SemiColonExpected);
        }
        return this.finish(node);
    };
    Parser.prototype._parseDocument = function () {
        // -moz-document is experimental but has been pushed to css4
        if (!this.peekKeyword('@-moz-document')) {
            return null;
        }
        var node = this.create(nodes.Document);
        this.consumeToken(); // @-moz-document
        this.resync([], [TokenType.CurlyL]); // ignore all the rules
        return this._parseBody(node, this._parseScene.bind(this));
    };
    Parser.prototype._parseOperator = function () {
        // these are operators for binary expressions
        if (this.peekDelim('/') ||
            this.peekDelim('*') ||
            this.peekDelim('+') ||
            this.peekDelim('-') ||
            this.peekDelim('%') ||
            this.peekDelim('!') ||
            this.peekDelim('&') ||
            this.peek(TokenType.Dashmatch) ||
            this.peek(TokenType.Includes) ||
            this.peek(TokenType.SubstringOperator) ||
            this.peek(TokenType.PrefixOperator) ||
            this.peek(TokenType.SuffixOperator) ||
            this.peekDelim('=')) { // doesn't stick to the standard here
            var node = this.createNode(nodes.NodeType.Operator);
            this.consumeToken();
            return this.finish(node);
        }
        else {
            return null;
        }
    };
    Parser.prototype._parseUnaryOperator = function () {
        if (!this.peekDelim('+') && !this.peekDelim('-')) {
            return null;
        }
        var node = this.create(nodes.Node);
        this.consumeToken();
        return this.finish(node);
    };
    Parser.prototype._parseSelectorIdent = function () {
        return this._parseIdent();
    };
    Parser.prototype._parseHash = function () {
        if (!this.peek(TokenType.Hash) && !this.peekDelim('#')) {
            return null;
        }
        var node = this.createNode(nodes.NodeType.ChoiceOption);
        if (this.acceptDelim('#')) {
            if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
                return this.finish(node, ParseError.IdentifierExpected);
            }
        }
        else {
            this.consumeToken(); // TokenType.Hash
        }
        return this.finish(node);
    };
    Parser.prototype._parseNamespacePrefix = function () {
        var pos = this.mark();
        var node = this.createNode(nodes.NodeType.NamespacePrefix);
        if (!node.addChild(this._parseIdent()) && !this.acceptDelim('*')) {
            // ns is optional
        }
        if (!this.acceptDelim('|')) {
            this.restoreAtMark(pos);
            return null;
        }
        return this.finish(node);
    };
    Parser.prototype._parseExpr = function (stopOnComma) {
        if (stopOnComma === void 0) { stopOnComma = false; }
        var node = this.create(nodes.Expression);
        if (!node.addChild(this._parseBinaryExpr())) {
            return null;
        }
        while (true) {
            if (this.peek(TokenType.Comma)) { // optional
                if (stopOnComma) {
                    return this.finish(node);
                }
                this.consumeToken();
            }
            if (!node.addChild(this._parseBinaryExpr())) {
                break;
            }
        }
        return this.finish(node);
    };
    Parser.prototype._parseNamedLine = function () {
        // https://www.w3.org/TR/css-grid-1/#named-lines
        if (!this.peek(TokenType.BracketL)) {
            return null;
        }
        var node = this.createNode(nodes.NodeType.GridLine);
        this.consumeToken();
        while (node.addChild(this._parseIdent())) {
            // repeat
        }
        if (!this.accept(TokenType.BracketR)) {
            return this.finish(node, ParseError.RightSquareBracketExpected);
        }
        return this.finish(node);
    };
    Parser.prototype._parseBinaryExpr = function (preparsedLeft, preparsedOper) {
        var node = this.create(nodes.BinaryExpression);
        if (!node.setLeft((preparsedLeft || this._parseTerm()))) {
            return null;
        }
        if (!node.setOperator(preparsedOper || this._parseOperator())) {
            return this.finish(node);
        }
        if (!node.setRight(this._parseTerm())) {
            return this.finish(node, ParseError.TermExpected);
        }
        // things needed for multiple binary expressions
        node = this.finish(node);
        var operator = this._parseOperator();
        if (operator) {
            node = this._parseBinaryExpr(node, operator);
        }
        return this.finish(node);
    };
    Parser.prototype._parseTerm = function () {
        var node = this.create(nodes.Term);
        node.setOperator(this._parseUnaryOperator()); // optional
        if (node.setExpression(this._parseIdent()) ||
            node.setExpression(this._parseStringLiteral()) ||
            node.setExpression(this._parseNumeric()) ||
            node.setExpression(this._parseHexColor()) ||
            node.setExpression(this._parseOperation()) ||
            node.setExpression(this._parseNamedLine())) {
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._parseOperation = function () {
        if (!this.peek(TokenType.ParenthesisL)) {
            return null;
        }
        var node = this.create(nodes.Node);
        this.consumeToken(); // ParenthesisL
        node.addChild(this._parseExpr());
        if (!this.accept(TokenType.ParenthesisR)) {
            return this.finish(node, ParseError.RightParenthesisExpected);
        }
        return this.finish(node);
    };
    Parser.prototype._parseNumeric = function () {
        if (this.peek(TokenType.Num) ||
            this.peek(TokenType.Percentage) ||
            this.peek(TokenType.Resolution) ||
            this.peek(TokenType.Length) ||
            this.peek(TokenType.EMS) ||
            this.peek(TokenType.EXS) ||
            this.peek(TokenType.Angle) ||
            this.peek(TokenType.Time) ||
            this.peek(TokenType.Dimension) ||
            this.peek(TokenType.Freq)) {
            var node = this.create(nodes.NumericValue);
            this.consumeToken();
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._parseStringLiteral = function () {
        if (!this.peek(TokenType.String) && !this.peek(TokenType.BadString)) {
            return null;
        }
        var node = this.createNode(nodes.NodeType.StringLiteral);
        this.consumeToken();
        return this.finish(node);
    };
    Parser.prototype._parseURLArgument = function () {
        var node = this.create(nodes.Node);
        if (!this.accept(TokenType.String) && !this.accept(TokenType.BadString) && !this.acceptUnquotedString()) {
            return null;
        }
        return this.finish(node);
    };
    Parser.prototype._parseIdent = function (referenceTypes) {
        if (!this.peek(TokenType.Ident)) {
            return null;
        }
        var node = this.create(nodes.Identifier);
        if (referenceTypes) {
            node.referenceTypes = referenceTypes;
        }
        node.isCustomProperty = this.peekRegExp(TokenType.Ident, /^--/);
        this.consumeToken();
        return this.finish(node);
    };
    Parser.prototype._parseFunctionIdentifier = function () {
        if (!this.peek(TokenType.Ident)) {
            return null;
        }
        var node = this.create(nodes.Identifier);
        node.referenceTypes = [nodes.ReferenceType.Function];
        if (this.acceptIdent('progid')) {
            // support for IE7 specific filters: 'progid:DXImageTransform.Microsoft.MotionBlur(strength=13, direction=310)'
            if (this.accept(TokenType.Colon)) {
                while (this.accept(TokenType.Ident) && this.acceptDelim('.')) {
                    // loop
                }
            }
            return this.finish(node);
        }
        this.consumeToken();
        return this.finish(node);
    };
    Parser.prototype._parseFunctionArgument = function () {
        var node = this.create(nodes.FunctionArgument);
        if (node.setValue(this._parseExpr(true))) {
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._parseHexColor = function () {
        if (this.peekRegExp(TokenType.Hash, /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/g)) {
            var node = this.create(nodes.HexColorValue);
            this.consumeToken();
            return this.finish(node);
        }
        else {
            return null;
        }
    };
    return Parser;
}());
export { Parser };
//# sourceMappingURL=cssParser.js.map