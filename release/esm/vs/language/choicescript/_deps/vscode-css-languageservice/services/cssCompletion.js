/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes.js';
import { ParseError } from '../parser/cssErrors.js';
import { Symbols } from '../parser/choicescriptSymbolScope.js';
import * as languageFacts from './languageFacts.js';
import * as strings from '../utils/strings.js';
import { Position, CompletionItemKind, Range, TextEdit, InsertTextFormat } from './../_deps/vscode-languageserver-types/main.js';
import { Typo } from './typo/typo.js';
import * as nls from './../../../fillers/vscode-nls.js';
var localize = nls.loadMessageBundle();
var SnippetFormat = InsertTextFormat.Snippet;
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
        this.typo = new Typo("", "", "", {
            platform: 'any'
        });
        this.typo = new Typo(dict, this.typo._readFile(baseUrl + dict + "/" + dict + ".aff"), this.typo._readFile(baseUrl + dict + "/" + dict + ".dic"), {
            platform: 'any'
        });
        this.variablePrefix = variablePrefix;
    }
    CSSCompletion.prototype.getSymbolContext = function () {
        if (!this.symbolContext) {
            this.symbolContext = new Symbols(this.scene);
        }
        return this.symbolContext;
    };
    CSSCompletion.prototype.setCompletionParticipants = function (registeredCompletionParticipants) {
        this.completionParticipants = registeredCompletionParticipants || [];
    };
    CSSCompletion.prototype.doComplete = function (document, position, scene) {
        var _this = this;
        this.offset = document.offsetAt(position);
        this.position = position;
        this.currentWord = getCurrentWord(document, this.offset);
        this.defaultReplaceRange = Range.create(Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
        this.textDocument = document;
        this.scene = scene;
        try {
            var result_1 = { isIncomplete: false, items: [] };
            this.nodePath = nodes.getNodePath(this.scene, this.offset);
            for (var i = this.nodePath.length - 1; i >= 0; i--) {
                var node = this.nodePath[i];
                var parentRef = node.findParent(nodes.NodeType.VariableDeclaration);
                if (parentRef) {
                    this.getCompletionsForVariableDeclaration(parentRef, result_1);
                    return new Promise(function (resolve, reject) {
                        resolve(_this.finalize(result_1));
                    });
                }
                else if (node.hasIssue(ParseError.UnknownCommand)) {
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
                textEdit: TextEdit.replace(this.getCompletionRange(null), _a[_i].name),
                kind: CompletionItemKind.Keyword
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
                            kind: CompletionItemKind.Keyword
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
                            kind: CompletionItemKind.Property
                        });
                        result.items.push({
                            label: "Add '" + word + "' to user dictionary.",
                            documentation: "",
                            textEdit: null,
                            filterText: word,
                            sortText: 'c',
                            insertText: { value: word },
                            kind: CompletionItemKind.Property,
                            command: 'close-selected-scene'
                        });
                        result.items = result.items.concat(suggestions.map(function (suggestion) {
                            return {
                                label: suggestion,
                                detail: "spelling suggestion",
                                textEdit: null,
                                filterText: word,
                                sortText: 'a',
                                insertText: { value: suggestion },
                                kind: CompletionItemKind.Text
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
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), keywords),
                kind: CompletionItemKind.Keyword
            });
        }
        return result;
    };
    CSSCompletion.prototype.getVariableProposals = function (existingNode, result) {
        var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
        console.log("debug var sug", symbols);
        for (var _b = 0, symbols_1 = symbols; _b < symbols_1.length; _b++) {
            var symbol = symbols_1[_b];
            var insertText = strings.startsWith(symbol.name, '--') ? "var(" + symbol.name + ")" : symbol.name;
            var suggest = {
                label: symbol.name,
                documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                kind: CompletionItemKind.Variable,
                sortText: 'z'
            };
            /*if (symbol.node.type === nodes.NodeType.FunctionParameter) {
                const mixinNode = <nodes.MixinDeclaration>(symbol.node.getParent());
                if (mixinNode.type === nodes.NodeType.MixinDeclaration) {
                    suggest.detail = localize('completion.argument', 'argument from \'{0}\'', mixinNode.getName());
                }
            }*/
            result.items.push(suggest);
        }
        return result;
    };
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
                        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                        kind: CompletionItemKind.Unit
                    });
                }
            }
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionRange = function (existingNode) {
        if (existingNode && existingNode.offset <= this.offset) {
            var end = existingNode.end !== -1 ? this.textDocument.positionAt(existingNode.end) : this.position;
            return Range.create(this.textDocument.positionAt(existingNode.offset), end);
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
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), position),
                kind: CompletionItemKind.Value
            });
        }
        return result;
    };
    CSSCompletion.prototype.getRepeatStyleProposals = function (entry, existingNode, result) {
        for (var repeat in languageFacts.repeatStyleKeywords) {
            result.items.push({
                label: repeat,
                documentation: languageFacts.repeatStyleKeywords[repeat],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), repeat),
                kind: CompletionItemKind.Value
            });
        }
        return result;
    };
    CSSCompletion.prototype.getLineStyleProposals = function (entry, existingNode, result) {
        for (var lineStyle in languageFacts.lineStyleKeywords) {
            result.items.push({
                label: lineStyle,
                documentation: languageFacts.lineStyleKeywords[lineStyle],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineStyle),
                kind: CompletionItemKind.Value
            });
        }
        return result;
    };
    CSSCompletion.prototype.getLineWidthProposals = function (entry, existingNode, result) {
        for (var _b = 0, _c = languageFacts.lineWidthKeywords; _b < _c.length; _b++) {
            var lineWidth = _c[_b];
            result.items.push({
                label: lineWidth,
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineWidth),
                kind: CompletionItemKind.Value
            });
        }
        return result;
    };
    CSSCompletion.prototype.getGeometryBoxProposals = function (entry, existingNode, result) {
        for (var box in languageFacts.geometryBoxKeywords) {
            result.items.push({
                label: box,
                documentation: languageFacts.geometryBoxKeywords[box],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
                kind: CompletionItemKind.Value
            });
        }
        return result;
    };
    CSSCompletion.prototype.getBoxProposals = function (entry, existingNode, result) {
        for (var box in languageFacts.boxKeywords) {
            result.items.push({
                label: box,
                documentation: languageFacts.boxKeywords[box],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
                kind: CompletionItemKind.Value
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
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                kind: CompletionItemKind.Function,
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
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                kind: CompletionItemKind.Function,
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
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
                kind: CompletionItemKind.Function,
                insertTextFormat: shape !== insertText ? SnippetFormat : void 0
            });
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionsForVariableDeclaration = function (declaration, result) {
        if (declaration.hasIssue(ParseError.VariableNameExpected)) {
            this.getVariableProposals(declaration.getValue(), result);
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionForUriLiteralValue = function (uriLiteralNode, result) {
        var uriValue;
        var position;
        var range;
        // No children, empty value
        if (uriLiteralNode.getChildren().length === 0) {
            uriValue = '';
            position = this.position;
            var emptyURIValuePosition = this.textDocument.positionAt(uriLiteralNode.offset + 'url('.length);
            range = Range.create(emptyURIValuePosition, emptyURIValuePosition);
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
export { CSSCompletion };
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
//# sourceMappingURL=cssCompletion.js.map