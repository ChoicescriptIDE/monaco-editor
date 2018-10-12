define(["require", "exports", "../test/testRunner"], function (require, exports, testRunner_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    testRunner_1.testTokenization('choicescript', [
        // Comments
        [{
                line: '*comment me out',
                tokens: [
                    { startIndex: 0, type: 'comment.choicescript' }
                ]
            }],
        [{
                line: '    *comment indent still valid',
                tokens: [
                    { startIndex: 0, type: 'comment.choicescript' }
                ]
            }],
        [{
                line: '\t*comment with tabs still valid',
                tokens: [
                    { startIndex: 0, type: 'comment.choicescript' }
                ]
            }],
    ]);
});
