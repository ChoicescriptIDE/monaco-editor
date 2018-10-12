/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "../test/testRunner"], function (require, exports, testRunner_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    testRunner_1.testTokenization('markdown', [
        [{
                line: '# Some header',
                tokens: [
                    { startIndex: 0, type: 'keyword.md' }
                ]
            }],
        [{
                line: '* Some list item',
                tokens: [
                    { startIndex: 0, type: 'keyword.md' },
                    { startIndex: 2, type: '' }
                ]
            }],
        [{
                line: 'some `code`',
                tokens: [
                    { startIndex: 0, type: '' },
                    { startIndex: 5, type: 'variable.md' }
                ]
            }],
        [{
                line: 'some ![link](http://link.com)',
                tokens: [
                    { startIndex: 0, type: '' },
                    { startIndex: 5, type: 'string.link.md' },
                    { startIndex: 7, type: '' },
                    { startIndex: 11, type: 'string.link.md' }
                ]
            }]
    ]);
});
