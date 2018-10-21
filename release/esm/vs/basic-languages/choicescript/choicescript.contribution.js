/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { registerLanguage } from '../_.contribution.js';
// Allow for running under nodejs/requirejs in tests
var _monaco = (typeof monaco === 'undefined' ? self.monaco : monaco);
registerLanguage({
    loader: function () { return _monaco.Promise.wrap(import('./choicescript.js')); },
    lang: {
        id: 'choicescript',
        extensions: ['.txt'],
        aliases: ['ChoiceScript', 'cs'],
    }
});
