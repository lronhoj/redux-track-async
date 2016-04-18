Install
=======
`npm install --save redux-track-async`

Usage
=====
Creating actions
```javascript
import {ASYNC} from 'redux-track-async';

export const SOME_ENTITIES = 'SOME_ENTITIES';
export function fetchSomeEntities() {
    return {
        type   : SOME_ENTITIES,
        // simple mode - just a promise needed
        [ASYNC]: fetch('/api/some/entities')
    };
}

export const SOME_ENTITY = 'SOME_ENTITY';
export function fetchSomeEntity(id) {
    return {
        type   : SOME_ENTITY,
        // specify options
        [ASYNC]: {
            promise: fetch(`/api/some/entities/${id}`),
            parse  : response => response.json()
        }
    };
}
```

Create a store with a reducer to track async actions. Wrap your own root reducer in order to allow the
asyncReducer to block orphaned responses. Attach middleware.
```javascript
import {middleware as asyncMiddleware, reducer as asyncReducer} from 'redux-track-async';
import {createStore, applyMiddleware} from 'redux';

const initialState = {};
const store = createStore(
    asyncReducer(rootReducer),
    initialState,
    applyMiddleware(asyncMiddleware)
);
```


API
===

## middleware
#### ASYNC
Type: `Symbol`

A constant which is used as an attribute of dispatched actions to signal middleware.

## middleware consumed actions
```javascript
action[ASYNC]: options || promise
```

#### promise (Required)
Type: `Promise`

The promise to track.

#### parse
Type: `function`  
Default: returns `response.json()` if the result is a `Response`
```javascript
response => {
    if (response && typeof response.json === 'function' && response.headers && response.headers.get) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
    }
    return response;
}
```

## middleware produced actions
The middleware produces a series of actions for each async actions it consumes.
The status attribute changes througout the series. `request => success|failure => completed`. Request and completed actions are always produced. Success or failure actions are produced depending on wether the promise is `fulfilled` or `rejected`.

#### Request action
```javascript
{
  "status": "request",
  [ASYNC]: {
    "id": "<generated uuid>"
  },
  { other attributes }
}
```

#### Success action
```javascript
{
  "status": "success",
  [ASYNC]: {
    "id": "<generated uuid>"
  },
  "payload": result,
  { other attributes }
}
```

#### Failure action
```javascript
{
  "status": "failure",
  [ASYNC]: {
    "id": "<generated uuid>"
  },
  "error": error,
  { other attributes }
}
```

#### Completed action
```javascript
{
  "status": "completed",
  [ASYNC]: {
    "id": "<generated uuid>"
  },
  { other attributes }
}
```


## reducer(rootReducer)

##### rootReducer (Required)
Type: `function`

The reducer wraps the application root reducer. This allows it to block orphaned actions caused by async actions being fired after page shifts or other context shifts where the async state has been cleared.

## actions

#### clearPendingRequests()
Takes no arguments and causes reducer to clear it's state of pending requests. All pending requests will be orphans and `success|failure` actions will be blocked from the rootReducer. Only the `completed` action will be fired. The `completed` action is fired to allow other reducers to remove loading states for pending requests.

#### clearPendingRequest(id)
Takes a `uuid` of an async request and removes it from the async state. Like `clearPendingRequests()` it causes the `success|failure` actions to be blocked from the rootReducer. Only the `completed` action will be fired. The `completed` action is fired to allow other reducers to remove loading state for the pending request.

LICENSE
=======
MIT © [Arosii A/S](http://www.arosii.com/)
