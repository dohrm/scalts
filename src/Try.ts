/* tslint:disable:no-use-before-declare */

import {Optional, Some, None} from './Optional'
import {Either, Left, Right} from './Either'

/**
 * The `Try` type represents a computation that may either result in an exception, or return a
 * successfully computed value. It's similar to, but semantically different from the Either type.
 *
 * Instances of `Try<T>`, are either an instance of Success<T> or Failure<T>.
 *
 * For example, `Try` can be used to perform division on a user-defined input, without the need to do explicit
 * exception-handling in all of the places that an exception might occur.
 *
 * An important property of `Try` shown in the above example is its ability to ''pipeline'', or chain, operations,
 * catching exceptions along the way. The `flatMap` and `map` combinators in the above example each essentially
 * pass off either their successfully completed value, wrapped in the `Success` type for it to be further operated
 * upon by the next combinator in the chain, or the exception wrapped in the `Failure` type usually to be simply
 * passed on down the chain. Combinators such as `recover` and `recoverWith` are designed to provide some type of
 * default behavior in the case of failure.
 */
export interface Try<A> {
    /**
     * Returns `true` if the `Try` is a `Success`, `false` otherwise.
     */
    isSuccess: boolean;
    /**
     * Returns `true` if the `Try` is a `Failure`, `false` otherwise.
     */
    isFailure: boolean;
    /**
     * Returns the value from this `Success` or throws the exception if this is a `Failure`.
     */
    get(): A;
    /**
     * Returns the error from this `Failure` or throws the exception if this is a `Success`.
     */
    getError(): Error;
    /**
     * Applies `fe` if this is a `Failure` or `ff` if this is a `Success`.
     * If `fe` is initially applied and throws an exception,
     * then `ff` is applied with this exception.
     * @param fe the function to apply if this is a `Failure`
     * @param ff the function to apply if this is a `Success`
     */
    fold<B>(fe: (e: Error) => B, ff: (a: A) => B): B;
    /**
     * Returns the value from this `Success` or the given `default` argument if this is a `Failure`.
     *
     * ''Note:'': This will throw an exception if it is not a success and default throws an exception.
     */
    getOrElse<B extends A>(a: () => B): A;
    /**
     * Returns this `Try` if it's a `Success` or the given `default` argument if this is a `Failure`.
     */
    orElse<B extends A>(a: Try<B>): Try<A>;
    /**
     * Applies the given function `f` if this is a `Success`, otherwise returns `Unit` if this is a `Failure`.
     *
     * ''Note:'' If `f` throws, then this method may throw an exception.
     */
    foreach<B>(f: (a: A) => void): void;
    /**
     * Returns the given function applied to the value from this `Success` or returns this if this is a `Failure`.
     */
    flatMap<B>(f: (a: A) => Try<B>): Try<B>;
    /**
     * Maps the given function to the value from this `Success` or returns this if this is a `Failure`.
     */
    map<B>(f: (a: A) => B): Try<B>;
    /**
     * Converts this to a `Failure` if the predicate is not satisfied
     */
    filter(f: (a: A) => boolean): Try<A>;
    /**
     * Inverts this `Try`. If this is a `Failure`, returns its exception wrapped in a `Success`.
     * If this is a `Success`, returns a `Failure` containing an `UnsupportedOperationException`.
     */
    failed(): Try<A>;
    /**
     * Completes this `Try` by applying the function `f` to this if this is of type `Failure`, or conversely, by applying
     * `s` if this is a `Success`.
     */
    transform<B>(fs: (a: A) => Try<B>, ff: (e: Error) => Try<B>): Try<B>;
    /**
     * Applies the given function `f` if this is a `Failure`, otherwise returns this if this is a `Success`.
     * This is like map for the exception.
     */
    recover<B extends A>(f: (e: Error) => Optional<B>): Try<A>;
    /**
     * Applies the given function `f` if this is a `Failure`, otherwise returns this if this is a `Success`.
     * This is like `flatMap` for the exception.
     */
    recoverWith<B extends A>(f: (e: Error) => Optional<Try<B>>): Try<A>;
    /**
     * Returns `None` if this is a `Failure` or a `Some` containing the value if this is a `Success`.
     */
    toOptional(): Optional<A>;
    toEither(): Either<Error, A>;

