var TABS = ["code","context","about"];

var editorify = function(document_id){
  var editor = ace.edit(document_id);
  
  editor.renderer.setShowGutter(false);
  editor.renderer.setHScrollBarAlwaysVisible(false);

  var js_mode = require("ace/mode/javascript").Mode;
  editor.getSession().setMode(new js_mode());

  editor.setTheme("ace/theme/idle_fingers");
  
  var editors = window.ace_editors || {};
  editors[document_id] = editor;

  window.ace_editors = editors;
};

// initialize first Ace editor
$(document).ready(function(){
  editorify("code_editor");
});

var deactivate_all = function(){
  $("ul.tabs li").removeClass("active");
  $("div.editors div.editor").removeClass("active");
};

// tab behaviour
$(document).ready(function(){
  $(TABS).each(function(key,tab){
    $("ul.tabs li."+tab+" a").click(function(e){
      e.preventDefault();
      deactivate_all();
      $("ul.tabs li."+tab).addClass("active");
      $("div.editors div.editor."+tab).addClass("active");
    });
  });  
});

$(document).ready(function(){
  $("ul.tabs li.context a").click(function(e){
    e.preventDefault();
    if (!window.ace_editors['context_editor']) {
      editorify('context_editor');
    }
  });
});