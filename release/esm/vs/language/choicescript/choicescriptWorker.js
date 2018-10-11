/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var Promise = monaco.Promise;
import * as choicescriptService from './_deps/vscode-css-languageservice/cssLanguageService.js';
import * as ls from './_deps/vscode-languageserver-types/main.js';
var CSSWorker = /** @class */ (function () {
    function CSSWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        switch (this._languageId) {
            case 'choicescript':
                this._languageService = choicescriptService.getCSSLanguageService();
                break;
            default:
                throw new Error('Invalid language id: ' + this._languageId);
        }
        this._languageService.configure(this._languageSettings);
    }
    // --- language service host ---------------
    CSSWorker.prototype.doSpellCheck = function (uri) {
        var document = this._getTextDocument(uri);
        if (document) {
            var stylesheet = this._languageService.parseStylesheet(document);
            var check = this._languageService.doSpellCheck(document, stylesheet);
            return Promise.as(check);
        }
        return Promise.as([]);
    };
    CSSWorker.prototype.doComplete = function (uri, position) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var completions = this._languageService.doComplete(document, position, stylesheet);
        return Promise.as(completions);
    };
    CSSWorker.prototype.doHover = function (uri, position) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var hover = this._languageService.doHover(document, position, stylesheet);
        return Promise.as(hover);
    };
    CSSWorker.prototype.findDefinition = function (uri, position) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var definition = this._languageService.findDefinition(document, position, stylesheet);
        return Promise.as(definition);
    };
    CSSWorker.prototype.findReferences = function (uri, position) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var references = this._languageService.findReferences(document, position, stylesheet);
        return Promise.as(references);
    };
    CSSWorker.prototype.findDocumentHighlights = function (uri, position) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var highlights = this._languageService.findDocumentHighlights(document, position, stylesheet);
        return Promise.as(highlights);
    };
    CSSWorker.prototype.findDocumentSymbols = function (uri) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var symbols = this._languageService.findDocumentSymbols(document, stylesheet);
        return Promise.as(symbols);
    };
    CSSWorker.prototype.findDocumentColors = function (uri) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var colorSymbols = this._languageService.findDocumentColors(document, stylesheet);
        return Promise.as(colorSymbols);
    };
    CSSWorker.prototype.getColorPresentations = function (uri, color, range) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseStylesheet(document);
        var colorPresentations = this._languageService.getColorPresentations(document, stylesheet, color, range);
        return Promise.as(colorPresentations);
    };
    CSSWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return ls.TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return CSSWorker;
}());
export { CSSWorker };
export function create(ctx, createData) {
    return new CSSWorker(ctx, createData);
}
