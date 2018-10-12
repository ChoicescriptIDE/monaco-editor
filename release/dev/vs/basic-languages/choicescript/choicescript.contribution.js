/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "../_.contribution", "./choicescript"], function (require, exports, __contribution_1, choicescript_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Allow for running under nodejs/requirejs in tests
    var _monaco = (typeof monaco === 'undefined' ? self.monaco : monaco);
    __contribution_1.registerLanguage({
        id: 'choicescript',
        extensions: ['.txt'],
        aliases: ['ChoiceScript', 'cs'],
        loader: function () { return _monaco.Promise.wrap(new Promise(function (resolve_1, reject_1) { require(['./choicescript'], resolve_1, reject_1); })); }
    });
    // Automatically load themes
    __contribution_1.registerTheme("cs-dark", choicescript_1.darkTheme);
    __contribution_1.registerTheme("cs-light", choicescript_1.lightTheme);
});
