"use strict";
const uuid = require('uuid');
const middleware = require('../lib/middleware.js');
const reducer = require('../lib/reducer.js').default;
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const redux = require('redux');
const createStore = redux.createStore;
const applyMiddleware = redux.applyMiddleware;

chai.use(require('sinon-chai'));

describe('Reducer', () => {

    it('should track async success actions with an id', (done) => {
        const spy = sinon.spy((state, action) => state || {});
        let mvSpy;
        const mv = store => next => mvSpy = sinon.spy(action => next(action));

        const store = createStore(reducer(spy), {}, applyMiddleware(middleware.default, mv));

        const promise = store.dispatch({
            type              : 'SOME_TYPE_CONSTANT',
            [middleware.ASYNC]: new Promise(resolve => resolve())
        });
        let id;
        expect(spy).to.have.been.calledTwice;

        let state = store.getState();
        let asyncKeys = Object.keys(state.__async);
        expect(asyncKeys.length).to.equal(1);
        expect(state.__async[asyncKeys[0]]).to.equal(true);

        expect(mvSpy).to.have.been.calledWithMatch((action) => {
            return action.status === 'request' && action[middleware.ASYNC].id === asyncKeys[0];
        });

        promise
            .then(res => {
                expect(spy.callCount).to.equal(4);

                let state = store.getState();
                let asyncKeys = Object.keys(state.__async);
                expect(asyncKeys.length).to.equal(1);
                expect(state.__async[asyncKeys[0]]).to.equal(false);

                expect(mvSpy).to.have.been.calledWithMatch(action => {
                    return action.status === 'success' &&
                        action[middleware.ASYNC].id === asyncKeys[0];
                });
                done();
            })
            .catch(done)
        ;
    });

    it('should track async error actions with an id', (done) => {
        const spy = sinon.spy((state, action) => state || {});
        let mvSpy;
        const mv = store => next => mvSpy = sinon.spy(action => next(action));

        const store = createStore(reducer(spy), {}, applyMiddleware(middleware.default, mv));

        const promise = store.dispatch({
            type              : 'SOME_TYPE_CONSTANT',
            [middleware.ASYNC]: new Promise((resolve, reject) => reject(new Error('INTENDED_ERROR')))
        });
        let id;
        expect(spy).to.have.been.calledTwice;

        let state = store.getState();
        let asyncKeys = Object.keys(state.__async);
        expect(asyncKeys.length).to.equal(1);
        expect(state.__async[asyncKeys[0]]).to.equal(true);

        expect(mvSpy).to.have.been.calledWithMatch((action) => {
            return action.status === 'request' && action[middleware.ASYNC].id === asyncKeys[0];
        });

        promise
            .then(res => {
                expect(spy.callCount).to.equal(4);

                let state = store.getState();
                let asyncKeys = Object.keys(state.__async);
                expect(asyncKeys.length).to.equal(1);
                expect(state.__async[asyncKeys[0]]).to.equal(false);

                expect(mvSpy).to.have.been.calledWithMatch(action => {
                    return action.status === 'failure' &&
                        action.error.message === 'INTENDED_ERROR' &&
                        action[middleware.ASYNC].id === asyncKeys[0];
                });

                done();
            })
            .catch(done)
        ;
    });

    it('async results should not be calling reducers if state has been wiped', () => {
        const spy = sinon.spy((state, action) => {
            return Object.assign({}, state);
        });
        const id = uuid.v4();

        reducer(spy)(null, {
            status            : 'request',
            [middleware.ASYNC]: {id}
        });

        reducer(spy)(null, {
            status            : 'success',
            [middleware.ASYNC]: {id}
        });

        reducer(spy)(null, {
            status            : 'failure',
            [middleware.ASYNC]: {id}
        });

        reducer(spy)(null, {
            status            : 'completed',
            [middleware.ASYNC]: {id}
        });


        expect(spy).to.have.been.calledWith({}, {status: 'request'});
        expect(spy).to.not.have.been.calledWith({}, {status: 'success'});
        expect(spy).to.not.have.been.calledWith({}, {status: 'failure'});
        expect(spy).to.have.been.calledWith({}, {status: 'completed'});
        expect(spy.callCount).to.equal(2);
    })

});