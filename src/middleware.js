import uuid from 'uuid';
export const ASYNC = Symbol('ASYNC');

function ApiError(status, statusText) {
    this.name = 'ApiError';
    this.message = `${status} - ${statusText}`;
    this.stack = (new Error()).stack;
}
ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = 'ApiError';

export default store => next => action => {
    const {[ASYNC]: options, ...tail} = action;

    // copy symbols that aren't copied with rest operator
    const symbols = Object.getOwnPropertySymbols(action)
        .filter(symbol => symbol !== ASYNC);
    symbols.forEach(symbol => tail[symbol] = action[symbol]);

    if (typeof options === 'undefined') {
        return next(action);
    }

    ['status', 'payload', 'error'].forEach(str => {
        if (typeof action[str] !== 'undefined') {
            throw new Error(`action.${str} must be undefined for async actions`);
        }
    });

    let {
        promise,
        parse = (response) => {
            // detect if response is a Response (or shim)
            if (response && typeof response.json === 'function' && response.headers && response.headers.get) {
                if (response.ok === false) {
                    throw new ApiError(response.status, response.statusText);
                }

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json();
                }
            }
            return response;
        }
    } = options;

    if (!promise) {
        promise = options;
    }

    // would prefer "promise instanceof Promise" but shims will fail that
    if (typeof promise.then !== 'function') {
        throw new Error('action.[ASYNC].promise must be instances of promise');
    }

    // removes ASYNC attribute from tail
    action[ASYNC] = {id: uuid.v4()};
    next(Object.assign({}, action, {status: 'request'}));

    return promise
        .then(result => {
            if (parse) {
                return parse(result);
            }
            return result;
        })
        .then(result => {
            next(Object.assign({}, action, {
                status : 'success',
                payload: result
            }));
        })
        .catch(err => {
            next(Object.assign({}, action, {
                status: 'failure',
                error : err
            }));
        })
        .then(() => {
            next(Object.assign({}, action, {
                status: 'completed'
            }));
        })
        ;
};
