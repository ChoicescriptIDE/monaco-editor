/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { WorkerManager } from './workerManagerChoiceScript.js';
import * as languageFeatures from './languageFeaturesChoiceScript.js';
import { languages, Range } from './fillers/monaco-editor-core.js';
export function setupMode(defaults) {
    var disposables = [];
    var providers = [];
    var client = new WorkerManager(defaults);
    disposables.push(client);
    var worker = function () {
        var uris = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            uris[_i] = arguments[_i];
        }
        return client.getLanguageServiceWorker.apply(client, uris);
    };
    function registerProviders() {
        var languageId = defaults.languageId, modeConfiguration = defaults.modeConfiguration;
        disposeAll(providers);
        if (modeConfiguration.completionItems) {
            providers.push(languages.registerCompletionItemProvider(languageId, new languageFeatures.CompletionAdapter(worker)));
        }
        if (modeConfiguration.hovers) {
            providers.push(languages.registerHoverProvider(languageId, new languageFeatures.HoverAdapter(worker)));
        }
        if (false) {
            /*providers.push(
                languages.registerDocumentHighlightProvider(
                    languageId,
                    new languageFeatures.DocumentHighlightAdapter(worker)
                )
            );*/
        }
        if (modeConfiguration.definitions) {
            providers.push(languages.registerDefinitionProvider(languageId, new languageFeatures.DefinitionAdapter(worker)));
        }
        if (modeConfiguration.references) {
            providers.push(languages.registerReferenceProvider(languageId, new languageFeatures.ReferenceAdapter(worker)));
        }
        if (modeConfiguration.documentSymbols) {
            providers.push(languages.registerDocumentSymbolProvider(languageId, new languageFeatures.DocumentSymbolAdapter(worker)));
        }
        if (false) {
            /*providers.push(
                languages.registerRenameProvider(languageId, new languageFeatures.RenameAdapter(worker))
            );*/
        }
        if (false) {
            /*providers.push(
                languages.registerColorProvider(
                    languageId,
                    new languageFeatures.DocumentColorAdapter(worker)
                )
            );*/
        }
        if (modeConfiguration.foldingRanges) {
            /*providers.push(
                languages.registerFoldingRangeProvider(
                    languageId,
                    new languageFeatures.FoldingRangeAdapter(worker)
                )
            );*/
        }
        if (modeConfiguration.diagnostics) {
            providers.push(new languageFeatures.DiagnosticsAdapter(languageId, worker, defaults));
        }
        if (false) {
            /*providers.push(
                languages.registerSelectionRangeProvider(
                    languageId,
                    new languageFeatures.SelectionRangeAdapter(worker)
                )
            );*/
        }
        if (modeConfiguration.autoFormat) {
            var autoFormatMap = {
                '.': { match: '...', result: '…' },
                '-': { match: '--', result: '—' } // emdash
            };
            providers.push(languages.registerOnTypeFormattingEditProvider(languageId, {
                autoFormatTriggerCharacters: Object.keys(autoFormatMap),
                provideOnTypeFormattingEdits: function (model, position, character, options, token) {
                    var matchLength = autoFormatMap[character].match.length;
                    var range = new Range(position.lineNumber, position.column >= matchLength ? position.column - matchLength : 0, position.lineNumber, position.column);
                    if (model.getValueInRange(range) === autoFormatMap[character].match) {
                        return [
                            {
                                range: range,
                                text: autoFormatMap[character].result
                            }
                        ];
                    }
                }
            }));
        }
        if (true /* Project Indexing */) {
            providers.push(new languageFeatures.IndexAdapter(languageId, worker));
        }
    }
    registerProviders();
    disposables.push(asDisposable(providers));
    return asDisposable(disposables);
}
function asDisposable(disposables) {
    return { dispose: function () { return disposeAll(disposables); } };
}
function disposeAll(disposables) {
    while (disposables.length) {
        disposables.pop().dispose();
    }
}
