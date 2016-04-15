import { ASYNC } from './middleware.js';
export default reducer => (state, action) => {
    state = state || {};
    let {__async, ...oldState} = state;
    let async = Object.assign({}, __async);
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
    state = reducer(oldState, action);
    state.__async = async;
    return state;
};