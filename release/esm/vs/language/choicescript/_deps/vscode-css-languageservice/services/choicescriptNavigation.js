/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Location, Range, SymbolKind } from './../_deps/vscode-languageserver-types/main.js';
import * as nls from './../../../fillers/vscode-nls.js';
import * as nodes from '../parser/cssNodes.js';
import { Symbols } from '../parser/choicescriptSymbolScope.js';
var localize = nls.loadMessageBundle();
var ChoiceScriptNavigation = /** @class */ (function () {
    function ChoiceScriptNavigation() {
    }
    ChoiceScriptNavigation.prototype.findDefinition = function (document, position, scene) {
        var symbols = new Symbols(scene);
        var offset = document.offsetAt(position);
        var node = nodes.getNodeAtOffset(scene, offset);
        if (!node) {
            return null;
        }
        var symbol = symbols.findSymbolFromNode(node);
        if (!symbol) {
            return null;
        }
        return {
            uri: document.uri,
            range: getRange(symbol.node, document)
        };
    };
    /*
        public findReferences(document: TextDocument, position: Position, scene: nodes.Scene): Location[] {
            let highlights = this.findDocumentHighlights(document, position, scene);
            return highlights.map(h => {
                return {
                    uri: document.uri,
                    range: h.range
                };
            });
        }
    */
    /*
    public findDocumentHighlights(document: TextDocument, position: Position, scene: nodes.Scene): DocumentHighlight[] {
        let result: DocumentHighlight[] = [];

        let offset = document.offsetAt(position);
        let node = nodes.getNodeAtOffset(scene, offset);
        if (!node || node.type === nodes.NodeType.Scene || node.type === nodes.NodeType.VariableDeclaration) {
            return result;
        }
        if (node.type === nodes.NodeType.Identifier && node.parent && node.parent.type === nodes.NodeType.ClassSelector) {
            node = node.parent;
        }

        let symbols = new Symbols(scene);
        let symbol = symbols.findSymbolFromNode(node);
        let name = node.getText();

        scene.accept(candidate => {
            if (symbol) {
                if (symbols.matchesSymbol(candidate, symbol)) {
                    result.push({
                        kind: getHighlightKind(candidate),
                        range: getRange(candidate, document)
                    });
                    return false;
                }
            } else if (node.type === candidate.type && node.length === candidate.length && name === candidate.getText()) {
                // Same node type and data
                result.push({
                    kind: getHighlightKind(candidate),
                    range: getRange(candidate, document)
                });
            }
            return true;
        });

        return result;
    }*/
    ChoiceScriptNavigation.prototype.findDocumentSymbols = function (document, scene) {
        var result = [];
        scene.accept(function (node) {
            var entry = {
                name: null,
                kind: SymbolKind.Class,
                location: null
            };
            var locationNode = node;
            if (node instanceof nodes.VariableDeclaration) {
                entry.name = node.getName();
                entry.kind = SymbolKind.Variable;
            }
            else if (node instanceof nodes.LabelDeclaration) {
                entry.name = node.getLabel().getName();
                entry.kind = SymbolKind.Function;
            }
            if (entry.name) {
                entry.location = Location.create(document.uri, getRange(locationNode, document));
                result.push(entry);
            }
            return true;
        });
        return result;
    };
    return ChoiceScriptNavigation;
}());
export { ChoiceScriptNavigation };
function getRange(node, document) {
    return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
}
/*
function getHighlightKind(node: nodes.Node): DocumentHighlightKind {

    if (node.type === nodes.NodeType.Selector) {
        return DocumentHighlightKind.Write;
    }

    if (node instanceof nodes.Identifier) {
        if (node.parent && node.parent instanceof nodes.Property) {
            if (node.isCustomProperty) {
                return DocumentHighlightKind.Write;
            }
        }
    }

    if (node.parent) {
        switch (node.parent.type) {
            case nodes.NodeType.FunctionDeclaration:
            case nodes.NodeType.Keyframe:
            case nodes.NodeType.VariableDeclaration:
            case nodes.NodeType.FunctionParameter:
                return DocumentHighlightKind.Write;
        }
    }

    return DocumentHighlightKind.Read;
}*/
function toTwoDigitHex(n) {
    var r = n.toString(16);
    return r.length !== 2 ? '0' + r : r;
}
//# sourceMappingURL=choicescriptNavigation.js.map