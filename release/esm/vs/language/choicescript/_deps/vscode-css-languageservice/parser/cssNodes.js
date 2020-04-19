/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <summary>
/// Nodes for the css 2.1 specification. See for reference:
/// http://www.w3.org/TR/CSS21/grammar.html#grammar
/// </summary>
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["Undefined"] = 0] = "Undefined";
    NodeType[NodeType["ChoiceScriptComment"] = 1] = "ChoiceScriptComment";
    NodeType[NodeType["Identifier"] = 2] = "Identifier";
    NodeType[NodeType["Scene"] = 3] = "Scene";
    NodeType[NodeType["Line"] = 4] = "Line";
    NodeType[NodeType["Label"] = 5] = "Label";
    NodeType[NodeType["ChoiceScriptLine"] = 6] = "ChoiceScriptLine";
    NodeType[NodeType["ChoiceScriptStatement"] = 7] = "ChoiceScriptStatement";
    NodeType[NodeType["TextLine"] = 8] = "TextLine";
    NodeType[NodeType["StringLiteral"] = 9] = "StringLiteral";
    NodeType[NodeType["Operator"] = 10] = "Operator";
    NodeType[NodeType["Expression"] = 11] = "Expression";
    NodeType[NodeType["BinaryExpression"] = 12] = "BinaryExpression";
    NodeType[NodeType["Term"] = 13] = "Term";
    NodeType[NodeType["Value"] = 14] = "Value";
    NodeType[NodeType["RealWord"] = 15] = "RealWord";
    NodeType[NodeType["ChoiceCommand"] = 16] = "ChoiceCommand";
    NodeType[NodeType["ChoiceOption"] = 17] = "ChoiceOption";
    NodeType[NodeType["MultiReplace"] = 18] = "MultiReplace";
    NodeType[NodeType["PrintVariable"] = 19] = "PrintVariable";
    NodeType[NodeType["NumericValue"] = 20] = "NumericValue";
    NodeType[NodeType["Boolean"] = 21] = "Boolean";
    NodeType[NodeType["Indentation"] = 22] = "Indentation";
    NodeType[NodeType["VariableDeclaration"] = 23] = "VariableDeclaration";
    NodeType[NodeType["LabelDeclaration"] = 24] = "LabelDeclaration";
    NodeType[NodeType["FlowCommand"] = 25] = "FlowCommand";
    // ...
    NodeType[NodeType["HexColorValue"] = 26] = "HexColorValue";
    NodeType[NodeType["Variable"] = 27] = "Variable";
    NodeType[NodeType["CreateVariable"] = 28] = "CreateVariable";
    NodeType[NodeType["If"] = 29] = "If";
    NodeType[NodeType["Else"] = 30] = "Else";
    NodeType[NodeType["For"] = 31] = "For";
    NodeType[NodeType["Each"] = 32] = "Each";
    NodeType[NodeType["While"] = 33] = "While";
    NodeType[NodeType["MixinContent"] = 34] = "MixinContent";
    NodeType[NodeType["Media"] = 35] = "Media";
    NodeType[NodeType["Keyframe"] = 36] = "Keyframe";
    NodeType[NodeType["FontFace"] = 37] = "FontFace";
    NodeType[NodeType["Import"] = 38] = "Import";
    NodeType[NodeType["Namespace"] = 39] = "Namespace";
    NodeType[NodeType["Invocation"] = 40] = "Invocation";
    NodeType[NodeType["FunctionDeclaration"] = 41] = "FunctionDeclaration";
    NodeType[NodeType["ReturnStatement"] = 42] = "ReturnStatement";
    NodeType[NodeType["MediaQuery"] = 43] = "MediaQuery";
    NodeType[NodeType["FunctionParameter"] = 44] = "FunctionParameter";
    NodeType[NodeType["FunctionArgument"] = 45] = "FunctionArgument";
    NodeType[NodeType["KeyframeSelector"] = 46] = "KeyframeSelector";
    NodeType[NodeType["ViewPort"] = 47] = "ViewPort";
    NodeType[NodeType["Document"] = 48] = "Document";
    NodeType[NodeType["AtApplyRule"] = 49] = "AtApplyRule";
    NodeType[NodeType["CustomPropertyDeclaration"] = 50] = "CustomPropertyDeclaration";
    NodeType[NodeType["CustomPropertySet"] = 51] = "CustomPropertySet";
    NodeType[NodeType["ListEntry"] = 52] = "ListEntry";
    NodeType[NodeType["Supports"] = 53] = "Supports";
    NodeType[NodeType["SupportsCondition"] = 54] = "SupportsCondition";
    NodeType[NodeType["NamespacePrefix"] = 55] = "NamespacePrefix";
    NodeType[NodeType["GridLine"] = 56] = "GridLine";
    NodeType[NodeType["Plugin"] = 57] = "Plugin";
    NodeType[NodeType["UnknownAtRule"] = 58] = "UnknownAtRule";
    NodeType[NodeType["Command"] = 59] = "Command";
    NodeType[NodeType["StandardCommand"] = 60] = "StandardCommand";
    NodeType[NodeType["InvalidBuiltin"] = 61] = "InvalidBuiltin";
})(NodeType || (NodeType = {}));
export var ReferenceType;
(function (ReferenceType) {
    ReferenceType[ReferenceType["Label"] = 0] = "Label";
    ReferenceType[ReferenceType["Variable"] = 1] = "Variable";
    ReferenceType[ReferenceType["Unknown"] = 2] = "Unknown";
})(ReferenceType || (ReferenceType = {}));
export function getNodeAtOffset(node, offset) {
    var candidate = null;
    if (!node || offset < node.offset || offset > node.end) {
        return null;
    }
    // Find the shortest node at the position
    node.accept(function (node) {
        if (node.offset === -1 && node.length === -1) {
            return true;
        }
        if (node.offset <= offset && node.end >= offset) {
            if (!candidate) {
                candidate = node;
            }
            else if (node.length <= candidate.length) {
                candidate = node;
            }
            return true;
        }
        return false;
    });
    return candidate;
}
export function getNodePath(node, offset) {
    var candidate = getNodeAtOffset(node, offset);
    var path = [];
    while (candidate) {
        path.unshift(candidate);
        candidate = candidate.parent;
    }
    return path;
}
var Node = /** @class */ (function () {
    function Node(offset, len, nodeType) {
        if (offset === void 0) { offset = -1; }
        if (len === void 0) { len = -1; }
        this.parent = null;
        this.offset = offset;
        this.length = len;
        if (nodeType) {
            this.nodeType = nodeType;
        }
    }
    Object.defineProperty(Node.prototype, "end", {
        get: function () { return this.offset + this.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "type", {
        get: function () {
            return this.nodeType || NodeType.Undefined;
        },
        set: function (type) {
            this.nodeType = type;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.getTextProvider = function () {
        var node = this;
        while (node && !node.textProvider) {
            node = node.parent;
        }
        if (node) {
            return node.textProvider;
        }
        return function () { return 'unknown'; };
    };
    Node.prototype.getText = function () {
        return this.getTextProvider()(this.offset, this.length);
    };
    Node.prototype.matches = function (str) {
        return this.length === str.length && this.getTextProvider()(this.offset, this.length) === str;
    };
    Node.prototype.startsWith = function (str) {
        return this.length >= str.length && this.getTextProvider()(this.offset, str.length) === str;
    };
    Node.prototype.endsWith = function (str) {
        return this.length >= str.length && this.getTextProvider()(this.end - str.length, str.length) === str;
    };
    Node.prototype.accept = function (visitor) {
        if (visitor(this) && this.children) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.accept(visitor);
            }
        }
    };
    Node.prototype.acceptVisitor = function (visitor) {
        this.accept(visitor.visitNode.bind(visitor));
    };
    Node.prototype.adoptChild = function (node, index) {
        if (index === void 0) { index = -1; }
        if (node.parent && node.parent.children) {
            var idx = node.parent.children.indexOf(node);
            if (idx >= 0) {
                node.parent.children.splice(idx, 1);
            }
        }
        node.parent = this;
        var children = this.children;
        if (!children) {
            children = this.children = [];
        }
        if (index !== -1) {
            children.splice(index, 0, node);
        }
        else {
            children.push(node);
        }
        return node;
    };
    Node.prototype.attachTo = function (parent, index) {
        if (index === void 0) { index = -1; }
        if (parent) {
            parent.adoptChild(this, index);
        }
        return this;
    };
    Node.prototype.collectIssues = function (results) {
        if (this.issues) {
            results.push.apply(results, this.issues);
        }
    };
    Node.prototype.addIssue = function (issue) {
        if (!this.issues) {
            this.issues = [];
        }
        this.issues.push(issue);
    };
    Node.prototype.hasIssue = function (rule) {
        return Array.isArray(this.issues) && this.issues.some(function (i) { return i.getRule() === rule; });
    };
    Node.prototype.isErroneous = function (recursive) {
        if (recursive === void 0) { recursive = false; }
        if (this.issues && this.issues.length > 0) {
            return true;
        }
        return recursive && Array.isArray(this.children) && this.children.some(function (c) { return c.isErroneous(true); });
    };
    Node.prototype.setNode = function (field, node, index) {
        if (index === void 0) { index = -1; }
        if (node) {
            node.attachTo(this, index);
            this[field] = node;
            return true;
        }
        return false;
    };
    Node.prototype.addChild = function (node) {
        if (node) {
            if (!this.children) {
                this.children = [];
            }
            node.attachTo(this);
            this.updateOffsetAndLength(node);
            return true;
        }
        return false;
    };
    Node.prototype.updateOffsetAndLength = function (node) {
        if (node.offset < this.offset || this.offset === -1) {
            this.offset = node.offset;
        }
        var nodeEnd = node.end;
        if ((nodeEnd > this.end) || this.length === -1) {
            this.length = nodeEnd - this.offset;
        }
    };
    Node.prototype.hasChildren = function () {
        return this.children && this.children.length > 0;
    };
    Node.prototype.getChildren = function () {
        return this.children ? this.children.slice(0) : [];
    };
    Node.prototype.getChild = function (index) {
        if (this.children && index < this.children.length) {
            return this.children[index];
        }
        return null;
    };
    Node.prototype.addChildren = function (nodes) {
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            this.addChild(node);
        }
    };
    Node.prototype.findFirstChildBeforeOffset = function (offset) {
        if (this.children) {
            var current = null;
            for (var i = this.children.length - 1; i >= 0; i--) {
                // iterate until we find a child that has a start offset smaller than the input offset
                current = this.children[i];
                if (current.offset <= offset) {
                    return current;
                }
            }
        }
        return null;
    };
    Node.prototype.findChildAtOffset = function (offset, goDeep) {
        var current = this.findFirstChildBeforeOffset(offset);
        if (current && current.end >= offset) {
            if (goDeep) {
                return current.findChildAtOffset(offset, true) || current;
            }
            return current;
        }
        return null;
    };
    Node.prototype.encloses = function (candidate) {
        return this.offset <= candidate.offset && this.offset + this.length >= candidate.offset + candidate.length;
    };
    Node.prototype.getParent = function () {
        var result = this.parent;
        while (result instanceof Nodelist) {
            result = result.parent;
        }
        return result;
    };
    Node.prototype.findParent = function (type) {
        var result = this;
        while (result && result.type !== type) {
            result = result.parent;
        }
        return result;
    };
    Node.prototype.setData = function (key, value) {
        if (!this.options) {
            this.options = {};
        }
        this.options[key] = value;
    };
    Node.prototype.getData = function (key) {
        if (!this.options || !this.options.hasOwnProperty(key)) {
            return null;
        }
        return this.options[key];
    };
    return Node;
}());
export { Node };
var Nodelist = /** @class */ (function (_super) {
    __extends(Nodelist, _super);
    function Nodelist(parent, index) {
        if (index === void 0) { index = -1; }
        var _this = _super.call(this, -1, -1) || this;
        _this.attachTo(parent, index);
        _this.offset = -1;
        _this.length = -1;
        return _this;
    }
    return Nodelist;
}(Node));
export { Nodelist };
var ChoiceScriptStatement = /** @class */ (function (_super) {
    __extends(ChoiceScriptStatement, _super);
    function ChoiceScriptStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ChoiceScriptStatement.prototype, "type", {
        get: function () {
            return NodeType.ChoiceScriptStatement;
        },
        enumerable: true,
        configurable: true
    });
    return ChoiceScriptStatement;
}(Node));
export { ChoiceScriptStatement };
var ChoiceScriptComment = /** @class */ (function (_super) {
    __extends(ChoiceScriptComment, _super);
    function ChoiceScriptComment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ChoiceScriptComment.prototype, "type", {
        get: function () {
            return NodeType.ChoiceScriptComment;
        },
        enumerable: true,
        configurable: true
    });
    return ChoiceScriptComment;
}(Node));
export { ChoiceScriptComment };
var Identifier = /** @class */ (function (_super) {
    __extends(Identifier, _super);
    function Identifier(offset, length) {
        var _this = _super.call(this, offset, length) || this;
        _this.isCustomProperty = false;
        return _this;
    }
    Object.defineProperty(Identifier.prototype, "type", {
        get: function () {
            return NodeType.Identifier;
        },
        enumerable: true,
        configurable: true
    });
    Identifier.prototype.containsInterpolation = function () {
        return this.hasChildren();
    };
    return Identifier;
}(Node));
export { Identifier };
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Scene.prototype, "type", {
        get: function () {
            return NodeType.Scene;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.setName = function (value) {
        this.name = value;
    };
    return Scene;
}(Node));
export { Scene };
var Command = /** @class */ (function (_super) {
    __extends(Command, _super);
    // FIXME could we get a clever way of generic handling/modelling of params/args here?
    function Command(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Command.prototype, "type", {
        get: function () {
            return NodeType.Command;
        },
        enumerable: true,
        configurable: true
    });
    return Command;
}(Node));
export { Command };
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Label.prototype, "type", {
        get: function () {
            return NodeType.Label;
        },
        enumerable: true,
        configurable: true
    });
    Label.prototype.getName = function () {
        return this.name || this.getText();
    };
    return Label;
}(Command));
export { Label };
var StandardCommand = /** @class */ (function (_super) {
    __extends(StandardCommand, _super);
    function StandardCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(StandardCommand.prototype, "type", {
        get: function () {
            return NodeType.StandardCommand;
        },
        enumerable: true,
        configurable: true
    });
    return StandardCommand;
}(Command));
export { StandardCommand };
var FlowCommand = /** @class */ (function (_super) {
    __extends(FlowCommand, _super);
    function FlowCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(FlowCommand.prototype, "type", {
        get: function () {
            return NodeType.FlowCommand;
        },
        enumerable: true,
        configurable: true
    });
    return FlowCommand;
}(Command));
export { FlowCommand };
var SetCommand = /** @class */ (function (_super) {
    __extends(SetCommand, _super);
    // FIXME: Getters?
    function SetCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    SetCommand.prototype.setVariable = function (node) {
        if (node) {
            node.attachTo(this);
            this.variable = node;
            return true;
        }
        return false;
    };
    SetCommand.prototype.setValue = function (node) {
        if (node) {
            node.attachTo(this);
            this.value = node;
            return true;
        }
        return false;
    };
    Object.defineProperty(SetCommand.prototype, "type", {
        get: function () {
            return NodeType.FlowCommand;
        },
        enumerable: true,
        configurable: true
    });
    return SetCommand;
}(Command));
export { SetCommand };
var ChoiceCommand = /** @class */ (function (_super) {
    __extends(ChoiceCommand, _super);
    // FIXME member array for choice options?
    function ChoiceCommand(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(ChoiceCommand.prototype, "type", {
        get: function () {
            return NodeType.ChoiceCommand;
        },
        enumerable: true,
        configurable: true
    });
    return ChoiceCommand;
}(StandardCommand));
export { ChoiceCommand };
var ChoiceOption = /** @class */ (function (_super) {
    __extends(ChoiceOption, _super);
    function ChoiceOption(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(ChoiceOption.prototype, "type", {
        get: function () {
            return NodeType.ChoiceOption;
        },
        enumerable: true,
        configurable: true
    });
    return ChoiceOption;
}(Node));
export { ChoiceOption };
var RealWord = /** @class */ (function (_super) {
    __extends(RealWord, _super);
    function RealWord(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(RealWord.prototype, "type", {
        get: function () {
            return NodeType.RealWord;
        },
        enumerable: true,
        configurable: true
    });
    return RealWord;
}(Node));
export { RealWord };
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Line.prototype.getLineNum = function () {
        return this.lineNumber;
    };
    Line.prototype.setLineNum = function (lineNum) {
        if (lineNum > 0) {
            this.lineNumber = lineNum;
            return true;
        }
        return false;
    };
    return Line;
}(Node));
export { Line };
var TextLine = /** @class */ (function (_super) {
    __extends(TextLine, _super);
    function TextLine(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    return TextLine;
}(Line));
export { TextLine };
var ChoiceScriptLine = /** @class */ (function (_super) {
    __extends(ChoiceScriptLine, _super);
    function ChoiceScriptLine(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    return ChoiceScriptLine;
}(Line));
export { ChoiceScriptLine };
var AtApplyRule = /** @class */ (function (_super) {
    __extends(AtApplyRule, _super);
    function AtApplyRule(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(AtApplyRule.prototype, "type", {
        get: function () {
            return NodeType.AtApplyRule;
        },
        enumerable: true,
        configurable: true
    });
    AtApplyRule.prototype.setIdentifier = function (node) {
        return this.setNode('identifier', node, 0);
    };
    AtApplyRule.prototype.getIdentifier = function () {
        return this.identifier;
    };
    AtApplyRule.prototype.getName = function () {
        return this.identifier ? this.identifier.getText() : '';
    };
    return AtApplyRule;
}(Node));
export { AtApplyRule };
var AbstractDeclaration = /** @class */ (function (_super) {
    __extends(AbstractDeclaration, _super);
    function AbstractDeclaration(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    return AbstractDeclaration;
}(Node));
export { AbstractDeclaration };
var Invocation = /** @class */ (function (_super) {
    __extends(Invocation, _super);
    function Invocation(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Invocation.prototype, "type", {
        get: function () {
            return NodeType.Invocation;
        },
        enumerable: true,
        configurable: true
    });
    Invocation.prototype.getArguments = function () {
        if (!this.arguments) {
            this.arguments = new Nodelist(this);
        }
        return this.arguments;
    };
    return Invocation;
}(Node));
export { Invocation };
var FunctionParameter = /** @class */ (function (_super) {
    __extends(FunctionParameter, _super);
    function FunctionParameter(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(FunctionParameter.prototype, "type", {
        get: function () {
            return NodeType.FunctionParameter;
        },
        enumerable: true,
        configurable: true
    });
    FunctionParameter.prototype.setIdentifier = function (node) {
        return this.setNode('identifier', node, 0);
    };
    FunctionParameter.prototype.getIdentifier = function () {
        return this.identifier;
    };
    FunctionParameter.prototype.getName = function () {
        return this.identifier ? this.identifier.getText() : '';
    };
    FunctionParameter.prototype.setDefaultValue = function (node) {
        return this.setNode('defaultValue', node, 0);
    };
    FunctionParameter.prototype.getDefaultValue = function () {
        return this.defaultValue;
    };
    return FunctionParameter;
}(Node));
export { FunctionParameter };
var FunctionArgument = /** @class */ (function (_super) {
    __extends(FunctionArgument, _super);
    function FunctionArgument(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(FunctionArgument.prototype, "type", {
        get: function () {
            return NodeType.FunctionArgument;
        },
        enumerable: true,
        configurable: true
    });
    FunctionArgument.prototype.setIdentifier = function (node) {
        return this.setNode('identifier', node, 0);
    };
    FunctionArgument.prototype.getIdentifier = function () {
        return this.identifier;
    };
    FunctionArgument.prototype.getName = function () {
        return this.identifier ? this.identifier.getText() : '';
    };
    FunctionArgument.prototype.setValue = function (node) {
        return this.setNode('value', node, 0);
    };
    FunctionArgument.prototype.getValue = function () {
        return this.value;
    };
    return FunctionArgument;
}(Node));
export { FunctionArgument };
var Import = /** @class */ (function (_super) {
    __extends(Import, _super);
    function Import(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Import.prototype, "type", {
        get: function () {
            return NodeType.Import;
        },
        enumerable: true,
        configurable: true
    });
    Import.prototype.setMedialist = function (node) {
        if (node) {
            node.attachTo(this);
            this.medialist = node;
            return true;
        }
        return false;
    };
    return Import;
}(Node));
export { Import };
var Namespace = /** @class */ (function (_super) {
    __extends(Namespace, _super);
    function Namespace(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Namespace.prototype, "type", {
        get: function () {
            return NodeType.Namespace;
        },
        enumerable: true,
        configurable: true
    });
    return Namespace;
}(Node));
export { Namespace };
var MediaQuery = /** @class */ (function (_super) {
    __extends(MediaQuery, _super);
    function MediaQuery(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(MediaQuery.prototype, "type", {
        get: function () {
            return NodeType.MediaQuery;
        },
        enumerable: true,
        configurable: true
    });
    return MediaQuery;
}(Node));
export { MediaQuery };
var SupportsCondition = /** @class */ (function (_super) {
    __extends(SupportsCondition, _super);
    function SupportsCondition(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(SupportsCondition.prototype, "type", {
        get: function () {
            return NodeType.SupportsCondition;
        },
        enumerable: true,
        configurable: true
    });
    return SupportsCondition;
}(Node));
export { SupportsCondition };
var Expression = /** @class */ (function (_super) {
    __extends(Expression, _super);
    function Expression(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Expression.prototype, "type", {
        get: function () {
            return NodeType.Expression;
        },
        enumerable: true,
        configurable: true
    });
    return Expression;
}(Node));
export { Expression };
var BinaryExpression = /** @class */ (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(BinaryExpression.prototype, "type", {
        get: function () {
            return NodeType.BinaryExpression;
        },
        enumerable: true,
        configurable: true
    });
    BinaryExpression.prototype.setLeft = function (left) {
        return this.setNode('left', left);
    };
    BinaryExpression.prototype.getLeft = function () {
        return this.left;
    };
    BinaryExpression.prototype.setRight = function (right) {
        return this.setNode('right', right);
    };
    BinaryExpression.prototype.getRight = function () {
        return this.right;
    };
    BinaryExpression.prototype.setOperator = function (value) {
        return this.setNode('operator', value);
    };
    BinaryExpression.prototype.getOperator = function () {
        return this.operator;
    };
    return BinaryExpression;
}(Node));
export { BinaryExpression };
var Term = /** @class */ (function (_super) {
    __extends(Term, _super);
    function Term(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Term.prototype, "type", {
        get: function () {
            return NodeType.Term;
        },
        enumerable: true,
        configurable: true
    });
    Term.prototype.setOperator = function (value) {
        return this.setNode('operator', value);
    };
    Term.prototype.getOperator = function () {
        return this.operator;
    };
    Term.prototype.setExpression = function (value) {
        return this.setNode('expression', value);
    };
    Term.prototype.getExpression = function () {
        return this.expression;
    };
    return Term;
}(Node));
export { Term };
var Operator = /** @class */ (function (_super) {
    __extends(Operator, _super);
    function Operator(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Operator.prototype, "type", {
        get: function () {
            return NodeType.Operator;
        },
        enumerable: true,
        configurable: true
    });
    return Operator;
}(Node));
export { Operator };
var HexColorValue = /** @class */ (function (_super) {
    __extends(HexColorValue, _super);
    function HexColorValue(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(HexColorValue.prototype, "type", {
        get: function () {
            return NodeType.HexColorValue;
        },
        enumerable: true,
        configurable: true
    });
    return HexColorValue;
}(Node));
export { HexColorValue };
var NumericValue = /** @class */ (function (_super) {
    __extends(NumericValue, _super);
    function NumericValue(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(NumericValue.prototype, "type", {
        get: function () {
            return NodeType.NumericValue;
        },
        enumerable: true,
        configurable: true
    });
    NumericValue.prototype.getValue = function () {
        var raw = this.getText();
        var unitIdx = 0, code, _dot = '.'.charCodeAt(0), _0 = '0'.charCodeAt(0), _9 = '9'.charCodeAt(0);
        for (var i = 0, len = raw.length; i < len; i++) {
            code = raw.charCodeAt(i);
            if (!(_0 <= code && code <= _9 || code === _dot)) {
                break;
            }
            unitIdx += 1;
        }
        return {
            value: raw.substring(0, unitIdx),
            unit: unitIdx < raw.length ? raw.substring(unitIdx) : undefined
        };
    };
    return NumericValue;
}(Node));
export { NumericValue };
var VariableDeclaration = /** @class */ (function (_super) {
    __extends(VariableDeclaration, _super);
    function VariableDeclaration(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(VariableDeclaration.prototype, "type", {
        get: function () {
            return NodeType.VariableDeclaration;
        },
        enumerable: true,
        configurable: true
    });
    VariableDeclaration.prototype.setVariable = function (node) {
        if (node) {
            node.attachTo(this);
            this.variable = node;
            return true;
        }
        return false;
    };
    VariableDeclaration.prototype.getVariable = function () {
        return this.variable;
    };
    VariableDeclaration.prototype.getName = function () {
        return this.variable ? this.variable.getName() : '';
    };
    VariableDeclaration.prototype.setValue = function (node) {
        if (node) {
            node.attachTo(this);
            this.value = node;
            return true;
        }
        return false;
    };
    VariableDeclaration.prototype.getValue = function () {
        return this.value;
    };
    return VariableDeclaration;
}(AbstractDeclaration));
export { VariableDeclaration };
var LabelDeclaration = /** @class */ (function (_super) {
    __extends(LabelDeclaration, _super);
    function LabelDeclaration(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(LabelDeclaration.prototype, "type", {
        get: function () {
            return NodeType.LabelDeclaration;
        },
        enumerable: true,
        configurable: true
    });
    LabelDeclaration.prototype.setLabel = function (node) {
        if (node) {
            node.attachTo(this);
            this.label = node;
            return true;
        }
        return false;
    };
    LabelDeclaration.prototype.getLabel = function () {
        return this.label;
    };
    return LabelDeclaration;
}(AbstractDeclaration));
export { LabelDeclaration };
var Variable = /** @class */ (function (_super) {
    __extends(Variable, _super);
    function Variable(offset, length) {
        return _super.call(this, offset, length) || this;
    }
    Object.defineProperty(Variable.prototype, "type", {
        get: function () {
            return NodeType.CreateVariable;
        },
        enumerable: true,
        configurable: true
    });
    Variable.prototype.getName = function () {
        return this.getText();
    };
    Variable.prototype.getValue = function () {
        return this.value;
    };
    return Variable;
}(Node));
export { Variable };
var ListEntry = /** @class */ (function (_super) {
    __extends(ListEntry, _super);
    function ListEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ListEntry.prototype, "type", {
        get: function () {
            return NodeType.ListEntry;
        },
        enumerable: true,
        configurable: true
    });
    ListEntry.prototype.setKey = function (node) {
        return this.setNode('key', node, 0);
    };
    ListEntry.prototype.setValue = function (node) {
        return this.setNode('value', node, 1);
    };
    return ListEntry;
}(Node));
export { ListEntry };
var LessGuard = /** @class */ (function (_super) {
    __extends(LessGuard, _super);
    function LessGuard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LessGuard.prototype.getConditions = function () {
        if (!this.conditions) {
            this.conditions = new Nodelist(this);
        }
        return this.conditions;
    };
    return LessGuard;
}(Node));
export { LessGuard };
var GuardCondition = /** @class */ (function (_super) {
    __extends(GuardCondition, _super);
    function GuardCondition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GuardCondition.prototype.setVariable = function (node) {
        return this.setNode('variable', node);
    };
    return GuardCondition;
}(Node));
export { GuardCondition };
export var Level;
(function (Level) {
    Level[Level["Ignore"] = 1] = "Ignore";
    Level[Level["Warning"] = 2] = "Warning";
    Level[Level["Error"] = 4] = "Error";
})(Level || (Level = {}));
var Marker = /** @class */ (function () {
    function Marker(node, rule, level, message, offset, length) {
        if (offset === void 0) { offset = node.offset; }
        if (length === void 0) { length = node.length; }
        this.node = node;
        this.rule = rule;
        this.level = level;
        this.message = message || rule.message;
        this.offset = offset;
        this.length = length;
    }
    Marker.prototype.getRule = function () {
        return this.rule;
    };
    Marker.prototype.getLevel = function () {
        return this.level;
    };
    Marker.prototype.getOffset = function () {
        return this.offset;
    };
    Marker.prototype.getLength = function () {
        return this.length;
    };
    Marker.prototype.getNode = function () {
        return this.node;
    };
    Marker.prototype.getMessage = function () {
        return this.message;
    };
    return Marker;
}());
export { Marker };
/*
export class DefaultVisitor implements IVisitor {

    public visitNode(node:Node):boolean {
        switch (node.type) {
            case NodeType.Stylesheet:
                return this.visitStylesheet(<Stylesheet> node);
            case NodeType.FontFace:
                return this.visitFontFace(<FontFace> node);
            case NodeType.Ruleset:
                return this.visitRuleSet(<RuleSet> node);
            case NodeType.Selector:
                return this.visitSelector(<Selector> node);
            case NodeType.SimpleSelector:
                return this.visitSimpleSelector(<SimpleSelector> node);
            case NodeType.Declaration:
                return this.visitDeclaration(<Declaration> node);
            case NodeType.Function:
                return this.visitFunction(<Function> node);
            case NodeType.FunctionDeclaration:
                return this.visitFunctionDeclaration(<FunctionDeclaration> node);
            case NodeType.FunctionParameter:
                return this.visitFunctionParameter(<FunctionParameter> node);
            case NodeType.FunctionArgument:
                return this.visitFunctionArgument(<FunctionArgument> node);
            case NodeType.Term:
                return this.visitTerm(<Term> node);
            case NodeType.Declaration:
                return this.visitExpression(<Expression> node);
            case NodeType.NumericValue:
                return this.visitNumericValue(<NumericValue> node);
            case NodeType.Page:
                return this.visitPage(<Page> node);
            case NodeType.PageBoxMarginBox:
                return this.visitPageBoxMarginBox(<PageBoxMarginBox> node);
            case NodeType.Property:
                return this.visitProperty(<Property> node);
            case NodeType.NumericValue:
                return this.visitNodelist(<Nodelist> node);
            case NodeType.Import:
                return this.visitImport(<Import> node);
            case NodeType.Namespace:
                return this.visitNamespace(<Namespace> node);
            case NodeType.Keyframe:
                return this.visitKeyframe(<Keyframe> node);
            case NodeType.KeyframeSelector:
                return this.visitKeyframeSelector(<KeyframeSelector> node);
            case NodeType.MixinDeclaration:
                return this.visitMixinDeclaration(<MixinDeclaration> node);
            case NodeType.MixinReference:
                return this.visitMixinReference(<MixinReference> node);
            case NodeType.Variable:
                return this.visitVariable(<Variable> node);
            case NodeType.VariableDeclaration:
                return this.visitVariableDeclaration(<VariableDeclaration> node);
        }
        return this.visitUnknownNode(node);
    }

    public visitFontFace(node:FontFace):boolean {
        return true;
    }

    public visitKeyframe(node:Keyframe):boolean {
        return true;
    }

    public visitKeyframeSelector(node:KeyframeSelector):boolean {
        return true;
    }

    public visitStylesheet(node:Stylesheet):boolean {
        return true;
    }

    public visitProperty(Node:Property):boolean {
        return true;
    }

    public visitRuleSet(node:RuleSet):boolean {
        return true;
    }

    public visitSelector(node:Selector):boolean {
        return true;
    }

    public visitSimpleSelector(node:SimpleSelector):boolean {
        return true;
    }

    public visitDeclaration(node:Declaration):boolean {
        return true;
    }

    public visitFunction(node:Function):boolean {
        return true;
    }

    public visitFunctionDeclaration(node:FunctionDeclaration):boolean {
        return true;
    }

    public visitInvocation(node:Invocation):boolean {
        return true;
    }

    public visitTerm(node:Term):boolean {
        return true;
    }

    public visitImport(node:Import):boolean {
        return true;
    }

    public visitNamespace(node:Namespace):boolean {
        return true;
    }

    public visitExpression(node:Expression):boolean {
        return true;
    }

    public visitNumericValue(node:NumericValue):boolean {
        return true;
    }

    public visitPage(node:Page):boolean {
        return true;
    }

    public visitPageBoxMarginBox(node:PageBoxMarginBox):boolean {
        return true;
    }

    public visitNodelist(node:Nodelist):boolean {
        return true;
    }

    public visitVariableDeclaration(node:VariableDeclaration):boolean {
        return true;
    }

    public visitVariable(node:Variable):boolean {
        return true;
    }

    public visitMixinDeclaration(node:MixinDeclaration):boolean {
        return true;
    }

    public visitMixinReference(node:MixinReference):boolean {
        return true;
    }

    public visitUnknownNode(node:Node):boolean {
        return true;
    }
}
*/
var ParseErrorCollector = /** @class */ (function () {
    function ParseErrorCollector() {
        this.entries = [];
    }
    ParseErrorCollector.entries = function (node) {
        var visitor = new ParseErrorCollector();
        node.acceptVisitor(visitor);
        return visitor.entries;
    };
    ParseErrorCollector.prototype.visitNode = function (node) {
        if (node.isErroneous()) {
            node.collectIssues(this.entries);
        }
        return true;
    };
    return ParseErrorCollector;
}());
export { ParseErrorCollector };
//# sourceMappingURL=cssNodes.js.map