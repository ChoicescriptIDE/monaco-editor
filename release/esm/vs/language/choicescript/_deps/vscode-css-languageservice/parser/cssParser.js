/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { TokenType, Scanner } from './cssScanner.js';
import * as nodes from './cssNodes.js';
import { ParseError } from './cssErrors.js';
import * as languageFacts from '../services/languageFacts.js';
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
    Parser.prototype.parseStylesheet = function (textDocument) {
        var versionId = textDocument.version;
        var textProvider = function (offset, length) {
            if (textDocument.version !== versionId) {
                throw new Error('Underlying model has changed, AST is no longer valid');
            }
            return textDocument.getText().substr(offset, length);
        };
        return this.internalParse(textDocument.getText(), this._parseStylesheet, textProvider);
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
    Parser.prototype._parseStylesheet = function () {
        var node = this.create(nodes.Stylesheet);
        node.addChild(this._parseCharset());
        do {
            var hasMatch = false;
            do {
                hasMatch = false;
                var statement = this._parseStylesheetStatement();
                if (statement) {
                    node.addChild(statement);
                    hasMatch = true;
                }
                else {
                    var line = this._parseTextLine();
                    if (line) {
                        node.addChild(line);
                        hasMatch = true;
                    }
                }
            } while (hasMatch);
            if (this.peek(TokenType.EOF)) {
                break;
            }
            this.consumeToken();
        } while (!this.peek(TokenType.EOF));
        return this.finish(node);
    };
    Parser.prototype._parseStylesheetStatement = function () {
        if (this.peek(TokenType.SingleLineComment)) {
            var node = this.create(nodes.Node);
            this.consumeToken();
            return this.finish(node);
        }
        else if (this.peek(TokenType.Builtin) || this.peek(TokenType.Invalid)) {
            return this._parseCommand();
        }
        return null; // this._parseRuleset(false);
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
    Parser.prototype._parseCommand = function () {
        return this._parseBasicCommand()
            || this._parseInvalid();
    };
    Parser.prototype._parseBasicCommand = function () {
        var node = this.create(nodes.Builtin);
        if (!this.acceptOneKeyword(languageFacts.getBuiltins().map(function (item) { return '*' + item.name; }))) {
            this.markError(node, ParseError.UnknownCommand);
            this.consumeToken();
        }
        return this.finish(node);
    };
    Parser.prototype._parseInvalid = function () {
        var node = this.create(nodes.Builtin);
        this.consumeToken();
        return this.finish(node, ParseError.UnknownCommand);
    };
    Parser.prototype._parseStylesheetAtStatement = function () {
        return this._parseDocument();
    };
    Parser.prototype._tryParseRuleset = function (isNested) {
        var mark = this.mark();
        if (this._parseSelector(isNested)) {
            while (this.accept(TokenType.Comma) && this._parseSelector(isNested)) {
                // loop
            }
            if (this.accept(TokenType.CurlyL)) {
                this.restoreAtMark(mark);
                return this._parseRuleset(isNested);
            }
        }
        this.restoreAtMark(mark);
        return null;
    };
    Parser.prototype._parseRuleset = function (isNested) {
        if (isNested === void 0) { isNested = false; }
        var node = this.create(nodes.RuleSet);
        if (!node.getSelectors().addChild(this._parseSelector(isNested))) {
            return null;
        }
        while (this.accept(TokenType.Comma) && node.getSelectors().addChild(this._parseSelector(isNested))) {
            // loop
        }
        return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
    };
    Parser.prototype._parseRuleSetDeclaration = function () {
        return this._parseAtApply() || this._tryParseCustomPropertyDeclaration() || this._parseDeclaration();
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
            case nodes.NodeType.Ruleset:
            case nodes.NodeType.Namespace:
            case nodes.NodeType.If:
            case nodes.NodeType.For:
            case nodes.NodeType.Each:
            case nodes.NodeType.While:
            case nodes.NodeType.MixinDeclaration:
            case nodes.NodeType.FunctionDeclaration:
                return false;
            case nodes.NodeType.VariableDeclaration:
            case nodes.NodeType.ExtendsReference:
            case nodes.NodeType.MixinContent:
            case nodes.NodeType.ReturnStatement:
            case nodes.NodeType.MediaQuery:
            case nodes.NodeType.Debug:
            case nodes.NodeType.Import:
            case nodes.NodeType.AtApplyRule:
            case nodes.NodeType.CustomPropertyDeclaration:
                return true;
            case nodes.NodeType.MixinReference:
                return !node.getContent();
            case nodes.NodeType.Declaration:
                return !node.getNestedProperties();
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
    Parser.prototype._parseSelector = function (isNested) {
        var node = this.create(nodes.Selector);
        var hasContent = false;
        if (isNested) {
            // nested selectors can start with a combinator
            hasContent = node.addChild(this._parseCombinator());
        }
        while (node.addChild(this._parseSimpleSelector())) {
            hasContent = true;
            node.addChild(this._parseCombinator()); // optional
        }
        return hasContent ? this.finish(node) : null;
    };
    Parser.prototype._parseDeclaration = function (resyncStopTokens) {
        var node = this.create(nodes.Declaration);
        if (!node.setProperty(this._parseProperty())) {
            return null;
        }
        if (!this.accept(TokenType.Colon)) {
            return this.finish(node, ParseError.ColonExpected, [TokenType.Colon], resyncStopTokens);
        }
        node.colonPosition = this.prevToken.offset;
        if (!node.setValue(this._parseExpr())) {
            return this.finish(node, ParseError.PropertyValueExpected);
        }
        node.addChild(this._parsePrio());
        if (this.peek(TokenType.SemiColon)) {
            node.semicolonPosition = this.token.offset; // not part of the declaration, but useful information for code assist
        }
        return this.finish(node);
    };
    Parser.prototype._tryParseCustomPropertyDeclaration = function () {
        if (!this.peekRegExp(TokenType.Ident, /^--/)) {
            return null;
        }
        var node = this.create(nodes.CustomPropertyDeclaration);
        if (!node.setProperty(this._parseProperty())) {
            return null;
        }
        if (!this.accept(TokenType.Colon)) {
            return this.finish(node, ParseError.ColonExpected, [TokenType.Colon]);
        }
        node.colonPosition = this.prevToken.offset;
        var mark = this.mark();
        if (this.peek(TokenType.CurlyL)) {
            // try to parse it as nested declaration
            var propertySet = this.create(nodes.CustomPropertySet);
            var declarations = this._parseDeclarations(this._parseRuleSetDeclaration.bind(this));
            if (propertySet.setDeclarations(declarations) && !declarations.isErroneous(true)) {
                propertySet.addChild(this._parsePrio());
                if (this.peek(TokenType.SemiColon)) {
                    this.finish(propertySet);
                    node.setPropertySet(propertySet);
                    node.semicolonPosition = this.token.offset; // not part of the declaration, but useful information for code assist
                    return this.finish(node);
                }
            }
            this.restoreAtMark(mark);
        }
        // try tp parse as expression
        var expression = this._parseExpr();
        if (expression && !expression.isErroneous(true)) {
            this._parsePrio();
            if (this.peek(TokenType.SemiColon)) {
                node.setValue(expression);
                node.semicolonPosition = this.token.offset; // not part of the declaration, but useful information for code assist
                return this.finish(node);
            }
        }
        this.restoreAtMark(mark);
        node.addChild(this._parseCustomPropertyValue());
        node.addChild(this._parsePrio());
        if (this.token.offset === node.colonPosition + 1) {
            return this.finish(node, ParseError.PropertyValueExpected);
        }
        return this.finish(node);
    };
    /**
     * Parse custom property values.
     *
     * Based on https://www.w3.org/TR/css-variables/#syntax
     *
     * This code is somewhat unusual, as the allowed syntax is incredibly broad,
     * parsing almost any sequence of tokens, save for a small set of exceptions.
     * Unbalanced delimitors, invalid tokens, and declaration
     * terminators like semicolons and !important directives (when not inside
     * of delimitors).
     */
    Parser.prototype._parseCustomPropertyValue = function () {
        var node = this.create(nodes.Node);
        var isTopLevel = function () { return curlyDepth === 0 && parensDepth === 0 && bracketsDepth === 0; };
        var curlyDepth = 0;
        var parensDepth = 0;
        var bracketsDepth = 0;
        done: while (true) {
            switch (this.token.type) {
                case TokenType.SemiColon:
                    // A semicolon only ends things if we're not inside a delimitor.
                    if (isTopLevel()) {
                        break done;
                    }
                    break;
                case TokenType.Exclamation:
                    // An exclamation ends the value if we're not inside delims.
                    if (isTopLevel()) {
                        break done;
                    }
                    break;
                case TokenType.CurlyL:
                    curlyDepth++;
                    break;
                case TokenType.CurlyR:
                    curlyDepth--;
                    if (curlyDepth < 0) {
                        // The property value has been terminated without a semicolon, and
                        // this is the last declaration in the ruleset.
                        if (parensDepth === 0 && bracketsDepth === 0) {
                            break done;
                        }
                        return this.finish(node, ParseError.LeftCurlyExpected);
                    }
                    break;
                case TokenType.ParenthesisL:
                    parensDepth++;
                    break;
                case TokenType.ParenthesisR:
                    parensDepth--;
                    if (parensDepth < 0) {
                        return this.finish(node, ParseError.LeftParenthesisExpected);
                    }
                    break;
                case TokenType.BracketL:
                    bracketsDepth++;
                    break;
                case TokenType.BracketR:
                    bracketsDepth--;
                    if (bracketsDepth < 0) {
                        return this.finish(node, ParseError.LeftSquareBracketExpected);
                    }
                    break;
                case TokenType.BadString: // fall through
                    break done;
                case TokenType.EOF:
                    // We shouldn't have reached the end of input, something is
                    // unterminated.
                    var error = ParseError.RightCurlyExpected;
                    if (bracketsDepth > 0) {
                        error = ParseError.RightSquareBracketExpected;
                    }
                    else if (parensDepth > 0) {
                        error = ParseError.RightParenthesisExpected;
                    }
                    return this.finish(node, error);
            }
            this.consumeToken();
        }
        return this.finish(node);
    };
    Parser.prototype._tryToParseDeclaration = function () {
        var mark = this.mark();
        if (this._parseProperty() && this.accept(TokenType.Colon)) {
            // looks like a declaration, go ahead
            this.restoreAtMark(mark);
            return this._parseDeclaration();
        }
        this.restoreAtMark(mark);
        return null;
    };
    Parser.prototype._parseProperty = function () {
        var node = this.create(nodes.Property);
        var mark = this.mark();
        if (this.acceptDelim('*') || this.acceptDelim('_')) {
            // support for  IE 5.x, 6 and 7 star hack: see http://en.wikipedia.org/wiki/CSS_filter#Star_hack
            if (this.hasWhitespace()) {
                this.restoreAtMark(mark);
                return null;
            }
        }
        if (node.setIdentifier(this._parsePropertyIdentifier())) {
            return this.finish(node);
        }
        return null;
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
        return this._parseBody(node, this._parseStylesheetStatement.bind(this));
    };
    Parser.prototype._parseOperator = function () {
        // these are operators for binary expressions
        if (this.peekDelim('/') ||
            this.peekDelim('*') ||
            this.peekDelim('+') ||
            this.peekDelim('-') ||
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
    Parser.prototype._parseCombinator = function () {
        if (this.peekDelim('>')) {
            var node = this.create(nodes.Node);
            this.consumeToken();
            var mark = this.mark();
            if (!this.hasWhitespace() && this.acceptDelim('>')) {
                if (!this.hasWhitespace() && this.acceptDelim('>')) {
                    node.type = nodes.NodeType.SelectorCombinatorShadowPiercingDescendant;
                    return this.finish(node);
                }
                this.restoreAtMark(mark);
            }
            node.type = nodes.NodeType.SelectorCombinatorParent;
            return this.finish(node);
        }
        else if (this.peekDelim('+')) {
            var node = this.create(nodes.Node);
            this.consumeToken();
            node.type = nodes.NodeType.SelectorCombinatorSibling;
            return this.finish(node);
        }
        else if (this.peekDelim('~')) {
            var node = this.create(nodes.Node);
            this.consumeToken();
            node.type = nodes.NodeType.SelectorCombinatorAllSiblings;
            return this.finish(node);
        }
        else if (this.peekDelim('/')) {
            var node = this.create(nodes.Node);
            this.consumeToken();
            var mark = this.mark();
            if (!this.hasWhitespace() && this.acceptIdent('deep') && !this.hasWhitespace() && this.acceptDelim('/')) {
                node.type = nodes.NodeType.SelectorCombinatorShadowPiercingDescendant;
                return this.finish(node);
            }
            this.restoreAtMark(mark);
        }
        else {
            return null;
        }
    };
    Parser.prototype._parseSimpleSelector = function () {
        // simple_selector
        //  : element_name [ HASH | class | attrib | pseudo ]* | [ HASH | class | attrib | pseudo ]+ ;
        var node = this.create(nodes.SimpleSelector);
        var c = 0;
        if (node.addChild(this._parseElementName())) {
            c++;
        }
        while ((c === 0 || !this.hasWhitespace()) && node.addChild(this._parseSimpleSelectorBody())) {
            c++;
        }
        return c > 0 ? this.finish(node) : null;
    };
    Parser.prototype._parseSimpleSelectorBody = function () {
        return this._parsePseudo() || this._parseHash() || this._parseClass() || this._parseAttrib();
    };
    Parser.prototype._parseSelectorIdent = function () {
        return this._parseIdent();
    };
    Parser.prototype._parseHash = function () {
        if (!this.peek(TokenType.Hash) && !this.peekDelim('#')) {
            return null;
        }
        var node = this.createNode(nodes.NodeType.IdentifierSelector);
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
    Parser.prototype._parseClass = function () {
        // class: '.' IDENT ;
        if (!this.peekDelim('.')) {
            return null;
        }
        var node = this.createNode(nodes.NodeType.ClassSelector);
        this.consumeToken(); // '.'
        if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
            return this.finish(node, ParseError.IdentifierExpected);
        }
        return this.finish(node);
    };
    Parser.prototype._parseElementName = function () {
        // element_name: (ns? '|')? IDENT | '*';
        var pos = this.mark();
        var node = this.createNode(nodes.NodeType.ElementNameSelector);
        node.addChild(this._parseNamespacePrefix());
        if (!node.addChild(this._parseSelectorIdent()) && !this.acceptDelim('*')) {
            this.restoreAtMark(pos);
            return null;
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
    Parser.prototype._parseAttrib = function () {
        // attrib : '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S*   [ IDENT | STRING ] S* ]? ']'
        if (!this.peek(TokenType.BracketL)) {
            return null;
        }
        var node = this.create(nodes.AttributeSelector);
        this.consumeToken(); // BracketL
        // Optional attrib namespace
        node.setNamespacePrefix(this._parseNamespacePrefix());
        if (!node.setIdentifier(this._parseIdent())) {
            return this.finish(node, ParseError.IdentifierExpected);
        }
        if (node.setOperator(this._parseOperator())) {
            node.setValue(this._parseBinaryExpr());
            this.acceptIdent('i'); // case insensitive matching
        }
        if (!this.accept(TokenType.BracketR)) {
            return this.finish(node, ParseError.RightSquareBracketExpected);
        }
        return this.finish(node);
    };
    Parser.prototype._parsePseudo = function () {
        var _this = this;
        // pseudo: ':' [ IDENT | FUNCTION S* [IDENT S*]? ')' ]
        var node = this._tryParsePseudoIdentifier();
        if (node) {
            if (!this.hasWhitespace() && this.accept(TokenType.ParenthesisL)) {
                var tryAsSelector = function () {
                    var selectors = _this.create(nodes.Node);
                    if (!selectors.addChild(_this._parseSelector(false))) {
                        return null;
                    }
                    while (_this.accept(TokenType.Comma) && selectors.addChild(_this._parseSelector(false))) {
                        // loop
                    }
                    if (_this.peek(TokenType.ParenthesisR)) {
                        return _this.finish(selectors);
                    }
                };
                node.addChild(this.try(tryAsSelector) || this._parseBinaryExpr());
                if (!this.accept(TokenType.ParenthesisR)) {
                    return this.finish(node, ParseError.RightParenthesisExpected);
                }
            }
            return this.finish(node);
        }
        return null;
    };
    Parser.prototype._tryParsePseudoIdentifier = function () {
        if (!this.peek(TokenType.Colon)) {
            return null;
        }
        var pos = this.mark();
        var node = this.createNode(nodes.NodeType.PseudoSelector);
        this.consumeToken(); // Colon
        if (this.hasWhitespace()) {
            this.restoreAtMark(pos);
            return null;
        }
        // optional, support ::
        if (this.accept(TokenType.Colon) && this.hasWhitespace()) {
            this.markError(node, ParseError.IdentifierExpected);
        }
        if (!node.addChild(this._parseIdent())) {
            this.markError(node, ParseError.IdentifierExpected);
        }
        return node;
    };
    Parser.prototype._tryParsePrio = function () {
        var mark = this.mark();
        var prio = this._parsePrio();
        if (prio) {
            return prio;
        }
        this.restoreAtMark(mark);
        return null;
    };
    Parser.prototype._parsePrio = function () {
        if (!this.peek(TokenType.Exclamation)) {
            return null;
        }
        var node = this.createNode(nodes.NodeType.Prio);
        if (this.accept(TokenType.Exclamation) && this.acceptIdent('important')) {
            return this.finish(node);
        }
        return null;
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
        if (node.setExpression(this._parseURILiteral()) || // url before function
            node.setExpression(this._parseFunction()) || // function before ident
            node.setExpression(this._parseIdent()) ||
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
    Parser.prototype._parseURILiteral = function () {
        if (!this.peekRegExp(TokenType.Ident, /^url(-prefix)?$/i)) {
            return null;
        }
        var pos = this.mark();
        var node = this.createNode(nodes.NodeType.URILiteral);
        this.accept(TokenType.Ident);
        if (this.hasWhitespace() || !this.peek(TokenType.ParenthesisL)) {
            this.restoreAtMark(pos);
            return null;
        }
        this.scanner.inURL = true;
        this.consumeToken(); // consume ()
        node.addChild(this._parseURLArgument()); // argument is optional
        this.scanner.inURL = false;
        if (!this.accept(TokenType.ParenthesisR)) {
            return this.finish(node, ParseError.RightParenthesisExpected);
        }
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
    Parser.prototype._parseFunction = function () {
        var pos = this.mark();
        var node = this.create(nodes.Function);
        if (!node.setIdentifier(this._parseFunctionIdentifier())) {
            return null;
        }
        if (this.hasWhitespace() || !this.accept(TokenType.ParenthesisL)) {
            this.restoreAtMark(pos);
            return null;
        }
        if (node.getArguments().addChild(this._parseFunctionArgument())) {
            while (this.accept(TokenType.Comma)) {
                if (!node.getArguments().addChild(this._parseFunctionArgument())) {
                    this.markError(node, ParseError.ExpressionExpected);
                }
            }
        }
        if (!this.accept(TokenType.ParenthesisR)) {
            return this.finish(node, ParseError.RightParenthesisExpected);
        }
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