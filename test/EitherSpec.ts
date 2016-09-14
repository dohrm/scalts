/// <reference path="../typings/tsd.d.ts" />

import * as assert from 'power-assert';
import {Either, Right, Left} from '../src/Either';

const right = Either(true, () => 1, () => 1);
console.log(right);
const left = Either(false, () => 1, () => 1);

describe('Either', () => {
    it('#isRight', () => {
        assert(right.isRight);
        assert(left.isRight === false);
        assert(left.toString().indexOf('Left(') > -1);
        assert(right.toString().indexOf('Right(') > -1);
    });
    it('#isLeft', () => {
        assert(right.isLeft === false);
        assert(left.isLeft);
    });
    it('#fold', () => {
        assert(right.fold((a) => 0, (b) => 1) === 1);
        assert(left.fold((a) => 0, (b) => 1) === 0);
    });
    it('#swap', () => {
        assert(right.swap().isLeft);
        assert(right.swap().left().get() === 1);
        assert(left.swap().isRight);
        assert(left.swap().right().get() === 1);
    });
    it('#get', () => {
        assert(right.right().get() === 1);
        assert(left.left().get() === 1);
    });
    it('#getOrElse', () => {
        assert(right.getOrElse(() => 0) === 1);
        assert(right.right().getOrElse(() => 0) === 1);
        assert(right.left().getOrElse(() => 0) === 0);
        assert(left.getOrElse(() => 0) === 0);
        assert(left.left().getOrElse(() => 0) === 1);
        assert(left.right().getOrElse(() => 0) === 0);
    });
    it('#forall', () => {
        assert(right.forall(x => x === 1));
        assert(right.forall(x => x === 2) === false);
        assert(right.right().forall((x) => x === 1));
        assert(right.right().forall((x) => x === 2) === false);
        assert(right.left().forall((x) => x === 1));
        assert(left.forall(x => x === 1));
        assert(left.forall(x => x === 2));
        assert(left.left().forall((x) => x === 1));
        assert(left.left().forall((x) => x === 2) === false);
        assert(left.right().forall((x) => x === 1));
    });
    it('#exists', () => {
        assert(right.exists(x => x === 1));
        assert(right.exists(x => x === 2) === false);
        assert(right.right().exists((x) => x === 1));
        assert(right.right().exists((x) => x === 2) === false);
        assert(right.left().exists((x) => x === 1) === false);
        assert(left.exists(x => x === 1) === false);
        assert(left.exists(x => x === 2) === false);
        assert(left.left().exists((x) => x === 1));
        assert(left.left().exists((x) => x === 2) === false);
        assert(left.right().exists((x) => x === 1) === false);
    });
    it('#filter', () => {
        assert(right.right().filter((x) => x === 1).nonEmpty);
        assert(right.right().filter((x) => x === 2).isEmpty);
        assert(right.left().filter((x) => x === 1).isEmpty);
        assert(left.left().filter((x) => x === 1).nonEmpty);
        assert(left.left().filter((x) => x === 2).isEmpty);
        assert(left.right().filter((x) => x === 1).isEmpty);
    });
    it('#map', () => {
        assert(right.map(x => x + 1).getOrElse(() => 0) === 2);
        assert(right.right().map(x => x + 1).right().getOrElse(() => 0) === 2);
        assert(right.left().map(x => x + 1).right().getOrElse(() => 0) === 1);
        assert(left.map(x => x + 1).getOrElse(() => 0) === 0);
        assert(left.left().map(x => x + 1).left().getOrElse(() => 0) === 2);
        assert(left.right().map(x => x + 1).left().getOrElse(() => 0) === 1);
    });
    it('#flatMap', () => {
        assert(right.flatMap(x => Right<number, number>(x + 1)).isRight);
        assert(right.right().flatMap(x => Right<number, number>(x + 1)).isRight);
        assert(right.left().flatMap(x => Right<number, number>(x + 1)).isRight);
        assert(right.right().flatMap(x => Left<number, number>(x + 1)).isLeft);
        assert(left.flatMap(x => Right<number, number>(x + 1)).isLeft);
        assert(left.left().flatMap(x => Left<number, number>(x + 1)).isLeft);
        assert(left.right().flatMap(x => Left<number, number>(x + 1)).isLeft);
        assert(left.left().flatMap(x => Right<number, number>(x + 1)).isRight);
    });
    it('#toOptional', () => {
        assert(right.toOptional().get() === 1);
        assert(right.right().toOptional().get() === 1);
        assert(right.left().toOptional().isEmpty);
        assert(left.toOptional().isEmpty);
        assert(left.left().toOptional().get() === 1);
        assert(left.right().toOptional().isEmpty);
    });
    it('#chain', () => {
        const rightBis = Right(1);

        assert.equal(right.chain(rightBis).run((a, b) => a + b).getOrElse(() => 0), 2);
        assert.equal(right.chain(rightBis).chain(rightBis).run((a, b, c) => a + b + c).getOrElse(() => 0), 3);
        assert.equal(right.chain(rightBis).chain(rightBis).chain(rightBis).run((a, b, c, d) => a + b + c + d).getOrElse(() => 0), 4);
        assert.equal(right.chain(rightBis).chain(rightBis).chain(rightBis).chain(rightBis).run((a, b, c, d, e) => a + b + c + d + e).getOrElse(() => 0), 5);
        assert.equal(right.chain(rightBis).chain(rightBis).chain(rightBis).chain(rightBis).chain(rightBis).run((a, b, c, d, e, f) => a + b + c + d + e + f).getOrElse(() => 0), 6);
        assert(right.chain(left).run((a, b) => a + b).isLeft);
        assert(right.chain(rightBis).chain(left).run((a, b, c) => a + b + c).isLeft);
        assert(right.chain(rightBis).chain(rightBis).chain(left).run((a, b, c, d) => a + b + c + d).isLeft);
        assert(right.chain(rightBis).chain(rightBis).chain(rightBis).chain(left).run((a, b, c, d, e) => a + b + c + d + e).isLeft);
        assert(right.chain(rightBis).chain(rightBis).chain(rightBis).chain(rightBis).chain(left).run((a, b, c, d, e, f) => a + b + c + d + e + f).isLeft);
    });
});