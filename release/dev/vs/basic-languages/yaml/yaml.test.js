define(["require", "exports", "../test/testRunner"], function (require, exports, testRunner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    testRunner_1.testTokenization('yaml', [
        // YAML directive
        [{
                line: '%YAML 1.2',
                tokens: [{
                        startIndex: 0,
                        type: 'meta.directive.yaml'
                    }]
            }],
        // Comments
        [{
                line: '#Comment',
                tokens: [{
                        startIndex: 0,
                        type: 'comment.yaml'
                    }]
            }],
        // Document Marker - Directives End
        [{
                line: '---',
                tokens: [{
                        startIndex: 0,
                        type: 'operators.directivesEnd.yaml'
                    }]
            }],
        // Document Marker - Document End
        [{
                line: '...',
                tokens: [{
                        startIndex: 0,
                        type: 'operators.documentEnd.yaml'
                    }]
            }],
        // Tag Handle
        [{
                line: '!<tag:clarkevans.com,2002:invoice>',
                tokens: [{
                        startIndex: 0,
                        type: 'tag.yaml'
                    }]
            }],
        // Key:
        [{
                line: 'key:',
                tokens: [{
                        startIndex: 0,
                        type: 'type.yaml'
                    }, {
                        startIndex: 3,
                        type: 'operators.yaml'
                    }]
            }],
        // Key:Value
        [{
                line: 'key: value',
                tokens: [{
                        startIndex: 0,
                        type: 'type.yaml'
                    }, {
                        startIndex: 3,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 4,
                        type: 'white.yaml'
                    }, {
                        startIndex: 5,
                        type: 'string.yaml'
                    }]
            }],
        // Key:Value - Quoted Keys
        [{
                line: '":": value',
                tokens: [{
                        startIndex: 0,
                        type: 'type.yaml'
                    }, {
                        startIndex: 3,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 4,
                        type: 'white.yaml'
                    }, {
                        startIndex: 5,
                        type: 'string.yaml'
                    }]
            }],
        // Tag Handles
        [{
                line: '!!str string',
                tokens: [{
                        startIndex: 0,
                        type: 'tag.yaml'
                    }, {
                        startIndex: 5,
                        type: 'white.yaml'
                    }, {
                        startIndex: 6,
                        type: 'string.yaml'
                    }]
            }],
        // Anchor
        [{
                line: 'anchor: &anchor',
                tokens: [{
                        startIndex: 0,
                        type: 'type.yaml'
                    }, {
                        startIndex: 6,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 7,
                        type: 'white.yaml'
                    }, {
                        startIndex: 8,
                        type: 'namespace.yaml'
                    }]
            }],
        // Alias
        [{
                line: 'alias: *alias',
                tokens: [{
                        startIndex: 0,
                        type: 'type.yaml'
                    }, {
                        startIndex: 5,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 6,
                        type: 'white.yaml'
                    }, {
                        startIndex: 7,
                        type: 'namespace.yaml'
                    }]
            }],
        // Block Scalar
        [{
                line: '>',
                tokens: [{
                        startIndex: 0,
                        type: 'operators.yaml'
                    }]
            }, {
                line: '  String',
                tokens: [{
                        startIndex: 0,
                        type: 'string.yaml'
                    }]
            }],
        // Block Structure
        [{
                line: '- one',
                tokens: [{
                        startIndex: 0,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 1,
                        type: 'white.yaml'
                    }, {
                        startIndex: 2,
                        type: 'string.yaml'
                    }]
            }, {
                line: '? two',
                tokens: [{
                        startIndex: 0,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 1,
                        type: 'white.yaml'
                    }, {
                        startIndex: 2,
                        type: 'string.yaml'
                    }]
            }, {
                line: ': three',
                tokens: [{
                        startIndex: 0,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 1,
                        type: 'white.yaml'
                    }, {
                        startIndex: 2,
                        type: 'string.yaml'
                    }]
            }],
        // Flow Mapping
        [{
                line: '{key: value, number: 123}',
                tokens: [{
                        startIndex: 0,
                        type: 'delimiter.bracket.yaml'
                    }, {
                        startIndex: 1,
                        type: 'type.yaml'
                    }, {
                        startIndex: 4,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 5,
                        type: 'white.yaml'
                    }, {
                        startIndex: 6,
                        type: 'string.yaml'
                    }, {
                        startIndex: 11,
                        type: 'delimiter.comma.yaml'
                    }, {
                        startIndex: 12,
                        type: 'white.yaml'
                    }, {
                        startIndex: 13,
                        type: 'type.yaml'
                    }, {
                        startIndex: 19,
                        type: 'operators.yaml'
                    }, {
                        startIndex: 20,
                        type: 'white.yaml'
                    }, {
                        startIndex: 21,
                        type: 'number.yaml'
                    }, {
                        startIndex: 24,
                        type: 'delimiter.bracket.yaml'
                    },]
            }],
        // Flow Sequence - Data types
        [{
                line: '[string,"double",\'single\',1,1.1,2002-04-28]',
                tokens: [{
                        startIndex: 0,
                        type: 'delimiter.square.yaml'
                    }, {
                        startIndex: 1,
                        type: 'string.yaml'
                    }, {
                        startIndex: 7,
                        type: 'delimiter.comma.yaml'
                    }, {
                        startIndex: 8,
                        type: 'string.yaml'
                    }, {
                        startIndex: 16,
                        type: 'delimiter.comma.yaml'
                    }, {
                        startIndex: 17,
                        type: 'string.yaml'
                    }, {
                        startIndex: 25,
                        type: 'delimiter.comma.yaml'
                    }, {
                        startIndex: 26,
                        type: 'number.yaml'
                    }, {
                        startIndex: 27,
                        type: 'delimiter.comma.yaml'
                    }, {
                        startIndex: 28,
                        type: 'number.float.yaml'
                    }, {
                        startIndex: 31,
                        type: 'delimiter.comma.yaml'
                    }, {
                        startIndex: 32,
                        type: 'number.date.yaml'
                    }, {
                        startIndex: 42,
                        type: 'delimiter.square.yaml'
                    }]
            }]
    ]);
});
