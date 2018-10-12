/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { registerLanguage, registerTheme } from '../_.contribution.js';
import { darkTheme, lightTheme } from './choicescript.js';
// Allow for running under nodejs/requirejs in tests
var _monaco = (typeof monaco === 'undefined' ? self.monaco : monaco);
registerLanguage({
    id: 'choicescript',
    extensions: ['.txt'],
    aliases: ['ChoiceScript', 'cs'],
    loader: function () { return _monaco.Promise.wrap(import('./choicescript.js')); }
});
// Automatically load themes
registerTheme("cs-dark", darkTheme);
registerTheme("cs-light", lightTheme);
