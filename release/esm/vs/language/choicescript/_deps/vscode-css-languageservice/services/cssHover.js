/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as nodes from '../parser/cssNodes.js';
import * as languageFacts from './languageFacts.js';
import { Range } from './../_deps/vscode-languageserver-types/main.js';
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
            if (node instanceof nodes.Command) {
                var propertyName = node.getText().slice(1, node.getText().length);
                var cmds = languageFacts.getCommands();
                var index = cmds.map(function (cmd) { return cmd.name; }).indexOf(propertyName);
                if (index !== -1) {
                    return {
                        contents: cmds[index].description,
                        range: getRange(node)
                    };
                }
            }
            // Expression is not correct. Just used to shut up compile errors. Needs fixing.
            if (node instanceof nodes.Expression) {
                return {
                    contents: "selectorToMarkedString",
                    range: getRange(node)
                };
            }
            if (node instanceof nodes.Expression) {
                return {
                    contents: "simpleSelector",
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