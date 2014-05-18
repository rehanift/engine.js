var util = require("util");

exports.look = function(obj){
    console.log(util.inspect(obj, false, 25));
}

exports.dom = 
[ { type: 'tag',
    name: 'html',
    children: 
     [ { type: 'tag',
         name: 'head',
         children: 
          [ { type: 'tag',
              name: 'meta',
              attribs: 
               { 'http-equiv': 'Content-type',
                 content: 'text/html; charset=utf-8' } },
            { type: 'tag',
              name: 'title',
              children: [ { data: 'Test', type: 'text' } ] } ] },
       { type: 'tag',
         name: 'body',
         children: 
          [ { type: 'tag',
              name: 'div',
              attribs: { id: 'nav' },
              children: 
               [ { type: 'tag',
                   name: 'ul',
                   attribs: { color: 'blue' },
                   children: 
                    [ { type: 'tag',
                        name: 'li',
                        children: [ { data: 'water', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        children: [ { data: 'sky', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        children: [ { data: 'bluebird', type: 'text' } ] } ] },
                 { type: 'tag',
                   name: 'ul',
                   attribs: { color: 'yellow' },
                   children: 
                    [ { type: 'tag',
                        name: 'li',
                        children: [ { data: 'sun', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        children: [ { data: 'daffodils', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        children: [ { data: 'leaves', type: 'text' } ] } ] } ] },
            { type: 'tag',
              name: 'div',
              attribs: { id: 'content' },
              children: 
               [ { type: 'tag',
                   name: 'h1',
                   children: [ { data: 'Testing Awesome', type: 'text' } ] },
                 { type: 'tag',
                   name: 'p',
                   attribs: { id: 'current post', class: 'main post' },
                   children: 
                    [ { data: '\n\t        \tCras mattis consectetur purus sit amet fermentum.\n\t        ',
                        type: 'text' } ] },
                 { type: 'tag',
                   name: 'p',
                   attribs: { class: 'post' },
                   children: 
                    [ { data: '\n\t        \tNullam quis risus eget urna mollis ornare vel eu leo.\n\t        ',
                        type: 'text' } ] } ] },
            { type: 'tag',
              name: 'div',
              attribs: { id: 'menu' },
              children: 
               [ { type: 'tag',
                   name: 'ul',
                   children: 
                    [ { type: 'tag',
                        name: 'h3',
                        attribs: { class: 'subtitle' },
                        children: [ { data: 'Hello, world!', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        attribs: { type: 'awesome' },
                        children: [ { data: 'I am awesome', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        attribs: { type: 'suckish' },
                        children: [ { data: 'I suck', type: 'text' } ] },
                      { type: 'tag',
                        name: 'h3',
                        attribs: { class: 'subtitle' },
                        children: [ { data: 'Bonjour, monde!', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        attribs: { type: 'awesome', color: 'green' },
                        children: [ { data: 'I am awesome, in green', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        attribs: { type: 'cookie', color: 'purple' },
                        children: [ { data: 'I am a cookie, in purple', type: 'text' } ] },
                      { type: 'tag',
                        name: 'li',
                        attribs: { type: 'pizza', color: 'green' },
                        children: [ { data: 'I am a pizza, in green', type: 'text' } ] } ] } ] } ] } ] } ];

