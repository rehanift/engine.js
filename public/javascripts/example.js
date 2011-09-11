var TABS = ["getting-started","code","context"];

// initialize the ACE editor
$(document).ready(function(){
  var editor = ace.edit("editor");
  window.ace_editor = editor;
  
  editor.renderer.setShowGutter(false);
  editor.renderer.setHScrollBarAlwaysVisible(false);

  var js_mode = require("ace/mode/javascript").Mode;
  editor.getSession().setMode(new js_mode());

  editor.setTheme("ace/theme/idle_fingers");
  
  window.ace_sessions = {};
  var EditSession = require("ace/edit_session").EditSession;
  var code_session = new EditSession('add(1,2);');
  code_session.setMode(new js_mode());
  window.ace_sessions['code'] = code_session;

  var context_session = new EditSession('(function(locals){\n    return {\n        add: function(a,b){\n            return a+b;\n        }\n    }\n})');
  context_session.setMode(new js_mode());
  window.ace_sessions['context'] = context_session;

  editor.setSession(code_session);
});

var deactivate_all = function(){
  $("ul.pills li").removeClass("active");
};

// tab behaviour
$(document).ready(function(){
  $(TABS).each(function(key,tab){
    $("ul.pills li."+tab+" a").click(function(e){
      e.preventDefault();
      deactivate_all();
      $("ul.pills li."+tab).addClass("active");
      window.ace_editor.setSession(window.ace_sessions[tab]);
    });
  });  
});

var socket;
$(document).ready(function(){
  socket = io.connect('http://localhost:3000');
  socket.on('console', function(data){
    $("#console").text(data);
  });

  socket.on('eval', function(data){
    $("#eval").text(data);
  });

});

$(document).ready(function(){
  $("#run").click(function(){
    socket.emit('run', {
      code: window.ace_sessions['code'].getValue(),
      context: window.ace_sessions['context'].getValue()      
    });
  });
});