'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ASYNC = undefined;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var ASYNC = exports.ASYNC = Symbol('ASYNC');

exports.default = function (store) {
    return function (next) {
        return function (action) {
            var options = action[ASYNC];

            var tail = _objectWithoutProperties(action, [ASYNC]);

            // copy symbols that aren't copied with rest operator


            var symbols = Object.getOwnPropertySymbols(action).filter(function (symbol) {
                return symbol !== ASYNC;
            });
            symbols.forEach(function (symbol) {
                return tail[symbol] = action[symbol];
            });

            if (typeof options === 'undefined') {
                return next(action);
            }

            ['status', 'payload', 'error'].forEach(function (str) {
                if (typeof action[str] !== 'undefined') {
                    throw new Error('action.' + str + ' must be undefined for async actions');
                }
            });

            var promise = options.promise;
            var _options$parse = options.parse;
            var parse = _options$parse === undefined ? function (response) {
                if (response && typeof response.json === 'function' && response.headers && response.headers.get) {
                    var contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                    }
                }
                return response;
            } : _options$parse;


            if (!promise) {
                promise = options;
            }

            // would prefer "promise instanceof Promise" but shims will fail that
            if (typeof promise.then !== 'function') {
                throw new Error('action.[ASYNC].promise must be instances of promise');
            }

            // removes ASYNC attribute from tail
            action[ASYNC] = { id: _uuid2.default.v4() };
            next(Object.assign({}, action, { status: 'request' }));

            return promise.then(function (result) {
                if (parse) {
                    return parse(result);
                }
                return result;
            }).then(function (result) {
                next(Object.assign({}, action, {
                    status: 'success',
                    payload: result
                }));
            }).catch(function (err) {
                next(Object.assign({}, action, {
                    status: 'failure',
                    error: err
                }));
            }).then(function () {
                next(Object.assign({}, action, {
                    status: 'completed'
                }));
            });
        };
    };
};