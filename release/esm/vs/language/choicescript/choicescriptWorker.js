/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as choicescriptService from './_deps/vscode-css-languageservice/cssLanguageService.js';
var ChoiceScriptWorker = /** @class */ (function () {
    function ChoiceScriptWorker(ctx, createData) {
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
    ChoiceScriptWorker.prototype.doValidation = function (uri) {
        var document = this._getTextDocument(uri);
        if (document) {
            var scene = this._languageService.parseScene(document);
            var check = this._languageService.doValidation(document, scene, this._languageSettings);
            return Promise.resolve(check);
        }
        return Promise.resolve([]);
    };
    ChoiceScriptWorker.prototype.doComplete = function (uri, position) {
        var document = this._getTextDocument(uri);
        var scene = this._languageService.parseScene(document);
        var completions = this._languageService.doComplete(document, position, scene);
        return Promise.resolve(completions);
    };
    ChoiceScriptWorker.prototype.doHover = function (uri, position) {
        var document = this._getTextDocument(uri);
        var scene = this._languageService.parseScene(document);
        var hover = this._languageService.doHover(document, position, scene);
        return Promise.resolve(hover);
    };
    ChoiceScriptWorker.prototype.findDefinition = function (uri, position) {
        var document = this._getTextDocument(uri);
        var scene = this._languageService.parseScene(document);
        var definition = this._languageService.findDefinition(document, position, scene);
        return Promise.resolve(definition);
    };
    /*findReferences(uri: string, position: choicescriptService.Position): Thenable<choicescriptService.Location[]> {
        let document = this._getTextDocument(uri);
        let stylesheet = this._languageService.parseScene(document);
        let references = this._languageService.findReferences(document, position, stylesheet);
        return Promise.resolve(references);
    }
    findDocumentHighlights(uri: string, position: choicescriptService.Position): Thenable<choicescriptService.DocumentHighlight[]> {
        let document = this._getTextDocument(uri);
        let stylesheet = this._languageService.parseScene(document);
        let highlights = this._languageService.findDocumentHighlights(document, position, stylesheet);
        return Promise.resolve(highlights);
    }*/
    ChoiceScriptWorker.prototype.findDocumentSymbols = function (uri) {
        var document = this._getTextDocument(uri);
        var scene = this._languageService.parseScene(document);
        var symbols = this._languageService.findDocumentSymbols(document, scene);
        return Promise.resolve(symbols);
    };
    ChoiceScriptWorker.prototype.doCodeActions = function (uri, range, context) {
        var document = this._getTextDocument(uri);
        var stylesheet = this._languageService.parseScene(document);
        var actions = this._languageService.doCodeActions(document, range, context, stylesheet);
        return Promise.resolve(actions);
    };
    /*findDocumentColors(uri: string): Thenable<choicescriptService.ColorInformation[]> {
        let document = this._getTextDocument(uri);
        let stylesheet = this._languageService.parseScene(document);
        let colorSymbols = this._languageService.findDocumentColors(document, stylesheet);
        return Promise.resolve(colorSymbols);
    }
    getColorPresentations(uri: string, color: choicescriptService.Color, range: choicescriptService.Range): Thenable<choicescriptService.ColorPresentation[]> {
        let document = this._getTextDocument(uri);
        let stylesheet = this._languageService.parseScene(document);
        let colorPresentations = this._languageService.getColorPresentations(document, stylesheet, color, range);
        return Promise.resolve(colorPresentations);
    }
    getFoldingRanges(uri: string, context?: { rangeLimit?: number; }): Thenable<choicescriptService.FoldingRange[]> {
        let document = this._getTextDocument(uri);
        let ranges = this._languageService.getFoldingRanges(document, context);
        return Promise.resolve(ranges);
    }
    getSelectionRanges(uri: string, positions: choicescriptService.Position[]): Thenable<choicescriptService.SelectionRange[]> {
        let document = this._getTextDocument(uri);
        let stylesheet = this._languageService.parseScene(document);
        let ranges = this._languageService.getSelectionRanges(document, positions, stylesheet);
        return Promise.resolve(ranges);
    }
    doRename(uri: string, position: choicescriptService.Position, newName: string): Thenable<choicescriptService.WorkspaceEdit> {
        let document = this._getTextDocument(uri);
        let stylesheet = this._languageService.parseScene(document);
        let renames = this._languageService.doRename(document, position, newName, stylesheet);
        return Promise.resolve(renames);
    }*/
    ChoiceScriptWorker.prototype._getTextDocument = function (uri) {
        console.log(uri);
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return choicescriptService.TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    ChoiceScriptWorker.prototype._getStartupTextDocument = function (uri) {
        return this._getTextDocument("startup");
    };
    return ChoiceScriptWorker;
}());
export { ChoiceScriptWorker };
export function create(ctx, createData) {
    return new ChoiceScriptWorker(ctx, createData);
}
