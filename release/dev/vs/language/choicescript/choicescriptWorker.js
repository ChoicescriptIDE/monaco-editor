(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/parser/cssScanner',["require", "exports"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["Ident"] = 0] = "Ident";
        TokenType[TokenType["AtKeyword"] = 1] = "AtKeyword";
        TokenType[TokenType["String"] = 2] = "String";
        TokenType[TokenType["BadString"] = 3] = "BadString";
        TokenType[TokenType["UnquotedString"] = 4] = "UnquotedString";
        TokenType[TokenType["Hash"] = 5] = "Hash";
        TokenType[TokenType["Num"] = 6] = "Num";
        TokenType[TokenType["Percentage"] = 7] = "Percentage";
        TokenType[TokenType["Dimension"] = 8] = "Dimension";
        TokenType[TokenType["UnicodeRange"] = 9] = "UnicodeRange";
        TokenType[TokenType["CDO"] = 10] = "CDO";
        TokenType[TokenType["CDC"] = 11] = "CDC";
        TokenType[TokenType["Colon"] = 12] = "Colon";
        TokenType[TokenType["SemiColon"] = 13] = "SemiColon";
        TokenType[TokenType["CurlyL"] = 14] = "CurlyL";
        TokenType[TokenType["CurlyR"] = 15] = "CurlyR";
        TokenType[TokenType["ParenthesisL"] = 16] = "ParenthesisL";
        TokenType[TokenType["ParenthesisR"] = 17] = "ParenthesisR";
        TokenType[TokenType["BracketL"] = 18] = "BracketL";
        TokenType[TokenType["BracketR"] = 19] = "BracketR";
        TokenType[TokenType["Whitespace"] = 20] = "Whitespace";
        TokenType[TokenType["Includes"] = 21] = "Includes";
        TokenType[TokenType["Dashmatch"] = 22] = "Dashmatch";
        TokenType[TokenType["SubstringOperator"] = 23] = "SubstringOperator";
        TokenType[TokenType["PrefixOperator"] = 24] = "PrefixOperator";
        TokenType[TokenType["SuffixOperator"] = 25] = "SuffixOperator";
        TokenType[TokenType["Delim"] = 26] = "Delim";
        TokenType[TokenType["EMS"] = 27] = "EMS";
        TokenType[TokenType["EXS"] = 28] = "EXS";
        TokenType[TokenType["Length"] = 29] = "Length";
        TokenType[TokenType["Angle"] = 30] = "Angle";
        TokenType[TokenType["Time"] = 31] = "Time";
        TokenType[TokenType["Freq"] = 32] = "Freq";
        TokenType[TokenType["Exclamation"] = 33] = "Exclamation";
        TokenType[TokenType["Resolution"] = 34] = "Resolution";
        TokenType[TokenType["Comma"] = 35] = "Comma";
        TokenType[TokenType["Charset"] = 36] = "Charset";
        TokenType[TokenType["EscapedJavaScript"] = 37] = "EscapedJavaScript";
        TokenType[TokenType["BadEscapedJavaScript"] = 38] = "BadEscapedJavaScript";
        TokenType[TokenType["Comment"] = 39] = "Comment";
        TokenType[TokenType["SingleLineComment"] = 40] = "SingleLineComment";
        TokenType[TokenType["EOF"] = 41] = "EOF";
        TokenType[TokenType["EOL"] = 42] = "EOL";
        TokenType[TokenType["CustomToken"] = 43] = "CustomToken";
        TokenType[TokenType["Builtin"] = 44] = "Builtin";
        TokenType[TokenType["Invalid"] = 45] = "Invalid";
        TokenType[TokenType["Word"] = 46] = "Word";
    })(TokenType = exports.TokenType || (exports.TokenType = {}));
    var MultiLineStream = /** @class */ (function () {
        function MultiLineStream(source) {
            this.source = source;
            this.len = source.length;
            this.position = 0;
        }
        MultiLineStream.prototype.substring = function (from, to) {
            if (to === void 0) { to = this.position; }
            return this.source.substring(from, to);
        };
        MultiLineStream.prototype.eos = function () {
            return this.len <= this.position;
        };
        MultiLineStream.prototype.pos = function () {
            return this.position;
        };
        MultiLineStream.prototype.goBackTo = function (pos) {
            this.position = pos;
        };
        MultiLineStream.prototype.goBack = function (n) {
            this.position -= n;
        };
        MultiLineStream.prototype.advance = function (n) {
            this.position += n;
        };
        MultiLineStream.prototype.nextChar = function () {
            return this.source.charCodeAt(this.position++) || 0;
        };
        MultiLineStream.prototype.peekChar = function (n) {
            if (n === void 0) { n = 0; }
            return this.source.charCodeAt(this.position + n) || 0;
        };
        MultiLineStream.prototype.lookbackChar = function (n) {
            if (n === void 0) { n = 0; }
            return this.source.charCodeAt(this.position - n) || 0;
        };
        MultiLineStream.prototype.advanceIfChar = function (ch) {
            if (ch === this.source.charCodeAt(this.position)) {
                this.position++;
                return true;
            }
            return false;
        };
        MultiLineStream.prototype.advanceIfChars = function (ch) {
            var i;
            if (this.position + ch.length > this.source.length) {
                return false;
            }
            for (i = 0; i < ch.length; i++) {
                if (this.source.charCodeAt(this.position + i) !== ch[i]) {
                    return false;
                }
            }
            this.advance(i);
            return true;
        };
        MultiLineStream.prototype.advanceWhileChar = function (condition) {
            var posNow = this.position;
            while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
                this.position++;
            }
            return this.position - posNow;
        };
        return MultiLineStream;
    }());
    exports.MultiLineStream = MultiLineStream;
    var _a = 'a'.charCodeAt(0);
    var _c = 'c'.charCodeAt(0);
    var _e = 'e'.charCodeAt(0);
    var _f = 'f'.charCodeAt(0);
    var _m = 'm'.charCodeAt(0);
    var _n = 'n'.charCodeAt(0);
    var _o = 'o'.charCodeAt(0);
    var _t = 't'.charCodeAt(0);
    var _z = 'z'.charCodeAt(0);
    var _A = 'A'.charCodeAt(0);
    var _F = 'F'.charCodeAt(0);
    var _Z = 'Z'.charCodeAt(0);
    var _0 = '0'.charCodeAt(0);
    var _9 = '9'.charCodeAt(0);
    var _TLD = '~'.charCodeAt(0);
    var _HAT = '^'.charCodeAt(0);
    var _EQS = '='.charCodeAt(0);
    var _PIP = '|'.charCodeAt(0);
    var _MIN = '-'.charCodeAt(0);
    var _USC = '_'.charCodeAt(0);
    var _PRC = '%'.charCodeAt(0);
    var _MUL = '*'.charCodeAt(0);
    var _LPA = '('.charCodeAt(0);
    var _RPA = ')'.charCodeAt(0);
    var _LAN = '<'.charCodeAt(0);
    var _RAN = '>'.charCodeAt(0);
    var _ATS = '@'.charCodeAt(0);
    var _HSH = '#'.charCodeAt(0);
    var _DLR = '$'.charCodeAt(0);
    var _BSL = '\\'.charCodeAt(0);
    var _FSL = '/'.charCodeAt(0);
    var _NWL = '\n'.charCodeAt(0);
    var _CAR = '\r'.charCodeAt(0);
    var _LFD = '\f'.charCodeAt(0);
    var _DQO = '"'.charCodeAt(0);
    var _SQO = '\''.charCodeAt(0);
    var _WSP = ' '.charCodeAt(0);
    var _TAB = '\t'.charCodeAt(0);
    var _SEM = ';'.charCodeAt(0);
    var _COL = ':'.charCodeAt(0);
    var _CUL = '{'.charCodeAt(0);
    var _CUR = '}'.charCodeAt(0);
    var _BRL = '['.charCodeAt(0);
    var _BRR = ']'.charCodeAt(0);
    var _CMA = ','.charCodeAt(0);
    var _DOT = '.'.charCodeAt(0);
    var _BNG = '!'.charCodeAt(0);
    var staticTokenTable = {};
    staticTokenTable[_SEM] = TokenType.SemiColon;
    staticTokenTable[_COL] = TokenType.Colon;
    staticTokenTable[_CUL] = TokenType.CurlyL;
    staticTokenTable[_CUR] = TokenType.CurlyR;
    staticTokenTable[_BRR] = TokenType.BracketR;
    staticTokenTable[_BRL] = TokenType.BracketL;
    staticTokenTable[_LPA] = TokenType.ParenthesisL;
    staticTokenTable[_RPA] = TokenType.ParenthesisR;
    staticTokenTable[_CMA] = TokenType.Comma;
    var staticUnitTable = {};
    staticUnitTable['em'] = TokenType.EMS;
    staticUnitTable['ex'] = TokenType.EXS;
    staticUnitTable['px'] = TokenType.Length;
    staticUnitTable['cm'] = TokenType.Length;
    staticUnitTable['mm'] = TokenType.Length;
    staticUnitTable['in'] = TokenType.Length;
    staticUnitTable['pt'] = TokenType.Length;
    staticUnitTable['pc'] = TokenType.Length;
    staticUnitTable['deg'] = TokenType.Angle;
    staticUnitTable['rad'] = TokenType.Angle;
    staticUnitTable['grad'] = TokenType.Angle;
    staticUnitTable['ms'] = TokenType.Time;
    staticUnitTable['s'] = TokenType.Time;
    staticUnitTable['hz'] = TokenType.Freq;
    staticUnitTable['khz'] = TokenType.Freq;
    staticUnitTable['%'] = TokenType.Percentage;
    staticUnitTable['fr'] = TokenType.Percentage;
    staticUnitTable['dpi'] = TokenType.Resolution;
    staticUnitTable['dpcm'] = TokenType.Resolution;
    var Scanner = /** @class */ (function () {
        function Scanner() {
            this.stream = new MultiLineStream('');
            this.ignoreComment = true;
            this.ignoreWhitespace = true;
            this.inURL = false;
        }
        Scanner.prototype.setSource = function (input) {
            this.stream = new MultiLineStream(input);
        };
        Scanner.prototype.finishToken = function (offset, type, text) {
            return {
                offset: offset,
                len: this.stream.pos() - offset,
                type: type,
                text: text || this.stream.substring(offset)
            };
        };
        Scanner.prototype.substring = function (offset, len) {
            return this.stream.substring(offset, offset + len);
        };
        Scanner.prototype.pos = function () {
            return this.stream.pos();
        };
        Scanner.prototype.goBackTo = function (pos) {
            this.stream.goBackTo(pos);
        };
        Scanner.prototype.scanUnquotedString = function () {
            var offset = this.stream.pos();
            var content = [];
            if (this._unquotedString(content)) {
                return this.finishToken(offset, TokenType.UnquotedString, content.join(''));
            }
            return null;
        };
        Scanner.prototype.scan = function () {
            // processes all whitespaces and comments... BUT NOT NEW LINES
            var triviaToken = this.trivia();
            if (triviaToken !== null) {
                return triviaToken;
            }
            var offset = this.stream.pos();
            // End of file/input
            if (this.stream.eos()) {
                return this.finishToken(offset, TokenType.EOF);
            }
            return this.scanNext(offset);
        };
        Scanner.prototype.scanNext = function (offset) {
            // Comment
            if (this.stream.advanceIfChars([_MUL, _c, _o, _m, _m, _e, _n, _t])) {
                var n = this.stream.advanceWhileChar(function (ch) {
                    return !(ch === _LFD || ch === _NWL || ch === _CAR);
                });
                var t = this.finishToken(offset, TokenType.SingleLineComment);
                return (n > 0) ? t : null;
            }
            var content = [];
            if (this.stream.advanceIfChar(_MUL)) {
                content = ['*'];
                if (this._name(content)) {
                    return this.finishToken(offset, TokenType.Builtin, content.join(''));
                }
                else if (content.length === 1) {
                    return this.finishToken(offset, TokenType.Delim);
                }
                else {
                    return this.finishToken(offset, TokenType.Invalid, content.join(''));
                }
            }
            // newlines
            if (this._newline(content)) {
                return this.finishToken(offset, TokenType.EOL, content.join(''));
            }
            // hash
            if (this.stream.advanceIfChar(_HSH)) {
                content = ['#'];
                if (this._name(content)) {
                    return this.finishToken(offset, TokenType.Hash, content.join(''));
                }
                else {
                    return this.finishToken(offset, TokenType.Delim);
                }
            }
            // Numbers
            if (this._number()) {
                var pos = this.stream.pos();
                content = [this.stream.substring(offset, pos)];
                if (this.stream.advanceIfChar(_PRC)) {
                    // Percentage 43%
                    return this.finishToken(offset, TokenType.Percentage);
                }
                else if (this.ident(content)) {
                    var dim = this.stream.substring(pos).toLowerCase();
                    var tokenType_1 = staticUnitTable[dim];
                    if (typeof tokenType_1 !== 'undefined') {
                        // Known dimension 43px
                        return this.finishToken(offset, tokenType_1, content.join(''));
                    }
                    else {
                        // Unknown dimension 43ft
                        return this.finishToken(offset, TokenType.Dimension, content.join(''));
                    }
                }
                return this.finishToken(offset, TokenType.Num);
            }
            // Word
            if (this._word()) {
                return this.finishToken(offset, TokenType.Word);
            }
            // Delim
            this.stream.nextChar();
            return this.finishToken(offset, TokenType.Delim);
        };
        Scanner.prototype._matchWordAnyCase = function (characters) {
            var index = 0;
            this.stream.advanceWhileChar(function (ch) {
                var result = characters[index] === ch || characters[index + 1] === ch;
                if (result) {
                    index += 2;
                }
                return result;
            });
            if (index === characters.length) {
                return true;
            }
            else {
                this.stream.goBack(index / 2);
                return false;
            }
        };
        Scanner.prototype.trivia = function () {
            while (true) {
                var offset = this.stream.pos();
                if (this._whitespace()) {
                    if (!this.ignoreWhitespace) {
                        return this.finishToken(offset, TokenType.Whitespace);
                    }
                }
                else if (this.comment()) {
                    if (!this.ignoreComment) {
                        return this.finishToken(offset, TokenType.Comment);
                    }
                }
                else {
                    return null;
                }
            }
        };
        Scanner.prototype.comment = function () {
            if (this.stream.advanceIfChars([_FSL, _MUL])) {
                var success_1 = false, hot_1 = false;
                this.stream.advanceWhileChar(function (ch) {
                    if (hot_1 && ch === _FSL) {
                        success_1 = true;
                        return false;
                    }
                    hot_1 = ch === _MUL;
                    return true;
                });
                if (success_1) {
                    this.stream.advance(1);
                }
                return true;
            }
            return false;
        };
        Scanner.prototype._number = function () {
            var npeek = 0, ch;
            if (this.stream.peekChar() === _DOT) {
                npeek = 1;
            }
            ch = this.stream.peekChar(npeek);
            if (ch >= _0 && ch <= _9) {
                this.stream.advance(npeek + 1);
                this.stream.advanceWhileChar(function (ch) {
                    return ch >= _0 && ch <= _9 || npeek === 0 && ch === _DOT;
                });
                return true;
            }
            return false;
        };
        Scanner.prototype._word = function () {
            var npeek = 0, ch;
            ch = this.stream.peekChar(npeek);
            if ((ch >= _A && ch <= _Z) || (ch >= _a && ch <= _z)) {
                this.stream.advance(npeek + 1);
                this.stream.advanceWhileChar(function (ch) {
                    return ((ch >= _A && ch <= _Z) || (ch >= _a && ch <= _z));
                });
                return true;
            }
            return false;
        };
        Scanner.prototype._newline = function (result) {
            var ch = this.stream.peekChar();
            switch (ch) {
                case _CAR:
                case _LFD:
                case _NWL:
                    this.stream.advance(1);
                    result.push(String.fromCharCode(ch));
                    if (ch === _CAR && this.stream.advanceIfChar(_NWL)) {
                        result.push('\n');
                    }
                    return true;
            }
            return false;
        };
        Scanner.prototype._escape = function (result, includeNewLines) {
            var ch = this.stream.peekChar();
            if (ch === _BSL) {
                this.stream.advance(1);
                ch = this.stream.peekChar();
                var hexNumCount = 0;
                while (hexNumCount < 6 && (ch >= _0 && ch <= _9 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
                    this.stream.advance(1);
                    ch = this.stream.peekChar();
                    hexNumCount++;
                }
                if (hexNumCount > 0) {
                    try {
                        var hexVal = parseInt(this.stream.substring(this.stream.pos() - hexNumCount), 16);
                        if (hexVal) {
                            result.push(String.fromCharCode(hexVal));
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                    // optional whitespace or new line, not part of result text
                    if (ch === _WSP || ch === _TAB) {
                        this.stream.advance(1);
                    }
                    else {
                        this._newline([]);
                    }
                    return true;
                }
                if (ch !== _CAR && ch !== _LFD && ch !== _NWL) {
                    this.stream.advance(1);
                    result.push(String.fromCharCode(ch));
                    return true;
                }
                else if (includeNewLines) {
                    return this._newline(result);
                }
            }
            return false;
        };
        Scanner.prototype._stringChar = function (closeQuote, result) {
            // not closeQuote, not backslash, not newline
            var ch = this.stream.peekChar();
            if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR && ch !== _LFD && ch !== _NWL) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        Scanner.prototype._string = function (result) {
            if (this.stream.peekChar() === _SQO || this.stream.peekChar() === _DQO) {
                var closeQuote = this.stream.nextChar();
                result.push(String.fromCharCode(closeQuote));
                while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
                    // loop
                }
                if (this.stream.peekChar() === closeQuote) {
                    this.stream.nextChar();
                    result.push(String.fromCharCode(closeQuote));
                    return TokenType.String;
                }
                else {
                    return TokenType.BadString;
                }
            }
            return null;
        };
        Scanner.prototype._unquotedChar = function (result) {
            // not closeQuote, not backslash, not newline
            var ch = this.stream.peekChar();
            if (ch !== 0 && ch !== _BSL && ch !== _SQO && ch !== _DQO && ch !== _LPA && ch !== _RPA && ch !== _WSP && ch !== _TAB && ch !== _NWL && ch !== _LFD && ch !== _CAR) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        Scanner.prototype._unquotedString = function (result) {
            var hasContent = false;
            while (this._unquotedChar(result) || this._escape(result)) {
                hasContent = true;
            }
            return hasContent;
        };
        Scanner.prototype._whitespace = function () {
            var n = this.stream.advanceWhileChar(function (ch) {
                return ch === _WSP || ch === _TAB;
            });
            return n > 0;
        };
        Scanner.prototype._name = function (result) {
            var matched = false;
            while (this._identChar(result) || this._escape(result)) {
                matched = true;
            }
            return matched;
        };
        Scanner.prototype.ident = function (result) {
            var pos = this.stream.pos();
            var hasMinus = this._minus(result);
            if (hasMinus && this._minus(result) /* -- */) {
                if (this._identFirstChar(result) || this._escape(result)) {
                    while (this._identChar(result) || this._escape(result)) {
                        // loop
                    }
                    return true;
                }
            }
            else if (this._identFirstChar(result) || this._escape(result)) {
                while (this._identChar(result) || this._escape(result)) {
                    // loop
                }
                return true;
            }
            this.stream.goBackTo(pos);
            return false;
        };
        Scanner.prototype._identFirstChar = function (result) {
            var ch = this.stream.peekChar();
            if (ch === _USC || // _
                ch >= _a && ch <= _z || // a-z
                ch >= _A && ch <= _Z || // A-Z
                ch >= 0x80 && ch <= 0xFFFF) { // nonascii
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        Scanner.prototype._minus = function (result) {
            var ch = this.stream.peekChar();
            if (ch === _MIN) {
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        Scanner.prototype._identChar = function (result) {
            var ch = this.stream.peekChar();
            if (ch === _USC || // _
                ch === _MIN || // -
                ch >= _a && ch <= _z || // a-z
                ch >= _A && ch <= _Z || // A-Z
                ch >= _0 && ch <= _9 || // 0/9
                ch >= 0x80 && ch <= 0xFFFF) { // nonascii
                this.stream.advance(1);
                result.push(String.fromCharCode(ch));
                return true;
            }
            return false;
        };
        return Scanner;
    }());
    exports.Scanner = Scanner;
});
//# sourceMappingURL=cssScanner.js.map;
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/parser/cssNodes',["require", "exports"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <summary>
    /// Nodes for the css 2.1 specification. See for reference:
    /// http://www.w3.org/TR/CSS21/grammar.html#grammar
    /// </summary>
    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["Undefined"] = 0] = "Undefined";
        NodeType[NodeType["Identifier"] = 1] = "Identifier";
        NodeType[NodeType["Scene"] = 2] = "Scene";
        NodeType[NodeType["Line"] = 3] = "Line";
        NodeType[NodeType["ChoiceScriptStatement"] = 4] = "ChoiceScriptStatement";
        NodeType[NodeType["StringLiteral"] = 5] = "StringLiteral";
        NodeType[NodeType["Operator"] = 6] = "Operator";
        NodeType[NodeType["Expression"] = 7] = "Expression";
        NodeType[NodeType["BinaryExpression"] = 8] = "BinaryExpression";
        NodeType[NodeType["Term"] = 9] = "Term";
        NodeType[NodeType["Value"] = 10] = "Value";
        NodeType[NodeType["RealWord"] = 11] = "RealWord";
        NodeType[NodeType["TextLine"] = 12] = "TextLine";
        NodeType[NodeType["ChoiceCommand"] = 13] = "ChoiceCommand";
        NodeType[NodeType["ChoiceOption"] = 14] = "ChoiceOption";
        NodeType[NodeType["MultiReplace"] = 15] = "MultiReplace";
        NodeType[NodeType["PrintVariable"] = 16] = "PrintVariable";
        NodeType[NodeType["NumericValue"] = 17] = "NumericValue";
        NodeType[NodeType["Boolean"] = 18] = "Boolean";
        NodeType[NodeType["Indentation"] = 19] = "Indentation";
        NodeType[NodeType["VariableDeclaration"] = 20] = "VariableDeclaration";
        NodeType[NodeType["FlowCommand"] = 21] = "FlowCommand";
        // ...
        NodeType[NodeType["HexColorValue"] = 22] = "HexColorValue";
        NodeType[NodeType["CreateVariable"] = 23] = "CreateVariable";
        NodeType[NodeType["If"] = 24] = "If";
        NodeType[NodeType["Else"] = 25] = "Else";
        NodeType[NodeType["For"] = 26] = "For";
        NodeType[NodeType["Each"] = 27] = "Each";
        NodeType[NodeType["While"] = 28] = "While";
        NodeType[NodeType["MixinContent"] = 29] = "MixinContent";
        NodeType[NodeType["Media"] = 30] = "Media";
        NodeType[NodeType["Keyframe"] = 31] = "Keyframe";
        NodeType[NodeType["FontFace"] = 32] = "FontFace";
        NodeType[NodeType["Import"] = 33] = "Import";
        NodeType[NodeType["Namespace"] = 34] = "Namespace";
        NodeType[NodeType["Invocation"] = 35] = "Invocation";
        NodeType[NodeType["FunctionDeclaration"] = 36] = "FunctionDeclaration";
        NodeType[NodeType["ReturnStatement"] = 37] = "ReturnStatement";
        NodeType[NodeType["MediaQuery"] = 38] = "MediaQuery";
        NodeType[NodeType["FunctionParameter"] = 39] = "FunctionParameter";
        NodeType[NodeType["FunctionArgument"] = 40] = "FunctionArgument";
        NodeType[NodeType["KeyframeSelector"] = 41] = "KeyframeSelector";
        NodeType[NodeType["ViewPort"] = 42] = "ViewPort";
        NodeType[NodeType["Document"] = 43] = "Document";
        NodeType[NodeType["AtApplyRule"] = 44] = "AtApplyRule";
        NodeType[NodeType["CustomPropertyDeclaration"] = 45] = "CustomPropertyDeclaration";
        NodeType[NodeType["CustomPropertySet"] = 46] = "CustomPropertySet";
        NodeType[NodeType["ListEntry"] = 47] = "ListEntry";
        NodeType[NodeType["Supports"] = 48] = "Supports";
        NodeType[NodeType["SupportsCondition"] = 49] = "SupportsCondition";
        NodeType[NodeType["NamespacePrefix"] = 50] = "NamespacePrefix";
        NodeType[NodeType["GridLine"] = 51] = "GridLine";
        NodeType[NodeType["Plugin"] = 52] = "Plugin";
        NodeType[NodeType["UnknownAtRule"] = 53] = "UnknownAtRule";
        NodeType[NodeType["Command"] = 54] = "Command";
        NodeType[NodeType["StandardCommand"] = 55] = "StandardCommand";
        NodeType[NodeType["InvalidBuiltin"] = 56] = "InvalidBuiltin";
    })(NodeType = exports.NodeType || (exports.NodeType = {}));
    var ReferenceType;
    (function (ReferenceType) {
        ReferenceType[ReferenceType["Mixin"] = 0] = "Mixin";
        ReferenceType[ReferenceType["Rule"] = 1] = "Rule";
        ReferenceType[ReferenceType["Variable"] = 2] = "Variable";
        ReferenceType[ReferenceType["Function"] = 3] = "Function";
        ReferenceType[ReferenceType["Keyframe"] = 4] = "Keyframe";
        ReferenceType[ReferenceType["Unknown"] = 5] = "Unknown";
    })(ReferenceType = exports.ReferenceType || (exports.ReferenceType = {}));
    function getNodeAtOffset(node, offset) {
        var candidate = null;
        if (!node || offset < node.offset || offset > node.end) {
            return null;
        }
        // Find the shortest node at the position
        node.accept(function (node) {
            if (node.offset === -1 && node.length === -1) {
                return true;
            }
            if (node.offset <= offset && node.end >= offset) {
                if (!candidate) {
                    candidate = node;
                }
                else if (node.length <= candidate.length) {
                    candidate = node;
                }
                return true;
            }
            return false;
        });
        return candidate;
    }
    exports.getNodeAtOffset = getNodeAtOffset;
    function getNodePath(node, offset) {
        var candidate = getNodeAtOffset(node, offset);
        var path = [];
        while (candidate) {
            path.unshift(candidate);
            candidate = candidate.parent;
        }
        return path;
    }
    exports.getNodePath = getNodePath;
    var Node = /** @class */ (function () {
        function Node(offset, len, nodeType) {
            if (offset === void 0) { offset = -1; }
            if (len === void 0) { len = -1; }
            this.parent = null;
            this.offset = offset;
            this.length = len;
            if (nodeType) {
                this.nodeType = nodeType;
            }
        }
        Object.defineProperty(Node.prototype, "end", {
            get: function () { return this.offset + this.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Node.prototype, "type", {
            get: function () {
                return this.nodeType || NodeType.Undefined;
            },
            set: function (type) {
                this.nodeType = type;
            },
            enumerable: true,
            configurable: true
        });
        Node.prototype.getTextProvider = function () {
            var node = this;
            while (node && !node.textProvider) {
                node = node.parent;
            }
            if (node) {
                return node.textProvider;
            }
            return function () { return 'unknown'; };
        };
        Node.prototype.getText = function () {
            return this.getTextProvider()(this.offset, this.length);
        };
        Node.prototype.matches = function (str) {
            return this.length === str.length && this.getTextProvider()(this.offset, this.length) === str;
        };
        Node.prototype.startsWith = function (str) {
            return this.length >= str.length && this.getTextProvider()(this.offset, str.length) === str;
        };
        Node.prototype.endsWith = function (str) {
            return this.length >= str.length && this.getTextProvider()(this.end - str.length, str.length) === str;
        };
        Node.prototype.accept = function (visitor) {
            if (visitor(this) && this.children) {
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.accept(visitor);
                }
            }
        };
        Node.prototype.acceptVisitor = function (visitor) {
            this.accept(visitor.visitNode.bind(visitor));
        };
        Node.prototype.adoptChild = function (node, index) {
            if (index === void 0) { index = -1; }
            if (node.parent && node.parent.children) {
                var idx = node.parent.children.indexOf(node);
                if (idx >= 0) {
                    node.parent.children.splice(idx, 1);
                }
            }
            node.parent = this;
            var children = this.children;
            if (!children) {
                children = this.children = [];
            }
            if (index !== -1) {
                children.splice(index, 0, node);
            }
            else {
                children.push(node);
            }
            return node;
        };
        Node.prototype.attachTo = function (parent, index) {
            if (index === void 0) { index = -1; }
            if (parent) {
                parent.adoptChild(this, index);
            }
            return this;
        };
        Node.prototype.collectIssues = function (results) {
            if (this.issues) {
                results.push.apply(results, this.issues);
            }
        };
        Node.prototype.addIssue = function (issue) {
            if (!this.issues) {
                this.issues = [];
            }
            this.issues.push(issue);
        };
        Node.prototype.hasIssue = function (rule) {
            return Array.isArray(this.issues) && this.issues.some(function (i) { return i.getRule() === rule; });
        };
        Node.prototype.isErroneous = function (recursive) {
            if (recursive === void 0) { recursive = false; }
            if (this.issues && this.issues.length > 0) {
                return true;
            }
            return recursive && Array.isArray(this.children) && this.children.some(function (c) { return c.isErroneous(true); });
        };
        Node.prototype.setNode = function (field, node, index) {
            if (index === void 0) { index = -1; }
            if (node) {
                node.attachTo(this, index);
                this[field] = node;
                return true;
            }
            return false;
        };
        Node.prototype.addChild = function (node) {
            if (node) {
                if (!this.children) {
                    this.children = [];
                }
                node.attachTo(this);
                this.updateOffsetAndLength(node);
                return true;
            }
            return false;
        };
        Node.prototype.updateOffsetAndLength = function (node) {
            if (node.offset < this.offset || this.offset === -1) {
                this.offset = node.offset;
            }
            var nodeEnd = node.end;
            if ((nodeEnd > this.end) || this.length === -1) {
                this.length = nodeEnd - this.offset;
            }
        };
        Node.prototype.hasChildren = function () {
            return this.children && this.children.length > 0;
        };
        Node.prototype.getChildren = function () {
            return this.children ? this.children.slice(0) : [];
        };
        Node.prototype.getChild = function (index) {
            if (this.children && index < this.children.length) {
                return this.children[index];
            }
            return null;
        };
        Node.prototype.addChildren = function (nodes) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                this.addChild(node);
            }
        };
        Node.prototype.findFirstChildBeforeOffset = function (offset) {
            if (this.children) {
                var current = null;
                for (var i = this.children.length - 1; i >= 0; i--) {
                    // iterate until we find a child that has a start offset smaller than the input offset
                    current = this.children[i];
                    if (current.offset <= offset) {
                        return current;
                    }
                }
            }
            return null;
        };
        Node.prototype.findChildAtOffset = function (offset, goDeep) {
            var current = this.findFirstChildBeforeOffset(offset);
            if (current && current.end >= offset) {
                if (goDeep) {
                    return current.findChildAtOffset(offset, true) || current;
                }
                return current;
            }
            return null;
        };
        Node.prototype.encloses = function (candidate) {
            return this.offset <= candidate.offset && this.offset + this.length >= candidate.offset + candidate.length;
        };
        Node.prototype.getParent = function () {
            var result = this.parent;
            while (result instanceof Nodelist) {
                result = result.parent;
            }
            return result;
        };
        Node.prototype.findParent = function (type) {
            var result = this;
            while (result && result.type !== type) {
                result = result.parent;
            }
            return result;
        };
        Node.prototype.setData = function (key, value) {
            if (!this.options) {
                this.options = {};
            }
            this.options[key] = value;
        };
        Node.prototype.getData = function (key) {
            if (!this.options || !this.options.hasOwnProperty(key)) {
                return null;
            }
            return this.options[key];
        };
        return Node;
    }());
    exports.Node = Node;
    var Nodelist = /** @class */ (function (_super) {
        __extends(Nodelist, _super);
        function Nodelist(parent, index) {
            if (index === void 0) { index = -1; }
            var _this = _super.call(this, -1, -1) || this;
            _this.attachTo(parent, index);
            _this.offset = -1;
            _this.length = -1;
            return _this;
        }
        return Nodelist;
    }(Node));
    exports.Nodelist = Nodelist;
    var ChoiceScriptStatement = /** @class */ (function (_super) {
        __extends(ChoiceScriptStatement, _super);
        function ChoiceScriptStatement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ChoiceScriptStatement.prototype, "type", {
            get: function () {
                return NodeType.ChoiceScriptStatement;
            },
            enumerable: true,
            configurable: true
        });
        return ChoiceScriptStatement;
    }(Node));
    exports.ChoiceScriptStatement = ChoiceScriptStatement;
    var Identifier = /** @class */ (function (_super) {
        __extends(Identifier, _super);
        function Identifier(offset, length) {
            var _this = _super.call(this, offset, length) || this;
            _this.isCustomProperty = false;
            return _this;
        }
        Object.defineProperty(Identifier.prototype, "type", {
            get: function () {
                return NodeType.Identifier;
            },
            enumerable: true,
            configurable: true
        });
        Identifier.prototype.containsInterpolation = function () {
            return this.hasChildren();
        };
        return Identifier;
    }(Node));
    exports.Identifier = Identifier;
    var Scene = /** @class */ (function (_super) {
        __extends(Scene, _super);
        function Scene(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Scene.prototype, "type", {
            get: function () {
                return NodeType.Scene;
            },
            enumerable: true,
            configurable: true
        });
        Scene.prototype.setName = function (value) {
            this.name = value;
        };
        return Scene;
    }(Node));
    exports.Scene = Scene;
    var Command = /** @class */ (function (_super) {
        __extends(Command, _super);
        function Command(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Command.prototype, "type", {
            get: function () {
                return NodeType.Command;
            },
            enumerable: true,
            configurable: true
        });
        return Command;
    }(Node));
    exports.Command = Command;
    var StandardCommand = /** @class */ (function (_super) {
        __extends(StandardCommand, _super);
        function StandardCommand(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(StandardCommand.prototype, "type", {
            get: function () {
                return NodeType.StandardCommand;
            },
            enumerable: true,
            configurable: true
        });
        return StandardCommand;
    }(Command));
    exports.StandardCommand = StandardCommand;
    var FlowCommand = /** @class */ (function (_super) {
        __extends(FlowCommand, _super);
        function FlowCommand(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(FlowCommand.prototype, "type", {
            get: function () {
                return NodeType.FlowCommand;
            },
            enumerable: true,
            configurable: true
        });
        return FlowCommand;
    }(Command));
    exports.FlowCommand = FlowCommand;
    var ChoiceCommand = /** @class */ (function (_super) {
        __extends(ChoiceCommand, _super);
        function ChoiceCommand(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(ChoiceCommand.prototype, "type", {
            get: function () {
                return NodeType.ChoiceCommand;
            },
            enumerable: true,
            configurable: true
        });
        return ChoiceCommand;
    }(StandardCommand));
    exports.ChoiceCommand = ChoiceCommand;
    var ChoiceOption = /** @class */ (function (_super) {
        __extends(ChoiceOption, _super);
        function ChoiceOption(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(ChoiceOption.prototype, "type", {
            get: function () {
                return NodeType.ChoiceOption;
            },
            enumerable: true,
            configurable: true
        });
        return ChoiceOption;
    }(Node));
    exports.ChoiceOption = ChoiceOption;
    var RealWord = /** @class */ (function (_super) {
        __extends(RealWord, _super);
        function RealWord(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(RealWord.prototype, "type", {
            get: function () {
                return NodeType.RealWord;
            },
            enumerable: true,
            configurable: true
        });
        return RealWord;
    }(Node));
    exports.RealWord = RealWord;
    var TextLine = /** @class */ (function (_super) {
        __extends(TextLine, _super);
        function TextLine(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        return TextLine;
    }(Node));
    exports.TextLine = TextLine;
    var AtApplyRule = /** @class */ (function (_super) {
        __extends(AtApplyRule, _super);
        function AtApplyRule(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(AtApplyRule.prototype, "type", {
            get: function () {
                return NodeType.AtApplyRule;
            },
            enumerable: true,
            configurable: true
        });
        AtApplyRule.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        AtApplyRule.prototype.getIdentifier = function () {
            return this.identifier;
        };
        AtApplyRule.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        return AtApplyRule;
    }(Node));
    exports.AtApplyRule = AtApplyRule;
    var AbstractDeclaration = /** @class */ (function (_super) {
        __extends(AbstractDeclaration, _super);
        function AbstractDeclaration(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        return AbstractDeclaration;
    }(Node));
    exports.AbstractDeclaration = AbstractDeclaration;
    var Invocation = /** @class */ (function (_super) {
        __extends(Invocation, _super);
        function Invocation(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Invocation.prototype, "type", {
            get: function () {
                return NodeType.Invocation;
            },
            enumerable: true,
            configurable: true
        });
        Invocation.prototype.getArguments = function () {
            if (!this.arguments) {
                this.arguments = new Nodelist(this);
            }
            return this.arguments;
        };
        return Invocation;
    }(Node));
    exports.Invocation = Invocation;
    var FunctionParameter = /** @class */ (function (_super) {
        __extends(FunctionParameter, _super);
        function FunctionParameter(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(FunctionParameter.prototype, "type", {
            get: function () {
                return NodeType.FunctionParameter;
            },
            enumerable: true,
            configurable: true
        });
        FunctionParameter.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        FunctionParameter.prototype.getIdentifier = function () {
            return this.identifier;
        };
        FunctionParameter.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        FunctionParameter.prototype.setDefaultValue = function (node) {
            return this.setNode('defaultValue', node, 0);
        };
        FunctionParameter.prototype.getDefaultValue = function () {
            return this.defaultValue;
        };
        return FunctionParameter;
    }(Node));
    exports.FunctionParameter = FunctionParameter;
    var FunctionArgument = /** @class */ (function (_super) {
        __extends(FunctionArgument, _super);
        function FunctionArgument(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(FunctionArgument.prototype, "type", {
            get: function () {
                return NodeType.FunctionArgument;
            },
            enumerable: true,
            configurable: true
        });
        FunctionArgument.prototype.setIdentifier = function (node) {
            return this.setNode('identifier', node, 0);
        };
        FunctionArgument.prototype.getIdentifier = function () {
            return this.identifier;
        };
        FunctionArgument.prototype.getName = function () {
            return this.identifier ? this.identifier.getText() : '';
        };
        FunctionArgument.prototype.setValue = function (node) {
            return this.setNode('value', node, 0);
        };
        FunctionArgument.prototype.getValue = function () {
            return this.value;
        };
        return FunctionArgument;
    }(Node));
    exports.FunctionArgument = FunctionArgument;
    var Import = /** @class */ (function (_super) {
        __extends(Import, _super);
        function Import(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Import.prototype, "type", {
            get: function () {
                return NodeType.Import;
            },
            enumerable: true,
            configurable: true
        });
        Import.prototype.setMedialist = function (node) {
            if (node) {
                node.attachTo(this);
                this.medialist = node;
                return true;
            }
            return false;
        };
        return Import;
    }(Node));
    exports.Import = Import;
    var Namespace = /** @class */ (function (_super) {
        __extends(Namespace, _super);
        function Namespace(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Namespace.prototype, "type", {
            get: function () {
                return NodeType.Namespace;
            },
            enumerable: true,
            configurable: true
        });
        return Namespace;
    }(Node));
    exports.Namespace = Namespace;
    var MediaQuery = /** @class */ (function (_super) {
        __extends(MediaQuery, _super);
        function MediaQuery(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(MediaQuery.prototype, "type", {
            get: function () {
                return NodeType.MediaQuery;
            },
            enumerable: true,
            configurable: true
        });
        return MediaQuery;
    }(Node));
    exports.MediaQuery = MediaQuery;
    var SupportsCondition = /** @class */ (function (_super) {
        __extends(SupportsCondition, _super);
        function SupportsCondition(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(SupportsCondition.prototype, "type", {
            get: function () {
                return NodeType.SupportsCondition;
            },
            enumerable: true,
            configurable: true
        });
        return SupportsCondition;
    }(Node));
    exports.SupportsCondition = SupportsCondition;
    var Expression = /** @class */ (function (_super) {
        __extends(Expression, _super);
        function Expression(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Expression.prototype, "type", {
            get: function () {
                return NodeType.Expression;
            },
            enumerable: true,
            configurable: true
        });
        return Expression;
    }(Node));
    exports.Expression = Expression;
    var BinaryExpression = /** @class */ (function (_super) {
        __extends(BinaryExpression, _super);
        function BinaryExpression(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(BinaryExpression.prototype, "type", {
            get: function () {
                return NodeType.BinaryExpression;
            },
            enumerable: true,
            configurable: true
        });
        BinaryExpression.prototype.setLeft = function (left) {
            return this.setNode('left', left);
        };
        BinaryExpression.prototype.getLeft = function () {
            return this.left;
        };
        BinaryExpression.prototype.setRight = function (right) {
            return this.setNode('right', right);
        };
        BinaryExpression.prototype.getRight = function () {
            return this.right;
        };
        BinaryExpression.prototype.setOperator = function (value) {
            return this.setNode('operator', value);
        };
        BinaryExpression.prototype.getOperator = function () {
            return this.operator;
        };
        return BinaryExpression;
    }(Node));
    exports.BinaryExpression = BinaryExpression;
    var Term = /** @class */ (function (_super) {
        __extends(Term, _super);
        function Term(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Term.prototype, "type", {
            get: function () {
                return NodeType.Term;
            },
            enumerable: true,
            configurable: true
        });
        Term.prototype.setOperator = function (value) {
            return this.setNode('operator', value);
        };
        Term.prototype.getOperator = function () {
            return this.operator;
        };
        Term.prototype.setExpression = function (value) {
            return this.setNode('expression', value);
        };
        Term.prototype.getExpression = function () {
            return this.expression;
        };
        return Term;
    }(Node));
    exports.Term = Term;
    var Operator = /** @class */ (function (_super) {
        __extends(Operator, _super);
        function Operator(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Operator.prototype, "type", {
            get: function () {
                return NodeType.Operator;
            },
            enumerable: true,
            configurable: true
        });
        return Operator;
    }(Node));
    exports.Operator = Operator;
    var HexColorValue = /** @class */ (function (_super) {
        __extends(HexColorValue, _super);
        function HexColorValue(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(HexColorValue.prototype, "type", {
            get: function () {
                return NodeType.HexColorValue;
            },
            enumerable: true,
            configurable: true
        });
        return HexColorValue;
    }(Node));
    exports.HexColorValue = HexColorValue;
    var NumericValue = /** @class */ (function (_super) {
        __extends(NumericValue, _super);
        function NumericValue(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(NumericValue.prototype, "type", {
            get: function () {
                return NodeType.NumericValue;
            },
            enumerable: true,
            configurable: true
        });
        NumericValue.prototype.getValue = function () {
            var raw = this.getText();
            var unitIdx = 0, code, _dot = '.'.charCodeAt(0), _0 = '0'.charCodeAt(0), _9 = '9'.charCodeAt(0);
            for (var i = 0, len = raw.length; i < len; i++) {
                code = raw.charCodeAt(i);
                if (!(_0 <= code && code <= _9 || code === _dot)) {
                    break;
                }
                unitIdx += 1;
            }
            return {
                value: raw.substring(0, unitIdx),
                unit: unitIdx < raw.length ? raw.substring(unitIdx) : undefined
            };
        };
        return NumericValue;
    }(Node));
    exports.NumericValue = NumericValue;
    var VariableDeclaration = /** @class */ (function (_super) {
        __extends(VariableDeclaration, _super);
        function VariableDeclaration(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(VariableDeclaration.prototype, "type", {
            get: function () {
                return NodeType.VariableDeclaration;
            },
            enumerable: true,
            configurable: true
        });
        VariableDeclaration.prototype.setVariable = function (node) {
            if (node) {
                node.attachTo(this);
                this.variable = node;
                return true;
            }
            return false;
        };
        VariableDeclaration.prototype.getVariable = function () {
            return this.variable;
        };
        VariableDeclaration.prototype.getName = function () {
            return this.variable ? this.variable.getName() : '';
        };
        VariableDeclaration.prototype.setValue = function (node) {
            if (node) {
                node.attachTo(this);
                this.value = node;
                return true;
            }
            return false;
        };
        VariableDeclaration.prototype.getValue = function () {
            return this.value;
        };
        return VariableDeclaration;
    }(AbstractDeclaration));
    exports.VariableDeclaration = VariableDeclaration;
    var Variable = /** @class */ (function (_super) {
        __extends(Variable, _super);
        function Variable(offset, length) {
            return _super.call(this, offset, length) || this;
        }
        Object.defineProperty(Variable.prototype, "type", {
            get: function () {
                return NodeType.CreateVariable;
            },
            enumerable: true,
            configurable: true
        });
        Variable.prototype.getName = function () {
            return this.getText();
        };
        return Variable;
    }(Node));
    exports.Variable = Variable;
    var ListEntry = /** @class */ (function (_super) {
        __extends(ListEntry, _super);
        function ListEntry() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ListEntry.prototype, "type", {
            get: function () {
                return NodeType.ListEntry;
            },
            enumerable: true,
            configurable: true
        });
        ListEntry.prototype.setKey = function (node) {
            return this.setNode('key', node, 0);
        };
        ListEntry.prototype.setValue = function (node) {
            return this.setNode('value', node, 1);
        };
        return ListEntry;
    }(Node));
    exports.ListEntry = ListEntry;
    var LessGuard = /** @class */ (function (_super) {
        __extends(LessGuard, _super);
        function LessGuard() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LessGuard.prototype.getConditions = function () {
            if (!this.conditions) {
                this.conditions = new Nodelist(this);
            }
            return this.conditions;
        };
        return LessGuard;
    }(Node));
    exports.LessGuard = LessGuard;
    var GuardCondition = /** @class */ (function (_super) {
        __extends(GuardCondition, _super);
        function GuardCondition() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GuardCondition.prototype.setVariable = function (node) {
            return this.setNode('variable', node);
        };
        return GuardCondition;
    }(Node));
    exports.GuardCondition = GuardCondition;
    var Level;
    (function (Level) {
        Level[Level["Ignore"] = 1] = "Ignore";
        Level[Level["Warning"] = 2] = "Warning";
        Level[Level["Error"] = 4] = "Error";
    })(Level = exports.Level || (exports.Level = {}));
    var Marker = /** @class */ (function () {
        function Marker(node, rule, level, message, offset, length) {
            if (offset === void 0) { offset = node.offset; }
            if (length === void 0) { length = node.length; }
            this.node = node;
            this.rule = rule;
            this.level = level;
            this.message = message || rule.message;
            this.offset = offset;
            this.length = length;
        }
        Marker.prototype.getRule = function () {
            return this.rule;
        };
        Marker.prototype.getLevel = function () {
            return this.level;
        };
        Marker.prototype.getOffset = function () {
            return this.offset;
        };
        Marker.prototype.getLength = function () {
            return this.length;
        };
        Marker.prototype.getNode = function () {
            return this.node;
        };
        Marker.prototype.getMessage = function () {
            return this.message;
        };
        return Marker;
    }());
    exports.Marker = Marker;
    /*
    export class DefaultVisitor implements IVisitor {
    
        public visitNode(node:Node):boolean {
            switch (node.type) {
                case NodeType.Stylesheet:
                    return this.visitStylesheet(<Stylesheet> node);
                case NodeType.FontFace:
                    return this.visitFontFace(<FontFace> node);
                case NodeType.Ruleset:
                    return this.visitRuleSet(<RuleSet> node);
                case NodeType.Selector:
                    return this.visitSelector(<Selector> node);
                case NodeType.SimpleSelector:
                    return this.visitSimpleSelector(<SimpleSelector> node);
                case NodeType.Declaration:
                    return this.visitDeclaration(<Declaration> node);
                case NodeType.Function:
                    return this.visitFunction(<Function> node);
                case NodeType.FunctionDeclaration:
                    return this.visitFunctionDeclaration(<FunctionDeclaration> node);
                case NodeType.FunctionParameter:
                    return this.visitFunctionParameter(<FunctionParameter> node);
                case NodeType.FunctionArgument:
                    return this.visitFunctionArgument(<FunctionArgument> node);
                case NodeType.Term:
                    return this.visitTerm(<Term> node);
                case NodeType.Declaration:
                    return this.visitExpression(<Expression> node);
                case NodeType.NumericValue:
                    return this.visitNumericValue(<NumericValue> node);
                case NodeType.Page:
                    return this.visitPage(<Page> node);
                case NodeType.PageBoxMarginBox:
                    return this.visitPageBoxMarginBox(<PageBoxMarginBox> node);
                case NodeType.Property:
                    return this.visitProperty(<Property> node);
                case NodeType.NumericValue:
                    return this.visitNodelist(<Nodelist> node);
                case NodeType.Import:
                    return this.visitImport(<Import> node);
                case NodeType.Namespace:
                    return this.visitNamespace(<Namespace> node);
                case NodeType.Keyframe:
                    return this.visitKeyframe(<Keyframe> node);
                case NodeType.KeyframeSelector:
                    return this.visitKeyframeSelector(<KeyframeSelector> node);
                case NodeType.MixinDeclaration:
                    return this.visitMixinDeclaration(<MixinDeclaration> node);
                case NodeType.MixinReference:
                    return this.visitMixinReference(<MixinReference> node);
                case NodeType.Variable:
                    return this.visitVariable(<Variable> node);
                case NodeType.VariableDeclaration:
                    return this.visitVariableDeclaration(<VariableDeclaration> node);
            }
            return this.visitUnknownNode(node);
        }
    
        public visitFontFace(node:FontFace):boolean {
            return true;
        }
    
        public visitKeyframe(node:Keyframe):boolean {
            return true;
        }
    
        public visitKeyframeSelector(node:KeyframeSelector):boolean {
            return true;
        }
    
        public visitStylesheet(node:Stylesheet):boolean {
            return true;
        }
    
        public visitProperty(Node:Property):boolean {
            return true;
        }
    
        public visitRuleSet(node:RuleSet):boolean {
            return true;
        }
    
        public visitSelector(node:Selector):boolean {
            return true;
        }
    
        public visitSimpleSelector(node:SimpleSelector):boolean {
            return true;
        }
    
        public visitDeclaration(node:Declaration):boolean {
            return true;
        }
    
        public visitFunction(node:Function):boolean {
            return true;
        }
    
        public visitFunctionDeclaration(node:FunctionDeclaration):boolean {
            return true;
        }
    
        public visitInvocation(node:Invocation):boolean {
            return true;
        }
    
        public visitTerm(node:Term):boolean {
            return true;
        }
    
        public visitImport(node:Import):boolean {
            return true;
        }
    
        public visitNamespace(node:Namespace):boolean {
            return true;
        }
    
        public visitExpression(node:Expression):boolean {
            return true;
        }
    
        public visitNumericValue(node:NumericValue):boolean {
            return true;
        }
    
        public visitPage(node:Page):boolean {
            return true;
        }
    
        public visitPageBoxMarginBox(node:PageBoxMarginBox):boolean {
            return true;
        }
    
        public visitNodelist(node:Nodelist):boolean {
            return true;
        }
    
        public visitVariableDeclaration(node:VariableDeclaration):boolean {
            return true;
        }
    
        public visitVariable(node:Variable):boolean {
            return true;
        }
    
        public visitMixinDeclaration(node:MixinDeclaration):boolean {
            return true;
        }
    
        public visitMixinReference(node:MixinReference):boolean {
            return true;
        }
    
        public visitUnknownNode(node:Node):boolean {
            return true;
        }
    }
    */
    var ParseErrorCollector = /** @class */ (function () {
        function ParseErrorCollector() {
            this.entries = [];
        }
        ParseErrorCollector.entries = function (node) {
            var visitor = new ParseErrorCollector();
            node.acceptVisitor(visitor);
            return visitor.entries;
        };
        ParseErrorCollector.prototype.visitNode = function (node) {
            if (node.isErroneous()) {
                node.collectIssues(this.entries);
            }
            return true;
        };
        return ParseErrorCollector;
    }());
    exports.ParseErrorCollector = ParseErrorCollector;
});
//# sourceMappingURL=cssNodes.js.map;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define('vscode-nls/vscode-nls',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function format(message, args) {
        var result;
        if (args.length === 0) {
            result = message;
        }
        else {
            result = message.replace(/\{(\d+)\}/g, function (match, rest) {
                var index = rest[0];
                return typeof args[index] !== 'undefined' ? args[index] : match;
            });
        }
        return result;
    }
    function localize(key, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return format(message, args);
    }
    function loadMessageBundle(file) {
        return localize;
    }
    exports.loadMessageBundle = loadMessageBundle;
    function config(opt) {
        return loadMessageBundle;
    }
    exports.config = config;
});

define('vscode-nls', ['vscode-nls/vscode-nls'], function (main) { return main; });

(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/parser/cssErrors',["require", "exports", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var CSSIssueType = /** @class */ (function () {
        function CSSIssueType(id, message) {
            this.id = id;
            this.message = message;
        }
        return CSSIssueType;
    }());
    exports.CSSIssueType = CSSIssueType;
    exports.ParseError = {
        UnknownCommand: new CSSIssueType('cs-unknowncommand', localize('unknown.command', "unknown command")),
        NoChoiceOption: new CSSIssueType('cs-nochoiceoption', localize('no.choice.command', "expected at least one choice option")),
        NumberExpected: new CSSIssueType('css-numberexpected', localize('expected.number', "number expected")),
        ConditionExpected: new CSSIssueType('css-conditionexpected', localize('expected.condt', "condition expected")),
        RuleOrSelectorExpected: new CSSIssueType('css-ruleorselectorexpected', localize('expected.ruleorselector', "at-rule or selector expected")),
        DotExpected: new CSSIssueType('css-dotexpected', localize('expected.dot', "dot expected")),
        ColonExpected: new CSSIssueType('css-colonexpected', localize('expected.colon', "colon expected")),
        SemiColonExpected: new CSSIssueType('css-semicolonexpected', localize('expected.semicolon', "semi-colon expected")),
        TermExpected: new CSSIssueType('css-termexpected', localize('expected.term', "term expected")),
        ExpressionExpected: new CSSIssueType('css-expressionexpected', localize('expected.expression', "expression expected")),
        OperatorExpected: new CSSIssueType('css-operatorexpected', localize('expected.operator', "operator expected")),
        IdentifierExpected: new CSSIssueType('css-identifierexpected', localize('expected.ident', "identifier expected")),
        PercentageExpected: new CSSIssueType('css-percentageexpected', localize('expected.percentage', "percentage expected")),
        URIOrStringExpected: new CSSIssueType('css-uriorstringexpected', localize('expected.uriorstring', "uri or string expected")),
        URIExpected: new CSSIssueType('css-uriexpected', localize('expected.uri', "URI expected")),
        VariableNameExpected: new CSSIssueType('css-varnameexpected', localize('expected.varname', "variable name expected")),
        VariableValueExpected: new CSSIssueType('css-varvalueexpected', localize('expected.varvalue', "variable value expected")),
        PropertyValueExpected: new CSSIssueType('css-propertyvalueexpected', localize('expected.propvalue', "property value expected")),
        LeftCurlyExpected: new CSSIssueType('css-lcurlyexpected', localize('expected.lcurly', "{ expected")),
        RightCurlyExpected: new CSSIssueType('css-rcurlyexpected', localize('expected.rcurly', "} expected")),
        LeftSquareBracketExpected: new CSSIssueType('css-rbracketexpected', localize('expected.lsquare', "[ expected")),
        RightSquareBracketExpected: new CSSIssueType('css-lbracketexpected', localize('expected.rsquare', "] expected")),
        LeftParenthesisExpected: new CSSIssueType('css-lparentexpected', localize('expected.lparen', "( expected")),
        RightParenthesisExpected: new CSSIssueType('css-rparentexpected', localize('expected.rparent', ") expected")),
        CommaExpected: new CSSIssueType('css-commaexpected', localize('expected.comma', "comma expected")),
        PageDirectiveOrDeclarationExpected: new CSSIssueType('css-pagedirordeclexpected', localize('expected.pagedirordecl', "page directive or declaraton expected")),
        UnknownAtRule: new CSSIssueType('css-unknownatrule', localize('unknown.atrule', "at-rule unknown")),
        SelectorExpected: new CSSIssueType('css-selectorexpected', localize('expected.selector', "selector expected")),
        StringLiteralExpected: new CSSIssueType('css-stringliteralexpected', localize('expected.stringliteral', "string literal expected")),
        WhitespaceExpected: new CSSIssueType('css-whitespaceexpected', localize('expected.whitespace', "whitespace expected")),
        MediaQueryExpected: new CSSIssueType('css-mediaqueryexpected', localize('expected.mediaquery', "media query expected"))
    };
});
//# sourceMappingURL=cssErrors.js.map;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/data/commands',["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.standardCommands = {
        abort: { desc: "" },
        achieve: { desc: "*achieve my_unique_achievement_id" },
        achievement: { desc: "*achievement unique_id true 100 Achievement Title\n\tPre-earned description.\n\tPost-earned description." },
        advertisement: { desc: "" },
        allow_reuse: { desc: "*choice\n\t#Delete the file\n\t\t*gosub delete_file\n\t*allow_reuse #Log out\n\t\t*goto log_out" },
        author: { desc: "*author Jane Doe" },
        bug: { desc: "*bug Oops! Something broke. Please report this bug." },
        check_achievements: { desc: "" },
        check_purchase: { desc: "" },
        check_registration: { desc: "" },
        choice: { desc: "*choice\n\t#Option 1\n\t\t*comment code here\n\t\t*goto label1\n\t#Option 2\n\t\t*comment code here\n\t\t*goto label2" },
        create: { desc: "*create name \"Joe\"" },
        delay_break: { desc: "" },
        delay_ending: { desc: "" },
        delete: { desc: "" },
        disable_reuse: { desc: "*choice\n\t*disable_reuse #Delete the file\n\t\t*gosub delete_file\n\t#Log out\n\t\t*goto log_out" },
        else: { desc: "*if (success)\n\t*goto_scene victory\n*else\n\t*goto_scene defeat" },
        elseif: { desc: "*if (class = \"wizard\")\n\tYou are a wise wizard!\n*elseif (class = \"warrior\")\n\tYou are a loyal warrior!\n*else\n\tYou must be a wily rouge!" },
        elsif: { desc: "*if (class = \"wizard\")\n\tYou are a wise wizard!\n*elsif (class = \"warrior\")\n\tYou are a loyal warrior!\n*else\n\tYou must be a wily rouge!" },
        end_trial: { desc: "" },
        ending: { desc: "Thanks for playing!\n*ending" },
        fake_choice: { desc: "What is your favorite colour?\n\n*fake_choice\n\t#Red\n\t#Green\n\t#Blue\n\nHow interesting! That's mine too!" },
        finish: { desc: "Thus ends the chapter!\n*finish" },
        hide_reuse: { desc: "*choice\n\t*hide_reuse #Delete the file\n\t\t*gosub delete_file\n\t#Log out\n\t\t*goto log_out" },
        if: { desc: "*if (is_warrior)\n\t*set strength (strength + 5)" },
        image: { desc: "*image myimage.png" },
        input_number: { desc: "*input_number percentage 1 100" },
        input_text: { desc: "*temp name \"\"\n*input_text name\nHello ${name}" },
        line_break: { desc: "" },
        link: { desc: "*link http://www.choiceofgames.com/" },
        link_button: { desc: "" },
        login: { desc: "" },
        looplimit: { desc: "(Unimplemented)" },
        more_games: { desc: "" },
        page_break: { desc: "*page_break Optional Button Text" },
        params: { desc: "*gosub sub_routine \"Jane\" \"Doe\"\n-----------\n*label sub_routine\n*params firstname lastname\nHi ${firstname} ${lastname}!\n*return" },
        print: { desc: "This command is deprecated. Please use the ${var} notation." },
        purchase: { desc: "" },
        rand: { desc: "*rand dice_roll 1 6" },
        reset: { desc: "" },
        restart: { desc: "" },
        restore_game: { desc: "" },
        restore_purchases: { desc: "" },
        save_game: { desc: "" },
        scene_list: { desc: "*scene_list\n\tscene_01\n\tscene_02\n\tscene_03" },
        script: { desc: "(Unsupported)" },
        selectable_if: { desc: "*choice\n\t*selectable_if (strength > 10) #Pump some iron\n\t\t...\n\t#Take a break\n\t\t..." },
        set: { desc: "*set n 5" },
        setref: { desc: "This command is deprecated.\nPlease use the *set {var} notation." },
        share_this_game: { desc: "" },
        show_password: { desc: "" },
        sound: { desc: "*sound mysoundfile.mp3" },
        stat_chart: { desc: "" },
        subscribe: { desc: "" },
        temp: { desc: "*temp " },
        title: { desc: "*title My Brand New Game" }
    };
    exports.flowCommands = {
        gosub: { desc: "*gosub my_label ?param1 ?param2 ?..." },
        gosub_scene: { desc: "*gosub_scene my_scene ?my_label " },
        goto: { desc: "*goto my_label" },
        goto_random_scene: { desc: "" },
        goto_scene: { desc: "*goto_scene my_scene ?my_label" },
        gotoref: { desc: "This command is deprecated.\nPlease use the *goto {var} notation." },
        label: { desc: "*label my_label" },
        redirect_scene: { desc: "" },
        return: { desc: "" }
    };
    exports.standardCommandList = Object.keys(exports.standardCommands);
    exports.flowCommandList = Object.keys(exports.flowCommands);
    exports.fullCommandList = exports.standardCommandList.concat(exports.flowCommandList);
});
//# sourceMappingURL=commands.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/parser/cssParser',["require", "exports", "./cssScanner", "./cssNodes", "./cssErrors", "../data/commands"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var cssScanner_1 = require("./cssScanner");
    var nodes = require("./cssNodes");
    var cssErrors_1 = require("./cssErrors");
    var commands_1 = require("../data/commands");
    /// <summary>
    /// A parser for the css core specification. See for reference:
    /// https://www.w3.org/TR/CSS21/grammar.html
    /// http://www.w3.org/TR/CSS21/syndata.html#tokenization
    /// </summary>
    var Parser = /** @class */ (function () {
        function Parser(scnr) {
            if (scnr === void 0) { scnr = new cssScanner_1.Scanner(); }
            this.scanner = scnr;
            this.token = null;
            this.prevToken = null;
        }
        Parser.prototype.peekIdent = function (text) {
            return cssScanner_1.TokenType.Ident === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
        };
        Parser.prototype.peekKeyword = function (text) {
            return cssScanner_1.TokenType.AtKeyword === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
        };
        Parser.prototype.peekDelim = function (text) {
            return cssScanner_1.TokenType.Delim === this.token.type && text === this.token.text;
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
            if (cssScanner_1.TokenType.Builtin === this.token.type) {
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
                    if (this.token.type === cssScanner_1.TokenType.EOF) {
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
                        while (!this.accept(cssScanner_1.TokenType.EOL) && !this.accept(cssScanner_1.TokenType.EOF)) {
                            this.consumeToken();
                        }
                        hasMatch = true;
                    }
                } while (hasMatch);
                if (this.peek(cssScanner_1.TokenType.EOF)) {
                    break;
                }
                this.consumeToken();
            } while (!this.peek(cssScanner_1.TokenType.EOF));
            return this.finish(node);
        };
        Parser.prototype._parseLine = function () {
            if (this.peek(cssScanner_1.TokenType.SingleLineComment)) {
                var node = this.create(nodes.Node);
                this.consumeToken();
                return this.finish(node);
            }
            else if (this.peek(cssScanner_1.TokenType.Builtin) || this.peek(cssScanner_1.TokenType.Invalid)) {
                return this._parseChoiceScriptStatement();
            }
            else {
                return this._parseTextLine();
            }
        };
        Parser.prototype._parseTextLine = function () {
            var node = this.createNode(nodes.NodeType.TextLine);
            while (this.peek(cssScanner_1.TokenType.Word)) {
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
            if (this.acceptOneKeyword(commands_1.flowCommandList.map(function (cmd) { return '*' + cmd; }))) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseChoiceOption = function () {
            if (!this.peek(cssScanner_1.TokenType.Hash) && !this.peekDelim('#')) {
                return null;
            }
            var node = this.create(nodes.ChoiceOption);
            if (this.acceptDelim('#')) {
                return this.finish(node);
            }
            else {
                this.consumeToken(); // TokenType.Hash
                while (!this.peek(cssScanner_1.TokenType.EOL) && !this.peek(cssScanner_1.TokenType.EOF)) {
                    this.consumeToken();
                }
            }
            return this.finish(node);
        };
        Parser.prototype._parseChoiceCommand = function () {
            var node = this.create(nodes.ChoiceCommand);
            if (this.acceptOneKeyword(["*choice"])) {
                if (this.accept(cssScanner_1.TokenType.EOL)) {
                    while (node.addChild(this._parseChoiceOption())) {
                        this.accept(cssScanner_1.TokenType.EOL); // EOL
                    }
                    if (node.hasChildren()) {
                        return this.finish(node);
                    }
                    else {
                        return this.finish(node, cssErrors_1.ParseError.NoChoiceOption);
                    }
                }
                return this.finish(node, cssErrors_1.ParseError.NoChoiceOption);
            }
            return null;
        };
        Parser.prototype._parseStandardCommand = function () {
            var node = this.create(nodes.StandardCommand);
            if (this.acceptOneKeyword(commands_1.standardCommandList.map(function (cmd) { return '*' + cmd; }))) {
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseInvalidCommand = function () {
            var node = this.create(nodes.Command);
            this.markError(node, cssErrors_1.ParseError.UnknownCommand);
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
                return this.finish(node, cssErrors_1.ParseError.IdentifierExpected);
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
            if (!this.accept(cssScanner_1.TokenType.CurlyL)) {
                return null;
            }
            var decl = parseDeclaration();
            while (node.addChild(decl)) {
                if (this.peek(cssScanner_1.TokenType.CurlyR)) {
                    break;
                }
                if (this._needsSemicolonAfter(decl) && !this.accept(cssScanner_1.TokenType.SemiColon)) {
                    return this.finish(node, cssErrors_1.ParseError.SemiColonExpected, [cssScanner_1.TokenType.SemiColon, cssScanner_1.TokenType.CurlyR]);
                }
                while (this.accept(cssScanner_1.TokenType.SemiColon)) {
                    // accept empty statements
                }
                decl = parseDeclaration();
            }
            if (!this.accept(cssScanner_1.TokenType.CurlyR)) {
                return this.finish(node, cssErrors_1.ParseError.RightCurlyExpected, [cssScanner_1.TokenType.CurlyR, cssScanner_1.TokenType.SemiColon]);
            }
            return this.finish(node);
        };
        Parser.prototype._parseBody = function (node, parseDeclaration) {
            if (!node.setDeclarations(this._parseDeclarations(parseDeclaration))) {
                return this.finish(node, cssErrors_1.ParseError.LeftCurlyExpected, [cssScanner_1.TokenType.CurlyR, cssScanner_1.TokenType.SemiColon]);
            }
            return this.finish(node);
        };
        Parser.prototype._parsePropertyIdentifier = function () {
            return this._parseIdent();
        };
        Parser.prototype._parseCharset = function () {
            if (!this.peek(cssScanner_1.TokenType.Charset)) {
                return null;
            }
            var node = this.create(nodes.Node);
            this.consumeToken(); // charset
            if (!this.accept(cssScanner_1.TokenType.String)) {
                return this.finish(node, cssErrors_1.ParseError.IdentifierExpected);
            }
            if (!this.accept(cssScanner_1.TokenType.SemiColon)) {
                return this.finish(node, cssErrors_1.ParseError.SemiColonExpected);
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
            this.resync([], [cssScanner_1.TokenType.CurlyL]); // ignore all the rules
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
                this.peek(cssScanner_1.TokenType.Dashmatch) ||
                this.peek(cssScanner_1.TokenType.Includes) ||
                this.peek(cssScanner_1.TokenType.SubstringOperator) ||
                this.peek(cssScanner_1.TokenType.PrefixOperator) ||
                this.peek(cssScanner_1.TokenType.SuffixOperator) ||
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
            if (!this.peek(cssScanner_1.TokenType.Hash) && !this.peekDelim('#')) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.ChoiceOption);
            if (this.acceptDelim('#')) {
                if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
                    return this.finish(node, cssErrors_1.ParseError.IdentifierExpected);
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
                if (this.peek(cssScanner_1.TokenType.Comma)) { // optional
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
            if (!this.peek(cssScanner_1.TokenType.BracketL)) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.GridLine);
            this.consumeToken();
            while (node.addChild(this._parseIdent())) {
                // repeat
            }
            if (!this.accept(cssScanner_1.TokenType.BracketR)) {
                return this.finish(node, cssErrors_1.ParseError.RightSquareBracketExpected);
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
                return this.finish(node, cssErrors_1.ParseError.TermExpected);
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
            if (!this.peek(cssScanner_1.TokenType.ParenthesisL)) {
                return null;
            }
            var node = this.create(nodes.Node);
            this.consumeToken(); // ParenthesisL
            node.addChild(this._parseExpr());
            if (!this.accept(cssScanner_1.TokenType.ParenthesisR)) {
                return this.finish(node, cssErrors_1.ParseError.RightParenthesisExpected);
            }
            return this.finish(node);
        };
        Parser.prototype._parseNumeric = function () {
            if (this.peek(cssScanner_1.TokenType.Num) ||
                this.peek(cssScanner_1.TokenType.Percentage) ||
                this.peek(cssScanner_1.TokenType.Resolution) ||
                this.peek(cssScanner_1.TokenType.Length) ||
                this.peek(cssScanner_1.TokenType.EMS) ||
                this.peek(cssScanner_1.TokenType.EXS) ||
                this.peek(cssScanner_1.TokenType.Angle) ||
                this.peek(cssScanner_1.TokenType.Time) ||
                this.peek(cssScanner_1.TokenType.Dimension) ||
                this.peek(cssScanner_1.TokenType.Freq)) {
                var node = this.create(nodes.NumericValue);
                this.consumeToken();
                return this.finish(node);
            }
            return null;
        };
        Parser.prototype._parseStringLiteral = function () {
            if (!this.peek(cssScanner_1.TokenType.String) && !this.peek(cssScanner_1.TokenType.BadString)) {
                return null;
            }
            var node = this.createNode(nodes.NodeType.StringLiteral);
            this.consumeToken();
            return this.finish(node);
        };
        Parser.prototype._parseURLArgument = function () {
            var node = this.create(nodes.Node);
            if (!this.accept(cssScanner_1.TokenType.String) && !this.accept(cssScanner_1.TokenType.BadString) && !this.acceptUnquotedString()) {
                return null;
            }
            return this.finish(node);
        };
        Parser.prototype._parseIdent = function (referenceTypes) {
            if (!this.peek(cssScanner_1.TokenType.Ident)) {
                return null;
            }
            var node = this.create(nodes.Identifier);
            if (referenceTypes) {
                node.referenceTypes = referenceTypes;
            }
            node.isCustomProperty = this.peekRegExp(cssScanner_1.TokenType.Ident, /^--/);
            this.consumeToken();
            return this.finish(node);
        };
        Parser.prototype._parseFunctionIdentifier = function () {
            if (!this.peek(cssScanner_1.TokenType.Ident)) {
                return null;
            }
            var node = this.create(nodes.Identifier);
            node.referenceTypes = [nodes.ReferenceType.Function];
            if (this.acceptIdent('progid')) {
                // support for IE7 specific filters: 'progid:DXImageTransform.Microsoft.MotionBlur(strength=13, direction=310)'
                if (this.accept(cssScanner_1.TokenType.Colon)) {
                    while (this.accept(cssScanner_1.TokenType.Ident) && this.acceptDelim('.')) {
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
            if (this.peekRegExp(cssScanner_1.TokenType.Hash, /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/g)) {
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
    exports.Parser = Parser;
});
//# sourceMappingURL=cssParser.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/languageFacts',["require", "exports", "../data/commands", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var commands = require("../data/commands");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    exports.colors = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgrey: '#a9a9a9',
        darkgreen: '#006400',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        grey: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgrey: '#d3d3d3',
        lightgreen: '#90ee90',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370d8',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#d87093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        red: '#ff0000',
        rebeccapurple: '#663399',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };
    exports.colorKeywords = {
        'currentColor': 'The value of the \'color\' property. The computed value of the \'currentColor\' keyword is the computed value of the \'color\' property. If the \'currentColor\' keyword is set on the \'color\' property itself, it is treated as \'color:inherit\' at parse time.',
        'transparent': 'Fully transparent. This keyword can be considered a shorthand for rgba(0,0,0,0) which is its computed value.',
    };
    exports.positionKeywords = {
        'bottom': 'Computes to ‘100%’ for the vertical position if one or two values are given, otherwise specifies the bottom edge as the origin for the next offset.',
        'center': 'Computes to ‘50%’ (‘left 50%’) for the horizontal position if the horizontal position is not otherwise specified, or ‘50%’ (‘top 50%’) for the vertical position if it is.',
        'left': 'Computes to ‘0%’ for the horizontal position if one or two values are given, otherwise specifies the left edge as the origin for the next offset.',
        'right': 'Computes to ‘100%’ for the horizontal position if one or two values are given, otherwise specifies the right edge as the origin for the next offset.',
        'top': 'Computes to ‘0%’ for the vertical position if one or two values are given, otherwise specifies the top edge as the origin for the next offset.'
    };
    exports.repeatStyleKeywords = {
        'no-repeat': 'Placed once and not repeated in this direction.',
        'repeat': 'Repeated in this direction as often as needed to cover the background painting area.',
        'repeat-x': 'Computes to ‘repeat no-repeat’.',
        'repeat-y': 'Computes to ‘no-repeat repeat’.',
        'round': 'Repeated as often as will fit within the background positioning area. If it doesn’t fit a whole number of times, it is rescaled so that it does.',
        'space': 'Repeated as often as will fit within the background positioning area without being clipped and then the images are spaced out to fill the area.'
    };
    exports.lineStyleKeywords = {
        'dashed': 'A series of square-ended dashes.',
        'dotted': 'A series of round dots.',
        'double': 'Two parallel solid lines with some space between them.',
        'groove': 'Looks as if it were carved in the canvas.',
        'hidden': 'Same as ‘none’, but has different behavior in the border conflict resolution rules for border-collapsed tables.',
        'inset': 'Looks as if the content on the inside of the border is sunken into the canvas.',
        'none': 'No border. Color and width are ignored.',
        'outset': 'Looks as if the content on the inside of the border is coming out of the canvas.',
        'ridge': 'Looks as if it were coming out of the canvas.',
        'solid': 'A single line segment.'
    };
    exports.lineWidthKeywords = ['medium', 'thick', 'thin'];
    exports.boxKeywords = {
        'border-box': 'The background is painted within (clipped to) the border box.',
        'content-box': 'The background is painted within (clipped to) the content box.',
        'padding-box': 'The background is painted within (clipped to) the padding box.'
    };
    exports.geometryBoxKeywords = {
        'margin-box': 'Uses the margin box as reference box.',
        'fill-box': 'Uses the object bounding box as reference box.',
        'stroke-box': 'Uses the stroke bounding box as reference box.',
        'view-box': 'Uses the nearest SVG viewport as reference box.'
    };
    exports.cssWideKeywords = {
        'initial': 'Represents the value specified as the property’s initial value.',
        'inherit': 'Represents the computed value of the property on the element’s parent.',
        'unset': 'Acts as either `inherit` or `initial`, depending on whether the property is inherited or not.'
    };
    exports.colorFunctions = [
        { func: 'rgb($red, $green, $blue)', desc: localize('css.builtin.rgb', 'Creates a Color from red, green, and blue values.') },
        { func: 'rgba($red, $green, $blue, $alpha)', desc: localize('css.builtin.rgba', 'Creates a Color from red, green, blue, and alpha values.') },
        { func: 'hsl($hue, $saturation, $lightness)', desc: localize('css.builtin.hsl', 'Creates a Color from hue, saturation, and lightness values.') },
        { func: 'hsla($hue, $saturation, $lightness, $alpha)', desc: localize('css.builtin.hsla', 'Creates a Color from hue, saturation, lightness, and alpha values.') }
    ];
    exports.imageFunctions = {
        'url()': 'Reference an image file by URL',
        'image()': 'Provide image fallbacks and annotations.',
        '-webkit-image-set()': 'Provide multiple resolutions. Remember to use unprefixed image-set() in addition.',
        'image-set()': 'Provide multiple resolutions of an image and let the UA decide which is most appropriate in a given situation.',
        '-moz-element()': 'Use an element in the document as an image. Remember to use unprefixed element() in addition.',
        'element()': 'Use an element in the document as an image.',
        'cross-fade()': 'Indicates the two images to be combined and how far along in the transition the combination is.',
        '-webkit-gradient()': 'Deprecated. Use modern linear-gradient() or radial-gradient() instead.',
        '-webkit-linear-gradient()': 'Linear gradient. Remember to use unprefixed version in addition.',
        '-moz-linear-gradient()': 'Linear gradient. Remember to use unprefixed version in addition.',
        '-o-linear-gradient()': 'Linear gradient. Remember to use unprefixed version in addition.',
        'linear-gradient()': 'A linear gradient is created by specifying a straight gradient line, and then several colors placed along that line.',
        '-webkit-repeating-linear-gradient()': 'Repeating Linear gradient. Remember to use unprefixed version in addition.',
        '-moz-repeating-linear-gradient()': 'Repeating Linear gradient. Remember to use unprefixed version in addition.',
        '-o-repeating-linear-gradient()': 'RepeatingLinear gradient. Remember to use unprefixed version in addition.',
        'repeating-linear-gradient()': 'Same as linear-gradient, except the color-stops are repeated infinitely in both directions, with their positions shifted by multiples of the difference between the last specified color-stop’s position and the first specified color-stop’s position.',
        '-webkit-radial-gradient()': 'Radial gradient. Remember to use unprefixed version in addition.',
        '-moz-radial-gradient()': 'Radial gradient. Remember to use unprefixed version in addition.',
        'radial-gradient()': 'Colors emerge from a single point and smoothly spread outward in a circular or elliptical shape.',
        '-webkit-repeating-radial-gradient()': 'Repeating radial gradient. Remember to use unprefixed version in addition.',
        '-moz-repeating-radial-gradient()': 'Repeating radial gradient. Remember to use unprefixed version in addition.',
        'repeating-radial-gradient()': 'Same as radial-gradient, except the color-stops are repeated infinitely in both directions, with their positions shifted by multiples of the difference between the last specified color-stop’s position and the first specified color-stop’s position.'
    };
    exports.transitionTimingFunctions = {
        'ease': 'Equivalent to cubic-bezier(0.25, 0.1, 0.25, 1.0).',
        'ease-in': 'Equivalent to cubic-bezier(0.42, 0, 1.0, 1.0).',
        'ease-in-out': 'Equivalent to cubic-bezier(0.42, 0, 0.58, 1.0).',
        'ease-out': 'Equivalent to cubic-bezier(0, 0, 0.58, 1.0).',
        'linear': 'Equivalent to cubic-bezier(0.0, 0.0, 1.0, 1.0).',
        'step-end': 'Equivalent to steps(1, end).',
        'step-start': 'Equivalent to steps(1, start).',
        'steps()': 'The first parameter specifies the number of intervals in the function. The second parameter, which is optional, is either the value “start” or “end”.',
        'cubic-bezier()': 'Specifies a cubic-bezier curve. The four values specify points P1 and P2  of the curve as (x1, y1, x2, y2).',
        'cubic-bezier(0.6, -0.28, 0.735, 0.045)': 'Ease-in Back. Overshoots.',
        'cubic-bezier(0.68, -0.55, 0.265, 1.55)': 'Ease-in-out Back. Overshoots.',
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)': 'Ease-out Back. Overshoots.',
        'cubic-bezier(0.6, 0.04, 0.98, 0.335)': 'Ease-in Circular. Based on half circle.',
        'cubic-bezier(0.785, 0.135, 0.15, 0.86)': 'Ease-in-out Circular. Based on half circle.',
        'cubic-bezier(0.075, 0.82, 0.165, 1)': 'Ease-out Circular. Based on half circle.',
        'cubic-bezier(0.55, 0.055, 0.675, 0.19)': 'Ease-in Cubic. Based on power of three.',
        'cubic-bezier(0.645, 0.045, 0.355, 1)': 'Ease-in-out Cubic. Based on power of three.',
        'cubic-bezier(0.215, 0.610, 0.355, 1)': 'Ease-out Cubic. Based on power of three.',
        'cubic-bezier(0.95, 0.05, 0.795, 0.035)': 'Ease-in Exponential. Based on two to the power ten.',
        'cubic-bezier(1, 0, 0, 1)': 'Ease-in-out Exponential. Based on two to the power ten.',
        'cubic-bezier(0.19, 1, 0.22, 1)': 'Ease-out Exponential. Based on two to the power ten.',
        'cubic-bezier(0.47, 0, 0.745, 0.715)': 'Ease-in Sine.',
        'cubic-bezier(0.445, 0.05, 0.55, 0.95)': 'Ease-in-out Sine.',
        'cubic-bezier(0.39, 0.575, 0.565, 1)': 'Ease-out Sine.',
        'cubic-bezier(0.55, 0.085, 0.68, 0.53)': 'Ease-in Quadratic. Based on power of two.',
        'cubic-bezier(0.455, 0.03, 0.515, 0.955)': 'Ease-in-out Quadratic. Based on power of two.',
        'cubic-bezier(0.25, 0.46, 0.45, 0.94)': 'Ease-out Quadratic. Based on power of two.',
        'cubic-bezier(0.895, 0.03, 0.685, 0.22)': 'Ease-in Quartic. Based on power of four.',
        'cubic-bezier(0.77, 0, 0.175, 1)': 'Ease-in-out Quartic. Based on power of four.',
        'cubic-bezier(0.165, 0.84, 0.44, 1)': 'Ease-out Quartic. Based on power of four.',
        'cubic-bezier(0.755, 0.05, 0.855, 0.06)': 'Ease-in Quintic. Based on power of five.',
        'cubic-bezier(0.86, 0, 0.07, 1)': 'Ease-in-out Quintic. Based on power of five.',
        'cubic-bezier(0.23, 1, 0.320, 1)': 'Ease-out Quintic. Based on power of five.'
    };
    exports.basicShapeFunctions = {
        'circle()': 'Defines a circle.',
        'ellipse()': 'Defines an ellipse.',
        'inset()': 'Defines an inset rectangle.',
        'polygon()': 'Defines a polygon.'
    };
    exports.units = {
        'length': ['em', 'rem', 'ex', 'px', 'cm', 'mm', 'in', 'pt', 'pc', 'ch', 'vw', 'vh', 'vmin', 'vmax'],
        'angle': ['deg', 'rad', 'grad', 'turn'],
        'time': ['ms', 's'],
        'frequency': ['Hz', 'kHz'],
        'resolution': ['dpi', 'dpcm', 'dppx'],
        'percentage': ['%', 'fr']
    };
    exports.html5Tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
        'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer',
        'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link',
        'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q',
        'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
        'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'let', 'video', 'wbr'];
    exports.svgElements = ['circle', 'clipPath', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
        'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
        'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignObject', 'g', 'hatch', 'hatchpath', 'image', 'line', 'linearGradient',
        'marker', 'mask', 'mesh', 'meshpatch', 'meshrow', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'solidcolor', 'stop', 'svg', 'switch',
        'symbol', 'text', 'textPath', 'tspan', 'use', 'view'];
    /*export function isColorConstructor(node: nodes.Function): boolean {
        let name = node.getName();
        if (!name) {
            return false;
        }
        return /^(rgb|rgba|hsl|hsla)$/gi.test(name);
    }*/
    /**
     * Returns true if the node is a color value - either
     * defined a hex number, as rgb or rgba function, or
     * as color name.
     */
    /*
    export function isColorValue(node: nodes.Node): boolean {
        if (node.type === nodes.NodeType.HexColorValue) {
            return true;
        } else if (node.type === nodes.NodeType.Function) {
            return isColorConstructor(<nodes.Function>node);
        } else if (node.type === nodes.NodeType.Identifier) {
            if (node.parent && node.parent.type !== nodes.NodeType.Term) {
                return false;
            }
            let candidateColor = node.getText().toLowerCase();
            if (candidateColor === 'none') {
                return false;
            }
            if (colors[candidateColor]) {
                return true;
            }
        }
        return false;
    }*/
    var Digit0 = 48;
    var Digit9 = 57;
    var A = 65;
    var F = 70;
    var a = 97;
    var f = 102;
    function hexDigit(charCode) {
        if (charCode < Digit0) {
            return 0;
        }
        if (charCode <= Digit9) {
            return charCode - Digit0;
        }
        if (charCode < a) {
            charCode += (a - A);
        }
        if (charCode >= a && charCode <= f) {
            return charCode - a + 10;
        }
        return 0;
    }
    exports.hexDigit = hexDigit;
    function colorFromHex(text) {
        if (text[0] !== '#') {
            return null;
        }
        switch (text.length) {
            case 4:
                return {
                    red: (hexDigit(text.charCodeAt(1)) * 0x11) / 255.0,
                    green: (hexDigit(text.charCodeAt(2)) * 0x11) / 255.0,
                    blue: (hexDigit(text.charCodeAt(3)) * 0x11) / 255.0,
                    alpha: 1
                };
            case 5:
                return {
                    red: (hexDigit(text.charCodeAt(1)) * 0x11) / 255.0,
                    green: (hexDigit(text.charCodeAt(2)) * 0x11) / 255.0,
                    blue: (hexDigit(text.charCodeAt(3)) * 0x11) / 255.0,
                    alpha: (hexDigit(text.charCodeAt(4)) * 0x11) / 255.0,
                };
            case 7:
                return {
                    red: (hexDigit(text.charCodeAt(1)) * 0x10 + hexDigit(text.charCodeAt(2))) / 255.0,
                    green: (hexDigit(text.charCodeAt(3)) * 0x10 + hexDigit(text.charCodeAt(4))) / 255.0,
                    blue: (hexDigit(text.charCodeAt(5)) * 0x10 + hexDigit(text.charCodeAt(6))) / 255.0,
                    alpha: 1
                };
            case 9:
                return {
                    red: (hexDigit(text.charCodeAt(1)) * 0x10 + hexDigit(text.charCodeAt(2))) / 255.0,
                    green: (hexDigit(text.charCodeAt(3)) * 0x10 + hexDigit(text.charCodeAt(4))) / 255.0,
                    blue: (hexDigit(text.charCodeAt(5)) * 0x10 + hexDigit(text.charCodeAt(6))) / 255.0,
                    alpha: (hexDigit(text.charCodeAt(7)) * 0x10 + hexDigit(text.charCodeAt(8))) / 255.0
                };
        }
        return null;
    }
    exports.colorFromHex = colorFromHex;
    function colorFrom256RGB(red, green, blue, alpha) {
        if (alpha === void 0) { alpha = 1.0; }
        return {
            red: red / 255.0,
            green: green / 255.0,
            blue: blue / 255.0,
            alpha: alpha
        };
    }
    exports.colorFrom256RGB = colorFrom256RGB;
    function colorFromHSL(hue, sat, light, alpha) {
        if (alpha === void 0) { alpha = 1.0; }
        hue = hue / 60.0;
        if (sat === 0) {
            return { red: light, green: light, blue: light, alpha: alpha };
        }
        else {
            var hueToRgb = function (t1, t2, hue) {
                while (hue < 0) {
                    hue += 6;
                }
                while (hue >= 6) {
                    hue -= 6;
                }
                if (hue < 1) {
                    return (t2 - t1) * hue + t1;
                }
                if (hue < 3) {
                    return t2;
                }
                if (hue < 4) {
                    return (t2 - t1) * (4 - hue) + t1;
                }
                return t1;
            };
            var t2 = light <= 0.5 ? (light * (sat + 1)) : (light + sat - (light * sat));
            var t1 = light * 2 - t2;
            return { red: hueToRgb(t1, t2, hue + 2), green: hueToRgb(t1, t2, hue), blue: hueToRgb(t1, t2, hue - 2), alpha: alpha };
        }
    }
    exports.colorFromHSL = colorFromHSL;
    function hslFromColor(rgba) {
        var r = rgba.red;
        var g = rgba.green;
        var b = rgba.blue;
        var a = rgba.alpha;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h = 0;
        var s = 0;
        var l = (min + max) / 2;
        var chroma = max - min;
        if (chroma > 0) {
            s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
            switch (max) {
                case r:
                    h = (g - b) / chroma + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / chroma + 2;
                    break;
                case b:
                    h = (r - g) / chroma + 4;
                    break;
            }
            h *= 60;
            h = Math.round(h);
        }
        return { h: h, s: s, l: l, a: a };
    }
    exports.hslFromColor = hslFromColor;
    /*
    export function getColorValue(node: nodes.Node): Color {
        if (node.type === nodes.NodeType.HexColorValue) {
            let text = node.getText();
            return colorFromHex(text);
        } else if (node.type === nodes.NodeType.Function) {
            let functionNode = <nodes.Function>node;
            let name = functionNode.getName();
            let colorValues = functionNode.getArguments().getChildren();
            if (!name || colorValues.length < 3 || colorValues.length > 4) {
                return null;
            }
            try {
                let alpha = colorValues.length === 4 ? getNumericValue(colorValues[3], 1) : 1;
                if (name === 'rgb' || name === 'rgba') {
                    return {
                        red: getNumericValue(colorValues[0], 255.0),
                        green: getNumericValue(colorValues[1], 255.0),
                        blue: getNumericValue(colorValues[2], 255.0),
                        alpha
                    };
                } else if (name === 'hsl' || name === 'hsla') {
                    let h = getAngle(colorValues[0]);
                    let s = getNumericValue(colorValues[1], 100.0);
                    let l = getNumericValue(colorValues[2], 100.0);
                    return colorFromHSL(h, s, l, alpha);
                }
            } catch (e) {
                // parse error on numeric value
                return null;
            }
        } else if (node.type === nodes.NodeType.Identifier) {
            if (node.parent && node.parent.type !== nodes.NodeType.Term) {
                return null;
            }
            let term = node.parent;
            if (term.parent && term.parent.type === nodes.NodeType.BinaryExpression) {
                let expression = term.parent;
                if (expression.parent && expression.parent.type === nodes.NodeType.ListEntry && (<nodes.ListEntry>expression.parent).key === expression) {
                    return null;
                }
            }
    
            let candidateColor = node.getText().toLowerCase();
            if (candidateColor === 'none') {
                return null;
            }
            let colorHex = colors[candidateColor];
            if (colorHex) {
                return colorFromHex(colorHex);
            }
        }
        return null;
    }*/
    function getNumericValue(node, factor) {
        var val = node.getText();
        var m = val.match(/^([-+]?[0-9]*\.?[0-9]+)(%?)$/);
        if (m) {
            if (m[2]) {
                factor = 100.0;
            }
            var result = parseFloat(m[1]) / factor;
            if (result >= 0 && result <= 1) {
                return result;
            }
        }
        throw new Error();
    }
    function getAngle(node) {
        var val = node.getText();
        var m = val.match(/^([-+]?[0-9]*\.?[0-9]+)(deg)?$/);
        if (m) {
            return parseFloat(val) % 360;
        }
        throw new Error();
    }
    function isCommonValue(entry) {
        return entry.browsers.count > 1;
    }
    exports.isCommonValue = isCommonValue;
    function getPageBoxDirectives() {
        return [
            '@bottom-center', '@bottom-left', '@bottom-left-corner', '@bottom-right', '@bottom-right-corner',
            '@left-bottom', '@left-middle', '@left-top', '@right-bottom', '@right-middle', '@right-top',
            '@top-center', '@top-left', '@top-left-corner', '@top-right', '@top-right-corner'
        ];
    }
    exports.getPageBoxDirectives = getPageBoxDirectives;
    function expandEntryStatus(status) {
        switch (status) {
            case 'e':
                return 'experimental';
            case 'n':
                return 'nonstandard';
            case 'o':
                return 'obsolete';
            default:
                return 'standard';
        }
    }
    exports.expandEntryStatus = expandEntryStatus;
    function getEntryStatus(status) {
        switch (status) {
            case 'e':
                return '⚠️ Property is experimental. Be cautious when using it.️\n\n';
            case 'n':
                return '🚨️ Property is nonstandard. Avoid using it.\n\n';
            case 'o':
                return '🚨️️️ Property is obsolete. Avoid using it.\n\n';
            default:
                return '';
        }
    }
    var EntryImpl = /** @class */ (function () {
        function EntryImpl(data) {
            this.data = data;
        }
        Object.defineProperty(EntryImpl.prototype, "name", {
            get: function () {
                return this.data.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntryImpl.prototype, "description", {
            get: function () {
                return this.data.desc;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntryImpl.prototype, "restrictions", {
            get: function () {
                if (this.data.restriction) {
                    return this.data.restriction.split(',').map(function (s) { return s.trim(); });
                }
                else {
                    return [];
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntryImpl.prototype, "status", {
            get: function () {
                return expandEntryStatus(this.data.status);
            },
            enumerable: true,
            configurable: true
        });
        return EntryImpl;
    }());
    var commandsArray = commands.fullCommandList;
    var fullCommandList;
    function getCommands() {
        if (!fullCommandList) {
            fullCommandList = [];
            for (var i = 0; i < commandsArray.length; i++) {
                var rawEntry = {
                    name: commandsArray[i],
                    desc: [
                        "**Command**: " + commandsArray[i],
                    ]
                };
                if (typeof commands.standardCommands[commandsArray[i]] !== "undefined"
                    && commands.standardCommands[commandsArray[i]].desc) {
                    rawEntry.desc.push("```choicescript\n" + commands.standardCommands[commandsArray[i]].desc + "\n```");
                }
                else if (typeof commands.flowCommands[commandsArray[i]] !== "undefined"
                    && commands.flowCommands[commandsArray[i]].desc) {
                    rawEntry.desc.push("```choicescript\n" + commands.flowCommands[commandsArray[i]].desc + "\n```");
                }
                rawEntry.desc.push("Read more on the [wiki](https://choicescriptdev.wikia.com/wiki/" + commandsArray[i] + ")");
                fullCommandList.push(new EntryImpl(rawEntry));
            }
        }
        return fullCommandList;
    }
    exports.getCommands = getCommands;
});
//# sourceMappingURL=languageFacts.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-languageserver-types/main',["require", "exports"], factory);
    }
})(function (require, exports) {
    /* --------------------------------------------------------------------------------------------
     * Copyright (c) Microsoft Corporation. All rights reserved.
     * Licensed under the MIT License. See License.txt in the project root for license information.
     * ------------------------------------------------------------------------------------------ */
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The Position namespace provides helper functions to work with
     * [Position](#Position) literals.
     */
    var Position;
    (function (Position) {
        /**
         * Creates a new Position literal from the given line and character.
         * @param line The position's line.
         * @param character The position's character.
         */
        function create(line, character) {
            return { line: line, character: character };
        }
        Position.create = create;
        /**
         * Checks whether the given liternal conforms to the [Position](#Position) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.objectLiteral(candidate) && Is.number(candidate.line) && Is.number(candidate.character);
        }
        Position.is = is;
    })(Position = exports.Position || (exports.Position = {}));
    /**
     * The Range namespace provides helper functions to work with
     * [Range](#Range) literals.
     */
    var Range;
    (function (Range) {
        function create(one, two, three, four) {
            if (Is.number(one) && Is.number(two) && Is.number(three) && Is.number(four)) {
                return { start: Position.create(one, two), end: Position.create(three, four) };
            }
            else if (Position.is(one) && Position.is(two)) {
                return { start: one, end: two };
            }
            else {
                throw new Error("Range#create called with invalid arguments[" + one + ", " + two + ", " + three + ", " + four + "]");
            }
        }
        Range.create = create;
        /**
         * Checks whether the given literal conforms to the [Range](#Range) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
        }
        Range.is = is;
    })(Range = exports.Range || (exports.Range = {}));
    /**
     * The Location namespace provides helper functions to work with
     * [Location](#Location) literals.
     */
    var Location;
    (function (Location) {
        /**
         * Creates a Location literal.
         * @param uri The location's uri.
         * @param range The location's range.
         */
        function create(uri, range) {
            return { uri: uri, range: range };
        }
        Location.create = create;
        /**
         * Checks whether the given literal conforms to the [Location](#Location) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
        }
        Location.is = is;
    })(Location = exports.Location || (exports.Location = {}));
    /**
     * The Color namespace provides helper functions to work with
     * [Color](#Color) literals.
     */
    var Color;
    (function (Color) {
        /**
         * Creates a new Color literal.
         */
        function create(red, green, blue, alpha) {
            return {
                red: red,
                green: green,
                blue: blue,
                alpha: alpha,
            };
        }
        Color.create = create;
        /**
         * Checks whether the given literal conforms to the [Color](#Color) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.number(candidate.red)
                && Is.number(candidate.green)
                && Is.number(candidate.blue)
                && Is.number(candidate.alpha);
        }
        Color.is = is;
    })(Color = exports.Color || (exports.Color = {}));
    /**
     * The ColorInformation namespace provides helper functions to work with
     * [ColorInformation](#ColorInformation) literals.
     */
    var ColorInformation;
    (function (ColorInformation) {
        /**
         * Creates a new ColorInformation literal.
         */
        function create(range, color) {
            return {
                range: range,
                color: color,
            };
        }
        ColorInformation.create = create;
        /**
         * Checks whether the given literal conforms to the [ColorInformation](#ColorInformation) interface.
         */
        function is(value) {
            var candidate = value;
            return Range.is(candidate.range) && Color.is(candidate.color);
        }
        ColorInformation.is = is;
    })(ColorInformation = exports.ColorInformation || (exports.ColorInformation = {}));
    /**
     * The Color namespace provides helper functions to work with
     * [ColorPresentation](#ColorPresentation) literals.
     */
    var ColorPresentation;
    (function (ColorPresentation) {
        /**
         * Creates a new ColorInformation literal.
         */
        function create(label, textEdit, additionalTextEdits) {
            return {
                label: label,
                textEdit: textEdit,
                additionalTextEdits: additionalTextEdits,
            };
        }
        ColorPresentation.create = create;
        /**
         * Checks whether the given literal conforms to the [ColorInformation](#ColorInformation) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.string(candidate.label)
                && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate))
                && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
        }
        ColorPresentation.is = is;
    })(ColorPresentation = exports.ColorPresentation || (exports.ColorPresentation = {}));
    /**
     * Enum of known range kinds
     */
    var FoldingRangeKind;
    (function (FoldingRangeKind) {
        /**
         * Folding range for a comment
         */
        FoldingRangeKind["Comment"] = "comment";
        /**
         * Folding range for a imports or includes
         */
        FoldingRangeKind["Imports"] = "imports";
        /**
         * Folding range for a region (e.g. `#region`)
         */
        FoldingRangeKind["Region"] = "region";
    })(FoldingRangeKind = exports.FoldingRangeKind || (exports.FoldingRangeKind = {}));
    /**
     * The folding range namespace provides helper functions to work with
     * [FoldingRange](#FoldingRange) literals.
     */
    var FoldingRange;
    (function (FoldingRange) {
        /**
         * Creates a new FoldingRange literal.
         */
        function create(startLine, endLine, startCharacter, endCharacter, kind) {
            var result = {
                startLine: startLine,
                endLine: endLine
            };
            if (Is.defined(startCharacter)) {
                result.startCharacter = startCharacter;
            }
            if (Is.defined(endCharacter)) {
                result.endCharacter = endCharacter;
            }
            if (Is.defined(kind)) {
                result.kind = kind;
            }
            return result;
        }
        FoldingRange.create = create;
        /**
         * Checks whether the given literal conforms to the [FoldingRange](#FoldingRange) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.number(candidate.startLine) && Is.number(candidate.startLine)
                && (Is.undefined(candidate.startCharacter) || Is.number(candidate.startCharacter))
                && (Is.undefined(candidate.endCharacter) || Is.number(candidate.endCharacter))
                && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
        }
        FoldingRange.is = is;
    })(FoldingRange = exports.FoldingRange || (exports.FoldingRange = {}));
    /**
     * The DiagnosticRelatedInformation namespace provides helper functions to work with
     * [DiagnosticRelatedInformation](#DiagnosticRelatedInformation) literals.
     */
    var DiagnosticRelatedInformation;
    (function (DiagnosticRelatedInformation) {
        /**
         * Creates a new DiagnosticRelatedInformation literal.
         */
        function create(location, message) {
            return {
                location: location,
                message: message
            };
        }
        DiagnosticRelatedInformation.create = create;
        /**
         * Checks whether the given literal conforms to the [DiagnosticRelatedInformation](#DiagnosticRelatedInformation) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
        }
        DiagnosticRelatedInformation.is = is;
    })(DiagnosticRelatedInformation = exports.DiagnosticRelatedInformation || (exports.DiagnosticRelatedInformation = {}));
    /**
     * The diagnostic's severity.
     */
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        /**
         * Reports an error.
         */
        DiagnosticSeverity.Error = 1;
        /**
         * Reports a warning.
         */
        DiagnosticSeverity.Warning = 2;
        /**
         * Reports an information.
         */
        DiagnosticSeverity.Information = 3;
        /**
         * Reports a hint.
         */
        DiagnosticSeverity.Hint = 4;
    })(DiagnosticSeverity = exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
    /**
     * The Diagnostic namespace provides helper functions to work with
     * [Diagnostic](#Diagnostic) literals.
     */
    var Diagnostic;
    (function (Diagnostic) {
        /**
         * Creates a new Diagnostic literal.
         */
        function create(range, message, severity, code, source, relatedInformation) {
            var result = { range: range, message: message };
            if (Is.defined(severity)) {
                result.severity = severity;
            }
            if (Is.defined(code)) {
                result.code = code;
            }
            if (Is.defined(source)) {
                result.source = source;
            }
            if (Is.defined(relatedInformation)) {
                result.relatedInformation = relatedInformation;
            }
            return result;
        }
        Diagnostic.create = create;
        /**
         * Checks whether the given literal conforms to the [Diagnostic](#Diagnostic) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate)
                && Range.is(candidate.range)
                && Is.string(candidate.message)
                && (Is.number(candidate.severity) || Is.undefined(candidate.severity))
                && (Is.number(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code))
                && (Is.string(candidate.source) || Is.undefined(candidate.source))
                && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
        }
        Diagnostic.is = is;
    })(Diagnostic = exports.Diagnostic || (exports.Diagnostic = {}));
    /**
     * The Command namespace provides helper functions to work with
     * [Command](#Command) literals.
     */
    var Command;
    (function (Command) {
        /**
         * Creates a new Command literal.
         */
        function create(title, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var result = { title: title, command: command };
            if (Is.defined(args) && args.length > 0) {
                result.arguments = args;
            }
            return result;
        }
        Command.create = create;
        /**
         * Checks whether the given literal conforms to the [Command](#Command) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
        }
        Command.is = is;
    })(Command = exports.Command || (exports.Command = {}));
    /**
     * The TextEdit namespace provides helper function to create replace,
     * insert and delete edits more easily.
     */
    var TextEdit;
    (function (TextEdit) {
        /**
         * Creates a replace text edit.
         * @param range The range of text to be replaced.
         * @param newText The new text.
         */
        function replace(range, newText) {
            return { range: range, newText: newText };
        }
        TextEdit.replace = replace;
        /**
         * Creates a insert text edit.
         * @param position The position to insert the text at.
         * @param newText The text to be inserted.
         */
        function insert(position, newText) {
            return { range: { start: position, end: position }, newText: newText };
        }
        TextEdit.insert = insert;
        /**
         * Creates a delete text edit.
         * @param range The range of text to be deleted.
         */
        function del(range) {
            return { range: range, newText: '' };
        }
        TextEdit.del = del;
        function is(value) {
            var candidate = value;
            return Is.objectLiteral(candidate)
                && Is.string(candidate.newText)
                && Range.is(candidate.range);
        }
        TextEdit.is = is;
    })(TextEdit = exports.TextEdit || (exports.TextEdit = {}));
    /**
     * The TextDocumentEdit namespace provides helper function to create
     * an edit that manipulates a text document.
     */
    var TextDocumentEdit;
    (function (TextDocumentEdit) {
        /**
         * Creates a new `TextDocumentEdit`
         */
        function create(textDocument, edits) {
            return { textDocument: textDocument, edits: edits };
        }
        TextDocumentEdit.create = create;
        function is(value) {
            var candidate = value;
            return Is.defined(candidate)
                && VersionedTextDocumentIdentifier.is(candidate.textDocument)
                && Array.isArray(candidate.edits);
        }
        TextDocumentEdit.is = is;
    })(TextDocumentEdit = exports.TextDocumentEdit || (exports.TextDocumentEdit = {}));
    var WorkspaceEdit;
    (function (WorkspaceEdit) {
        function is(value) {
            var candidate = value;
            return candidate &&
                (candidate.changes !== void 0 || candidate.documentChanges !== void 0) &&
                (candidate.documentChanges === void 0 || Is.typedArray(candidate.documentChanges, TextDocumentEdit.is));
        }
        WorkspaceEdit.is = is;
    })(WorkspaceEdit = exports.WorkspaceEdit || (exports.WorkspaceEdit = {}));
    var TextEditChangeImpl = /** @class */ (function () {
        function TextEditChangeImpl(edits) {
            this.edits = edits;
        }
        TextEditChangeImpl.prototype.insert = function (position, newText) {
            this.edits.push(TextEdit.insert(position, newText));
        };
        TextEditChangeImpl.prototype.replace = function (range, newText) {
            this.edits.push(TextEdit.replace(range, newText));
        };
        TextEditChangeImpl.prototype.delete = function (range) {
            this.edits.push(TextEdit.del(range));
        };
        TextEditChangeImpl.prototype.add = function (edit) {
            this.edits.push(edit);
        };
        TextEditChangeImpl.prototype.all = function () {
            return this.edits;
        };
        TextEditChangeImpl.prototype.clear = function () {
            this.edits.splice(0, this.edits.length);
        };
        return TextEditChangeImpl;
    }());
    /**
     * A workspace change helps constructing changes to a workspace.
     */
    var WorkspaceChange = /** @class */ (function () {
        function WorkspaceChange(workspaceEdit) {
            var _this = this;
            this._textEditChanges = Object.create(null);
            if (workspaceEdit) {
                this._workspaceEdit = workspaceEdit;
                if (workspaceEdit.documentChanges) {
                    workspaceEdit.documentChanges.forEach(function (textDocumentEdit) {
                        var textEditChange = new TextEditChangeImpl(textDocumentEdit.edits);
                        _this._textEditChanges[textDocumentEdit.textDocument.uri] = textEditChange;
                    });
                }
                else if (workspaceEdit.changes) {
                    Object.keys(workspaceEdit.changes).forEach(function (key) {
                        var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
                        _this._textEditChanges[key] = textEditChange;
                    });
                }
            }
        }
        Object.defineProperty(WorkspaceChange.prototype, "edit", {
            /**
             * Returns the underlying [WorkspaceEdit](#WorkspaceEdit) literal
             * use to be returned from a workspace edit operation like rename.
             */
            get: function () {
                return this._workspaceEdit;
            },
            enumerable: true,
            configurable: true
        });
        WorkspaceChange.prototype.getTextEditChange = function (key) {
            if (VersionedTextDocumentIdentifier.is(key)) {
                if (!this._workspaceEdit) {
                    this._workspaceEdit = {
                        documentChanges: []
                    };
                }
                if (!this._workspaceEdit.documentChanges) {
                    throw new Error('Workspace edit is not configured for versioned document changes.');
                }
                var textDocument = key;
                var result = this._textEditChanges[textDocument.uri];
                if (!result) {
                    var edits = [];
                    var textDocumentEdit = {
                        textDocument: textDocument,
                        edits: edits
                    };
                    this._workspaceEdit.documentChanges.push(textDocumentEdit);
                    result = new TextEditChangeImpl(edits);
                    this._textEditChanges[textDocument.uri] = result;
                }
                return result;
            }
            else {
                if (!this._workspaceEdit) {
                    this._workspaceEdit = {
                        changes: Object.create(null)
                    };
                }
                if (!this._workspaceEdit.changes) {
                    throw new Error('Workspace edit is not configured for normal text edit changes.');
                }
                var result = this._textEditChanges[key];
                if (!result) {
                    var edits = [];
                    this._workspaceEdit.changes[key] = edits;
                    result = new TextEditChangeImpl(edits);
                    this._textEditChanges[key] = result;
                }
                return result;
            }
        };
        return WorkspaceChange;
    }());
    exports.WorkspaceChange = WorkspaceChange;
    /**
     * The TextDocumentIdentifier namespace provides helper functions to work with
     * [TextDocumentIdentifier](#TextDocumentIdentifier) literals.
     */
    var TextDocumentIdentifier;
    (function (TextDocumentIdentifier) {
        /**
         * Creates a new TextDocumentIdentifier literal.
         * @param uri The document's uri.
         */
        function create(uri) {
            return { uri: uri };
        }
        TextDocumentIdentifier.create = create;
        /**
         * Checks whether the given literal conforms to the [TextDocumentIdentifier](#TextDocumentIdentifier) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.string(candidate.uri);
        }
        TextDocumentIdentifier.is = is;
    })(TextDocumentIdentifier = exports.TextDocumentIdentifier || (exports.TextDocumentIdentifier = {}));
    /**
     * The VersionedTextDocumentIdentifier namespace provides helper functions to work with
     * [VersionedTextDocumentIdentifier](#VersionedTextDocumentIdentifier) literals.
     */
    var VersionedTextDocumentIdentifier;
    (function (VersionedTextDocumentIdentifier) {
        /**
         * Creates a new VersionedTextDocumentIdentifier literal.
         * @param uri The document's uri.
         * @param uri The document's text.
         */
        function create(uri, version) {
            return { uri: uri, version: version };
        }
        VersionedTextDocumentIdentifier.create = create;
        /**
         * Checks whether the given literal conforms to the [VersionedTextDocumentIdentifier](#VersionedTextDocumentIdentifier) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.string(candidate.uri) && Is.number(candidate.version);
        }
        VersionedTextDocumentIdentifier.is = is;
    })(VersionedTextDocumentIdentifier = exports.VersionedTextDocumentIdentifier || (exports.VersionedTextDocumentIdentifier = {}));
    /**
     * The TextDocumentItem namespace provides helper functions to work with
     * [TextDocumentItem](#TextDocumentItem) literals.
     */
    var TextDocumentItem;
    (function (TextDocumentItem) {
        /**
         * Creates a new TextDocumentItem literal.
         * @param uri The document's uri.
         * @param languageId The document's language identifier.
         * @param version The document's version number.
         * @param text The document's text.
         */
        function create(uri, languageId, version, text) {
            return { uri: uri, languageId: languageId, version: version, text: text };
        }
        TextDocumentItem.create = create;
        /**
         * Checks whether the given literal conforms to the [TextDocumentItem](#TextDocumentItem) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.number(candidate.version) && Is.string(candidate.text);
        }
        TextDocumentItem.is = is;
    })(TextDocumentItem = exports.TextDocumentItem || (exports.TextDocumentItem = {}));
    /**
     * Describes the content type that a client supports in various
     * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
     *
     * Please note that `MarkupKinds` must not start with a `$`. This kinds
     * are reserved for internal usage.
     */
    var MarkupKind;
    (function (MarkupKind) {
        /**
         * Plain text is supported as a content format
         */
        MarkupKind.PlainText = 'plaintext';
        /**
         * Markdown is supported as a content format
         */
        MarkupKind.Markdown = 'markdown';
    })(MarkupKind = exports.MarkupKind || (exports.MarkupKind = {}));
    (function (MarkupKind) {
        /**
         * Checks whether the given value is a value of the [MarkupKind](#MarkupKind) type.
         */
        function is(value) {
            var candidate = value;
            return candidate === MarkupKind.PlainText || candidate === MarkupKind.Markdown;
        }
        MarkupKind.is = is;
    })(MarkupKind = exports.MarkupKind || (exports.MarkupKind = {}));
    var MarkupContent;
    (function (MarkupContent) {
        /**
         * Checks whether the given value conforms to the [MarkupContent](#MarkupContent) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
        }
        MarkupContent.is = is;
    })(MarkupContent = exports.MarkupContent || (exports.MarkupContent = {}));
    /**
     * The kind of a completion entry.
     */
    var CompletionItemKind;
    (function (CompletionItemKind) {
        CompletionItemKind.Text = 1;
        CompletionItemKind.Method = 2;
        CompletionItemKind.Function = 3;
        CompletionItemKind.Constructor = 4;
        CompletionItemKind.Field = 5;
        CompletionItemKind.Variable = 6;
        CompletionItemKind.Class = 7;
        CompletionItemKind.Interface = 8;
        CompletionItemKind.Module = 9;
        CompletionItemKind.Property = 10;
        CompletionItemKind.Unit = 11;
        CompletionItemKind.Value = 12;
        CompletionItemKind.Enum = 13;
        CompletionItemKind.Keyword = 14;
        CompletionItemKind.Snippet = 15;
        CompletionItemKind.Color = 16;
        CompletionItemKind.File = 17;
        CompletionItemKind.Reference = 18;
        CompletionItemKind.Folder = 19;
        CompletionItemKind.EnumMember = 20;
        CompletionItemKind.Constant = 21;
        CompletionItemKind.Struct = 22;
        CompletionItemKind.Event = 23;
        CompletionItemKind.Operator = 24;
        CompletionItemKind.TypeParameter = 25;
    })(CompletionItemKind = exports.CompletionItemKind || (exports.CompletionItemKind = {}));
    /**
     * Defines whether the insert text in a completion item should be interpreted as
     * plain text or a snippet.
     */
    var InsertTextFormat;
    (function (InsertTextFormat) {
        /**
         * The primary text to be inserted is treated as a plain string.
         */
        InsertTextFormat.PlainText = 1;
        /**
         * The primary text to be inserted is treated as a snippet.
         *
         * A snippet can define tab stops and placeholders with `$1`, `$2`
         * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
         * the end of the snippet. Placeholders with equal identifiers are linked,
         * that is typing in one will update others too.
         *
         * See also: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/snippet/common/snippet.md
         */
        InsertTextFormat.Snippet = 2;
    })(InsertTextFormat = exports.InsertTextFormat || (exports.InsertTextFormat = {}));
    /**
     * The CompletionItem namespace provides functions to deal with
     * completion items.
     */
    var CompletionItem;
    (function (CompletionItem) {
        /**
         * Create a completion item and seed it with a label.
         * @param label The completion item's label
         */
        function create(label) {
            return { label: label };
        }
        CompletionItem.create = create;
    })(CompletionItem = exports.CompletionItem || (exports.CompletionItem = {}));
    /**
     * The CompletionList namespace provides functions to deal with
     * completion lists.
     */
    var CompletionList;
    (function (CompletionList) {
        /**
         * Creates a new completion list.
         *
         * @param items The completion items.
         * @param isIncomplete The list is not complete.
         */
        function create(items, isIncomplete) {
            return { items: items ? items : [], isIncomplete: !!isIncomplete };
        }
        CompletionList.create = create;
    })(CompletionList = exports.CompletionList || (exports.CompletionList = {}));
    var MarkedString;
    (function (MarkedString) {
        /**
         * Creates a marked string from plain text.
         *
         * @param plainText The plain text.
         */
        function fromPlainText(plainText) {
            return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&"); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
        }
        MarkedString.fromPlainText = fromPlainText;
        /**
         * Checks whether the given value conforms to the [MarkedString](#MarkedString) type.
         */
        function is(value) {
            var candidate = value;
            return Is.string(candidate) || (Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value));
        }
        MarkedString.is = is;
    })(MarkedString = exports.MarkedString || (exports.MarkedString = {}));
    var Hover;
    (function (Hover) {
        /**
         * Checks whether the given value conforms to the [Hover](#Hover) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) ||
                MarkedString.is(candidate.contents) ||
                Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
        }
        Hover.is = is;
    })(Hover = exports.Hover || (exports.Hover = {}));
    /**
     * The ParameterInformation namespace provides helper functions to work with
     * [ParameterInformation](#ParameterInformation) literals.
     */
    var ParameterInformation;
    (function (ParameterInformation) {
        /**
         * Creates a new parameter information literal.
         *
         * @param label A label string.
         * @param documentation A doc string.
         */
        function create(label, documentation) {
            return documentation ? { label: label, documentation: documentation } : { label: label };
        }
        ParameterInformation.create = create;
        ;
    })(ParameterInformation = exports.ParameterInformation || (exports.ParameterInformation = {}));
    /**
     * The SignatureInformation namespace provides helper functions to work with
     * [SignatureInformation](#SignatureInformation) literals.
     */
    var SignatureInformation;
    (function (SignatureInformation) {
        function create(label, documentation) {
            var parameters = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                parameters[_i - 2] = arguments[_i];
            }
            var result = { label: label };
            if (Is.defined(documentation)) {
                result.documentation = documentation;
            }
            if (Is.defined(parameters)) {
                result.parameters = parameters;
            }
            else {
                result.parameters = [];
            }
            return result;
        }
        SignatureInformation.create = create;
    })(SignatureInformation = exports.SignatureInformation || (exports.SignatureInformation = {}));
    /**
     * A document highlight kind.
     */
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        /**
         * A textual occurrence.
         */
        DocumentHighlightKind.Text = 1;
        /**
         * Read-access of a symbol, like reading a variable.
         */
        DocumentHighlightKind.Read = 2;
        /**
         * Write-access of a symbol, like writing to a variable.
         */
        DocumentHighlightKind.Write = 3;
    })(DocumentHighlightKind = exports.DocumentHighlightKind || (exports.DocumentHighlightKind = {}));
    /**
     * DocumentHighlight namespace to provide helper functions to work with
     * [DocumentHighlight](#DocumentHighlight) literals.
     */
    var DocumentHighlight;
    (function (DocumentHighlight) {
        /**
         * Create a DocumentHighlight object.
         * @param range The range the highlight applies to.
         */
        function create(range, kind) {
            var result = { range: range };
            if (Is.number(kind)) {
                result.kind = kind;
            }
            return result;
        }
        DocumentHighlight.create = create;
    })(DocumentHighlight = exports.DocumentHighlight || (exports.DocumentHighlight = {}));
    /**
     * A symbol kind.
     */
    var SymbolKind;
    (function (SymbolKind) {
        SymbolKind.File = 1;
        SymbolKind.Module = 2;
        SymbolKind.Namespace = 3;
        SymbolKind.Package = 4;
        SymbolKind.Class = 5;
        SymbolKind.Method = 6;
        SymbolKind.Property = 7;
        SymbolKind.Field = 8;
        SymbolKind.Constructor = 9;
        SymbolKind.Enum = 10;
        SymbolKind.Interface = 11;
        SymbolKind.Function = 12;
        SymbolKind.Variable = 13;
        SymbolKind.Constant = 14;
        SymbolKind.String = 15;
        SymbolKind.Number = 16;
        SymbolKind.Boolean = 17;
        SymbolKind.Array = 18;
        SymbolKind.Object = 19;
        SymbolKind.Key = 20;
        SymbolKind.Null = 21;
        SymbolKind.EnumMember = 22;
        SymbolKind.Struct = 23;
        SymbolKind.Event = 24;
        SymbolKind.Operator = 25;
        SymbolKind.TypeParameter = 26;
    })(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
    var SymbolInformation;
    (function (SymbolInformation) {
        /**
         * Creates a new symbol information literal.
         *
         * @param name The name of the symbol.
         * @param kind The kind of the symbol.
         * @param range The range of the location of the symbol.
         * @param uri The resource of the location of symbol, defaults to the current document.
         * @param containerName The name of the symbol containing the symbol.
         */
        function create(name, kind, range, uri, containerName) {
            var result = {
                name: name,
                kind: kind,
                location: { uri: uri, range: range }
            };
            if (containerName) {
                result.containerName = containerName;
            }
            return result;
        }
        SymbolInformation.create = create;
    })(SymbolInformation = exports.SymbolInformation || (exports.SymbolInformation = {}));
    /**
     * Represents programming constructs like variables, classes, interfaces etc.
     * that appear in a document. Document symbols can be hierarchical and they
     * have two ranges: one that encloses its definition and one that points to
     * its most interesting range, e.g. the range of an identifier.
     */
    var DocumentSymbol = /** @class */ (function () {
        function DocumentSymbol() {
        }
        return DocumentSymbol;
    }());
    exports.DocumentSymbol = DocumentSymbol;
    (function (DocumentSymbol) {
        /**
         * Creates a new symbol information literal.
         *
         * @param name The name of the symbol.
         * @param detail The detail of the symbol.
         * @param kind The kind of the symbol.
         * @param range The range of the symbol.
         * @param selectionRange The selectionRange of the symbol.
         * @param children Children of the symbol.
         */
        function create(name, detail, kind, range, selectionRange, children) {
            var result = {
                name: name,
                detail: detail,
                kind: kind,
                range: range,
                selectionRange: selectionRange
            };
            if (children !== void 0) {
                result.children = children;
            }
            return result;
        }
        DocumentSymbol.create = create;
        /**
         * Checks whether the given literal conforms to the [DocumentSymbol](#DocumentSymbol) interface.
         */
        function is(value) {
            var candidate = value;
            return candidate &&
                Is.string(candidate.name) && Is.string(candidate.detail) && Is.number(candidate.kind) &&
                Range.is(candidate.range) && Range.is(candidate.selectionRange) &&
                (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) &&
                (candidate.children === void 0 || Array.isArray(candidate.children));
        }
        DocumentSymbol.is = is;
    })(DocumentSymbol = exports.DocumentSymbol || (exports.DocumentSymbol = {}));
    exports.DocumentSymbol = DocumentSymbol;
    /**
     * A set of predefined code action kinds
     */
    var CodeActionKind;
    (function (CodeActionKind) {
        /**
         * Base kind for quickfix actions: 'quickfix'
         */
        CodeActionKind.QuickFix = 'quickfix';
        /**
         * Base kind for refactoring actions: 'refactor'
         */
        CodeActionKind.Refactor = 'refactor';
        /**
         * Base kind for refactoring extraction actions: 'refactor.extract'
         *
         * Example extract actions:
         *
         * - Extract method
         * - Extract function
         * - Extract variable
         * - Extract interface from class
         * - ...
         */
        CodeActionKind.RefactorExtract = 'refactor.extract';
        /**
         * Base kind for refactoring inline actions: 'refactor.inline'
         *
         * Example inline actions:
         *
         * - Inline function
         * - Inline variable
         * - Inline constant
         * - ...
         */
        CodeActionKind.RefactorInline = 'refactor.inline';
        /**
         * Base kind for refactoring rewrite actions: 'refactor.rewrite'
         *
         * Example rewrite actions:
         *
         * - Convert JavaScript function to class
         * - Add or remove parameter
         * - Encapsulate field
         * - Make method static
         * - Move method to base class
         * - ...
         */
        CodeActionKind.RefactorRewrite = 'refactor.rewrite';
        /**
         * Base kind for source actions: `source`
         *
         * Source code actions apply to the entire file.
         */
        CodeActionKind.Source = 'source';
        /**
         * Base kind for an organize imports source action: `source.organizeImports`
         */
        CodeActionKind.SourceOrganizeImports = 'source.organizeImports';
    })(CodeActionKind = exports.CodeActionKind || (exports.CodeActionKind = {}));
    /**
     * The CodeActionContext namespace provides helper functions to work with
     * [CodeActionContext](#CodeActionContext) literals.
     */
    var CodeActionContext;
    (function (CodeActionContext) {
        /**
         * Creates a new CodeActionContext literal.
         */
        function create(diagnostics, only) {
            var result = { diagnostics: diagnostics };
            if (only !== void 0 && only !== null) {
                result.only = only;
            }
            return result;
        }
        CodeActionContext.create = create;
        /**
         * Checks whether the given literal conforms to the [CodeActionContext](#CodeActionContext) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string));
        }
        CodeActionContext.is = is;
    })(CodeActionContext = exports.CodeActionContext || (exports.CodeActionContext = {}));
    var CodeAction;
    (function (CodeAction) {
        function create(title, commandOrEdit, kind) {
            var result = { title: title };
            if (Command.is(commandOrEdit)) {
                result.command = commandOrEdit;
            }
            else {
                result.edit = commandOrEdit;
            }
            if (kind !== void null) {
                result.kind = kind;
            }
            return result;
        }
        CodeAction.create = create;
        function is(value) {
            var candidate = value;
            return candidate && Is.string(candidate.title) &&
                (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) &&
                (candidate.kind === void 0 || Is.string(candidate.kind)) &&
                (candidate.edit !== void 0 || candidate.command !== void 0) &&
                (candidate.command === void 0 || Command.is(candidate.command)) &&
                (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
        }
        CodeAction.is = is;
    })(CodeAction = exports.CodeAction || (exports.CodeAction = {}));
    /**
     * The CodeLens namespace provides helper functions to work with
     * [CodeLens](#CodeLens) literals.
     */
    var CodeLens;
    (function (CodeLens) {
        /**
         * Creates a new CodeLens literal.
         */
        function create(range, data) {
            var result = { range: range };
            if (Is.defined(data))
                result.data = data;
            return result;
        }
        CodeLens.create = create;
        /**
         * Checks whether the given literal conforms to the [CodeLens](#CodeLens) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
        }
        CodeLens.is = is;
    })(CodeLens = exports.CodeLens || (exports.CodeLens = {}));
    /**
     * The FormattingOptions namespace provides helper functions to work with
     * [FormattingOptions](#FormattingOptions) literals.
     */
    var FormattingOptions;
    (function (FormattingOptions) {
        /**
         * Creates a new FormattingOptions literal.
         */
        function create(tabSize, insertSpaces) {
            return { tabSize: tabSize, insertSpaces: insertSpaces };
        }
        FormattingOptions.create = create;
        /**
         * Checks whether the given literal conforms to the [FormattingOptions](#FormattingOptions) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.number(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
        }
        FormattingOptions.is = is;
    })(FormattingOptions = exports.FormattingOptions || (exports.FormattingOptions = {}));
    /**
     * A document link is a range in a text document that links to an internal or external resource, like another
     * text document or a web site.
     */
    var DocumentLink = /** @class */ (function () {
        function DocumentLink() {
        }
        return DocumentLink;
    }());
    exports.DocumentLink = DocumentLink;
    /**
     * The DocumentLink namespace provides helper functions to work with
     * [DocumentLink](#DocumentLink) literals.
     */
    (function (DocumentLink) {
        /**
         * Creates a new DocumentLink literal.
         */
        function create(range, target, data) {
            return { range: range, target: target, data: data };
        }
        DocumentLink.create = create;
        /**
         * Checks whether the given literal conforms to the [DocumentLink](#DocumentLink) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
        }
        DocumentLink.is = is;
    })(DocumentLink = exports.DocumentLink || (exports.DocumentLink = {}));
    exports.DocumentLink = DocumentLink;
    exports.EOL = ['\n', '\r\n', '\r'];
    var TextDocument;
    (function (TextDocument) {
        /**
         * Creates a new ITextDocument literal from the given uri and content.
         * @param uri The document's uri.
         * @param languageId  The document's language Id.
         * @param content The document's content.
         */
        function create(uri, languageId, version, content) {
            return new FullTextDocument(uri, languageId, version, content);
        }
        TextDocument.create = create;
        /**
         * Checks whether the given literal conforms to the [ITextDocument](#ITextDocument) interface.
         */
        function is(value) {
            var candidate = value;
            return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.number(candidate.lineCount)
                && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
        }
        TextDocument.is = is;
        function applyEdits(document, edits) {
            var text = document.getText();
            var sortedEdits = mergeSort(edits, function (a, b) {
                var diff = a.range.start.line - b.range.start.line;
                if (diff === 0) {
                    return a.range.start.character - b.range.start.character;
                }
                return diff;
            });
            var lastModifiedOffset = text.length;
            for (var i = sortedEdits.length - 1; i >= 0; i--) {
                var e = sortedEdits[i];
                var startOffset = document.offsetAt(e.range.start);
                var endOffset = document.offsetAt(e.range.end);
                if (endOffset <= lastModifiedOffset) {
                    text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
                }
                else {
                    throw new Error('Ovelapping edit');
                }
                lastModifiedOffset = startOffset;
            }
            return text;
        }
        TextDocument.applyEdits = applyEdits;
        function mergeSort(data, compare) {
            if (data.length <= 1) {
                // sorted
                return data;
            }
            var p = (data.length / 2) | 0;
            var left = data.slice(0, p);
            var right = data.slice(p);
            mergeSort(left, compare);
            mergeSort(right, compare);
            var leftIdx = 0;
            var rightIdx = 0;
            var i = 0;
            while (leftIdx < left.length && rightIdx < right.length) {
                var ret = compare(left[leftIdx], right[rightIdx]);
                if (ret <= 0) {
                    // smaller_equal -> take left to preserve order
                    data[i++] = left[leftIdx++];
                }
                else {
                    // greater -> take right
                    data[i++] = right[rightIdx++];
                }
            }
            while (leftIdx < left.length) {
                data[i++] = left[leftIdx++];
            }
            while (rightIdx < right.length) {
                data[i++] = right[rightIdx++];
            }
            return data;
        }
    })(TextDocument = exports.TextDocument || (exports.TextDocument = {}));
    /**
     * Represents reasons why a text document is saved.
     */
    var TextDocumentSaveReason;
    (function (TextDocumentSaveReason) {
        /**
         * Manually triggered, e.g. by the user pressing save, by starting debugging,
         * or by an API call.
         */
        TextDocumentSaveReason.Manual = 1;
        /**
         * Automatic after a delay.
         */
        TextDocumentSaveReason.AfterDelay = 2;
        /**
         * When the editor lost focus.
         */
        TextDocumentSaveReason.FocusOut = 3;
    })(TextDocumentSaveReason = exports.TextDocumentSaveReason || (exports.TextDocumentSaveReason = {}));
    var FullTextDocument = /** @class */ (function () {
        function FullTextDocument(uri, languageId, version, content) {
            this._uri = uri;
            this._languageId = languageId;
            this._version = version;
            this._content = content;
            this._lineOffsets = null;
        }
        Object.defineProperty(FullTextDocument.prototype, "uri", {
            get: function () {
                return this._uri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FullTextDocument.prototype, "languageId", {
            get: function () {
                return this._languageId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FullTextDocument.prototype, "version", {
            get: function () {
                return this._version;
            },
            enumerable: true,
            configurable: true
        });
        FullTextDocument.prototype.getText = function (range) {
            if (range) {
                var start = this.offsetAt(range.start);
                var end = this.offsetAt(range.end);
                return this._content.substring(start, end);
            }
            return this._content;
        };
        FullTextDocument.prototype.update = function (event, version) {
            this._content = event.text;
            this._version = version;
            this._lineOffsets = null;
        };
        FullTextDocument.prototype.getLineOffsets = function () {
            if (this._lineOffsets === null) {
                var lineOffsets = [];
                var text = this._content;
                var isLineStart = true;
                for (var i = 0; i < text.length; i++) {
                    if (isLineStart) {
                        lineOffsets.push(i);
                        isLineStart = false;
                    }
                    var ch = text.charAt(i);
                    isLineStart = (ch === '\r' || ch === '\n');
                    if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
                        i++;
                    }
                }
                if (isLineStart && text.length > 0) {
                    lineOffsets.push(text.length);
                }
                this._lineOffsets = lineOffsets;
            }
            return this._lineOffsets;
        };
        FullTextDocument.prototype.positionAt = function (offset) {
            offset = Math.max(Math.min(offset, this._content.length), 0);
            var lineOffsets = this.getLineOffsets();
            var low = 0, high = lineOffsets.length;
            if (high === 0) {
                return Position.create(0, offset);
            }
            while (low < high) {
                var mid = Math.floor((low + high) / 2);
                if (lineOffsets[mid] > offset) {
                    high = mid;
                }
                else {
                    low = mid + 1;
                }
            }
            // low is the least x for which the line offset is larger than the current offset
            // or array.length if no line offset is larger than the current offset
            var line = low - 1;
            return Position.create(line, offset - lineOffsets[line]);
        };
        FullTextDocument.prototype.offsetAt = function (position) {
            var lineOffsets = this.getLineOffsets();
            if (position.line >= lineOffsets.length) {
                return this._content.length;
            }
            else if (position.line < 0) {
                return 0;
            }
            var lineOffset = lineOffsets[position.line];
            var nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : this._content.length;
            return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
        };
        Object.defineProperty(FullTextDocument.prototype, "lineCount", {
            get: function () {
                return this.getLineOffsets().length;
            },
            enumerable: true,
            configurable: true
        });
        return FullTextDocument;
    }());
    var Is;
    (function (Is) {
        var toString = Object.prototype.toString;
        function defined(value) {
            return typeof value !== 'undefined';
        }
        Is.defined = defined;
        function undefined(value) {
            return typeof value === 'undefined';
        }
        Is.undefined = undefined;
        function boolean(value) {
            return value === true || value === false;
        }
        Is.boolean = boolean;
        function string(value) {
            return toString.call(value) === '[object String]';
        }
        Is.string = string;
        function number(value) {
            return toString.call(value) === '[object Number]';
        }
        Is.number = number;
        function func(value) {
            return toString.call(value) === '[object Function]';
        }
        Is.func = func;
        function objectLiteral(value) {
            // Strictly speaking class instances pass this check as well. Since the LSP
            // doesn't use classes we ignore this for now. If we do we need to add something
            // like this: `Object.getPrototypeOf(Object.getPrototypeOf(x)) === null`
            return value !== null && typeof value === 'object';
        }
        Is.objectLiteral = objectLiteral;
        function typedArray(value, check) {
            return Array.isArray(value) && value.every(check);
        }
        Is.typedArray = typedArray;
    })(Is || (Is = {}));
});

define('vscode-languageserver-types', ['vscode-languageserver-types/main'], function (main) { return main; });

(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/typo/typo',["require", "exports"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Element = /** @class */ (function () {
        function Element(text, data) {
            this.name = text;
            this.node = data;
        }
        return Element;
	}());
		
	/**
	 * Typo is a JavaScript implementation of a spellchecker using hunspell-style 
	 * dictionaries.
	 */

	/**
	 * Typo constructor.
	 *
	 * @param {String} [dictionary] The locale code of the dictionary being used. e.g.,
	 *                              "en_US". This is only used to auto-load dictionaries.
	 * @param {String} [affData] The data from the dictionary's .aff file. If omitted
	 *                           and the first argument is supplied, in "chrome" platform,
	 *                           the .aff file will be loaded automatically from
	 *                           lib/typo/dictionaries/[dictionary]/[dictionary].aff
	 *                           In other platform, it will be loaded from
	 *                           [setting.path]/dictionaries/[dictionary]/[dictionary].aff
	 * @param {String} [wordsData] The data from the dictionary's .dic file. If omitted,
	 *                           and the first argument is supplied, in "chrome" platform,
	 *                           the .dic file will be loaded automatically from
	 *                           lib/typo/dictionaries/[dictionary]/[dictionary].dic
	 *                           In other platform, it will be loaded from
	 *                           [setting.path]/dictionaries/[dictionary]/[dictionary].dic
	 * @param {Object} [settings] Constructor settings. Available properties are:
	 *                            {String} [platform]: "chrome" for Chrome Extension or other
	 *                              value for the usual web.
	 *                            {String} [path]: path to load dictionary from in non-chrome
	 *                              environment.
	 *                            {Object} [flags]: flag information.
	 *
	 *
	 * @returns {Typo} A Typo object.
	 */

	var Typo = function (dictionary, affData, wordsData, settings) {
		settings = settings || {};
		
		/** Determines the method used for auto-loading .aff and .dic files. **/
		this.platform = settings.platform || "chrome"; 
		
		this.dictionary = null;
		
		this.rules = {};
		this.dictionaryTable = {};
		
		this.compoundRules = [];
		this.compoundRuleCodes = {};
		
		this.replacementTable = [];
		
		this.flags = settings.flags || {}; 
		
		if (dictionary) {
			this.dictionary = dictionary;
			
			if (this.platform == "chrome") {
				if (!affData) affData = this._readFile(chrome.extension.getURL("lib/typo/dictionaries/" + dictionary + "/" + dictionary + ".aff"));
				if (!wordsData) wordsData = this._readFile(chrome.extension.getURL("lib/typo/dictionaries/" + dictionary + "/" + dictionary + ".dic"));
			} else {
				var path = settings.dictionaryPath || '';
				
				if (!affData) affData = this._readFile(path + "/" + dictionary + "/" + dictionary + ".aff");
				if (!wordsData) wordsData = this._readFile(path + "/" + dictionary + "/" + dictionary + ".dic");
			}
			
			this.rules = this._parseAFF(affData);
			
			// Save the rule codes that are used in compound rules.
			this.compoundRuleCodes = {};
			
			for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
				var rule = this.compoundRules[i];
				
				for (var j = 0, _jlen = rule.length; j < _jlen; j++) {
					this.compoundRuleCodes[rule[j]] = [];
				}
			}
			
			// If we add this ONLYINCOMPOUND flag to this.compoundRuleCodes, then _parseDIC
			// will do the work of saving the list of words that are compound-only.
			if ("ONLYINCOMPOUND" in this.flags) {
				this.compoundRuleCodes[this.flags.ONLYINCOMPOUND] = [];
			}
			
			this.dictionaryTable = this._parseDIC(wordsData);
			
			// Get rid of any codes from the compound rule codes that are never used 
			// (or that were special regex characters).  Not especially necessary... 
			for (var i in this.compoundRuleCodes) {
				if (this.compoundRuleCodes[i].length == 0) {
					delete this.compoundRuleCodes[i];
				}
			}
			
			// Build the full regular expressions for each compound rule.
			// I have a feeling (but no confirmation yet) that this method of 
			// testing for compound words is probably slow.
			for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
				var ruleText = this.compoundRules[i];
				
				var expressionText = "";
				
				for (var j = 0, _jlen = ruleText.length; j < _jlen; j++) {
					var character = ruleText[j];
					
					if (character in this.compoundRuleCodes) {
						expressionText += "(" + this.compoundRuleCodes[character].join("|") + ")";
					}
					else {
						expressionText += character;
					}
				}
				
				this.compoundRules[i] = new RegExp(expressionText, "i");
			}
		}
		
		return this;
	};

	Typo.prototype = {
		/**
		 * Loads a Typo instance from a hash of all of the Typo properties.
		 *
		 * @param object obj A hash of Typo properties, probably gotten from a JSON.parse(JSON.stringify(typo_instance)).
		 */
		
		load : function (obj) {
			for (var i in obj) {
				this[i] = obj[i];
			}
			
			return this;
		},
		
		/**
		 * Read the contents of a file.
		 * 
		 * @param {String} path The path (relative) to the file.
		 * @param {String} [charset="ISO8859-1"] The expected charset of the file
		 * @returns string The file data.
		 */
		
		_readFile : function (path, charset) {
			if (!charset) charset = "ISO8859-1";
			
			var req = new XMLHttpRequest();
			req.open("GET", path, false);
			
			if (req.overrideMimeType)
				req.overrideMimeType("text/plain; charset=" + charset);
			
			req.send(null);
			return req.responseText;
		},
		
		/**
		 * Parse the rules out from a .aff file.
		 *
		 * @param {String} data The contents of the affix file.
		 * @returns object The rules from the file.
		 */
		
		_parseAFF : function (data) {
			var rules = {};
			
			// Remove comment lines
			data = this._removeAffixComments(data);
			
			var lines = data.split("\n");
			
			for (var i = 0, _len = lines.length; i < _len; i++) {
				var line = lines[i];
				
				var definitionParts = line.split(/\s+/);
				
				var ruleType = definitionParts[0];
				
				if (ruleType == "PFX" || ruleType == "SFX") {
					var ruleCode = definitionParts[1];
					var combineable = definitionParts[2];
					var numEntries = parseInt(definitionParts[3], 10);
					
					var entries = [];
					
					for (var j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
						var line = lines[j];
						
						var lineParts = line.split(/\s+/);
						var charactersToRemove = lineParts[2];
						
						var additionParts = lineParts[3].split("/");
						
						var charactersToAdd = additionParts[0];
						if (charactersToAdd === "0") charactersToAdd = "";
						
						var continuationClasses = this.parseRuleCodes(additionParts[1]);
						
						var regexToMatch = lineParts[4];
						
						var entry = {};
						entry.add = charactersToAdd;
						
						if (continuationClasses.length > 0) entry.continuationClasses = continuationClasses;
						
						if (regexToMatch !== ".") {
							if (ruleType === "SFX") {
								entry.match = new RegExp(regexToMatch + "$");
							}
							else {
								entry.match = new RegExp("^" + regexToMatch);
							}
						}
						
						if (charactersToRemove != "0") {
							if (ruleType === "SFX") {
								entry.remove = new RegExp(charactersToRemove  + "$");
							}
							else {
								entry.remove = charactersToRemove;
							}
						}
						
						entries.push(entry);
					}
					
					rules[ruleCode] = { "type" : ruleType, "combineable" : (combineable == "Y"), "entries" : entries };
					
					i += numEntries;
				}
				else if (ruleType === "COMPOUNDRULE") {
					var numEntries = parseInt(definitionParts[1], 10);
					
					for (var j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
						var line = lines[j];
						
						var lineParts = line.split(/\s+/);
						this.compoundRules.push(lineParts[1]);
					}
					
					i += numEntries;
				}
				else if (ruleType === "REP") {
					var lineParts = line.split(/\s+/);
					
					if (lineParts.length === 3) {
						this.replacementTable.push([ lineParts[1], lineParts[2] ]);
					}
				}
				else {
					// ONLYINCOMPOUND
					// COMPOUNDMIN
					// FLAG
					// KEEPCASE
					// NEEDAFFIX
					
					this.flags[ruleType] = definitionParts[1];
				}
			}
			
			return rules;
		},
		
		/**
		 * Removes comment lines and then cleans up blank lines and trailing whitespace.
		 *
		 * @param {String} data The data from an affix file.
		 * @return {String} The cleaned-up data.
		 */
		
		_removeAffixComments : function (data) {
			// Remove comments
			data = data.replace(/#.*$/mg, "");
			
			// Trim each line
			data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');
			
			// Remove blank lines.
			data = data.replace(/\n{2,}/g, "\n");
			
			// Trim the entire string
			data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			
			return data;
		},
		
		/**
		 * Parses the words out from the .dic file.
		 *
		 * @param {String} data The data from the dictionary file.
		 * @returns object The lookup table containing all of the words and
		 *                 word forms from the dictionary.
		 */
		
		_parseDIC : function (data) {
			data = this._removeDicComments(data);
			
			var lines = data.split("\n");
			var dictionaryTable = {};
			
			function addWord(word, rules) {
				// Some dictionaries will list the same word multiple times with different rule sets.
				if (!(word in dictionaryTable) || typeof dictionaryTable[word] != 'object') {
					dictionaryTable[word] = [];
				}
				
				dictionaryTable[word].push(rules);
			}
			
			// The first line is the number of words in the dictionary.
			for (var i = 1, _len = lines.length; i < _len; i++) {
				var line = lines[i];
				
				var parts = line.split("/", 2);
				
				var word = parts[0];

				// Now for each affix rule, generate that form of the word.
				if (parts.length > 1) {
					var ruleCodesArray = this.parseRuleCodes(parts[1]);
					
					// Save the ruleCodes for compound word situations.
					if (!("NEEDAFFIX" in this.flags) || ruleCodesArray.indexOf(this.flags.NEEDAFFIX) == -1) {
						addWord(word, ruleCodesArray);
					}
					
					for (var j = 0, _jlen = ruleCodesArray.length; j < _jlen; j++) {
						var code = ruleCodesArray[j];
						
						var rule = this.rules[code];
						
						if (rule) {
							var newWords = this._applyRule(word, rule);
							
							for (var ii = 0, _iilen = newWords.length; ii < _iilen; ii++) {
								var newWord = newWords[ii];
								
								addWord(newWord, []);
								
								if (rule.combineable) {
									for (var k = j + 1; k < _jlen; k++) {
										var combineCode = ruleCodesArray[k];
										
										var combineRule = this.rules[combineCode];
										
										if (combineRule) {
											if (combineRule.combineable && (rule.type != combineRule.type)) {
												var otherNewWords = this._applyRule(newWord, combineRule);
												
												for (var iii = 0, _iiilen = otherNewWords.length; iii < _iiilen; iii++) {
													var otherNewWord = otherNewWords[iii];
													addWord(otherNewWord, []);
												}
											}
										}
									}
								}
							}
						}
						
						if (code in this.compoundRuleCodes) {
							this.compoundRuleCodes[code].push(word);
						}
					}
				}
				else {
					addWord(word, []);
				}
			}
			
			return dictionaryTable;
		},
		
		
		/**
		 * Removes comment lines and then cleans up blank lines and trailing whitespace.
		 *
		 * @param {String} data The data from a .dic file.
		 * @return {String} The cleaned-up data.
		 */
		
		_removeDicComments : function (data) {
			// I can't find any official documentation on it, but at least the de_DE
			// dictionary uses tab-indented lines as comments.
			
			// Remove comments
			data = data.replace(/^\t.*$/mg, "");
			
			return data;
			
			// Trim each line
			data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');
			
			// Remove blank lines.
			data = data.replace(/\n{2,}/g, "\n");
			
			// Trim the entire string
			data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			
			return data;
		},
		
		parseRuleCodes : function (textCodes) {
			if (!textCodes) {
				return [];
			}
			else if (!("FLAG" in this.flags)) {
				return textCodes.split("");
			}
			else if (this.flags.FLAG === "long") {
				var flags = [];
				
				for (var i = 0, _len = textCodes.length; i < _len; i += 2) {
					flags.push(textCodes.substr(i, 2));
				}
				
				return flags;
			}
			else if (this.flags.FLAG === "num") {
				return textCode.split(",");
			}
		},
		
		/**
		 * Applies an affix rule to a word.
		 *
		 * @param {String} word The base word.
		 * @param {Object} rule The affix rule.
		 * @returns {String[]} The new words generated by the rule.
		 */
		
		_applyRule : function (word, rule) {
			var entries = rule.entries;
			var newWords = [];
			
			for (var i = 0, _len = entries.length; i < _len; i++) {
				var entry = entries[i];
				
				if (!entry.match || word.match(entry.match)) {
					var newWord = word;
					
					if (entry.remove) {
						newWord = newWord.replace(entry.remove, "");
					}
					
					if (rule.type === "SFX") {
						newWord = newWord + entry.add;
					}
					else {
						newWord = entry.add + newWord;
					}
					
					newWords.push(newWord);
					
					if ("continuationClasses" in entry) {
						for (var j = 0, _jlen = entry.continuationClasses.length; j < _jlen; j++) {
							var continuationRule = this.rules[entry.continuationClasses[j]];
							
							if (continuationRule) {
								newWords = newWords.concat(this._applyRule(newWord, continuationRule));
							}
							/*
							else {
								// This shouldn't happen, but it does, at least in the de_DE dictionary.
								// I think the author mistakenly supplied lower-case rule codes instead 
								// of upper-case.
							}
							*/
						}
					}
				}
			}
			
			return newWords;
		},
		
		/**
		 * Checks whether a word or a capitalization variant exists in the current dictionary.
		 * The word is trimmed and several variations of capitalizations are checked.
		 * If you want to check a word without any changes made to it, call checkExact()
		 *
		 * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript re:trimming function
		 *
		 * @param {String} aWord The word to check.
		 * @returns {Boolean}
		 */
		
		check : function (aWord) {
			// Remove leading and trailing whitespace
			var trimmedWord = aWord.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			
			if (this.checkExact(trimmedWord)) {
				return true;
			}
			
			// The exact word is not in the dictionary.
			if (trimmedWord.toUpperCase() === trimmedWord) {
				// The word was supplied in all uppercase.
				// Check for a capitalized form of the word.
				var capitalizedWord = trimmedWord[0] + trimmedWord.substring(1).toLowerCase();
				
				if (this.hasFlag(capitalizedWord, "KEEPCASE")) {
					// Capitalization variants are not allowed for this word.
					return false;
				}
				
				if (this.checkExact(capitalizedWord)) {
					return true;
				}
			}
			
			var lowercaseWord = trimmedWord.toLowerCase();
			
			if (lowercaseWord !== trimmedWord) {
				if (this.hasFlag(lowercaseWord, "KEEPCASE")) {
					// Capitalization variants are not allowed for this word.
					return false;
				}
				
				// Check for a lowercase form
				if (this.checkExact(lowercaseWord)) {
					return true;
				}
			}
			
			return false;
		},
		
		/**
		 * Checks whether a word exists in the current dictionary.
		 *
		 * @param {String} word The word to check.
		 * @returns {Boolean}
		 */
		
		checkExact : function (word) {
			var ruleCodes = this.dictionaryTable[word];
			
			if (typeof ruleCodes === 'undefined') {
				// Check if this might be a compound word.
				if ("COMPOUNDMIN" in this.flags && word.length >= this.flags.COMPOUNDMIN) {
					for (var i = 0, _len = this.compoundRules.length; i < _len; i++) {
						if (word.match(this.compoundRules[i])) {
							return true;
						}
					}
				}
				
				return false;
			}
			else {
				for (var i = 0, _len = ruleCodes.length; i < _len; i++) {
					if (!this.hasFlag(word, "ONLYINCOMPOUND", ruleCodes[i])) {
						return true;
					}
				}
				
				return false;
			}
		},
		
		/**
		 * Looks up whether a given word is flagged with a given flag.
		 *
		 * @param {String} word The word in question.
		 * @param {String} flag The flag in question.
		 * @return {Boolean}
		 */
		
		hasFlag : function (word, flag, wordFlags) {
			if (flag in this.flags) {
				if (typeof wordFlags === 'undefined') {
					var wordFlags = Array.prototype.concat.apply([], this.dictionaryTable[word]);
				}
				
				if (wordFlags && wordFlags.indexOf(this.flags[flag]) !== -1) {
					return true;
				}
			}
			
			return false;
		},
		
		/**
		 * Returns a list of suggestions for a misspelled word.
		 *
		 * @see http://www.norvig.com/spell-correct.html for the basis of this suggestor.
		 * This suggestor is primitive, but it works.
		 *
		 * @param {String} word The misspelling.
		 * @param {Number} [limit=5] The maximum number of suggestions to return.
		 * @returns {String[]} The array of suggestions.
		 */
		
		alphabet : "",
		
		suggest : function (word, limit, callback) {
			if (!limit) limit = 5;
			
			if (this.check(word)) {
				callback([]);
				return;
			}
			
			// Check the replacement table.
			for (var i = 0, _len = this.replacementTable.length; i < _len; i++) {
				var replacementEntry = this.replacementTable[i];
				
				if (word.indexOf(replacementEntry[0]) !== -1) {
					var correctedWord = word.replace(replacementEntry[0], replacementEntry[1]);
					
					if (this.check(correctedWord)) {
						callback( [ correctedWord ] );
						return;
					}
				}
			}
			
			var self = this;
			self.alphabet = "abcdefghijklmnopqrstuvwxyz";
			
			/*
			if (!self.alphabet) {
				// Use the alphabet as implicitly defined by the words in the dictionary.
				var alphaHash = {};
				
				for (var i in self.dictionaryTable) {
					for (var j = 0, _len = i.length; j < _len; j++) {
						alphaHash[i[j]] = true;
					}
				}
				
				for (var i in alphaHash) {
					self.alphabet += i;
				}
				
				var alphaArray = self.alphabet.split("");
				alphaArray.sort();
				self.alphabet = alphaArray.join("");
			}
			*/
			
			function edits1(words, callback) {
				var numWorkers = 4;
				
				var rv = [];
				
				var workers = [];
				var workersCompleted = [];
				
				var processNext = function() {
					for (var i = 0; i < numWorkers; ++i) {
						if (!workersCompleted[i]) {
							return;
						}			  	  			  
					}
					callback(rv);
				}
				
				for (var i = 0; i < numWorkers; ++i) {
					var worker = new Worker("wordprocessor.js");
					worker.addEventListener('message', function(index) {
						return function(e) {
						rv = rv.concat(e.data);
						workersCompleted[index] = true;
						this.terminate(); //CJW stop the worker (else the buildup makes the app crash)?
						processNext();
						};
					}(i));
					
					workers.push(worker); 	
					workersCompleted.push(false);
				}
				
				var sliceSize = words.length / numWorkers;
				for (var i = 0; i < numWorkers; ++i) {
					if (i != numWorkers - 1) {
						workers[i].postMessage(words.slice(sliceSize * i, sliceSize * (i+1)));
					} else {
						workers[i].postMessage(words.slice(sliceSize * i));
					}
				}					
			}
			
			function known(words) {
				var rv = [];
				
				for (var i = 0; i < words.length; i++) {
					if (self.check(words[i])) {
						rv.push(words[i]);
					}
				}
				
				return rv;
			}
			
			function correct(word, callback) {
				// Get the edit-distance-1 and edit-distance-2 forms of this word.
				edits1([word], function(ed1) {
					edits1(ed1,function(ed2) {
				
						var corrections = known(ed1).concat(known(ed2));
						
						// Sort the edits based on how many different ways they were created.
						var weighted_corrections = {};
						
						//not this
						for (var i = 0, _len = corrections.length; i < _len; i++) {
							if (!(corrections[i] in weighted_corrections)) {
								weighted_corrections[corrections[i]] = 1;
							}
							else {
								weighted_corrections[corrections[i]] += 1;
							}
						}
						
						var sorted_corrections = [];
						
						//not this
						for (var i in weighted_corrections) {
							sorted_corrections.push([ i, weighted_corrections[i] ]);
						}
						
						//not this
						function sorter(a, b) {
							if (a[1] < b[1]) {
								return -1;
							}
							
							return 1;
						}
						
						sorted_corrections.sort(sorter).reverse();
						
						var rv = [];
						
						//not this
						for (var i = 0, _len = Math.min(limit, sorted_corrections.length); i < _len; i++) {
							if (!self.hasFlag(sorted_corrections[i][0], "NOSUGGEST")) {
								rv.push(sorted_corrections[i][0]);
							}
						}
						
						callback(rv);		
					});
				});
				
			}
			
			correct(word, function(rv) {
				callback(rv);
			});
		}
	};
	exports.Typo = Typo;
});
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/cssCompletion',["require", "exports", "../parser/cssNodes", "../parser/cssErrors", "./languageFacts", "vscode-languageserver-types", "./typo/typo", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../parser/cssNodes");
    var cssErrors_1 = require("../parser/cssErrors");
    //import { Symbols, Symbol } from '../parser/cssSymbolScope';
    var languageFacts = require("./languageFacts");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    var typo_1 = require("./typo/typo");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var SnippetFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
    var CSSCompletion = /** @class */ (function () {
        function CSSCompletion(variablePrefix) {
            if (variablePrefix === void 0) { variablePrefix = null; }
            this.completionParticipants = [];
            this.valueTypes = [
                nodes.NodeType.Identifier, nodes.NodeType.Value, nodes.NodeType.StringLiteral, nodes.NodeType.NumericValue,
                nodes.NodeType.HexColorValue, nodes.NodeType.PrintVariable,
            ];
            var baseUrl = "https://raw.githubusercontent.com/ChoicescriptIDE/main/latest/source/lib/typo/dictionaries/";
            var dict = "en_US";
            this.typo = new typo_1.Typo("", "", "", {
                platform: 'any'
            });
            this.typo = new typo_1.Typo(dict, this.typo._readFile(baseUrl + dict + "/" + dict + ".aff"), this.typo._readFile(baseUrl + dict + "/" + dict + ".dic"), {
                platform: 'any'
            });
            this.variablePrefix = variablePrefix;
        }
        /*protected getSymbolContext(): Symbols {
            if (!this.symbolContext) {
                this.symbolContext = new Symbols(this.scene);
            }
            return this.symbolContext;
        }*/
        CSSCompletion.prototype.setCompletionParticipants = function (registeredCompletionParticipants) {
            this.completionParticipants = registeredCompletionParticipants || [];
        };
        CSSCompletion.prototype.doComplete = function (document, position, styleSheet) {
            var _this = this;
            this.offset = document.offsetAt(position);
            this.position = position;
            this.currentWord = getCurrentWord(document, this.offset);
            this.defaultReplaceRange = vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
            this.textDocument = document;
            this.scene = styleSheet;
            try {
                var result_1 = { isIncomplete: false, items: [] };
                this.nodePath = nodes.getNodePath(this.scene, this.offset);
                for (var i = this.nodePath.length - 1; i >= 0; i--) {
                    var node = this.nodePath[i];
                    if (node.hasIssue(cssErrors_1.ParseError.UnknownCommand)) {
                        this.getCompletionsForCommands(result_1);
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result_1));
                        });
                        // this.getCompletionForTopLevel(result);
                        // } else if (node instanceof nodes.Variable) {
                        // this.getCompletionsForVariableDeclaration()O
                    }
                    else if (node.type === nodes.NodeType.RealWord
                        && node.getText().length > 2
                        && !this.typo.check(node.getText())) {
                        return this.getSuggestionsForSpellings(result_1).then(function (list) {
                            return _this.finalize(list);
                        }).catch(function () {
                            return _this.finalize(result_1);
                        });
                    }
                    else {
                        return new Promise(function (resolve, reject) {
                            resolve(_this.finalize(result_1));
                        });
                    }
                }
            }
            finally {
                // don't hold on any state, clear symbolContext
                this.position = null;
                this.currentWord = null;
                this.textDocument = null;
                this.scene = null;
                //this.symbolContext = null;
                this.defaultReplaceRange = null;
                this.nodePath = null;
            }
        };
        CSSCompletion.prototype.finalize = function (result) {
            var needsSortText = result.items.some(function (i) { return !!i.sortText; });
            if (needsSortText) {
                for (var _b = 0, _c = result.items; _b < _c.length; _b++) {
                    var i = _c[_b];
                    if (!i.sortText) {
                        i.sortText = 'd';
                    }
                }
            }
            return result;
        };
        CSSCompletion.prototype.findInNodePath = function () {
            var types = [];
            for (var _b = 0; _b < arguments.length; _b++) {
                types[_b] = arguments[_b];
            }
            for (var i = this.nodePath.length - 1; i >= 0; i--) {
                var node = this.nodePath[i];
                if (types.indexOf(node.type) !== -1) {
                    return node;
                }
            }
            return null;
        };
        CSSCompletion.prototype.getCompletionsForCommands = function (result) {
            var _this = this;
            var commands = languageFacts.getCommands().filter(function (cmd) {
                return _this.currentWord.slice(0, 1) === cmd.name.slice(0, 1);
            });
            for (var _i = 0, _a = commands; _i < _a.length; _i++) {
                result.items.push({
                    label: _a[_i].name,
                    detail: "(command)",
                    documentation: "TBD",
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(null), _a[_i].name),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Keyword
                });
            }
            return result;
        };
        CSSCompletion.prototype.getSuggestionsForSpellings = function (result) {
            var _this = this;
            var self = this;
            var word = this.currentWord;
            return new Promise(function (resolve, reject) {
                if (_this.typo.working) {
                    reject(result);
                }
                else {
                    _this.typo.working = true;
                    _this.typo.suggest(word, 5, function (suggestions) {
                        var result = { items: [], isIncomplete: false };
                        if (suggestions.length < 1) {
                            result.items.push({
                                label: "No spelling suggestions for " + word,
                                documentation: "",
                                textEdit: null,
                                insertText: { value: word },
                                kind: vscode_languageserver_types_1.CompletionItemKind.Keyword
                            });
                        }
                        else {
                            //defaults
                            result.items.push({
                                label: "Ignore '" + word + "' this session.",
                                documentation: "",
                                textEdit: null,
                                filterText: word,
                                sortText: 'b',
                                insertText: { value: word },
                                kind: vscode_languageserver_types_1.CompletionItemKind.Property
                            });
                            result.items.push({
                                label: "Add '" + word + "' to user dictionary.",
                                documentation: "",
                                textEdit: null,
                                filterText: word,
                                sortText: 'c',
                                insertText: { value: word },
                                kind: vscode_languageserver_types_1.CompletionItemKind.Property
                            });
                            result.items = result.items.concat(suggestions.map(function (suggestion) {
                                return {
                                    label: "Correct to: " + suggestion,
                                    documentation: "",
                                    textEdit: null,
                                    filterText: word,
                                    sortText: 'a',
                                    insertText: { value: suggestion },
                                    kind: vscode_languageserver_types_1.CompletionItemKind.Text
                                };
                            }));
                        }
                        self.typo.working = false;
                        resolve(result);
                    });
                }
            });
        };
        CSSCompletion.prototype.getCSSWideKeywordProposals = function (entry, existingNode, result) {
            for (var keywords in languageFacts.cssWideKeywords) {
                result.items.push({
                    label: keywords,
                    documentation: languageFacts.cssWideKeywords[keywords],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), keywords),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Keyword
                });
            }
            return result;
        };
        /*public getVariableProposals(existingNode: nodes.Node, result: CompletionList): CompletionList {
            let symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
            for (let symbol of symbols) {
                let insertText = strings.startsWith(symbol.name, '--') ? `var(${symbol.name})` : symbol.name;
                const suggest: CompletionItem = {
                    label: symbol.name,
                    documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: CompletionItemKind.Variable,
                    sortText: 'z'
                };
    
                if (symbol.node.type === nodes.NodeType.FunctionParameter) {
                    const mixinNode = <nodes.MixinDeclaration>(symbol.node.getParent());
                    if (mixinNode.type === nodes.NodeType.MixinDeclaration) {
                        suggest.detail = localize('completion.argument', 'argument from \'{0}\'', mixinNode.getName());
                    }
                }
    
                result.items.push(suggest);
            }
            return result;
        }*/
        /*public getVariableProposalsForCSSVarFunction(result: CompletionList): CompletionList {
            let symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
            symbols = symbols.filter((symbol): boolean => {
                return strings.startsWith(symbol.name, '--');
            });
            for (let symbol of symbols) {
                result.items.push({
                    label: symbol.name,
                    documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
                    textEdit: TextEdit.replace(this.getCompletionRange(null), symbol.name),
                    kind: CompletionItemKind.Variable
                });
            }
            return result;
        }*/
        CSSCompletion.prototype.getUnitProposals = function (entry, existingNode, result) {
            var currentWord = '0';
            if (this.currentWord.length > 0) {
                var numMatch = this.currentWord.match(/^-?\d[\.\d+]*/);
                if (numMatch) {
                    currentWord = numMatch[0];
                    result.isIncomplete = currentWord.length === this.currentWord.length;
                }
            }
            else if (this.currentWord.length === 0) {
                result.isIncomplete = true;
            }
            if (existingNode && existingNode.parent && existingNode.parent.type === nodes.NodeType.Term) {
                existingNode = existingNode.getParent(); // include the unary operator
            }
            for (var _b = 0, _c = entry.restrictions; _b < _c.length; _b++) {
                var restriction = _c[_b];
                var units = languageFacts.units[restriction];
                if (units) {
                    for (var _d = 0, units_1 = units; _d < units_1.length; _d++) {
                        var unit = units_1[_d];
                        var insertText = currentWord + unit;
                        result.items.push({
                            label: insertText,
                            textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                            kind: vscode_languageserver_types_1.CompletionItemKind.Unit
                        });
                    }
                }
            }
            return result;
        };
        CSSCompletion.prototype.getCompletionRange = function (existingNode) {
            if (existingNode && existingNode.offset <= this.offset) {
                var end = existingNode.end !== -1 ? this.textDocument.positionAt(existingNode.end) : this.position;
                return vscode_languageserver_types_1.Range.create(this.textDocument.positionAt(existingNode.offset), end);
            }
            return this.defaultReplaceRange;
        };
        /*protected getColorProposals(entry: languageFacts.IEntry, existingNode: nodes.Node, result: CompletionList): CompletionList {
            for (let color in languageFacts.colors) {
                result.items.push({
                    label: color,
                    documentation: languageFacts.colors[color],
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                    kind: CompletionItemKind.Color
                });
            }
            for (let color in languageFacts.colorKeywords) {
                result.items.push({
                    label: color,
                    documentation: languageFacts.colorKeywords[color],
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                    kind: CompletionItemKind.Value
                });
            }
            let colorValues = new Set();
            this.scene.acceptVisitor(new ColorValueCollector(colorValues, this.offset));
            for (let color of colorValues.getEntries()) {
                result.items.push({
                    label: color,
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                    kind: CompletionItemKind.Color
                });
            }
            for (let p of languageFacts.colorFunctions) {
                let tabStop = 1;
                let replaceFunction = (match, p1) => '${' + tabStop++ + ':' + p1 + '}';
                let insertText = p.func.replace(/\[?\$(\w+)\]?/g, replaceFunction);
                result.items.push({
                    label: p.func.substr(0, p.func.indexOf('(')),
                    detail: p.func,
                    documentation: p.desc,
                    textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    insertTextFormat: SnippetFormat,
                    kind: CompletionItemKind.Function
                });
            }
            return result;
        }*/
        CSSCompletion.prototype.getPositionProposals = function (entry, existingNode, result) {
            for (var position in languageFacts.positionKeywords) {
                result.items.push({
                    label: position,
                    documentation: languageFacts.positionKeywords[position],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), position),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        CSSCompletion.prototype.getRepeatStyleProposals = function (entry, existingNode, result) {
            for (var repeat in languageFacts.repeatStyleKeywords) {
                result.items.push({
                    label: repeat,
                    documentation: languageFacts.repeatStyleKeywords[repeat],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), repeat),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        CSSCompletion.prototype.getLineStyleProposals = function (entry, existingNode, result) {
            for (var lineStyle in languageFacts.lineStyleKeywords) {
                result.items.push({
                    label: lineStyle,
                    documentation: languageFacts.lineStyleKeywords[lineStyle],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), lineStyle),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        CSSCompletion.prototype.getLineWidthProposals = function (entry, existingNode, result) {
            for (var _b = 0, _c = languageFacts.lineWidthKeywords; _b < _c.length; _b++) {
                var lineWidth = _c[_b];
                result.items.push({
                    label: lineWidth,
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), lineWidth),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        CSSCompletion.prototype.getGeometryBoxProposals = function (entry, existingNode, result) {
            for (var box in languageFacts.geometryBoxKeywords) {
                result.items.push({
                    label: box,
                    documentation: languageFacts.geometryBoxKeywords[box],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), box),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        CSSCompletion.prototype.getBoxProposals = function (entry, existingNode, result) {
            for (var box in languageFacts.boxKeywords) {
                result.items.push({
                    label: box,
                    documentation: languageFacts.boxKeywords[box],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), box),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Value
                });
            }
            return result;
        };
        CSSCompletion.prototype.getImageProposals = function (entry, existingNode, result) {
            for (var image in languageFacts.imageFunctions) {
                var insertText = moveCursorInsideParenthesis(image);
                result.items.push({
                    label: image,
                    documentation: languageFacts.imageFunctions[image],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Function,
                    insertTextFormat: image !== insertText ? SnippetFormat : void 0
                });
            }
            return result;
        };
        CSSCompletion.prototype.getTimingFunctionProposals = function (entry, existingNode, result) {
            for (var timing in languageFacts.transitionTimingFunctions) {
                var insertText = moveCursorInsideParenthesis(timing);
                result.items.push({
                    label: timing,
                    documentation: languageFacts.transitionTimingFunctions[timing],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Function,
                    insertTextFormat: timing !== insertText ? SnippetFormat : void 0
                });
            }
            return result;
        };
        CSSCompletion.prototype.getBasicShapeProposals = function (entry, existingNode, result) {
            for (var shape in languageFacts.basicShapeFunctions) {
                var insertText = moveCursorInsideParenthesis(shape);
                result.items.push({
                    label: shape,
                    documentation: languageFacts.basicShapeFunctions[shape],
                    textEdit: vscode_languageserver_types_1.TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                    kind: vscode_languageserver_types_1.CompletionItemKind.Function,
                    insertTextFormat: shape !== insertText ? SnippetFormat : void 0
                });
            }
            return result;
        };
        /*public getCompletionsForVariableDeclaration(declaration: nodes.VariableDeclaration, result: CompletionList): CompletionList {
            if (this.offset > declaration.colonPosition) {
                this.getVariableProposals(declaration.getValue(), result);
            }
            return result;
        }*/
        CSSCompletion.prototype.getCompletionForUriLiteralValue = function (uriLiteralNode, result) {
            var uriValue;
            var position;
            var range;
            // No children, empty value
            if (uriLiteralNode.getChildren().length === 0) {
                uriValue = '';
                position = this.position;
                var emptyURIValuePosition = this.textDocument.positionAt(uriLiteralNode.offset + 'url('.length);
                range = vscode_languageserver_types_1.Range.create(emptyURIValuePosition, emptyURIValuePosition);
            }
            else {
                var uriValueNode = uriLiteralNode.getChild(0);
                uriValue = uriValueNode.getText();
                position = this.position;
                range = this.getCompletionRange(uriValueNode);
            }
            this.completionParticipants.forEach(function (participant) {
                if (participant.onCssURILiteralValue) {
                    participant.onCssURILiteralValue({
                        uriValue: uriValue,
                        position: position,
                        range: range
                    });
                }
            });
            return result;
        };
        CSSCompletion.prototype.getCompletionForImportPath = function (importPathNode, result) {
            var _this = this;
            this.completionParticipants.forEach(function (participant) {
                if (participant.onCssImportPath) {
                    participant.onCssImportPath({
                        pathValue: importPathNode.getText(),
                        position: _this.position,
                        range: _this.getCompletionRange(importPathNode)
                    });
                }
            });
            return result;
        };
        return CSSCompletion;
    }());
    exports.CSSCompletion = CSSCompletion;
    var Set = /** @class */ (function () {
        function Set() {
            this.entries = {};
        }
        Set.prototype.add = function (entry) {
            this.entries[entry] = true;
        };
        Set.prototype.getEntries = function () {
            return Object.keys(this.entries);
        };
        return Set;
    }());
    function moveCursorInsideParenthesis(text) {
        return text.replace(/\(\)$/, "($1)");
    }
    /*class ColorValueCollector implements nodes.IVisitor {
    
        constructor(public entries: Set, private currentOffset: number) {
            // nothing to do
        }
    
        public visitNode(node: nodes.Node): boolean {
            if (node instanceof nodes.HexColorValue || (node instanceof nodes.Function && languageFacts.isColorConstructor(<nodes.Function>node))) {
                if (this.currentOffset < node.offset || node.end < this.currentOffset) {
                    this.entries.add(node.getText());
                }
            }
            return true;
        }
    }*/
    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }
    function getCurrentWord(document, offset) {
        var i = offset - 1;
        var text = document.getText();
        while (i >= 0 && ' \t\n\r":{[()]},*>+'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, offset);
    }
});
//# sourceMappingURL=cssCompletion.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/cssHover',["require", "exports", "../parser/cssNodes", "./languageFacts", "vscode-languageserver-types"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../parser/cssNodes");
    var languageFacts = require("./languageFacts");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    var CSSHover = /** @class */ (function () {
        function CSSHover() {
        }
        CSSHover.prototype.doHover = function (document, position, stylesheet) {
            function getRange(node) {
                return vscode_languageserver_types_1.Range.create(document.positionAt(node.offset), document.positionAt(node.end));
            }
            var offset = document.offsetAt(position);
            var nodepath = nodes.getNodePath(stylesheet, offset);
            for (var i = 0; i < nodepath.length; i++) {
                var node = nodepath[i];
                if (node instanceof nodes.Command) {
                    var propertyName = node.getText().slice(1, node.getText().length);
                    var cmds = languageFacts.getCommands();
                    var index = cmds.map(function (cmd) { return cmd.name; }).indexOf(propertyName);
                    if (index !== -1) {
                        return {
                            contents: cmds[index].description,
                            range: getRange(node)
                        };
                    }
                }
                // Expression is not correct. Just used to shut up compile errors. Needs fixing.
                if (node instanceof nodes.Expression) {
                    return {
                        contents: "selectorToMarkedString",
                        range: getRange(node)
                    };
                }
                if (node instanceof nodes.Expression) {
                    return {
                        contents: "simpleSelector",
                        range: getRange(node)
                    };
                }
            }
            return null;
        };
        return CSSHover;
    }());
    exports.CSSHover = CSSHover;
});
//# sourceMappingURL=cssHover.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/textRules',["require", "exports", "../parser/cssNodes", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../parser/cssNodes");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var Warning = nodes.Level.Warning;
    var Error = nodes.Level.Error;
    var Ignore = nodes.Level.Ignore;
    var Rule = /** @class */ (function () {
        function Rule(id, message, defaultValue) {
            this.id = id;
            this.message = message;
            this.defaultValue = defaultValue;
            // nothing to do
        }
        return Rule;
    }());
    exports.Rule = Rule;
    exports.Rules = {
        BadSpelling: new Rule('badSpelling', localize('rule.badSpelling', "Bad spelling."), Warning),
    };
    var LintConfigurationSettings = /** @class */ (function () {
        function LintConfigurationSettings(conf) {
            if (conf === void 0) { conf = {}; }
            this.conf = conf;
        }
        LintConfigurationSettings.prototype.get = function (rule) {
            if (this.conf.hasOwnProperty(rule.id)) {
                var level = toLevel(this.conf[rule.id]);
                if (level) {
                    return level;
                }
            }
            return rule.defaultValue;
        };
        return LintConfigurationSettings;
    }());
    exports.LintConfigurationSettings = LintConfigurationSettings;
    function toLevel(level) {
        switch (level) {
            case 'ignore': return nodes.Level.Ignore;
            case 'warning': return nodes.Level.Warning;
            case 'error': return nodes.Level.Error;
        }
        return null;
    }
});
//# sourceMappingURL=textRules.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/spellcheck',["require", "exports", "./textRules", "../parser/cssNodes", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var textRules_1 = require("./textRules");
    var nodes = require("../parser/cssNodes");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var NodesByRootMap = /** @class */ (function () {
        function NodesByRootMap() {
            this.data = {};
        }
        NodesByRootMap.prototype.add = function (root, name, node) {
            var entry = this.data[root];
            if (!entry) {
                entry = { nodes: [], names: [] };
                this.data[root] = entry;
            }
            entry.names.push(name);
            if (node) {
                entry.nodes.push(node);
            }
        };
        return NodesByRootMap;
    }());
    var SpellCheckVisitor = /** @class */ (function () {
        function SpellCheckVisitor(document, settings, typo) {
            this.warnings = [];
            this.visitScene = function (node) {
                return true;
            };
            this.visitWord = function (node) {
                if (!this.typo.check(node.getText())) {
                    this.addEntry(node, textRules_1.Rules.BadSpelling, "Bad spelling: " + node.getText());
                }
                return true;
            };
            this.settings = settings;
            this.documentText = document.getText();
            this.keyframes = new NodesByRootMap();
            this.typo = typo;
        }
        SpellCheckVisitor.entries = function (node, document, settings, entryFilter, typo) {
            var visitor = new SpellCheckVisitor(document, settings, typo);
            node.acceptVisitor(visitor);
            return visitor.getEntries(entryFilter);
        };
        SpellCheckVisitor.prototype.findValueInExpression = function (expression, v) {
            var found = false;
            expression.accept(function (node) {
                if (node.type === nodes.NodeType.Identifier && node.getText() === v) {
                    found = true;
                }
                return !found;
            });
            return found;
        };
        SpellCheckVisitor.prototype.getEntries = function (filter) {
            if (filter === void 0) { filter = (nodes.Level.Warning | nodes.Level.Error); }
            return this.warnings.filter(function (entry) {
                return (entry.getLevel() & filter) !== 0;
            });
        };
        SpellCheckVisitor.prototype.addEntry = function (node, rule, details) {
            var entry = new nodes.Marker(node, rule, nodes.Level.Warning, details, node.offset, node.length);
            this.warnings.push(entry);
        };
        SpellCheckVisitor.prototype.getMissingNames = function (expected, actual) {
            expected = expected.slice(0); // clone
            for (var i = 0; i < actual.length; i++) {
                var k = expected.indexOf(actual[i]);
                if (k !== -1) {
                    expected[k] = null;
                }
            }
            var result = null;
            for (var i = 0; i < expected.length; i++) {
                var curr = expected[i];
                if (curr) {
                    if (result === null) {
                        result = localize('namelist.single', "'{0}'", curr);
                    }
                    else {
                        result = localize('namelist.concatenated', "{0}, '{1}'", result, curr);
                    }
                }
            }
            return result;
        };
        SpellCheckVisitor.prototype.visitNode = function (node) {
            switch (node.type) {
                case nodes.NodeType.Scene:
                    return this.visitScene(node);
                case nodes.NodeType.TextLine:
                    return true;
                case nodes.NodeType.RealWord:
                    return this.visitWord(node);
                default:
                    return true;
            }
        };
        SpellCheckVisitor.prefixes = [
            '-ms-', '-moz-', '-o-', '-webkit-',
        ];
        return SpellCheckVisitor;
    }());
    exports.SpellCheckVisitor = SpellCheckVisitor;
});
//# sourceMappingURL=spellcheck.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/ChoiceScriptValidation',["require", "exports", "../parser/cssNodes", "vscode-languageserver-types", "./textRules", "./spellcheck", "./typo/typo"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../parser/cssNodes");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    var textRules_1 = require("./textRules");
    var spellcheck_1 = require("./spellcheck");
    var typo_1 = require("./typo/typo");
    var ChoiceScriptValidation = /** @class */ (function () {
        function ChoiceScriptValidation() {
            this.typo = new typo_1.Typo("", "", "", {
                platform: 'any'
            });
        }
        ChoiceScriptValidation.prototype.configure = function (settings) {
            this.settings = settings;
            // Reload typo here rather than every time we call a visitor.
            // Don't bother reloading a dictionary if spellcheck is disabled.
            console.log(settings);
            if (this.settings.spellCheckSettings.enabled) {
                this.loadTypo(settings);
            }
        };
        ChoiceScriptValidation.prototype.loadTypo = function (settings) {
            var baseUrl = settings.spellCheckSettings.rootPath;
            var dict = settings.spellCheckSettings.dictionary;
            this.typo = new typo_1.Typo(dict, this.typo._readFile(baseUrl + dict + "/" + dict + ".aff"), this.typo._readFile(baseUrl + dict + "/" + dict + ".dic"), {
                platform: 'any'
            });
        };
        ChoiceScriptValidation.prototype.doValidation = function (document, scene, settings) {
            if (settings === void 0) { settings = this.settings; }
            if (settings && settings.validate === false) {
                return [];
            }
            var entries = [];
            entries.push.apply(entries, nodes.ParseErrorCollector.entries(scene));
            if (settings && settings.spellCheckSettings.enabled === true) {
                entries.push.apply(entries, spellcheck_1.SpellCheckVisitor.entries(scene, document, null, (nodes.Level.Warning | nodes.Level.Error), this.typo));
            }
            var ruleIds = [];
            for (var r in textRules_1.Rules) {
                ruleIds.push(textRules_1.Rules[r].id);
            }
            function toDiagnostic(marker) {
                var range = vscode_languageserver_types_1.Range.create(document.positionAt(marker.getOffset()), document.positionAt(marker.getOffset() + marker.getLength()));
                var source = ruleIds.indexOf(marker.getRule().id) !== -1
                    ? document.languageId + ".lint." + marker.getRule().id
                    : document.languageId;
                return {
                    code: marker.getRule().id,
                    source: source,
                    message: marker.getMessage(),
                    severity: marker.getLevel() === nodes.Level.Warning ? vscode_languageserver_types_1.DiagnosticSeverity.Warning : vscode_languageserver_types_1.DiagnosticSeverity.Error,
                    range: range
                };
            }
            return entries.filter(function (entry) { return entry.getLevel() !== nodes.Level.Ignore; }).map(toDiagnostic);
        };
        return ChoiceScriptValidation;
    }());
    exports.ChoiceScriptValidation = ChoiceScriptValidation;
});
//# sourceMappingURL=ChoiceScriptValidation.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/lintRules',["require", "exports", "../parser/cssNodes", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../parser/cssNodes");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var Warning = nodes.Level.Warning;
    var Error = nodes.Level.Error;
    var Ignore = nodes.Level.Ignore;
    var Rule = /** @class */ (function () {
        function Rule(id, message, defaultValue) {
            this.id = id;
            this.message = message;
            this.defaultValue = defaultValue;
            // nothing to do
        }
        return Rule;
    }());
    exports.Rule = Rule;
    exports.Rules = {
        AllVendorPrefixes: new Rule('compatibleVendorPrefixes', localize('rule.vendorprefixes.all', "When using a vendor-specific prefix make sure to also include all other vendor-specific properties"), Ignore),
        IncludeStandardPropertyWhenUsingVendorPrefix: new Rule('vendorPrefix', localize('rule.standardvendorprefix.all', "When using a vendor-specific prefix also include the standard property"), Warning),
        DuplicateDeclarations: new Rule('duplicateProperties', localize('rule.duplicateDeclarations', "Do not use duplicate style definitions"), Ignore),
        EmptyRuleSet: new Rule('emptyRules', localize('rule.emptyRuleSets', "Do not use empty rulesets"), Warning),
        ImportStatemement: new Rule('importStatement', localize('rule.importDirective', "Import statements do not load in parallel"), Ignore),
        BewareOfBoxModelSize: new Rule('boxModel', localize('rule.bewareOfBoxModelSize', "Do not use width or height when using padding or border"), Ignore),
        UniversalSelector: new Rule('universalSelector', localize('rule.universalSelector', "The universal selector (*) is known to be slow"), Ignore),
        ZeroWithUnit: new Rule('zeroUnits', localize('rule.zeroWidthUnit', "No unit for zero needed"), Ignore),
        RequiredPropertiesForFontFace: new Rule('fontFaceProperties', localize('rule.fontFaceProperties', "@font-face rule must define 'src' and 'font-family' properties"), Warning),
        HexColorLength: new Rule('hexColorLength', localize('rule.hexColor', "Hex colors must consist of three, four, six or eight hex numbers"), Error),
        ArgsInColorFunction: new Rule('argumentsInColorFunction', localize('rule.colorFunction', "Invalid number of parameters"), Error),
        UnknownProperty: new Rule('unknownProperties', localize('rule.unknownProperty', "Unknown property."), Warning),
        UnknownAtRules: new Rule('unknownAtRules', localize('rule.unknownAtRules', "Unknown at-rule."), Warning),
        IEStarHack: new Rule('ieHack', localize('rule.ieHack', "IE hacks are only necessary when supporting IE7 and older"), Ignore),
        UnknownVendorSpecificProperty: new Rule('unknownVendorSpecificProperties', localize('rule.unknownVendorSpecificProperty', "Unknown vendor specific property."), Ignore),
        PropertyIgnoredDueToDisplay: new Rule('propertyIgnoredDueToDisplay', localize('rule.propertyIgnoredDueToDisplay', "Property is ignored due to the display."), Warning),
        AvoidImportant: new Rule('important', localize('rule.avoidImportant', "Avoid using !important. It is an indication that the specificity of the entire CSS has gotten out of control and needs to be refactored."), Ignore),
        AvoidFloat: new Rule('float', localize('rule.avoidFloat', "Avoid using 'float'. Floats lead to fragile CSS that is easy to break if one aspect of the layout changes."), Ignore),
        AvoidIdSelector: new Rule('idSelector', localize('rule.avoidIdSelector', "Selectors should not contain IDs because these rules are too tightly coupled with the HTML."), Ignore),
    };
    var LintConfigurationSettings = /** @class */ (function () {
        function LintConfigurationSettings(conf) {
            if (conf === void 0) { conf = {}; }
            this.conf = conf;
        }
        LintConfigurationSettings.prototype.get = function (rule) {
            if (this.conf.hasOwnProperty(rule.id)) {
                var level = toLevel(this.conf[rule.id]);
                if (level) {
                    return level;
                }
            }
            return rule.defaultValue;
        };
        return LintConfigurationSettings;
    }());
    exports.LintConfigurationSettings = LintConfigurationSettings;
    function toLevel(level) {
        switch (level) {
            case 'ignore': return nodes.Level.Ignore;
            case 'warning': return nodes.Level.Warning;
            case 'error': return nodes.Level.Error;
        }
        return null;
    }
});
//# sourceMappingURL=lintRules.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/services/ChoiceScriptCodeActions',["require", "exports", "../parser/cssNodes", "../services/lintRules", "vscode-languageserver-types", "vscode-nls"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodes = require("../parser/cssNodes");
    var lintRules_1 = require("../services/lintRules");
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    var nls = require("vscode-nls");
    var localize = nls.loadMessageBundle();
    var ChoiceScriptCodeActions = /** @class */ (function () {
        function ChoiceScriptCodeActions() {
        }
        ChoiceScriptCodeActions.prototype.doCodeActions = function (document, range, context, scene) {
            return this.doCodeActions2(document, range, context, scene).map(function (ca) {
                return vscode_languageserver_types_1.Command.create(ca.title, '_choicescript.applyCodeAction', document.uri, document.version, ca.edit.documentChanges[0].edits);
            });
        };
        ChoiceScriptCodeActions.prototype.doCodeActions2 = function (document, range, context, scene) {
            var result = [];
            if (context.diagnostics) {
                for (var _i = 0, _a = context.diagnostics; _i < _a.length; _i++) {
                    var diagnostic = _a[_i];
                    this.appendSpellingSuggestions(document, scene, diagnostic, result);
                }
            }
            return result;
        };
        ChoiceScriptCodeActions.prototype.getSpellingSuggestions = function (document, word, marker, result) {
            // let text = word.getText();
            var suggestions = ["Suggestion One", "Suggestion Two", "Suggestion Three", "Suggestion Four", "Suggestion Five"];
            var maxActions = 3;
            for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
                var suggestion = suggestions_1[_i];
                var title = localize('choicescript.codeaction.correctspelling', "Correct to '{0}'", suggestion);
                var edit = vscode_languageserver_types_1.TextEdit.replace(marker.range, suggestion);
                var documentIdentifier = vscode_languageserver_types_1.VersionedTextDocumentIdentifier.create(document.uri, document.version);
                var workspaceEdit = { documentChanges: [vscode_languageserver_types_1.TextDocumentEdit.create(documentIdentifier, [edit])] };
                var codeAction = vscode_languageserver_types_1.CodeAction.create(title, workspaceEdit, vscode_languageserver_types_1.CodeActionKind.QuickFix);
                codeAction.diagnostics = [marker];
                result.push(codeAction);
                if (--maxActions <= 0) {
                    return;
                }
            }
        };
        ChoiceScriptCodeActions.prototype.appendSpellingSuggestions = function (document, stylesheet, marker, result) {
            if (marker.code !== lintRules_1.Rules.UnknownProperty.id) {
                return;
            }
            var offset = document.offsetAt(marker.range.start);
            var end = document.offsetAt(marker.range.end);
            var nodepath = nodes.getNodePath(stylesheet, offset);
            for (var i = nodepath.length - 1; i >= 0; i--) {
                var word = nodepath[i];
                if (word instanceof nodes.RealWord) {
                    if (word && word.offset === offset && word.end === end) {
                        this.getSpellingSuggestions(document, word, marker, result);
                        return;
                    }
                }
            }
        };
        return ChoiceScriptCodeActions;
    }());
    exports.ChoiceScriptCodeActions = ChoiceScriptCodeActions;
});
//# sourceMappingURL=ChoiceScriptCodeActions.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/cssLanguageTypes',["require", "exports", "vscode-languageserver-types"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var vscode_languageserver_types_1 = require("vscode-languageserver-types");
    exports.Range = vscode_languageserver_types_1.Range;
    exports.TextEdit = vscode_languageserver_types_1.TextEdit;
    exports.Position = vscode_languageserver_types_1.Position;
    var SpellCheckDictionary;
    (function (SpellCheckDictionary) {
        SpellCheckDictionary["EN_US"] = "en_US";
        SpellCheckDictionary["EN_GB"] = "en_GB";
    })(SpellCheckDictionary = exports.SpellCheckDictionary || (exports.SpellCheckDictionary = {}));
});
//# sourceMappingURL=cssLanguageTypes.js.map;
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define('vscode-css-languageservice/cssLanguageService',["require", "exports", "./parser/cssParser", "./services/cssCompletion", "./services/cssHover", "./services/ChoiceScriptValidation", "./services/ChoiceScriptCodeActions", "./cssLanguageTypes", "vscode-languageserver-types"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    var cssParser_1 = require("./parser/cssParser");
    var cssCompletion_1 = require("./services/cssCompletion");
    var cssHover_1 = require("./services/cssHover");
    var ChoiceScriptValidation_1 = require("./services/ChoiceScriptValidation");
    var ChoiceScriptCodeActions_1 = require("./services/ChoiceScriptCodeActions");
    __export(require("./cssLanguageTypes"));
    __export(require("vscode-languageserver-types"));
    function createFacade(parser, completion, hover, validation, codeActions) {
        return {
            configure: validation.configure.bind(validation),
            doValidation: validation.doValidation.bind(validation),
            parseScene: parser.parseScene.bind(parser),
            doComplete: completion.doComplete.bind(completion),
            setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
            doHover: hover.doHover.bind(hover),
            doCodeActions: codeActions.doCodeActions.bind(codeActions),
            doCodeActions2: codeActions.doCodeActions2.bind(codeActions),
        };
    }
    function getCSSLanguageService() {
        return createFacade(new cssParser_1.Parser(), new cssCompletion_1.CSSCompletion(), new cssHover_1.CSSHover(), new ChoiceScriptValidation_1.ChoiceScriptValidation(), new ChoiceScriptCodeActions_1.ChoiceScriptCodeActions());
    }
    exports.getCSSLanguageService = getCSSLanguageService;
});
//# sourceMappingURL=cssLanguageService.js.map;
define('vscode-css-languageservice', ['vscode-css-languageservice/cssLanguageService'], function (main) { return main; });

define('vs/language/choicescript/choicescriptWorker',["require", "exports", "vscode-css-languageservice", "vscode-languageserver-types"], function (require, exports, choicescriptService, ls) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Promise = monaco.Promise;
    var CSSWorker = /** @class */ (function () {
        function CSSWorker(ctx, createData) {
            this._ctx = ctx;
            this._languageSettings = createData.languageSettings;
            this._languageId = createData.languageId;
            switch (this._languageId) {
                case 'choicescript':
                    this._languageService = choicescriptService.getCSSLanguageService();
                    break;
                default:
                    throw new Error('Invalid language id: ' + this._languageId);
            }
            this._languageService.configure(this._languageSettings);
        }
        // --- language service host ---------------
        CSSWorker.prototype.doValidation = function (uri) {
            var document = this._getTextDocument(uri);
            if (document) {
                var stylesheet = this._languageService.parseScene(document);
                var check = this._languageService.doValidation(document, stylesheet, this._languageSettings);
                return Promise.as(check);
            }
            return Promise.as([]);
        };
        CSSWorker.prototype.doComplete = function (uri, position) {
            var document = this._getTextDocument(uri);
            var stylesheet = this._languageService.parseScene(document);
            var completions = this._languageService.doComplete(document, position, stylesheet);
            return Promise.as(completions);
        };
        CSSWorker.prototype.doHover = function (uri, position) {
            var document = this._getTextDocument(uri);
            var stylesheet = this._languageService.parseScene(document);
            var hover = this._languageService.doHover(document, position, stylesheet);
            return Promise.as(hover);
        };
        CSSWorker.prototype._getTextDocument = function (uri) {
            var models = this._ctx.getMirrorModels();
            for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
                var model = models_1[_i];
                if (model.uri.toString() === uri) {
                    return ls.TextDocument.create(uri, this._languageId, model.version, model.getValue());
                }
            }
            return null;
        };
        return CSSWorker;
    }());
    exports.CSSWorker = CSSWorker;
    function create(ctx, createData) {
        return new CSSWorker(ctx, createData);
    }
    exports.create = create;
});

