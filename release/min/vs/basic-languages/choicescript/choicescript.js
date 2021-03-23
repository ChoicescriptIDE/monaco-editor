/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * monaco-languages version: 2.3.0(9ee3ec7492f2b395608fd1ac4cd88b98cdcd11c1)
 * Released under the MIT license
 * https://github.com/Microsoft/monaco-languages/blob/master/LICENSE.md
 *-----------------------------------------------------------------------------*/
define("vs/basic-languages/choicescript/choicescript",["require","exports","../fillers/monaco-editor-core"],(function(e,o,t){"use strict";Object.defineProperty(o,"__esModule",{value:!0}),o.language=o.conf=void 0,o.conf={onEnterRules:[{beforeText:new RegExp("^\\s*(:?#|\\*(?:"+["achievement","choice","else","elseif","elsif","fake_choice","if","scene_list","stat_chart"].join("|")+")).*\\s*$"),action:{indentAction:t.languages.IndentAction.Indent}},{beforeText:new RegExp("^\\s*\\*(?:"+["ending","finish","goto","goto_scene","redirect_scene"].join("|")+").*\\s*$"),action:{indentAction:t.languages.IndentAction.Outdent}}],autoClosingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}]},o.language={tokenPostfix:".choicescript",commands:["abort","achieve","achievement","advertisement","allow_reuse","author","bug","check_achievements","check_purchase","check_registration","choice","create","delay_break","delay_ending","delete","disable_reuse","else","elseif","elsif","end_trial","ending","fake_choice","finish","gosub","gosub_scene","goto","goto_random_scene","goto_scene","gotoref","hide_reuse","if","image","input_number","input_text","label","line_break","link","link_button","login","looplimit","more_games","page_break","params","print","purchase","purchase_discount","rand","redirect_scene","reset","restart","restore_game","restore_purchases","return","save_game","scene_list","script","selectable_if","set","setref","share_this_game","show_password","sound","stat_chart","subscribe","temp","title"],indentCommands:["achievement","choice","else","elseif","elsif","fake_choice","if","scene_list","stat_chart"],dedentCommands:["ending","finish","goto","goto_scene","redirect_scene"],optionCommands:["allow_reuse","disable_reuse","hide_reuse"],flowCommands:["gosub","gosub_scene","goto","goto_random_scene","goto_scene","gotoref","label","redirect_scene","return"],csPlusCommands:["console_log","console_track","console_track_all","console_untrack_all","console_untrack","console_clear","console_track_list","cside_theme_set","cside_theme_apply"],symbols:/[=><&+\-*\/\^%!#]+/,operators:["#","&","%-","%+","-","+","/","*","<",">","<=",">=","=","!=","and","or","modulo"],brackets:[{open:"{",close:"}",token:"bracket"},{open:"[",close:"]",token:"bracket"},{open:"(",close:")",token:"bracket"}],escapes:/[\\"]/,tokenizer:{command_line:[[/[{}\[\]()]/,"@brackets"],{regex:/^\s*[^\*\s]+.*$/,action:{token:"@rematch",switchTo:"@text_line"}},{regex:/^\s*\*\w+/,action:{token:"@rematch",next:"@command"}},{include:"@expression"},{regex:/\s+#/,action:{token:"@rematch",switchTo:"@text_line"}},{regex:/\s+/,action:{token:"whitespace"}}],text_line:[{regex:/^\s*\*.*$/,action:{token:"@rematch",switchTo:"@command_line"}},{regex:/#/,action:{token:"choice-marker"}},[/[\$@]\{.*\}/,{token:"@rematch",next:"@variable"}]],command:[{regex:/^\s+/,action:{token:"whitespace"}},{regex:"\\*comment.*$",action:{token:"comment",next:"@pop"}},{regex:/(?:\*)(\w+)/,action:{cases:{"$1@optionCommands":{token:"command",switchTo:"@reuse_option"},"$1@flowCommands":{token:"flow-command",next:"@pop"},"$1@csPlusCommands":{token:"extra-keywords",next:"@pop"},"$1@commands":{token:"command",next:"@pop"},"@default":{token:"invalid"}}}}],string:[[/[\$@]\{.*\}/,{token:"@rematch",next:"@variable"}],[/[^\\@\$"]+(?!\$\{)/,{token:"string.string"}],[/\\"/,"string.escape"],[/\\./,"string.escape.invalid"],[/"/,{token:"string.quote",bracket:"@close",next:"@pop"}]],variable:[{regex:/\${|@{/,action:{token:"variable",bracket:"@open"}},{include:"@expression"},{regex:/\{/,action:{token:"variable",bracket:"@open",next:"@push"}},{regex:/\}/,action:{token:"variable",bracket:"@close",next:"@pop"}}],expression:[{regex:/\b[A-Za-z_]+\w*/,action:{cases:{"(true|false)":{token:"keyword"},"(not|length|round|timestamp|log|auto)":{token:"function"},"(and|or|modulo)":{token:"operator"},"@default":{token:"identifier"}}}},{regex:'"',action:{token:"string.quote",bracket:"@open",next:"@string"}},{regex:/\b[0-9]+\b/,action:{token:"number"}},["@symbols",{cases:{"@operators":{token:"operator"}}}]],reuse_option:[[/\s*#/,{token:"@rematch",switchTo:"@text_line"}],[/\s*\*(selectable_if|if)/,{token:"@rematch",switchTo:"@command"}],[/^\s*/,{token:"rematch",next:"@pop"}]]}}}));