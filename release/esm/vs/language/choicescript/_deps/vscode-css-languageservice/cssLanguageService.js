/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Parser } from './parser/cssParser.js';
import { CSSCompletion } from './services/cssCompletion.js';
import { CSSHover } from './services/cssHover.js';
import { ChoiceScriptValidation } from './services/ChoiceScriptValidation.js';
import { ChoiceScriptCodeActions } from './services/ChoiceScriptCodeActions.js';
export * from './cssLanguageTypes.js';
export * from './_deps/vscode-languageserver-types/main.js';
function createFacade(parser, completion, hover, validation, codeActions) {
    return {
        configure: validation.configure.bind(validation),
        doValidation: validation.doValidation.bind(validation),
        parseScene: parser.parseScene.bind(parser),
        doComplete: completion.doComplete.bind(completion),
        setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
        doHover: hover.doHover.bind(hover),
        doCodeActions: codeActions.doCodeActions.bind(codeActions),
        doCodeActions2: codeActions.doCodeActions2.bind(codeActions),
    };
}
export function getCSSLanguageService() {
    return createFacade(new Parser(), new CSSCompletion(), new CSSHover(), new ChoiceScriptValidation(), new ChoiceScriptCodeActions());
}
//# sourceMappingURL=cssLanguageService.js.map