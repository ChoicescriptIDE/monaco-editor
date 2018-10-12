/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes.js';
import { Range, DiagnosticSeverity } from './../_deps/vscode-languageserver-types/main.js';
import { Rules } from './textRules.js';
import { SpellCheckVisitor } from './spellcheck.js';
import { Typo } from './typo/typo.js';
var CSSpellCheck = /** @class */ (function () {
    function CSSpellCheck() {
    }
    CSSpellCheck.prototype.configure = function (settings) {
        this.settings = settings;
    };
    CSSpellCheck.prototype.doSpellCheck = function (document, stylesheet, settings) {
        if (settings === void 0) { settings = this.settings; }
        if (settings && settings.validate === false) {
            return [];
        }
        // Might be a better place to do this...
        this.typo = new Typo("", "", "", {
            platform: 'any'
        });
        this.typo = new Typo("en_US", this.typo._readFile("https://raw.githubusercontent.com/cfinke/Typo.js/master/typo/dictionaries/en_US/en_US.aff"), this.typo._readFile("https://raw.githubusercontent.com/cfinke/Typo.js/master/typo/dictionaries/en_US/en_US.dic"), {
            platform: 'any'
        });
        var entries = [];
        entries.push.apply(entries, nodes.ParseErrorCollector.entries(stylesheet));
        entries.push.apply(entries, SpellCheckVisitor.entries(stylesheet, document, null, (nodes.Level.Warning | nodes.Level.Error), this.typo));
        var ruleIds = [];
        for (var r in Rules) {
            ruleIds.push(Rules[r].id);
        }
        function toDiagnostic(marker) {
            var range = Range.create(document.positionAt(marker.getOffset()), document.positionAt(marker.getOffset() + marker.getLength()));
            var source = ruleIds.indexOf(marker.getRule().id) !== -1
                ? document.languageId + ".lint." + marker.getRule().id
                : document.languageId;
            return {
                code: marker.getRule().id,
                source: source,
                message: marker.getMessage(),
                severity: marker.getLevel() === nodes.Level.Warning ? DiagnosticSeverity.Warning : DiagnosticSeverity.Error,
                range: range
            };
        }
        return entries.filter(function (entry) { return entry.getLevel() !== nodes.Level.Ignore; }).map(toDiagnostic);
    };
    return CSSpellCheck;
}());
export { CSSpellCheck };
//# sourceMappingURL=CSSpellCheck.js.map