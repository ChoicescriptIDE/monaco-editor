/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Rules } from './textRules.js';
import * as nodes from '../parser/cssNodes.js';
import * as nls from './../../../fillers/vscode-nls.js';
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
                this.addEntry(node, Rules.BadSpelling, "Bad spelling: " + node.getText());
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
export { SpellCheckVisitor };
//# sourceMappingURL=spellcheck.js.map