/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as choicescriptService from './_deps/vscode-choicescript-languageservice/cssLanguageService.js';
var ChoiceScriptWorker = /** @class */ (function () {
    function ChoiceScriptWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._cslanguageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        switch (this._languageId) {
            case 'css':
                this._languageService = choicescriptService.getCSSLanguageService();
                this._languageService.configure(this._languageSettings);
                break;
            case 'less':
                this._languageService = choicescriptService.getLESSLanguageService();
                this._languageService.configure(this._languageSettings);
                break;
            case 'scss':
                this._languageService = choicescriptService.getSCSSLanguageService();
                this._languageService.configure(this._languageSettings);
                break;
            case 'choicescript':
            case 'xml':
                this._languageService = choicescriptService.getCSSLanguageService();
                this._languageService.configure(this._languageSettings);
                this._csLanguageService = choicescriptService.getChoiceScriptLanguageService();
                this._csLanguageService.configure(this._cslanguageSettings);
                break;
            default:
                throw new Error('Invalid language id: ' + this._languageId);
        }
    }
    ChoiceScriptWorker.prototype.doComplete = function () {
        return Promise.resolve('hello world');
    };
    ChoiceScriptWorker.prototype.doValidation = function () {
        return Promise.resolve('hello validation');
    };
    ChoiceScriptWorker.prototype.doHover = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, hover;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._csLanguageService.parseScene(document);
                hover = this._csLanguageService.doHover(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(hover)];
            });
        });
    };
    ChoiceScriptWorker.prototype.doValidation3 = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, diagnostics;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                if (document) {
                    stylesheet = this._csLanguageService.parseScene(document);
                    diagnostics = this._csLanguageService.doValidation(document, stylesheet);
                    return [2 /*return*/, Promise.resolve(diagnostics)];
                }
                return [2 /*return*/, Promise.resolve([])];
            });
        });
    };
    ChoiceScriptWorker.prototype._getStartupTextDocument = function () {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (/\/startup\.txt$/.test(model.uri.toString())) {
                return choicescriptService.TextDocument.create(model.uri.toString(), this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    ChoiceScriptWorker.prototype._getProjectPath = function (uri) {
        return uri.slice(0, uri.lastIndexOf('/') + 1);
    };
    ChoiceScriptWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
            var model = models_2[_i];
            if (model.uri.toString() === uri) {
                return choicescriptService.TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    ChoiceScriptWorker.prototype._getAllProjectTextDocuments = function (uri) {
        var docs = [];
        var projectPath = this._getProjectPath(uri);
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_3 = models; _i < models_3.length; _i++) {
            var model = models_3[_i];
            if (this._getProjectPath(model.uri.toString()) === projectPath) {
                docs.push(choicescriptService.TextDocument.create(model.uri.toString(), this._languageId, model.version, model.getValue()));
            }
        }
        return docs;
    };
    ChoiceScriptWorker.prototype.removeIndex = function (uri) {
        this._csLanguageService.purgeProject(uri, [uri]);
    };
    ChoiceScriptWorker.prototype.updateIndex = function (uri) {
        this._csLanguageService.updateProject(uri, [this._getTextDocument(uri)]);
    };
    ChoiceScriptWorker.prototype.doComplete3 = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, completions;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._csLanguageService.parseScene(document);
                completions = this._csLanguageService.doComplete(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(completions)];
            });
        });
    };
    ChoiceScriptWorker.prototype.findDefinition = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var localDocument, localScene, definition;
            return __generator(this, function (_a) {
                localDocument = this._getTextDocument(uri);
                localScene = this._csLanguageService.parseScene(localDocument);
                definition = this._csLanguageService.findDefinition(localDocument, position, localScene);
                return [2 /*return*/, Promise.resolve(definition)];
            });
        });
    };
    ChoiceScriptWorker.prototype.findReferences = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, references;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._csLanguageService.parseScene(document);
                references = this._csLanguageService.findReferences(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(references)];
            });
        });
    };
    ChoiceScriptWorker.prototype.findDocumentSymbols = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, scene, symbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                scene = this._csLanguageService.parseScene(document);
                symbols = this._csLanguageService.findDocumentSymbols(document, scene, false /* includeGlobals */);
                return [2 /*return*/, Promise.resolve(symbols)];
            });
        });
    };
    ChoiceScriptWorker.prototype.configure = function (settings) {
        this._csLanguageService.configure(settings);
    };
    return ChoiceScriptWorker;
}());
export { ChoiceScriptWorker };
export function create(ctx, createData) {
    return new ChoiceScriptWorker(ctx, createData);
}
