import './....editoreditor.api.jsapi';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var Emitter = monaco.Emitter;
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "languageId", {
        get: function () {
            return this._languageId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "modeConfiguration", {
        get: function () {
            return this._modeConfiguration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LanguageServiceDefaultsImpl.prototype, "diagnosticsOptions", {
        get: function () {
            return this._diagnosticsOptions;
        },
        enumerable: true,
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
    ;
    return LanguageServiceDefaultsImpl;
}());
export { LanguageServiceDefaultsImpl };
var diagnosticDefault = {
    // Generally try to disable things by default
    // when we're using CSIDE but enable otherwise
    // for ease of testing.
    validate: (typeof window.cside !== "undefined") ? false : true,
    spellCheckSettings: {
        rootPath: (typeof window.cside !== "undefined") ? "" : "https://raw.githubusercontent.com/ChoicescriptIDE/main/latest/source/lib/typo/dictionaries/",
        enabled: (typeof window.cside !== "undefined") ? false : true,
        dictionary: "en_US",
        userDictionaries: {
            persistent: {},
            session: {}
        }
    },
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
    definitions: false,
    references: false,
    documentHighlights: false,
    rename: false,
    colors: false,
    foldingRanges: false,
    diagnostics: true,
    selectionRanges: false
};
var choicescriptDefaults = new LanguageServiceDefaultsImpl('choicescript', diagnosticDefault, modeConfigurationDefault);
// Export API
function createAPI() {
    return {
        choicescriptDefaults: choicescriptDefaults,
    };
}
monaco.languages.choicescript = createAPI();
// --- Registration to monaco editor ---
function getMode() {
    return import('./choicescriptMode.js');
}
monaco.languages.onLanguage('choicescript', function () {
    getMode().then(function (mode) { return mode.setupMode(choicescriptDefaults); });
});
