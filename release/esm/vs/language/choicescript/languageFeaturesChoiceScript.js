/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as choicescriptService from './_deps/vscode-choicescript-languageservice/cssLanguageService.js';
import { languages, editor, Uri, Position, Range, MarkerSeverity } from './fillers/monaco-editor-core.js';
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
                handle = window.setTimeout(function () { return _this._doValidate(model.uri, modeId); }, 500);
            });
            _this._doValidate(model.uri, modeId);
        };
        var onModelRemoved = function (model) {
            editor.setModelMarkers(model, _this._languageId, []);
            var uriStr = model.uri.toString();
            var listener = _this._listener[uriStr];
            if (listener) {
                listener.dispose();
                delete _this._listener[uriStr];
            }
        };
        this._disposables.push(editor.onDidCreateModel(onModelAdd));
        this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
        this._disposables.push(editor.onDidChangeModelLanguage(function (event) {
            onModelRemoved(event.model);
            onModelAdd(event.model);
        }));
        this._disposables.push(defaults.onDidChange(function (_) {
            editor.getModels().forEach(function (model) {
                if (model.getModeId() === _this._languageId) {
                    onModelRemoved(model);
                    onModelAdd(model);
                }
            });
        }));
        this._disposables.push({
            dispose: function () {
                editor.getModels().forEach(onModelRemoved);
                for (var key in _this._listener) {
                    _this._listener[key].dispose();
                }
            }
        });
        editor.getModels().forEach(onModelAdd);
    }
    DiagnosticsAdapter.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d && d.dispose(); });
        this._disposables = [];
    };
    DiagnosticsAdapter.prototype._doValidate = function (resource, languageId) {
        this._worker(resource)
            .then(function (worker) {
            return worker.doValidation3(resource.toString());
        })
            .then(function (diagnostics) {
            var markers = diagnostics.map(function (d) { return toDiagnostics(resource, d); });
            var model = editor.getModel(resource);
            if (model.getModeId() === languageId) {
                editor.setModelMarkers(model, languageId, markers);
            }
        })
            .then(undefined, function (err) {
            console.error(err);
        });
    };
    return DiagnosticsAdapter;
}());
export { DiagnosticsAdapter };
function toSeverity(lsSeverity) {
    switch (lsSeverity) {
        case choicescriptService.DiagnosticSeverity.Error:
            return MarkerSeverity.Error;
        case choicescriptService.DiagnosticSeverity.Warning:
            return MarkerSeverity.Warning;
        case choicescriptService.DiagnosticSeverity.Information:
            return MarkerSeverity.Info;
        case choicescriptService.DiagnosticSeverity.Hint:
            return MarkerSeverity.Hint;
        default:
            return MarkerSeverity.Info;
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
    return {
        start: {
            line: range.startLineNumber - 1,
            character: range.startColumn - 1
        },
        end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
    };
}
function toRange(range) {
    if (!range) {
        return void 0;
    }
    return new Range(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}
function isInsertReplaceEdit(edit) {
    return (typeof edit.insert !== 'undefined' &&
        typeof edit.replace !== 'undefined');
}
function toCompletionItemKind(kind) {
    var mItemKind = languages.CompletionItemKind;
    switch (kind) {
        case choicescriptService.CompletionItemKind.Text:
            return mItemKind.Text;
        case choicescriptService.CompletionItemKind.Method:
            return mItemKind.Method;
        case choicescriptService.CompletionItemKind.Function:
            return mItemKind.Function;
        case choicescriptService.CompletionItemKind.Constructor:
            return mItemKind.Constructor;
        case choicescriptService.CompletionItemKind.Field:
            return mItemKind.Field;
        case choicescriptService.CompletionItemKind.Variable:
            return mItemKind.Variable;
        case choicescriptService.CompletionItemKind.Class:
            return mItemKind.Class;
        case choicescriptService.CompletionItemKind.Interface:
            return mItemKind.Interface;
        case choicescriptService.CompletionItemKind.Module:
            return mItemKind.Module;
        case choicescriptService.CompletionItemKind.Property:
            return mItemKind.Property;
        case choicescriptService.CompletionItemKind.Unit:
            return mItemKind.Unit;
        case choicescriptService.CompletionItemKind.Value:
            return mItemKind.Value;
        case choicescriptService.CompletionItemKind.Enum:
            return mItemKind.Enum;
        case choicescriptService.CompletionItemKind.Keyword:
            return mItemKind.Keyword;
        case choicescriptService.CompletionItemKind.Snippet:
            return mItemKind.Snippet;
        case choicescriptService.CompletionItemKind.Color:
            return mItemKind.Color;
        case choicescriptService.CompletionItemKind.File:
            return mItemKind.File;
        case choicescriptService.CompletionItemKind.Reference:
            return mItemKind.Reference;
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
        enumerable: false,
        configurable: true
    });
    CompletionAdapter.prototype.provideCompletionItems = function (model, position, context, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.doComplete3(resource.toString(), fromPosition(position));
        })
            .then(function (info) {
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
                    kind: toCompletionItemKind(entry.kind)
                };
                if (entry.textEdit) {
                    if (isInsertReplaceEdit(entry.textEdit)) {
                        item.range = {
                            insert: toRange(entry.textEdit.insert),
                            replace: toRange(entry.textEdit.replace)
                        };
                    }
                    else {
                        item.range = toRange(entry.textEdit.range);
                    }
                    item.insertText = entry.textEdit.newText;
                }
                if (entry.additionalTextEdits) {
                    item.additionalTextEdits = entry.additionalTextEdits.map(toTextEdit);
                }
                if (entry.insertTextFormat === choicescriptService.InsertTextFormat.Snippet) {
                    item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet;
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
    return (thing &&
        typeof thing === 'object' &&
        typeof thing.kind === 'string');
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
        return this._worker(resource)
            .then(function (worker) {
            return worker.doHover(resource.toString(), fromPosition(position));
        })
            .then(function (info) {
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
// --- CodeActions, Spelling QuickFix ---
var CodeActionAdapter = /** @class */ (function () {
    function CodeActionAdapter(_worker) {
        this._worker = _worker;
    }
    CodeActionAdapter.prototype.provideCodeActions = function (model, range, context, token) {
        var resource = model.uri;
        var words = [];
        return this._worker(resource)
            .then(function (worker) {
            var markers = context.markers;
            if (markers.length <= 0)
                return null;
            // Only use is spellings (for now), and we limit
            // the results to the first one, regardless of context,
            // for performance reasons.
            markers = markers.filter(function (m) { return m.code === "badSpelling"; });
            markers = markers.slice(0, 1); //
            for (var _i = 0, markers_1 = markers; _i < markers_1.length; _i++) {
                var m = markers_1[_i];
                var wordRange = new Range(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn);
                var word = model.getWordAtPosition(new Position(wordRange.startLineNumber, wordRange.startColumn));
                if (!word)
                    continue;
                words.push({ word: word.word, range: wordRange });
            }
            if (words.length <= 0)
                return null;
            return worker.suggestSpelling(words.map(function (w) { return w.word; }));
        })
            .then(function (results) {
            if (!results)
                return null;
            var actions = [];
            if (results.length > 0) {
                for (var i = 0; i < results[0].length; i++) {
                    actions.push({
                        title: "Correct spelling: " + results[0][i], kind: "quickfix",
                        edit: {
                            edits: [{ edit: { range: words[0].range, text: results[0][i] }, resource: model.uri }]
                        }
                    });
                }
            }
            actions.push({ title: "Ignore '" + words[0].word + "' this session", kind: "quickfix",
                command: { id: "addWordToDictionary", title: "Ignore Word", arguments: ["session", words[0].word] }
            }),
                actions.push({ title: "Add '" + words[0].word + "' to the User Dictionary", kind: "quickfix",
                    command: { id: "addWordToDictionary", title: "Add Word", arguments: ["persistent", words[0].word] }
                });
            return actions.length > 0 ? {
                actions: actions,
                dispose: function () { },
            } : null;
        });
    };
    return CodeActionAdapter;
}());
export { CodeActionAdapter };
// --- document highlights ------
/*function toDocumentHighlightKind(kind: number): languages.DocumentHighlightKind {
    switch (kind) {
        case cssService.DocumentHighlightKind.Read:
            return languages.DocumentHighlightKind.Read;
        case cssService.DocumentHighlightKind.Write:
            return languages.DocumentHighlightKind.Write;
        case cssService.DocumentHighlightKind.Text:
            return languages.DocumentHighlightKind.Text;
    }
    return languages.DocumentHighlightKind.Text;
}

export class DocumentHighlightAdapter implements languages.DocumentHighlightProvider {
    constructor(private _worker: WorkerAccessor) {}

    public provideDocumentHighlights(
        model: editor.IReadOnlyModel,
        position: Position,
        token: CancellationToken
    ): Promise<languages.DocumentHighlight[]> {
        const resource = model.uri;

        return this._worker(resource)
            .then((worker) => {
                return worker.findDocumentHighlights(resource.toString(), fromPosition(position));
            })
            .then((entries) => {
                if (!entries) {
                    return;
                }
                return entries.map((entry) => {
                    return <languages.DocumentHighlight>{
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
        return this._worker(resource)
            .then(function (worker) {
            return worker.findDefinition(resource.toString(), fromPosition(position));
        })
            .then(function (definition) {
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
var ReferenceAdapter = /** @class */ (function () {
    function ReferenceAdapter(_worker) {
        this._worker = _worker;
    }
    ReferenceAdapter.prototype.provideReferences = function (model, position, context, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.findReferences(resource.toString(), fromPosition(position));
        })
            .then(function (entries) {
            if (!entries) {
                return;
            }
            return entries.map(toLocation);
        });
    };
    return ReferenceAdapter;
}());
export { ReferenceAdapter };
// --- rename ------
function toWorkspaceEdit(edit) {
    if (!edit || !edit.changes) {
        return void 0;
    }
    var resourceEdits = [];
    for (var uri in edit.changes) {
        var _uri = Uri.parse(uri);
        // let edits: languages.TextEdit[] = [];
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
/*export class RenameAdapter implements languages.RenameProvider {
    constructor(private _worker: WorkerAccessor) {}

    provideRenameEdits(
        model: editor.IReadOnlyModel,
        position: Position,
        newName: string,
        token: CancellationToken
    ): Promise<languages.WorkspaceEdit> {
        const resource = model.uri;

        return this._worker(resource)
            .then((worker) => {
            return worker.doRename(resource.toString(), fromPosition(position), newName);
        })
        .then((edit) => {
            return toWorkspaceEdit(edit);
        });
    }
}*/
// --- document symbols ------
function toSymbolKind(kind) {
    var mKind = languages.SymbolKind;
    switch (kind) {
        case choicescriptService.SymbolKind.File:
            return mKind.Array;
        case choicescriptService.SymbolKind.Module:
            return mKind.Module;
        case choicescriptService.SymbolKind.Namespace:
            return mKind.Namespace;
        case choicescriptService.SymbolKind.Package:
            return mKind.Package;
        case choicescriptService.SymbolKind.Class:
            return mKind.Class;
        case choicescriptService.SymbolKind.Method:
            return mKind.Method;
        case choicescriptService.SymbolKind.Property:
            return mKind.Property;
        case choicescriptService.SymbolKind.Field:
            return mKind.Field;
        case choicescriptService.SymbolKind.Constructor:
            return mKind.Constructor;
        case choicescriptService.SymbolKind.Enum:
            return mKind.Enum;
        case choicescriptService.SymbolKind.Interface:
            return mKind.Interface;
        case choicescriptService.SymbolKind.Function:
            return mKind.Function;
        case choicescriptService.SymbolKind.Variable:
            return mKind.Variable;
        case choicescriptService.SymbolKind.Constant:
            return mKind.Constant;
        case choicescriptService.SymbolKind.String:
            return mKind.String;
        case choicescriptService.SymbolKind.Number:
            return mKind.Number;
        case choicescriptService.SymbolKind.Boolean:
            return mKind.Boolean;
        case choicescriptService.SymbolKind.Array:
            return mKind.Array;
    }
    return mKind.Function;
}
var DocumentSymbolAdapter = /** @class */ (function () {
    function DocumentSymbolAdapter(_worker) {
        this._worker = _worker;
    }
    DocumentSymbolAdapter.prototype.provideDocumentSymbols = function (model, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) { return worker.findDocumentSymbols(resource.toString()); })
            .then(function (items) {
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
                selectionRange: toRange(item.location.range) // location: item.location?
            }); });
        });
    };
    return DocumentSymbolAdapter;
}());
export { DocumentSymbolAdapter };
/*export class DocumentColorAdapter implements languages.DocumentColorProvider {
    constructor(private _worker: WorkerAccessor) {}

    public provideDocumentColors(
        model: editor.IReadOnlyModel,
        token: CancellationToken
    ): Promise<languages.IColorInformation[]> {
        const resource = model.uri;

        return this._worker(resource)
            .then((worker) => worker.findDocumentColors(resource.toString()))
            .then((infos) => {
                if (!infos) {
                    return;
                }
                return infos.map((item) => ({
                    color: item.color,
                    range: toRange(item.range)
                }));
            });
    }

    public provideColorPresentations(
        model: editor.IReadOnlyModel,
        info: languages.IColorInformation,
        token: CancellationToken
    ): Promise<languages.IColorPresentation[]> {
        const resource = model.uri;

        return this._worker(resource)
            .then((worker) =>
                worker.getColorPresentations(resource.toString(), info.color, fromRange(info.range))
            )
            .then((presentations) => {
                if (!presentations) {
                    return;
                }
                return presentations.map((presentation) => {
                    let item: languages.IColorPresentation = {
                        label: presentation.label
                    };
                    if (presentation.textEdit) {
                        item.textEdit = toTextEdit(presentation.textEdit);
                    }
                    if (presentation.additionalTextEdits) {
                        item.additionalTextEdits = presentation.additionalTextEdits.map(toTextEdit);
                    }
                    return item;
                });
            });
    }
}*/
/*export class FoldingRangeAdapter implements languages.FoldingRangeProvider {
    constructor(private _worker: WorkerAccessor) {}

    public provideFoldingRanges(
        model: editor.IReadOnlyModel,
        context: languages.FoldingContext,
        token: CancellationToken
    ): Promise<languages.FoldingRange[]> {
        const resource = model.uri;

        return this._worker(resource)
        .then((worker) => worker.getFoldingRanges(resource.toString(), context))
        .then((ranges) => {
            if (!ranges) {
                return;
            }
            return ranges.map((range) => {
                let result: languages.FoldingRange = {
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
/*function toFoldingRangeKind(kind: choicescriptService.FoldingRangeKind): languages.FoldingRangeKind {
    switch (kind) {
        case choicescriptService.FoldingRangeKind.Comment:
            return languages.FoldingRangeKind.Comment;
        case choicescriptService.FoldingRangeKind.Imports:
            return languages.FoldingRangeKind.Imports;
        case choicescriptService.FoldingRangeKind.Region:
            return languages.FoldingRangeKind.Region;
    }
}

/*export class SelectionRangeAdapter implements languages.SelectionRangeProvider {
    constructor(private _worker: WorkerAccessor) {}

    public provideSelectionRanges(
        model: editor.IReadOnlyModel,
        positions: Position[],
        token: CancellationToken
    ): Promise<languages.SelectionRange[][]> {
        const resource = model.uri;

        return this._worker(resource)
        .then((worker) => worker.getSelectionRanges(resource.toString(), positions.map(fromPosition)))
        .then((selectionRanges) => {
            if (!selectionRanges) {
                return;
            }
            return selectionRanges.map((selectionRange) => {
                const result: languages.SelectionRange[] = [];
                while (selectionRange) {
                    result.push({ range: toRange(selectionRange.range) });
                    selectionRange = selectionRange.parent;
                }
                return result;
            });
        });
    }

}*/
var IndexAdapter = /** @class */ (function () {
    function IndexAdapter(_languageId, _worker) {
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
                // we can probably get away with debouncing/delaying this a good while
                // as it's unlikely we'll need an up-to-date index of the scene we're currently editing
                handle = window.setTimeout(function () { return _this._updateIndex(model.uri); }, 1000);
            });
            _this._updateIndex(model.uri);
        };
        var onModelRemoved = function (model) {
            _this._removeIndex(model.uri);
            var uriStr = model.uri.toString();
            var listener = _this._listener[uriStr];
            if (listener) {
                listener.dispose();
                delete _this._listener[uriStr];
            }
        };
        this._disposables.push(editor.onDidCreateModel(onModelAdd));
        this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
        this._disposables.push({
            dispose: function () {
                for (var key in _this._listener) {
                    _this._listener[key].dispose();
                }
            }
        });
        editor.getModels().forEach(onModelAdd);
    }
    IndexAdapter.prototype._updateIndex = function (resource) {
        this._worker(resource).then(function (worker) {
            return worker.updateIndex(resource.toString());
        });
    };
    IndexAdapter.prototype._removeIndex = function (resource) {
        this._worker(resource).then(function (worker) {
            return worker.removeIndex(resource.toString());
        });
    };
    IndexAdapter.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d && d.dispose(); });
        this._disposables = [];
    };
    return IndexAdapter;
}());
export { IndexAdapter };
