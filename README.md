redux-track-async
=================
A small lib to track pending asynchronous actions

Example
-------
An action creator can look as simple as this

```javascript
import {ASYNC} from 'redux-track-async';
export const SOME_ENTITIES = 'SOME_ENTITIES';
export function fetchSomeEntities() {
    return {
        type       : SOME_ENTITIES,
        [ASYNC]    : fetch('/api/some/entities')
    };
}
```

Create a store with a reducer to track async actions. Wrap your own root reducer in order to allow the asyncReducer to block orphaned responses.
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

