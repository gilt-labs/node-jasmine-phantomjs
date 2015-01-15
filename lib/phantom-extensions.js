/*
Ported directly from: https://github.com/metaskills/mocha-phantomjs/blob/master/lib/mocha-phantomjs/core_extensions.js

Copyright (c) 2012 Ken Collins
Copyright (c) 2015 Gilt Groupe, Inc., Andrew Powell

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(){

  // A shim for non ES5 supporting browsers, like PhantomJS. Lovingly inspired by:
  // http://www.angrycoding.com/2011/09/to-bind-or-not-to-bind-that-is-in.html
  if (!('bind' in Function.prototype)) {
    Function.prototype.bind = function () {
      var funcObj = this;
      var extraArgs = Array.prototype.slice.call(arguments);
      var thisObj = extraArgs.shift();
      return function() {
        return funcObj.apply(thisObj, extraArgs.concat(Array.prototype.slice.call(arguments)));
      };
    };
  }

  // jasmine needs a process.stdout.write in order to change the cursor position.
  jasmine.process = jasmine.process || {};
  jasmine.process.stdout = jasmine.process.stdout || process.stdout;
  jasmine.process.stdout.write = function (s) { window.callPhantom({ 'jasmine.process.stdout.write': s }); }

  // jasmine needs the formating feature of console.log so copy node's format function and
  // monkey-patch it into place. This code is copied from node's, links copyright applies.
  // https://github.com/joyent/node/blob/master/lib/util.js
  console.format = function (f) {
    if (typeof f !== 'string') {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(JSON.stringify(arguments[i]));
      }
      return objects.join(' ');
    }
    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(/%[sdj%]/g, function (x) {
      if (x === '%%') return '%';
      if (i >= len) return x;
      switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j': return JSON.stringify(args[i++]);
        default:
          return x;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (x === null || typeof x !== 'object') {
        str += ' ' + x;
      } else {
        str += ' ' + JSON.stringify(x);
      }
    }
    return str;
  };
  var origError = console.error;
  console.error = function () { origError.call(console, console.format.apply(console, arguments)); };
  var origLog = console.log;
  console.log = function () { origLog.call(console, console.format.apply(console, arguments)); };

})();
