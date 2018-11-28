/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes.js';
import { Rules } from '../services/lintRules.js';
import { Command, TextEdit, CodeAction, CodeActionKind, TextDocumentEdit, VersionedTextDocumentIdentifier } from './../_deps/vscode-languageserver-types/main.js';
import * as nls from './../../../fillers/vscode-nls.js';
var localize = nls.loadMessageBundle();
var ChoiceScriptCodeActions = /** @class */ (function () {
    function ChoiceScriptCodeActions() {
    }
    ChoiceScriptCodeActions.prototype.doCodeActions = function (document, range, context, scene) {
        return this.doCodeActions2(document, range, context, scene).map(function (ca) {
            return Command.create(ca.title, '_choicescript.applyCodeAction', document.uri, document.version, ca.edit.documentChanges[0].edits);
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
            var edit = TextEdit.replace(marker.range, suggestion);
            var documentIdentifier = VersionedTextDocumentIdentifier.create(document.uri, document.version);
            var workspaceEdit = { documentChanges: [TextDocumentEdit.create(documentIdentifier, [edit])] };
            var codeAction = CodeAction.create(title, workspaceEdit, CodeActionKind.QuickFix);
            codeAction.diagnostics = [marker];
            result.push(codeAction);
            if (--maxActions <= 0) {
                return;
            }
        }
    };
    ChoiceScriptCodeActions.prototype.appendSpellingSuggestions = function (document, stylesheet, marker, result) {
        if (marker.code !== Rules.UnknownProperty.id) {
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
export { ChoiceScriptCodeActions };
//# sourceMappingURL=ChoiceScriptCodeActions.js.map