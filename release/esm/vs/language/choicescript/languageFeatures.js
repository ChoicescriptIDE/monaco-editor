/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as choicescriptService from './_deps/vscode-css-languageservice/cssLanguageService.js';
var Uri = monaco.Uri;
var Range = monaco.Range;
// --- diagnostics --- ---
var DiagnosticsAdapter = /** @class */ (function () {
    function DiagnosticsAdapter(_languageId, _worker, defaults) {
        var _this = this;
        this._languageId = _languageId;
        this._worker = _worker;
        this._disposables = [];
        this._listener = Object.create(null);
        var onModelAdd = function (model) {
            var modeId = model.getModeId();
            if (modeId !== _this._languageId) {
                return;
            }
            var handle;
            _this._listener[model.uri.toString()] = model.onDidChangeContent(function () {
                window.clearTimeout(handle);
                handle = setTimeout(function () { return _this._doValidate(model.uri, modeId); }, 500);
            });
            _this._doValidate(model.uri, modeId);
        };
        var onModelRemoved = function (model) {
            monaco.editor.setModelMarkers(model, _this._languageId, []);
            var uriStr = model.uri.toString();
            var listener = _this._listener[uriStr];
            if (listener) {
                listener.dispose();
                delete _this._listener[uriStr];
            }
        };
        this._disposables.push(monaco.editor.onDidCreateModel(onModelAdd));
        this._disposables.push(monaco.editor.onWillDisposeModel(onModelRemoved));
        this._disposables.push(monaco.editor.onDidChangeModelLanguage(function (event) {
            onModelRemoved(event.model);
            onModelAdd(event.model);
        }));
        defaults.onDidChange(function (_) {
            monaco.editor.getModels().forEach(function (model) {
                if (model.getModeId() === _this._languageId) {
                    onModelRemoved(model);
                    onModelAdd(model);
                }
            });
        });
        this._disposables.push({
            dispose: function () {
                for (var key in _this._listener) {
                    _this._listener[key].dispose();
                }
            }
        });
        monaco.editor.getModels().forEach(onModelAdd);
    }
    DiagnosticsAdapter.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d && d.dispose(); });
        this._disposables = [];
    };
    DiagnosticsAdapter.prototype._doValidate = function (resource, languageId) {
        this._worker(resource).then(function (worker) {
            return worker.doValidation(resource.toString());
        }).then(function (diagnostics) {
            var markers = diagnostics.map(function (d) { return toDiagnostics(resource, d); });
            var model = monaco.editor.getModel(resource);
            if (model.getModeId() === languageId) {
                monaco.editor.setModelMarkers(model, languageId, markers);
            }
        }).then(undefined, function (err) {
            console.error(err);
        });
    };
    return DiagnosticsAdapter;
}());
export { DiagnosticsAdapter };
function toSeverity(lsSeverity) {
    switch (lsSeverity) {
        case choicescriptService.DiagnosticSeverity.Error: return monaco.MarkerSeverity.Error;
        case choicescriptService.DiagnosticSeverity.Warning: return monaco.MarkerSeverity.Warning;
        case choicescriptService.DiagnosticSeverity.Information: return monaco.MarkerSeverity.Info;
        case choicescriptService.DiagnosticSeverity.Hint: return monaco.MarkerSeverity.Hint;
        default:
            return monaco.MarkerSeverity.Info;
    }
}
function toDiagnostics(resource, diag) {
    var code = typeof diag.code === 'number' ? String(diag.code) : diag.code;
    return {
        severity: toSeverity(diag.severity),
        startLineNumber: diag.range.start.line + 1,
        startColumn: diag.range.start.character + 1,
        endLineNumber: diag.range.end.line + 1,
        endColumn: diag.range.end.character + 1,
        message: diag.message,
        code: code,
        source: diag.source
    };
}
// --- completion ------
function fromPosition(position) {
    if (!position) {
        return void 0;
    }
    return { character: position.column - 1, line: position.lineNumber - 1 };
}
function fromRange(range) {
    if (!range) {
        return void 0;
    }
    return { start: { line: range.startLineNumber - 1, character: range.startColumn - 1 }, end: { line: range.endLineNumber - 1, character: range.endColumn - 1 } };
}
function toRange(range) {
    if (!range) {
        return void 0;
    }
    return new monaco.Range(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}
function toCompletionItemKind(kind) {
    var mItemKind = monaco.languages.CompletionItemKind;
    switch (kind) {
        case choicescriptService.CompletionItemKind.Text: return mItemKind.Text;
        case choicescriptService.CompletionItemKind.Method: return mItemKind.Method;
        case choicescriptService.CompletionItemKind.Function: return mItemKind.Function;
        case choicescriptService.CompletionItemKind.Constructor: return mItemKind.Constructor;
        case choicescriptService.CompletionItemKind.Field: return mItemKind.Field;
        case choicescriptService.CompletionItemKind.Variable: return mItemKind.Variable;
        case choicescriptService.CompletionItemKind.Class: return mItemKind.Class;
        case choicescriptService.CompletionItemKind.Interface: return mItemKind.Interface;
        case choicescriptService.CompletionItemKind.Module: return mItemKind.Module;
        case choicescriptService.CompletionItemKind.Property: return mItemKind.Property;
        case choicescriptService.CompletionItemKind.Unit: return mItemKind.Unit;
        case choicescriptService.CompletionItemKind.Value: return mItemKind.Value;
        case choicescriptService.CompletionItemKind.Enum: return mItemKind.Enum;
        case choicescriptService.CompletionItemKind.Keyword: return mItemKind.Keyword;
        case choicescriptService.CompletionItemKind.Snippet: return mItemKind.Snippet;
        case choicescriptService.CompletionItemKind.Color: return mItemKind.Color;
        case choicescriptService.CompletionItemKind.File: return mItemKind.File;
        case choicescriptService.CompletionItemKind.Reference: return mItemKind.Reference;
    }
    return mItemKind.Property;
}
function toTextEdit(textEdit) {
    if (!textEdit) {
        return void 0;
    }
    return {
        range: toRange(textEdit.range),
        text: textEdit.newText
    };
}
var CompletionAdapter = /** @class */ (function () {
    function CompletionAdapter(_worker) {
        this._worker = _worker;
    }
    Object.defineProperty(CompletionAdapter.prototype, "triggerCharacters", {
        get: function () {
            return [' ', ':'];
        },
        enumerable: true,
        configurable: true
    });
    CompletionAdapter.prototype.provideCompletionItems = function (model, position, context, token) {
        var resource = model.uri;
        return this._worker(resource).then(function (worker) {
            return worker.doComplete(resource.toString(), fromPosition(position));
        }).then(function (info) {
            if (!info) {
                return;
            }
            var wordInfo = model.getWordUntilPosition(position);
            var wordRange = new Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);
            var items = info.items.map(function (entry) {
                var item = {
                    label: entry.label,
                    insertText: entry.insertText || entry.label,
                    sortText: entry.sortText,
                    filterText: entry.filterText,
                    documentation: entry.documentation,
                    detail: entry.detail,
                    range: wordRange,
                    kind: toCompletionItemKind(entry.kind),
                };
                if (entry.textEdit) {
                    item.range = toRange(entry.textEdit.range);
                    item.insertText = entry.textEdit.newText;
                }
                if (entry.additionalTextEdits) {
                    item.additionalTextEdits = entry.additionalTextEdits.map(toTextEdit);
                }
                if (entry.insertTextFormat === choicescriptService.InsertTextFormat.Snippet) {
                    item.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
                }
                return item;
            });
            return {
                isIncomplete: info.isIncomplete,
                suggestions: items
            };
        });
    };
    return CompletionAdapter;
}());
export { CompletionAdapter };
function isMarkupContent(thing) {
    return thing && typeof thing === 'object' && typeof thing.kind === 'string';
}
function toMarkdownString(entry) {
    if (typeof entry === 'string') {
        return {
            value: entry
        };
    }
    if (isMarkupContent(entry)) {
        if (entry.kind === 'plaintext') {
            return {
                value: entry.value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&')
            };
        }
        return {
            value: entry.value
        };
    }
    return { value: '```' + entry.language + '\n' + entry.value + '\n```\n' };
}
function toMarkedStringArray(contents) {
    if (!contents) {
        return void 0;
    }
    if (Array.isArray(contents)) {
        return contents.map(toMarkdownString);
    }
    return [toMarkdownString(contents)];
}
// --- hover ------
var HoverAdapter = /** @class */ (function () {
    function HoverAdapter(_worker) {
        this._worker = _worker;
    }
    HoverAdapter.prototype.provideHover = function (model, position, token) {
        var resource = model.uri;
        return this._worker(resource).then(function (worker) {
            return worker.doHover(resource.toString(), fromPosition(position));
        }).then(function (info) {
            if (!info) {
                return;
            }
            return {
                range: toRange(info.range),
                contents: toMarkedStringArray(info.contents)
            };
        });
    };
    return HoverAdapter;
}());
export { HoverAdapter };
// --- document highlights ------
function toDocumentHighlightKind(kind) {
    switch (kind) {
        case choicescriptService.DocumentHighlightKind.Read: return monaco.languages.DocumentHighlightKind.Read;
        case choicescriptService.DocumentHighlightKind.Write: return monaco.languages.DocumentHighlightKind.Write;
        case choicescriptService.DocumentHighlightKind.Text: return monaco.languages.DocumentHighlightKind.Text;
    }
    return monaco.languages.DocumentHighlightKind.Text;
}
/*export class DocumentHighlightAdapter implements monaco.languages.DocumentHighlightProvider {

    constructor(private _worker: WorkerAccessor) {
    }

    public provideDocumentHighlights(model: monaco.editor.IReadOnlyModel, position: Position, token: CancellationToken): Thenable<monaco.languages.DocumentHighlight[]> {
        const resource = model.uri;

        return this._worker(resource).then(worker => {
            return worker.findDocumentHighlights(resource.toString(), fromPosition(position))
        }).then(entries => {
            if (!entries) {
                return;
            }
            return entries.map(entry => {
                return <monaco.languages.DocumentHighlight>{
                    range: toRange(entry.range),
                    kind: toDocumentHighlightKind(entry.kind)
                };
            });
        });
    }
}*/
// --- definition ------
function toLocation(location) {
    return {
        uri: Uri.parse(location.uri),
        range: toRange(location.range)
    };
}
var DefinitionAdapter = /** @class */ (function () {
    function DefinitionAdapter(_worker) {
        this._worker = _worker;
    }
    DefinitionAdapter.prototype.provideDefinition = function (model, position, token) {
        var resource = model.uri;
        return this._worker(resource).then(function (worker) {
            return worker.findDefinition(resource.toString(), fromPosition(position));
        }).then(function (definition) {
            if (!definition) {
                return;
            }
            return [toLocation(definition)];
        });
    };
    return DefinitionAdapter;
}());
export { DefinitionAdapter };
// --- references ------
/*export class ReferenceAdapter implements monaco.languages.ReferenceProvider {

    constructor(private _worker: WorkerAccessor) {
    }

    provideReferences(model: monaco.editor.IReadOnlyModel, position: Position, context: monaco.languages.ReferenceContext, token: CancellationToken): Thenable<monaco.languages.Location[]> {
        const resource = model.uri;

        return this._worker(resource).then(worker => {
            return worker.findReferences(resource.toString(), fromPosition(position));
        }).then(entries => {
            if (!entries) {
                return;
            }
            return entries.map(toLocation);
        });
    }
}*/
// --- rename ------
function toWorkspaceEdit(edit) {
    if (!edit || !edit.changes) {
        return void 0;
    }
    var resourceEdits = [];
    for (var uri in edit.changes) {
        var _uri = Uri.parse(uri);
        // let edits: monaco.languages.TextEdit[] = [];
        for (var _i = 0, _a = edit.changes[uri]; _i < _a.length; _i++) {
            var e = _a[_i];
            resourceEdits.push({
                resource: _uri,
                edit: {
                    range: toRange(e.range),
                    text: e.newText
                }
            });
        }
    }
    return {
        edits: resourceEdits
    };
}
/*export class RenameAdapter implements monaco.languages.RenameProvider {

    constructor(private _worker: WorkerAccessor) {
    }

    provideRenameEdits(model: monaco.editor.IReadOnlyModel, position: Position, newName: string, token: CancellationToken): Thenable<monaco.languages.WorkspaceEdit> {
        const resource = model.uri;

        return this._worker(resource).then(worker => {
            return worker.doRename(resource.toString(), fromPosition(position), newName);
        }).then(edit => {
            return toWorkspaceEdit(edit);
        });
    }
}*/
// --- document symbols ------
function toSymbolKind(kind) {
    var mKind = monaco.languages.SymbolKind;
    switch (kind) {
        case choicescriptService.SymbolKind.File: return mKind.Array;
        case choicescriptService.SymbolKind.Module: return mKind.Module;
        case choicescriptService.SymbolKind.Namespace: return mKind.Namespace;
        case choicescriptService.SymbolKind.Package: return mKind.Package;
        case choicescriptService.SymbolKind.Class: return mKind.Class;
        case choicescriptService.SymbolKind.Method: return mKind.Method;
        case choicescriptService.SymbolKind.Property: return mKind.Property;
        case choicescriptService.SymbolKind.Field: return mKind.Field;
        case choicescriptService.SymbolKind.Constructor: return mKind.Constructor;
        case choicescriptService.SymbolKind.Enum: return mKind.Enum;
        case choicescriptService.SymbolKind.Interface: return mKind.Interface;
        case choicescriptService.SymbolKind.Function: return mKind.Function;
        case choicescriptService.SymbolKind.Variable: return mKind.Variable;
        case choicescriptService.SymbolKind.Constant: return mKind.Constant;
        case choicescriptService.SymbolKind.String: return mKind.String;
        case choicescriptService.SymbolKind.Number: return mKind.Number;
        case choicescriptService.SymbolKind.Boolean: return mKind.Boolean;
        case choicescriptService.SymbolKind.Array: return mKind.Array;
    }
    return mKind.Function;
}
var DocumentSymbolAdapter = /** @class */ (function () {
    function DocumentSymbolAdapter(_worker) {
        this._worker = _worker;
    }
    DocumentSymbolAdapter.prototype.provideDocumentSymbols = function (model, token) {
        var resource = model.uri;
        return this._worker(resource).then(function (worker) { return worker.findDocumentSymbols(resource.toString()); }).then(function (items) {
            if (!items) {
                return;
            }
            return items.map(function (item) { return ({
                name: item.name,
                detail: '',
                containerName: item.containerName,
                kind: toSymbolKind(item.kind),
                tags: [],
                range: toRange(item.location.range),
                selectionRange: toRange(item.location.range)
            }); });
        });
    };
    return DocumentSymbolAdapter;
}());
export { DocumentSymbolAdapter };
/*export class DocumentColorAdapter implements monaco.languages.DocumentColorProvider {

    constructor(private _worker: WorkerAccessor) {
    }

    public provideDocumentColors(model: monaco.editor.IReadOnlyModel, token: CancellationToken): Thenable<monaco.languages.IColorInformation[]> {
        const resource = model.uri;

        return this._worker(resource).then(worker => worker.findDocumentColors(resource.toString())).then(infos => {
            if (!infos) {
                return;
            }
            return infos.map(item => ({
                color: item.color,
                range: toRange(item.range)
            }));
        });
    }

    public provideColorPresentations(model: monaco.editor.IReadOnlyModel, info: monaco.languages.IColorInformation, token: CancellationToken): Thenable<monaco.languages.IColorPresentation[]> {
        const resource = model.uri;

        return this._worker(resource).then(worker => worker.getColorPresentations(resource.toString(), info.color, fromRange(info.range))).then(presentations => {
            if (!presentations) {
                return;
            }
            return presentations.map(presentation => {
                let item: monaco.languages.IColorPresentation = {
                    label: presentation.label,
                };
                if (presentation.textEdit) {
                    item.textEdit = toTextEdit(presentation.textEdit)
                }
                if (presentation.additionalTextEdits) {
                    item.additionalTextEdits = presentation.additionalTextEdits.map(toTextEdit)
                }
                return item;
            });
        });
    }
}*/
/*export class FoldingRangeAdapter implements monaco.languages.FoldingRangeProvider {

    constructor(private _worker: WorkerAccessor) {
    }

    public provideFoldingRanges(model: monaco.editor.IReadOnlyModel, context: monaco.languages.FoldingContext, token: CancellationToken): Thenable<monaco.languages.FoldingRange[]> {
        const resource = model.uri;

        return this._worker(resource).then(worker => worker.getFoldingRanges(resource.toString(), context)).then(ranges => {
            if (!ranges) {
                return;
            }
            return ranges.map(range => {
                let result: monaco.languages.FoldingRange = {
                    start: range.startLine + 1,
                    end: range.endLine + 1
                };
                if (typeof range.kind !== 'undefined') {
                    result.kind = toFoldingRangeKind(<choicescriptService.FoldingRangeKind>range.kind);
                }
                return result;
            });
        });
    }

}*/
function toFoldingRangeKind(kind) {
    switch (kind) {
        case choicescriptService.FoldingRangeKind.Comment: return monaco.languages.FoldingRangeKind.Comment;
        case choicescriptService.FoldingRangeKind.Imports: return monaco.languages.FoldingRangeKind.Imports;
        case choicescriptService.FoldingRangeKind.Region: return monaco.languages.FoldingRangeKind.Region;
    }
    return void 0;
}
