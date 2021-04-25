import '../../editor/editor.api.js';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { editor, languages, Emitter } from './fillers/monaco-editor-core.js';
var DictionaryEvent = /** @class */ (function () {
    function DictionaryEvent() {
    }
    return DictionaryEvent;
}());
export { DictionaryEvent };
// --- CSS configuration and defaults ---------
var LanguageServiceDefaultsImpl = /** @class */ (function () {
    function LanguageServiceDefaultsImpl(languageId, diagnosticsOptions, modeConfiguration) {
        this._onDidChange = new Emitter();
        this._languageId = languageId;
        this.setDiagnosticsOptions(diagnosticsOptions);
        this.setModeConfiguration(modeConfiguration);
    }
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "onDidChange", {
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "languageId", {
        get: function () {
            return this._languageId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "modeConfiguration", {
        get: function () {
            return this._modeConfiguration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "diagnosticsOptions", {
        get: function () {
            return this._diagnosticsOptions;
        },
        enumerable: false,
        configurable: true
    });
    LanguageServiceDefaultsImpl.prototype.setDiagnosticsOptions = function (options) {
        this._diagnosticsOptions = options || Object.create(null);
        this._onDidChange.fire(this);
    };
    LanguageServiceDefaultsImpl.prototype.setModeConfiguration = function (modeConfiguration) {
        this._modeConfiguration = modeConfiguration || Object.create(null);
        this._onDidChange.fire(this);
    };
    return LanguageServiceDefaultsImpl;
}());
var diagnosticDefault = {
    validate: true,
    lint: {
        compatibleVendorPrefixes: 'ignore',
        vendorPrefix: 'warning',
        duplicateProperties: 'warning',
        emptyRules: 'warning',
        importStatement: 'ignore',
        boxModel: 'ignore',
        universalSelector: 'ignore',
        zeroUnits: 'ignore',
        fontFaceProperties: 'warning',
        hexColorLength: 'error',
        argumentsInColorFunction: 'error',
        unknownProperties: 'warning',
        ieHack: 'ignore',
        unknownVendorSpecificProperties: 'ignore',
        propertyIgnoredDueToDisplay: 'warning',
        important: 'ignore',
        float: 'ignore',
        idSelector: 'ignore'
    }
};
var modeConfigurationDefault = {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    definitions: true,
    references: true,
    documentHighlights: true,
    rename: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
    selectionRanges: true,
    autoFormat: false,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
    tokens: true
};
export var cssDefaults = new LanguageServiceDefaultsImpl('css', diagnosticDefault, modeConfigurationDefault);
export var scssDefaults = new LanguageServiceDefaultsImpl('scss', diagnosticDefault, modeConfigurationDefault);
export var lessDefaults = new LanguageServiceDefaultsImpl('less', diagnosticDefault, modeConfigurationDefault);
// export to the global based API
languages.css = { cssDefaults: cssDefaults, lessDefaults: lessDefaults, scssDefaults: scssDefaults };
// --- Registration to monaco editor ---
function getMode() {
    return import('./cssMode.js');
}
languages.onLanguage('less', function () {
    getMode().then(function (mode) { return mode.setupMode(lessDefaults); });
});
languages.onLanguage('scss', function () {
    getMode().then(function (mode) { return mode.setupMode(scssDefaults); });
});
languages.onLanguage('css', function () {
    getMode().then(function (mode) { return mode.setupMode(cssDefaults); });
});
var LanguageServiceDefaultsChoiceScriptImpl = /** @class */ (function () {
    function LanguageServiceDefaultsChoiceScriptImpl(languageId, diagnosticsOptions, modeConfiguration) {
        this._onDidChange = new Emitter();
        this._onDidDictionaryChange = new Emitter();
        this._languageId = languageId;
        this.setDiagnosticsOptions(diagnosticsOptions);
        this.setModeConfiguration(modeConfiguration);
    }
    Object.defineProperty(LanguageServiceDefaultsChoiceScriptImpl.prototype, "onDidChange", {
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsChoiceScriptImpl.prototype, "onDictionaryChange", {
        get: function () {
            return this._onDidDictionaryChange.event;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsChoiceScriptImpl.prototype, "languageId", {
        get: function () {
            return this._languageId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsChoiceScriptImpl.prototype, "modeConfiguration", {
        get: function () {
            return this._modeConfiguration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsChoiceScriptImpl.prototype, "diagnosticsOptions", {
        get: function () {
            return this._diagnosticsOptions;
        },
        enumerable: false,
        configurable: true
    });
    LanguageServiceDefaultsChoiceScriptImpl.prototype.addWordToDictionary = function (accessor, dict, word) {
        this._onDidDictionaryChange.fire({ dictionary: dict, word: word });
    };
    LanguageServiceDefaultsChoiceScriptImpl.prototype.setDiagnosticsOptions = function (options) {
        this._diagnosticsOptions = options || Object.create(null);
        this._onDidChange.fire(this);
    };
    LanguageServiceDefaultsChoiceScriptImpl.prototype.setModeConfiguration = function (modeConfiguration) {
        this._modeConfiguration = modeConfiguration || Object.create(null);
        this._onDidChange.fire(this);
    };
    return LanguageServiceDefaultsChoiceScriptImpl;
}());
var diagnosticDefaultChoiceScript = {
    validate: true,
    lint: { enabled: true },
    spellcheck: {
        enabled: true,
        dictionaryPath: 'https://raw.githubusercontent.com/cfinke/Typo.js/master/typo/dictionaries',
        dictionary: 'en_US',
        userDictionaries: null
    }
};
var modeConfigurationDefaultChoiceScript = {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    definitions: true,
    references: true,
    documentHighlights: false,
    rename: false,
    colors: false,
    foldingRanges: false,
    diagnostics: true,
    selectionRanges: false,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
    tokens: true,
    autoFormat: true
};
export var choicescriptDefaults = new LanguageServiceDefaultsChoiceScriptImpl('choicescript', diagnosticDefaultChoiceScript, modeConfigurationDefaultChoiceScript);
// export to the global based API
languages.choicescript = choicescriptDefaults;
// --- Registration to monaco editor ---
function getCSMode() {
    return import('./choicescriptMode.js');
}
languages.onLanguage('choicescript', function () {
    //getModeCS('choicescript').then(csmode => csmode.setupMode(choicescriptDefaults));
    editor.registerCommand("addWordToDictionary", function (accessor, dict, word) {
        choicescriptDefaults.addWordToDictionary(accessor, dict, word);
    });
    getCSMode().then(function (mode) {
        languages.choicescriptDispose = mode.setupMode(choicescriptDefaults);
        // handle reset on setModeConfiguration
        choicescriptDefaults.onDidChange(function () {
            var _a;
            (_a = languages.choicescriptDispose) === null || _a === void 0 ? void 0 : _a.dispose();
            languages.choicescriptDispose = mode.setupMode(choicescriptDefaults);
        });
    });
});