    apply1<B, C>(ob: Try<B>, f: (a: A, b: B) => C): Try<C>;
    apply2<B, C, D>(ob: Try<B>, oc: Try<C>, f: (a: A, b: B, c: C) => D): Try<D>;
    apply3<B, C, D, E>(ob: Try<B>, oc: Try<C>, od: Try<D>, f: (a: A, b: B, c: C, d: D) => E): Try<E>;
    apply4<B, C, D, E, F>(ob: Try<B>, oc: Try<C>, od: Try<D>, oe: Try<E>, f: (a: A, b: B, c: C, d: D, e: E) => F): Try<F>;
    apply5<B, C, D, E, F, G>(ob: Try<B>, oc: Try<C>, od: Try<D>, oe: Try<E>, of: Try<F>, f: (a: A, b: B, c: C, d: D, e: E, f: F) => G): Try<G>;
    chain<B>(ob: Try<B>): TryBuilder1<A, B>;
}

export function Try<A>(f: () => A): Try<A> {
    try {
        return Success(f());
    } catch (e) {
        return Failure<A>(e);
    }
}

export function Success<A>(a: A): Try<A> {
    return new SuccessImpl(a);
}

export function Failure<A>(e: Error): Try<A> {
    return new FailureImpl<A>(e);
}

//------------------------------------
//
// Implementation section.
//
//------------------------------------

abstract class TryImpl<A> implements Try<A> {
    isSuccess: boolean;
    isFailure: boolean;

    toString(): string {
        return this.isSuccess ? `Success(${this.get()}})` : `Failure(${this.getError()}})`;
    }

    get(): A {
        throw 'impl child';
    }

    getError(): Error {
        throw 'impl child';
    }

    flatMap<B>(f: (a: A) => Try<B>): Try<B> {
        throw 'impl child';
    }

    map<B>(f: (a: A) => B): Try<B> {
        throw 'impl child';
    }

    filter(f: (a: A) => boolean): Try<A> {
        throw 'impl child';
    }

    toOptional(): Optional<A> {
        return this.isSuccess ? Some(this.get()) : None;
    }

    toEither(): Either<Error, A> {
        return this.isSuccess ? Right<Error, A>(this.get()) : Left<Error, A>(this.getError());
    }

    failed(): Try<A> {
        throw 'impl child';
    }

    recover<B>(f: (e: Error) => Optional<B>): Try<B> {
        throw 'impl child';
    }

    recoverWith<B>(f: (e: Error) => Optional<Try<B>>): Try<B> {
        throw 'impl child';
    }

    fold<B>(fe: (e: Error) => B, ff: (a: A) => B): B {
        return this.isFailure ? fe(this.getError()) : ff(this.get());
    }

    getOrElse<B extends A>(a: () => B): A {
        return this.isFailure ? a() : this.get();
    }

    orElse<B extends A>(a: Try<B>): Try<A> {
        return this.isFailure ? a : <Try<A>>this;
    }

    foreach<B>(f: (a: A) => void): void {
        if (this.isSuccess) {
            f(this.get());
        }
    }

    transform<B>(fs: (a: A) => Try<B>, ff: (e: Error) => Try<B>): Try<B> {
        try {
            return this.isSuccess ? fs(this.get()) : ff(this.getError());
        } catch (e) {
            return Failure<B>(e);
        }
    }

    /** @override */
    apply1<B, C>(ob: Try<B>, f: (a: A, b: B) => C): Try<C> {
        return this.flatMap(a => ob.map(b => f(a, b)));
    }

    /** @override */
    apply2<B, C, D>(ob: Try<B>, oc: Try<C>, f: (a: A, b: B, c: C) => D): Try<D> {
        return this.flatMap(a => ob.flatMap(b => oc.map(c => f(a, b, c))));
    }

    /** @override */
    apply3<B, C, D, E>(ob: Try<B>, oc: Try<C>, od: Try<D>, f: (a: A, b: B, c: C, d: D) => E): Try<E> {
        return this.flatMap(a => ob.flatMap(b => oc.flatMap(c => od.map(d => f(a, b, c, d)))));
    }

    /** @override */
    apply4<B, C, D, E, F>(ob: Try<B>, oc: Try<C>, od: Try<D>, oe: Try<E>, f: (a: A, b: B, c: C, d: D, e: E) => F): Try<F> {
        return this.flatMap(a => ob.flatMap(b => oc.flatMap(c => od.flatMap(d => oe.map(e => f(a, b, c, d, e))))));
    }

    /** @override */
    apply5<B, C, D, E, F, G>(ob: Try<B>, oc: Try<C>, od: Try<D>, oe: Try<E>, of: Try<F>, f: (a: A, b: B, c: C, d: D, e: E, f: F) => G): Try<G> {
        return this.flatMap(a => ob.flatMap(b => oc.flatMap(c => od.flatMap(d => oe.flatMap(e => of.map(ff => f(a, b, c, d, e, ff)))))));
    }

    /** @override */
    chain<B>(ob: Try<B>): TryBuilder1<A, B> {
        return new TryBuilder1(this, ob);
    }
}

class SuccessImpl<A> extends TryImpl<A> {
    isSuccess: boolean = true;
    isFailure: boolean = false;

