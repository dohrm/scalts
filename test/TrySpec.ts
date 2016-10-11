import * as assert from 'power-assert';
import {Try, Success, Failure} from '../src/Try';
import {Some} from '../src/Optional';

describe('Try', () => {
    const err:() => number = () => { throw 'err' };
    const f:() => number = () => 1;

    it('#Success', () => {
        assert(Success(1).isSuccess);
        assert(Success(1).isFailure === false);
    });
    it('#Failure', () => {
        assert(Failure(new Error).isFailure);
        assert(Failure(new Error).isSuccess === false);
    });

    it('#isFailure', () => {
        assert(Try(err).isFailure);
        assert(Try(f).isFailure === false);
    });
    it('#isSuccess', () => {
        assert(Try(err).isSuccess === false);
        assert(Try(f).isSuccess)
    });
    it('#get', () => {
        assert(Try(f).get() === 1);
        try {
            Try(err).get();
            assert(false)
        } catch(e) {
            assert(true)
        }
    });
    it('#fold', () => {
        assert(Try(f).fold((e) => 0, (a) => a) === 1);
        assert(Try(err).fold((e) => 0, (a) => a) === 0);
    });
    it('#getOrElse', () => {
        assert(Try(f).getOrElse(() => 0) === 1);
        assert(Try(err).getOrElse(() => 0) === 0);
    });
    it('#orElse', () => {
        assert(Try(err).orElse(Try(f)).get() === 1);
        assert(Try(f).orElse(Try(err)).get() === 1);
        assert(Try(err).orElse(Try(err)).isFailure)
    });
    it('#foreach', () => {
        Try(err).foreach((a) => assert(false));
        Try(f).foreach((a) => assert(true));
    });
    it('#flatMap', () => {
        assert(Try(f).flatMap((a) => Success(a + 1)).get() === 2);
        assert(Try(err).flatMap((a) => Success(a + 1)).isFailure);
    });
    it('#map', () => {
        assert(Try(f).map((a) => a + 1).get() === 2);
        assert(Try(err).map((a) => a + 1).isFailure);
    });
    it('#filter', () => {
        assert(Try(f).filter((a) => a === 1).isSuccess);
        assert(Try(f).filter((a) => a === 0).isFailure);
        assert(Try(err).filter((a) => a === 1).isFailure);
    });
    it('#toOptional', () => {
        assert(Try(f).toOptional().nonEmpty);
        assert(Try(err).toOptional().isEmpty);
    });
    it('#toEither', () => {
        assert(Try(f).toEither().isRight);
        assert(Try(err).toEither().isLeft);
    });
    it('#failed', () => {
        assert(Try(f).failed().isFailure);
        assert(Try(err).failed().isFailure);
    });
    it('#transform', () => {
        assert(Try(f).transform((a) => Success(a + 1), (e) => Success(0)).get() === 2);
        assert(Try(err).transform((a) => Success(a + 1), (e) => Success(0)).get() === 0);
    });
    it('#recover', () => {
        assert(Try(f).recover((e) => Some(0)).get() === 1);
        assert(Try(err).recover((e) => Some(0)).get() === 0);
    });
    it('#recoverWith', () => {
        assert(Try(f).recoverWith((e) => Some(Success(0))).get() === 1);
        assert(Try(err).recoverWith((e) => Some(Success(0))).get() === 0);
    });
    it('chain', () => {
        assert.equal(Try(f).chain(Try(f)).run((a, b) => a + b).get(), 2);
        assert.equal(Try(f).chain(Try(f)).chain(Try(f)).run((a, b, c) => a + b + c).get(), 3);
        assert.equal(Try(f).chain(Try(f)).chain(Try(f)).chain(Try(f)).run((a, b, c, d) => a + b + c + d).get(), 4);
        assert.equal(Try(f).chain(Try(f)).chain(Try(f)).chain(Try(f)).chain(Try(f)).run((a, b, c, d, e) => a + b + c + d + e).get(), 5);
        assert.equal(Try(f).chain(Try(f)).chain(Try(f)).chain(Try(f)).chain(Try(f)).chain(Try(f)).run((a, b, c, d, e, f) => a + b + c + d + e + f).get(), 6);

        assert(Try(f).chain(Try(err)).run((a, b) => a + b).isFailure);
        assert(Try(f).chain(Try(f)).chain(Try(err)).run((a, b, c) => a + b + c).isFailure);
        assert(Try(f).chain(Try(f)).chain(Try(f)).chain(Try(err)).run((a, b, c, d) => a + b + c + d).isFailure);
        assert(Try(f).chain(Try(f)).chain(Try(f)).chain(Try(f)).chain(Try(err)).run((a, b, c, d, e) => a + b + c + d + e).isFailure);
        assert(Try(f).chain(Try(f)).chain(Try(f)).chain(Try(f)).chain(Try(f)).chain(Try(err)).run((a, b, c, d, e, f) => a + b + c + d + e + f).isFailure);
    });
});