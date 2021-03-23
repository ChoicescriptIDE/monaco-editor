define('vs/basic-languages/choicescript/choicescript',["require", "exports", "../fillers/monaco-editor-core"], function (require, exports, monaco_editor_core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.language = exports.conf = void 0;
    exports.conf = {
        onEnterRules: [
            {
                beforeText: new RegExp('^\\s*(:?#|\\*(?:' +
                    [
                        'achievement',
                        'choice',
                        'else',
                        'elseif',
                        'elsif',
                        'fake_choice',
                        'if',
                        'scene_list',
                        'stat_chart'
                    ].join('|') +
                    ')).*\\s*$'),
                action: { indentAction: monaco_editor_core_1.languages.IndentAction.Indent }
            },
            {
                beforeText: new RegExp('^\\s*\\*(?:' +
                    ['ending', 'finish', 'goto', 'goto_scene', 'redirect_scene'].join('|') +
                    ').*\\s*$'),
                action: { indentAction: monaco_editor_core_1.languages.IndentAction.Outdent }
            }
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ]
    };
    exports.language = {
        tokenPostfix: '.choicescript',
        commands: [
            'abort',
            'achieve',
            'achievement',
            'advertisement',
            'allow_reuse',
            'author',
            'bug',
            'check_achievements',
            'check_purchase',
            'check_registration',
            'choice',
            'create',
            'delay_break',
            'delay_ending',
            'delete',
            'disable_reuse',
            'else',
            'elseif',
            'elsif',
            'end_trial',
            'ending',
            'fake_choice',
            'finish',
            'gosub',
            'gosub_scene',
            'goto',
            'goto_random_scene',
            'goto_scene',
            'gotoref',
            'hide_reuse',
            'if',
            'image',
            'input_number',
            'input_text',
            'label',
            'line_break',
            'link',
            'link_button',
            'login',
            'looplimit',
            'more_games',
            'page_break',
            'params',
            'print',
            'purchase',
            'purchase_discount',
            'rand',
            'redirect_scene',
            'reset',
            'restart',
            'restore_game',
            'restore_purchases',
            'return',
            'save_game',
            'scene_list',
            'script',
            'selectable_if',
            'set',
            'setref',
            'share_this_game',
            'show_password',
            'sound',
            'stat_chart',
            'subscribe',
            'temp',
            'title'
        ],
        indentCommands: [
            'achievement',
            'choice',
            'else',
            'elseif',
            'elsif',
            'fake_choice',
            'if',
            'scene_list',
            'stat_chart'
        ],
        dedentCommands: ['ending', 'finish', 'goto', 'goto_scene', 'redirect_scene'],
        optionCommands: ['allow_reuse', 'disable_reuse', 'hide_reuse'],
        flowCommands: [
            'gosub',
            'gosub_scene',
            'goto',
            'goto_random_scene',
            'goto_scene',
            'gotoref',
            'label',
            'redirect_scene',
            'return'
        ],
        csPlusCommands: [
            'console_log',
            'console_track',
            'console_track_all',
            'console_untrack_all',
            'console_untrack',
            'console_clear',
            'console_track_list',
            'cside_theme_set',
            'cside_theme_apply'
        ],
        symbols: /[=><&+\-*\/\^%!#]+/,
        operators: [
            '#',
            '&',
            '%-',
            '%+',
            '-',
            '+',
            '/',
            '*',
            '<',
            '>',
            '<=',
            '>=',
            '=',
            '!=',
            'and',
            'or',
            'modulo'
        ],
        brackets: [
            { open: '{', close: '}', token: 'bracket' },
            { open: '[', close: ']', token: 'bracket' },
            { open: '(', close: ')', token: 'bracket' }
        ],
        escapes: /[\\"]/,
        tokenizer: {
            command_line: [
                [/[{}\[\]()]/, '@brackets'],
                {
                    // SWITCH to parsing a text line
                    regex: /^\s*[^\*\s]+.*$/,
                    action: { token: '@rematch', switchTo: '@text_line' }
                },
                {
                    // command
                    regex: /^\s*\*\w+/,
                    action: { token: '@rematch', next: '@command' }
                },
                { include: '@expression' },
                {
                    // SWITCH to parsing a text line if we hit a CHOICE OPTION
                    regex: /\s+#/,
                    action: { token: '@rematch', switchTo: '@text_line' }
                },
                {
                    // whitespace
                    regex: /\s+/,
                    action: { token: 'whitespace' }
                }
            ],
            text_line: [
                {
                    // SWITCH to parsing a command line
                    regex: /^\s*\*.*$/,
                    action: { token: '@rematch', switchTo: '@command_line' }
                },
                {
                    regex: /#/,
                    action: { token: 'choice-marker' }
                },
                // The following are useful for debugging; but don't really benefit end-usage?
                //[/\s+/, 'whitespace'],
                /*{
                    regex: /\w+/,
                    action: { token: 'annotation' }
                },
                {
                    regex: /\s+/,
                    action: { token: 'whitespace' }
                },*/
                //
                [/[\$@]\{.*\}/, { token: '@rematch', next: '@variable' }]
            ],
            command: [
                {
                    // indentation
                    regex: /^\s+/,
                    action: { token: 'whitespace' }
                },
                {
                    // comments
                    regex: '\\*comment.*$',
                    action: { token: 'comment', next: '@pop' }
                },
                {
                    // command name
                    regex: /(?:\*)(\w+)/,
                    action: {
                        cases: {
                            '$1@optionCommands': { token: 'command', switchTo: '@reuse_option' },
                            '$1@flowCommands': { token: 'flow-command', next: '@pop' },
                            '$1@csPlusCommands': { token: 'extra-keywords', next: '@pop' },
                            '$1@commands': { token: 'command', next: '@pop' },
                            // visually distinguish any unrecognized commands
                            '@default': { token: 'invalid' }
                        }
                    }
                }
            ],
            string: [
                // highlight variable replacements inside strings:
                [/[\$@]\{.*\}/, { token: '@rematch', next: '@variable' }],
                [/[^\\@\$"]+(?!\$\{)/, { token: 'string.string' }],
                [/\\"/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ],
            variable: [
                // parse variable replacements and multireplace
                { regex: /\${|@{/, action: { token: 'variable', bracket: '@open' } },
                { include: '@expression' },
                { regex: /\{/, action: { token: 'variable', bracket: '@open', next: '@push' } },
                { regex: /\}/, action: { token: 'variable', bracket: '@close', next: '@pop' } }
            ],
            expression: [
                {
                    // identifiers, keywords and textual operators
                    regex: /\b[A-Za-z_]+\w*/,
                    action: {
                        cases: {
                            '(true|false)': { token: 'keyword' },
                            '(not|length|round|timestamp|log|auto)': { token: 'function' },
                            '(and|or|modulo)': { token: 'operator' },
                            '@default': { token: 'identifier' }
                        }
                    }
                },
                {
                    // strings
                    regex: '"',
                    action: { token: 'string.quote', bracket: '@open', next: '@string' }
                },
                {
                    // numbers
                    regex: /\b[0-9]+\b/,
                    action: { token: 'number' }
                },
                // symbol operators
                [
                    '@symbols',
                    {
                        cases: {
                            '@operators': { token: 'operator' }
                        }
                    }
                ]
            ],
            // <?>_reuse commands are difficult because they can occur in three different patterns,
            // so we use a special intermediate state to determine the correct ongoing action.
            reuse_option: [
                // E.g.: <?>_reuse # Alone in front of a choice option
                //	Jump straight to parsing the choice option as a text line.
                [/\s*#/, { token: '@rematch', switchTo: '@text_line' }],
                // E.g.: <?>_reuse *selectable_if (true) # In conjunction with an if command
                // 	We need to parse the if command first, so we head back to command parsing.
                [/\s*\*(selectable_if|if)/, { token: '@rematch', switchTo: '@command' }],
                // E.g.: <?>_reuse (at the top of a file)
                //  No more parsing necessary, just confirm we've hit the next line and return naturally.
                [/^\s*/, { token: 'rematch', next: '@pop' }]
            ]
        }
    };
});