    constructor(private value: A) {
        super();
    }

    get(): A {
        return this.value;
    }

    getError(): Error {
        throw 'Success has not Error';
    }

    flatMap<B>(f: (a: A) => Try<B>): Try<B> {
        try {
            return f(this.value);
        } catch (e) {
            return Failure<B>(e);
        }
    }

    map<B>(f: (a: A) => B): Try<B> {
        return Try(() => f(this.value));
    }

    filter(f: (a: A) => boolean): Try<A> {
        try {
            return f(this.value) ? this : Failure<A>(new Error('Predicate does not hold for ' + this.value));
        } catch (e) {
            return Failure<A>(e);
        }
    }

    failed(): Try<A> {
        return Failure<A>(new Error('Success.failed'));
    }

    recover<B extends A>(f: (e: Error) => Optional<B>): Try<A> {
        return Success(this.value);
    }

    recoverWith<B extends A>(f: (e: Error) => Optional<Try<B>>): Try<A> {
        return Success(this.value);
    }
}

class FailureImpl<A> extends TryImpl<A> {
    isSuccess: boolean = false;
    isFailure: boolean = true;

    constructor(private e: Error) {
        super();
    }

    get(): any {
        throw this.e;
    }

    getError(): Error {
        return this.e;
    }

    flatMap<B>(f: (a: A) => Try<B>): Try<B> {
        return Failure<B>(this.e);
    }

    map<B>(f: (a: A) => B): Try<B> {
        return new FailureImpl<B>(this.e);
    }

    filter(f: (a: A) => boolean): Try<A> {
        return this;
    }

    failed(): Try<A> {
        return <Try<A>>this;
    }

    recover<B extends A>(f: (e: Error) => Optional<B>): Try<A> {
        try {
            const op = f(this.e);
            return op.nonEmpty ? Success(op.get()) : Failure<B>(this.e);
        } catch (e) {
            return Failure<B>(e);
        }
    }

    recoverWith<B extends A>(f: (e: Error) => Optional<Try<B>>): Try<A> {
        try {
            const op = f(this.e);
            return op.nonEmpty ? op.get() : Failure<B>(this.e);
        } catch (e) {
            return Failure<B>(e);
        }
    }
}

// Builders

export class TryBuilder1<A, B> {
    constructor(private oa: Try<A>,
                private ob: Try<B>) {
    }

    run<C>(f: (a: A, b: B) => C): Try<C> {
        return this.oa.apply1(this.ob, f);
    }

    chain<C>(oc: Try<C>): TryBuilder2<A, B, C> {
        return new TryBuilder2(this.oa, this.ob, oc);
    }
}

export class TryBuilder2<A, B, C> {
    constructor(private oa: Try<A>,
                private ob: Try<B>,
                private oc: Try<C>) {
    }

    run<D>(f: (a: A, b: B, c: C) => D): Try<D> {
        return this.oa.apply2(this.ob, this.oc, f);
    }

    chain<D>(od: Try<D>): TryBuilder3<A, B, C, D> {
        return new TryBuilder3(this.oa, this.ob, this.oc, od);
    }
}

export class TryBuilder3<A, B, C, D> {
    constructor(private oa: Try<A>, private ob: Try<B>, private oc: Try<C>, private od: Try<D>) {
    }

    run<E>(f: (a: A, b: B, c: C, d: D) => E): Try<E> {
        return this.oa.apply3(this.ob, this.oc, this.od, f);
    }

    chain<E>(oe: Try<E>): TryBuilder4<A, B, C, D, E> {
        return new TryBuilder4(this.oa, this.ob, this.oc, this.od, oe);
    }
}

export class TryBuilder4<A, B, C, D, E> {
    constructor(private oa: Try<A>,
                private ob: Try<B>,
                private oc: Try<C>,
                private od: Try<D>,
                private oe: Try<E>) {
    }

    run<F>(f: (a: A, b: B, c: C, d: D, e: E) => F): Try<F> {
        return this.oa.apply4(this.ob, this.oc, this.od, this.oe, f);
    }

    chain<F>(of: Try<F>): TryBuilder5<A, B, C, D, E, F> {
        return new TryBuilder5(this.oa, this.ob, this.oc, this.od, this.oe, of);
    }
}

export class TryBuilder5<A, B, C, D, E, F> {
    constructor(private oa: Try<A>,
                private ob: Try<B>,
                private oc: Try<C>,
                private od: Try<D>,
                private oe: Try<E>,
                private of: Try<F>) {
    }

    run<G>(f: (a: A, b: B, c: C, d: D, e: E, f: F) => G): Try<G> {
        return this.oa.apply5(this.ob, this.oc, this.od, this.oe, this.of, f);
    }
}

