/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
// Allow for running under nodejs/requirejs in tests
var _monaco = (typeof monaco === 'undefined' ? self.monaco : monaco);
var languageDefinitions = {};
function _loadLanguage(languageId) {
    var loader = languageDefinitions[languageId].loader;
    return loader().then(function (mod) {
        _monaco.languages.setMonarchTokensProvider(languageId, mod.language);
        _monaco.languages.setLanguageConfiguration(languageId, mod.conf);
        _monaco.languages.registerOnTypeFormattingEditProvider(languageId, mod.formatProvider);
        for (var i = 0; i < mod.themes.definitions.length; i++) {
            _monaco.editor.defineTheme(mod.themes.ids[i], mod.themes.definitions[i]);
        }
    });
}
var languagePromises = {};
export function loadLanguage(languageId) {
    if (!languagePromises[languageId]) {
        languagePromises[languageId] = _loadLanguage(languageId);
    }
    return languagePromises[languageId];
}
export function registerLanguage(def) {
    var languageId = def.lang.id;
    languageDefinitions[languageId] = def;
    _monaco.languages.register(def.lang);
    _monaco.languages.onLanguage(languageId, function () {
        loadLanguage(languageId);
    });
}
