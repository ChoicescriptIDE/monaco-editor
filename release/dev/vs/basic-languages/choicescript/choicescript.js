/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.conf = {
        onEnterRules: [
            {
                beforeText: new RegExp("^\\s*(:?#|\\*(?:" + [
                    "achievement", "choice", "else", "elseif", "elsif",
                    "fake_choice", "if", "scene_list", "stat_chart"
                ].join("|") + ")).*\\s*$"),
                action: { indentAction: monaco.languages.IndentAction.Indent }
            },
            {
                beforeText: new RegExp("^\\s*\\*(?:" + ["ending", "finish", "goto", "goto_scene", "redirect_scene"].join("|") + ").*\\s*$"),
                action: { indentAction: monaco.languages.IndentAction.Outdent }
            }
        ]
    };
    exports.language = {
        defaultToken: '',
        tokenPostfix: '.choicescript',
        ws: '[ \t\n\r\f]*',
        identifier: '-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',
        commands: [
            "abort", "achieve", "achievement", "advertisement", "allow_reuse",
            "author", "bug", "check_achievements", "check_purchase",
            "check_registration", "choice", "create", "delay_break",
            "delay_ending", "delete", "disable_reuse", "else", "elseif",
            "elsif", "end_trial", "ending", "fake_choice", "finish", "gosub",
            "gosub_scene", "goto", "goto_random_scene", "goto_scene", "gotoref",
            "hide_reuse", "if", "image", "input_number", "input_text", "label",
            "line_break", "link", "link_button", "login", "looplimit",
            "more_games", "page_break", "params", "print", "purchase", "rand",
            "redirect_scene", "reset", "restart", "restore_game",
            "restore_purchases", "return", "save_game", "scene_list", "script",
            "selectable_if", "set", "setref", "share_this_game", "show_password",
            "sound", "stat_chart", "subscribe", "temp", "title"
        ],
        indentCommands: [
            "achievement", "choice", "else", "elseif", "elsif",
            "fake_choice", "if", "scene_list", "stat_chart"
        ],
        dedentCommands: ["ending", "finish", "goto", "goto_scene", "redirect_scene"],
        optionCommands: ["allow_reuse", "disable_reuse", "hide_reuse"],
        flowCommands: ["gosub", "gosub_scene", "goto", "goto_random_scene", "goto_scene",
            "gotoref", "label", "redirect_scene", "return"],
        csPlusCommands: ["console_log", "console_track", "console_track_all", "console_untrack_all", "console_untrack", "console_clear", "console_track_list", "cside_theme_set", "cside_theme_apply"],
        builtins: /(?:^\*)(\w+)(?:\s?)/,
        choiceOptionModifiers: new RegExp("\\s+\\*(" + ["allow_reuse", "disable_reuse", "hide_reuse"].join("|") + "){0,1}"),
        choiceOptionConditionals: new RegExp("(:?\\s+\\*(if|selectable_if) .+ ?){0,1}#.+/"),
        brackets: [
            { open: '{', close: '}', token: 'delimiter.bracket' },
            { open: '[', close: ']', token: 'delimiter.bracket' },
            { open: '(', close: ')', token: 'delimiter.parenthesis' },
            { open: '<', close: '>', token: 'delimiter.angle' }
        ],
        tokenizer: {
            root: [
                [/^(:?\s*)\*comment\s+.*$/, "comment"],
                [/@builtins/, { cases: {
                            "$1@flowCommands": { token: 'flow-command' },
                            "$1@indentCommands": { token: 'keyword' },
                            "$1@dedentCommands": { token: 'keyword' },
                            "$1@csPlusCommands": { token: 'extra-keywords' },
                            "$1@commands": 'keyword', "@default": 'invalid'
                        }
                    }],
                [/^\s+(\*hide_reuse |\*allow_reuse |\*disable_reuse ){0,1}(\*if .+ ?|\*selectable_if .+ ?){0,1}#.+/, "choice-option"],
                [/\$!{0,2}\{[\w\{\}\+\-&\*/\s0-9#]+(\[[\w0-9\[\]]+\])*\}/, "variable"],
                [/\@\{.*}/, "variable"],
                [/\[error.*/, "custom-error"],
                [/\[notice.*/, "custom-notice"],
                [/\[info.*/, "custom-info"],
                [/\[[a-zA-Z 0-9:]+\]/, "custom-date"],
            ]
        }
    };
    exports.darkTheme = {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'extra-keywords', foreground: "DA9ED3" },
            { token: 'flow-command', foreground: "599eff" },
            { token: 'keyword', foreground: "FFA500" },
            { token: 'conditional', foreground: "FFA500" },
            { token: 'choice-option', foreground: "92A75C" },
            { token: 'variable', foreground: "636DB5", fontStyle: 'bold' },
            { token: 'custom-info', foreground: '808080' },
            { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
            { token: 'custom-notice', foreground: 'FFA500' },
            { token: 'custom-date', foreground: '008800' },
        ],
    };
    exports.lightTheme = {
        base: "vs",
        inherit: true,
        rules: []
    };
});
