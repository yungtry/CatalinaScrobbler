'use strict';

var debug = require('debug')('prompt-password');
var Prompt = require('prompt-base');

/**
 * `password` type prompt
 */

function Password() {
  Prompt.apply(this, arguments);
  debug('initializing from <%s>', __filename);
}

/**
 * Inherit `Prompt`
 */

Prompt.extend(Password);

/**
 * Overwrite the `renderMask` method on prompt-base
 * to mask password as it's typed by the user.
 */

Password.prototype.renderMask = function(input) {
  if (!input) return '';
  if (this.status === 'answered') {
    return '[hidden]';
  }
  var mask = this.options.mask || '*';
  if (typeof mask === 'string') {
    return new Array(String(input).length + 1).join(mask);
  }
  if (typeof mask === 'function') {
    return mask.call(this, input);
  }
};

/**
 * Module exports
 */

module.exports = Password;
