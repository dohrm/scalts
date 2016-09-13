/// <reference path="../typings/tsd.d.ts" />

import * as assert              from 'power-assert';
import {Case}                   from '../src/MatchCase'
import {PartialFunction}        from '../src/PartialFunction';


const func1 = PartialFunction<number, string>(
    Case(idx => idx > 3, idx => `Greats, better than God`),
    Case(idx => idx === 3, idx => `Like God`),
    Case(idx => idx < 3 && idx > 0, idx => `Boo you are a peon`),
);

const func2 = PartialFunction<number, string>(
    Case(idx => idx > 3, idx => `WTF ? You try to hit me?`),
    Case(idx => idx === 3, idx => `The king is dead`),
    Case(idx => idx < 3 && idx > 0, idx => `I like this kind of test.`),
    Case(idx => idx <= 0, idx => `I like to move it, move it.`),
);

const func3 = PartialFunction<string, number>(
    Case(_ => true, _ => 42)
);

describe('PartialFunction', () => {
    it('#func', () => {
        assert.equal(func1(4), 'Greats, better than God');
        assert.equal(func1(3), 'Like God');
        assert.equal(func1(2), 'Boo you are a peon');
        assert.equal(func1(1), 'Boo you are a peon');
        try {
            func1(0);
            assert(false);
        } catch (e) {
            assert(true);
        }
    });
    it('#orElse', () => {
        const f1 = func1.orElse(func2);
        const f2 = func2.orElse(func1);
        assert.equal(f1(4), 'Greats, better than God');
        assert.equal(f1(3), 'Like God');
        assert.equal(f1(2), 'Boo you are a peon');
        assert.equal(f1(1), 'Boo you are a peon');
        assert.equal(f1(0), 'I like to move it, move it.');
        assert.equal(f1(-1), 'I like to move it, move it.');

        assert.equal(f2(4), 'WTF ? You try to hit me?');
        assert.equal(f2(3), 'The king is dead');
        assert.equal(f2(2), 'I like this kind of test.');
        assert.equal(f2(1), 'I like this kind of test.');
        assert.equal(f2(0), 'I like to move it, move it.');
        assert.equal(f2(-1), 'I like to move it, move it.');
    });
    it('#andThen', () => {
        const f1 = func1.andThen(func3);
        assert.equal(f1(1), 42);
        try {
            f1(0);
            assert(false);
        } catch (e) {
            assert(true);
        }
    });
});