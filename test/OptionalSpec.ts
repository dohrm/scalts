import * as assert              from 'power-assert';
import {Optional}               from '../src/Optional';
import 'reflect-metadata';


function testDec( clazz: Object, field: string ) {
    // Nothing
}

class ReflectTest {
    @testDec
    readonly field: Optional< string >;
}

console.log('.......', (<any>ReflectTest).test);

describe('Optional', () => {
    it('#profides reflect metadata', () => {
        assert.equal( Reflect.getMetadata( 'design:type', ReflectTest.prototype, 'field' ), Optional );
    });
    it('#isEmpty', () => {
        assert(Optional.apply<number>(null).isEmpty);
        assert(Optional.apply(undefined).isEmpty);
        assert(Optional.apply(1).isEmpty === false);
    });
    it('#nonEmpty', () => {
        assert(Optional.apply<number>(null).nonEmpty === false);
        assert(Optional.apply(undefined).nonEmpty === false);
        assert(Optional.apply(1).nonEmpty);
    });
    it('#get', () => {
        assert(Optional.apply(1).get() === 1);
        try {
            assert(Optional.apply<number>(null).get());
            assert(false)
        } catch (e) {
            assert(true);
        }
    });
    it('#getOrElse', () => {
        assert(Optional.apply(1).getOrElse(() => 0) === 1);
        assert(Optional.apply<number>(null).getOrElse(() => 0) === 0);
    });
    it('#map', () => {
        assert(Optional.apply(1).map((x) => x + 1).get() === 2);
        assert(Optional.apply<number>(null).map((x) => x + 1).isEmpty);
    });
    it('#fold', () => {
        assert(Optional.apply(1).fold(0, (x) => x + 1) === 2);
        assert(Optional.apply<number>(null).fold(0, (x) => x + 1) === 0);
    });
    it('#filter', () => {
        assert(Optional.apply(1).filter((x) => x === 1).nonEmpty);
        assert(Optional.apply(1).filter((x) => x === 2).isEmpty);
        assert(Optional.apply<number>(null).filter((x) => x === 1).isEmpty);
    });
    it('#contains', () => {
        assert(Optional.apply(1).contains(1));
        assert(Optional.apply(1).contains(2) === false);
        assert(Optional.apply<number>(null).contains(1) === false);
    });
    it('#exists', () => {
        assert(Optional.apply(1).exists((x) => x === 1));
        assert(Optional.apply(1).exists((x) => x === 2) === false);
        assert(Optional.apply<number>(null).exists((x) => x === 1) === false);
    });
    it('#forall', () => {
        assert(Optional.apply(1).forall((x) => x === 1));
        assert(Optional.apply(1).forall((x) => x === 2) === false);
        assert(Optional.apply<number>(null).forall((x) => x === 1) === true);
    });
    it('#flatMap', () => {
        assert(Optional.apply(1).flatMap((x) => Optional.apply<number>(null)).isEmpty);
        assert(Optional.apply(1).flatMap((x) => Optional.apply(x + 1)).get() === 2);
        assert(Optional.apply<number>(null).flatMap((x) => Optional.apply(x + 1)).isEmpty);
    });
    it('#foreach', () => {
        Optional.apply(1).foreach((x) => assert(x === 1));
        Optional.apply<number>(null).foreach((x) => assert(x === 1));
    });
    it('#orElse', () => {
        assert(Optional.apply(1).orElse(() => Optional.apply(2)).get() === 1);
        assert(Optional.apply<number>(null).orElse(() => Optional.apply(2)).get() === 2);
    });
    it('#apply1', () => {
        assert(Optional.apply(1).apply1(() => Optional.apply(2), (a, b) => a + b).get() === 3);
        assert(Optional.apply<number>(null).apply1(() => Optional.apply(2), (a, b) => a + b).isEmpty);
        assert(Optional.apply(1).apply1(() => Optional.apply<number>(null), (a, b) => a + b).isEmpty);
    });
    it('#apply2', () => {
        assert(Optional.apply(1).apply2(() => Optional.apply(2), () => Optional.apply(3), (a, b, c) => a + b + c).get() === 6);
        assert(Optional.apply<number>(null).apply2(() => Optional.apply(2), () => Optional.apply(3), (a, b, c) => a + b + c).isEmpty);
        assert(Optional.apply(1).apply2(() => Optional.apply<number>(null), () => Optional.apply(3), (a, b, c) => a + b + c).isEmpty);
        assert(Optional.apply(1).apply2(() => Optional.apply(2), () => Optional.apply<number>(null), (a, b, c) => a + b + c).isEmpty);
    });
    it('#chain', () => {
        assert(Optional.apply(1).chain(() => Optional.apply(2)).run((a, b) => a + b).get() === 3);
        assert(Optional.apply(1).chain(() => Optional.apply(2)).chain(() => Optional.apply(3)).run((a, b, c) => a + b + c).get() === 6);
        assert(Optional.apply(1).chain(() => Optional.apply(2)).chain(() => Optional.apply(3)).chain(() => Optional.apply(4)).run((a, b, c, d) => a + b + c + d).get() === 10);
        assert(Optional.apply(1).chain(() => Optional.apply(2)).chain(() => Optional.apply(3)).chain(() => Optional.apply(4)).chain(() => Optional.apply(5)).run((a, b, c, d, e) => a + b + c + d + e).get() === 15);
        assert(Optional.apply(1).chain(() => Optional.apply(2)).chain(() => Optional.apply(3)).chain(() => Optional.apply(4)).chain(() => Optional.apply(5)).chain(() => Optional.apply(6)).run((a, b, c, d, e, f) => a + b + c + d + e + f).get() === 21);
        assert(Optional.apply<number>(null).chain(() => Optional.apply(1)).run((a, b) => a + b).isEmpty);
        assert(Optional.apply(1).chain(() => Optional.apply<number>(null)).run((a, b) => a + b).isEmpty);
    });
});
