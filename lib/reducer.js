'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _middleware = require('./middleware.js');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

exports.default = function (reducer) {
    return function (state, action) {
        state = state || {};
        var _state = state;
        var __async = _state.__async;

        var oldState = _objectWithoutProperties(_state, ['__async']);

        var async = Object.assign({}, __async);
        if (action[_middleware.ASYNC] && action[_middleware.ASYNC].id) {
            switch (action.status) {
                case 'request':
                    async[action[_middleware.ASYNC].id] = true;
                    break;
                case 'success':
                case 'failure':
                    if (async[action[_middleware.ASYNC].id] !== true) {
                        return state;
                    }
                    break;
                case 'completed':
                    async[action[_middleware.ASYNC].id] = false;
                    break;
            }
        }
        state = reducer(oldState, action);
        state.__async = async;
        return state;
    };
};