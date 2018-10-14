/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Parser } from './parser/cssParser.js';
import { CSSCompletion } from './services/cssCompletion.js';
import { CSSHover } from './services/cssHover.js';
import { CSSNavigation } from './services/cssNavigation.js';
import { ChoiceScriptValidation } from './services/ChoiceScriptValidation.js';
export * from './cssLanguageTypes.js';
export * from './_deps/vscode-languageserver-types/main.js';
function createFacade(parser, completion, hover, navigation, validation) {
    return {
        configure: validation.configure.bind(validation),
        doValidation: validation.doValidation.bind(validation),
        parseStylesheet: parser.parseStylesheet.bind(parser),
        doComplete: completion.doComplete.bind(completion),
        setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
        doHover: hover.doHover.bind(hover),
        findDefinition: navigation.findDefinition.bind(navigation),
        findReferences: navigation.findReferences.bind(navigation),
        findDocumentHighlights: navigation.findDocumentHighlights.bind(navigation),
        findDocumentLinks: navigation.findDocumentLinks.bind(navigation),
        findDocumentSymbols: navigation.findDocumentSymbols.bind(navigation),
        findColorSymbols: function (d, s) { return navigation.findDocumentColors(d, s).map(function (s) { return s.range; }); },
        findDocumentColors: navigation.findDocumentColors.bind(navigation),
        getColorPresentations: navigation.getColorPresentations.bind(navigation),
        doRename: navigation.doRename.bind(navigation),
    };
}
export function getCSSLanguageService() {
    return createFacade(new Parser(), new CSSCompletion(), new CSSHover(), new CSSNavigation(), new ChoiceScriptValidation());
}
//# sourceMappingURL=cssLanguageService.js.map