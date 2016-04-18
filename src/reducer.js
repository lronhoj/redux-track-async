import { ASYNC } from './middleware.js';
import { CLEAR_PENDING_REQUEST, CLEAR_PENDING_REQUESTS } from './actions.js';
export default reducer => (state, action) => {
    state = state || {};
    let {__async, ...oldState} = state;
    let async = Object.assign({}, __async);

    // handle async requests
    if (action[ASYNC] && action[ASYNC].id) {
        switch(action.status) {
            case 'request':
                async[action[ASYNC].id] = true;
                break;
            case 'success':
            case 'failure':
                if (async[action[ASYNC].id] !== true) {
                    return state;
                }
                break;
            case 'completed':
                async[action[ASYNC].id] = false;
                break;
        }
    }

    // handle package actions
    switch (action.type) {
        case CLEAR_PENDING_REQUEST:
            if (async[action.id]) {
                async[action.id] = false;
            }
            break;
        case CLEAR_PENDING_REQUESTS:
            async = {};
            break;
    }
    state = reducer(oldState, action);
    state.__async = async;
    return state;
};