/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes.js';
import * as languageFacts from './languageFacts.js';
import { Range } from './../_deps/vscode-languageserver-types/main.js';
import { selectorToMarkedString, simpleSelectorToMarkedString } from './selectorPrinting.js';
var CSSHover = /** @class */ (function () {
    function CSSHover() {
    }
    CSSHover.prototype.doHover = function (document, position, stylesheet) {
        function getRange(node) {
            return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
        }
        var offset = document.offsetAt(position);
        var nodepath = nodes.getNodePath(stylesheet, offset);
        for (var i = 0; i < nodepath.length; i++) {
            var node = nodepath[i];
            if (node.type === nodes.NodeType.Builtin) {
                var propertyName = node.getText().slice(1, node.getText().length);
                var builtins = languageFacts.getBuiltins();
                var index = builtins.map(function (cmd) { return cmd.name; }).indexOf(propertyName);
                if (index !== -1) {
                    return {
                        contents: builtins[index].description,
                        range: getRange(node)
                    };
                }
            }
            if (node instanceof nodes.Selector) {
                return {
                    contents: selectorToMarkedString(node),
                    range: getRange(node)
                };
            }
            if (node instanceof nodes.SimpleSelector) {
                return {
                    contents: simpleSelectorToMarkedString(node),
                    range: getRange(node)
                };
            }
        }
        return null;
    };
    return CSSHover;
}());
export { CSSHover };
//# sourceMappingURL=cssHover.js.map