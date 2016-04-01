"use strict";
const expect        = require('chai').expect;
const event         = require('../bin/event');

describe.only('event', function() {

    describe('#emitter', function() {
        let emit;

        beforeEach(function() {
            emit = event.emitter('foo')
        });
        afterEach(function() {
            emit.deRegister();
        });

        it('returns a function', function() {
            expect(emit).to.be.a('function');
        });

        it('requires unique namespace', function() {
            expect(() => event.emitter('foo')).to.throw(event.error.exist);
        });

    });

    describe('#namespaces', function() {

        it('has foo item only', function() {
            let emit = event.emitter('foo');
            expect(event.namespaces).to.be.deep.equal(['event-core', 'foo']);
            emit.deRegister();
        });

    });

    describe('#off, #on, #once', function() {
        let emit;
        let noop;

        before(function() {
            emit = event.emitter('foo');
            noop = getNoop();
        });
        after(function() {
            emit.deRegister();
        });

        it('removes on listener', function() {
            event.on('foo', 'bar', noop);
            expect(event.listenerCount('foo', 'bar')).to.equal(1);
            event.off('foo', 'bar', noop);
            expect(event.listenerCount('foo', 'bar')).to.equal(0);
        });

        it('removes once listener', function() {
            event.once('foo', 'bar', noop);
            expect(event.listenerCount('foo', 'bar')).to.equal(1);
            event.off('foo', 'bar', noop);
            expect(event.listenerCount('foo', 'bar')).to.equal(0);
        });

    });

});

function getNoop() {
    return function() {};
}