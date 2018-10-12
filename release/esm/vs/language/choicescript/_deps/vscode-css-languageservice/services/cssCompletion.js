/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes.js';
import { Symbols } from '../parser/cssSymbolScope.js';
import * as languageFacts from './languageFacts.js';
import * as strings from '../utils/strings.js';
import { Position, CompletionItemKind, Range, TextEdit, InsertTextFormat } from './../_deps/vscode-languageserver-types/main.js';
import * as nls from './../../../fillers/vscode-nls.js';
var localize = nls.loadMessageBundle();
var SnippetFormat = InsertTextFormat.Snippet;
var CSSCompletion = /** @class */ (function () {
    function CSSCompletion(variablePrefix) {
        if (variablePrefix === void 0) { variablePrefix = null; }
        this.completionParticipants = [];
        this.valueTypes = [
            nodes.NodeType.Identifier, nodes.NodeType.Value, nodes.NodeType.StringLiteral, nodes.NodeType.URILiteral, nodes.NodeType.NumericValue,
            nodes.NodeType.HexColorValue, nodes.NodeType.VariableName, nodes.NodeType.Prio
        ];
        this.variablePrefix = variablePrefix;
    }
    CSSCompletion.prototype.getSymbolContext = function () {
        if (!this.symbolContext) {
            this.symbolContext = new Symbols(this.styleSheet);
        }
        return this.symbolContext;
    };
    CSSCompletion.prototype.setCompletionParticipants = function (registeredCompletionParticipants) {
        this.completionParticipants = registeredCompletionParticipants || [];
    };
    CSSCompletion.prototype.doComplete = function (document, position, styleSheet) {
        this.offset = document.offsetAt(position);
        this.position = position;
        this.currentWord = getCurrentWord(document, this.offset);
        this.defaultReplaceRange = Range.create(Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
        this.textDocument = document;
        this.styleSheet = styleSheet;
        try {
            var result = { isIncomplete: false, items: [] };
            this.nodePath = nodes.getNodePath(this.styleSheet, this.offset);
            for (var i = this.nodePath.length - 1; i >= 0; i--) {
                var node = this.nodePath[i];
                if (node.type === nodes.NodeType.Builtin) {
                    this.getCompletionsForBuiltin(result);
                    // this.getCompletionForTopLevel(result);
                    // } else if (node instanceof nodes.Variable) {
                    // this.getCompletionsForVariableDeclaration()
                }
                if (result.items.length > 0 || this.offset > node.offset) {
                    return this.finalize(result);
                }
            }
            if (result.items.length === 0) {
                if (this.variablePrefix && this.currentWord.indexOf(this.variablePrefix) === 0) {
                    this.getVariableProposals(null, result);
                }
            }
            return this.finalize(result);
        }
        finally {
            // don't hold on any state, clear symbolContext
            this.position = null;
            this.currentWord = null;
            this.textDocument = null;
            this.styleSheet = null;
            this.symbolContext = null;
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
    CSSCompletion.prototype.getCompletionsForBuiltin = function (result) {
        var builtins = languageFacts.getBuiltins();
        for (var _i = 0, _a = builtins; _i < _a.length; _i++) {
            result.items.push({
                label: _a[_i]["name"],
                detail: "(command) builtin",
                documentation: "*choice\n\nDisplays a choice of options to the player.",
                textEdit: TextEdit.replace(this.getCompletionRange(null), _a[_i]["name"]),
                kind: CompletionItemKind.Keyword
            });
        }
        return result;
    };
    CSSCompletion.prototype.getCSSWideKeywordProposals = function (entry, existingNode, result) {
        for (var keywords in languageFacts.cssWideKeywords) {
            result.items.push({
                label: keywords,
                documentation: languageFacts.cssWideKeywords[keywords],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), keywords),
                kind: CompletionItemKind.Value
            });
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionsForInterpolation = function (node, result) {
        if (this.offset >= node.offset + 2) {
            this.getVariableProposals(null, result);
        }
        return result;
    };
    CSSCompletion.prototype.getVariableProposals = function (existingNode, result) {
        var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
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
            if (symbol.node.type === nodes.NodeType.FunctionParameter) {
                var mixinNode = (symbol.node.getParent());
                if (mixinNode.type === nodes.NodeType.MixinDeclaration) {
                    suggest.detail = localize('completion.argument', 'argument from \'{0}\'', mixinNode.getName());
                }
            }
            result.items.push(suggest);
        }
        return result;
    };
    CSSCompletion.prototype.getVariableProposalsForCSSVarFunction = function (result) {
        var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Variable);
        symbols = symbols.filter(function (symbol) {
            return strings.startsWith(symbol.name, '--');
        });
        for (var _b = 0, symbols_2 = symbols; _b < symbols_2.length; _b++) {
            var symbol = symbols_2[_b];
            result.items.push({
                label: symbol.name,
                documentation: symbol.value ? strings.getLimitedString(symbol.value) : symbol.value,
                textEdit: TextEdit.replace(this.getCompletionRange(null), symbol.name),
                kind: CompletionItemKind.Variable
            });
        }
        return result;
    };
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
    CSSCompletion.prototype.getColorProposals = function (entry, existingNode, result) {
        for (var color in languageFacts.colors) {
            result.items.push({
                label: color,
                documentation: languageFacts.colors[color],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                kind: CompletionItemKind.Color
            });
        }
        for (var color in languageFacts.colorKeywords) {
            result.items.push({
                label: color,
                documentation: languageFacts.colorKeywords[color],
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                kind: CompletionItemKind.Value
            });
        }
        var colorValues = new Set();
        this.styleSheet.acceptVisitor(new ColorValueCollector(colorValues, this.offset));
        for (var _b = 0, _c = colorValues.getEntries(); _b < _c.length; _b++) {
            var color = _c[_b];
            result.items.push({
                label: color,
                textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
                kind: CompletionItemKind.Color
            });
        }
        var _loop_1 = function (p) {
            var tabStop = 1;
            var replaceFunction = function (match, p1) { return '${' + tabStop++ + ':' + p1 + '}'; };
            var insertText = p.func.replace(/\[?\$(\w+)\]?/g, replaceFunction);
            result.items.push({
                label: p.func.substr(0, p.func.indexOf('(')),
                detail: p.func,
                documentation: p.desc,
                textEdit: TextEdit.replace(this_1.getCompletionRange(existingNode), insertText),
                insertTextFormat: SnippetFormat,
                kind: CompletionItemKind.Function
            });
        };
        var this_1 = this;
        for (var _d = 0, _e = languageFacts.colorFunctions; _d < _e.length; _d++) {
            var p = _e[_d];
            _loop_1(p);
        }
        return result;
    };
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
        if (this.offset > declaration.colonPosition) {
            this.getVariableProposals(declaration.getValue(), result);
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionsForFunctionArgument = function (arg, func, result) {
        if (func.getIdentifier().getText() === 'var') {
            if (!func.getArguments().hasChildren() || func.getArguments().getChild(0) === arg) {
                this.getVariableProposalsForCSSVarFunction(result);
            }
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionsForFunctionDeclaration = function (decl, result) {
        var declarations = decl.getDeclarations();
        if (declarations && this.offset > declarations.offset && this.offset < declarations.end) {
            this.getTermProposals(null, null, result);
        }
        return result;
    };
    CSSCompletion.prototype.getCompletionsForMixinReference = function (ref, result) {
        var allMixins = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Mixin);
        for (var _b = 0, allMixins_1 = allMixins; _b < allMixins_1.length; _b++) {
            var mixinSymbol = allMixins_1[_b];
            if (mixinSymbol.node instanceof nodes.MixinDeclaration) {
                result.items.push(this.makeTermProposal(mixinSymbol, mixinSymbol.node.getParameters(), null));
            }
        }
        return result;
    };
    CSSCompletion.prototype.getTermProposals = function (entry, existingNode, result) {
        var allFunctions = this.getSymbolContext().findSymbolsAtOffset(this.offset, nodes.ReferenceType.Function);
        for (var _b = 0, allFunctions_1 = allFunctions; _b < allFunctions_1.length; _b++) {
            var functionSymbol = allFunctions_1[_b];
            if (functionSymbol.node instanceof nodes.FunctionDeclaration) {
                result.items.push(this.makeTermProposal(functionSymbol, functionSymbol.node.getParameters(), existingNode));
            }
        }
        return result;
    };
    CSSCompletion.prototype.makeTermProposal = function (symbol, parameters, existingNode) {
        var decl = symbol.node;
        var params = parameters.getChildren().map(function (c) {
            return (c instanceof nodes.FunctionParameter) ? c.getName() : c.getText();
        });
        var insertText = symbol.name + '(' + params.map(function (p, index) { return '${' + (index + 1) + ':' + p + '}'; }).join(', ') + ')';
        return {
            label: symbol.name,
            detail: symbol.name + '(' + params.join(', ') + ')',
            textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
            insertTextFormat: SnippetFormat,
            kind: CompletionItemKind.Function,
            sortText: 'z'
        };
    };
    CSSCompletion.prototype.getCompletionsForExtendsReference = function (extendsRef, existingNode, result) {
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
function collectValues(styleSheet, declaration) {
    var fullPropertyName = declaration.getFullPropertyName();
    var entries = new Set();
    function visitValue(node) {
        if (node instanceof nodes.Identifier || node instanceof nodes.NumericValue || node instanceof nodes.HexColorValue) {
            entries.add(node.getText());
        }
        return true;
    }
    function matchesProperty(decl) {
        var propertyName = decl.getFullPropertyName();
        return fullPropertyName === propertyName;
    }
    function vistNode(node) {
        if (node instanceof nodes.Declaration && node !== declaration) {
            if (matchesProperty(node)) {
                var value = node.getValue();
                if (value) {
                    value.accept(visitValue);
                }
            }
        }
        return true;
    }
    styleSheet.accept(vistNode);
    return entries;
}
var ColorValueCollector = /** @class */ (function () {
    function ColorValueCollector(entries, currentOffset) {
        this.entries = entries;
        this.currentOffset = currentOffset;
        // nothing to do
    }
    ColorValueCollector.prototype.visitNode = function (node) {
        if (node instanceof nodes.HexColorValue || (node instanceof nodes.Function && languageFacts.isColorConstructor(node))) {
            if (this.currentOffset < node.offset || node.end < this.currentOffset) {
                this.entries.add(node.getText());
            }
        }
        return true;
    };
    return ColorValueCollector;
}());
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