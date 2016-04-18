"use strict";

const middleware = require('../lib/middleware.js');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('Middleware', () => {

    it('should throw error when async is not a promise', () => {
        expect(
            middleware.default()().bind(null, {
                [middleware.ASYNC]: 'bar'
            })
        ).to.throw('action.[ASYNC].promise must be instances of promise')
    });

    it('should throw error when status is defined for async action', () => {
        expect(
            middleware.default()().bind(null, {
                status            : 'bar',
                [middleware.ASYNC]: new Promise(resolve => resolve())
            })
        ).to.throw('action.status must be undefined for async actions')
    });

    it('should throw error when error is defined for async action', () => {
        expect(
            middleware.default()().bind(null, {
                error             : 'bar',
                [middleware.ASYNC]: new Promise(resolve => resolve())
            })
        ).to.throw('action.error must be undefined for async actions')
    });

    it('should throw error when payload is defined for async action', () => {
        expect(
            middleware.default()().bind(null, {
                payload           : 'bar',
                [middleware.ASYNC]: new Promise(resolve => resolve())
            })
        ).to.throw('action.payload must be undefined for async actions')
    });

    it('should call next in chain with a request and a success action', (done) => {
        const spy = sinon.spy();

        const promise = middleware.default()(spy)({
            [middleware.ASYNC]: new Promise(resolve => resolve({
                json   : () => ["valid", "json"],
                headers: {
                    get: () => 'application/json'
                },
                ok        : true,
                status    : 200,
                statusText: 'OK'
            }))
        });

        expect(spy).calledWith({status: 'request'});
        expect(spy).to.have.been.calledOnce;
        return promise
            .then(() => {
                expect(spy).to.have.been.calledThrice;
                expect(spy).calledWith({
                    payload: ["valid", "json"],
                    status: 'success'
                });
                expect(spy).calledWith({status: 'completed'});
                done();
            })
            .catch(err => done(err))
            ;
    });

    it('should throw errors for fetch Response\'s !ok', (done) => {
        const spy = sinon.spy();

        const promise = middleware.default()(spy)({
            [middleware.ASYNC]: new Promise(resolve => resolve({
                json   : () => ["valid", "json"],
                headers: {
                    get: () => 'application/json'
                },
                ok        : false,
                status    : 404,
                statusText: 'NOT FOUND'
            }))
        });

        expect(spy).calledWith({status: 'request'});
        expect(spy).to.have.been.calledOnce;

        return promise
            .then(() => {
                expect(spy).to.have.been.calledThrice;
                expect(spy).calledWithMatch({status: 'failure'});
                expect(spy).calledWith({status: 'completed'});
                done();
            })
            .catch(err => done(err))
    });

});