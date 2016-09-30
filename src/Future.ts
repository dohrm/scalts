/* tslint:disable:no-use-before-declare */

import {Try, Success, Failure} from './Try';
import {Optional, Some, None} from './Optional';


// TODO review this code to use PartialFunction and other ...

/**
 * A `Future` represents a value which may or may not *currently* be available,
 * but will be available at some point, or an exception if that value could not be made available.
 */
export interface Future<A> {
    readonly promise: Promise<A>;
    /**
     * When this future is completed, either through an exception, or a value,
     * apply the provided function.
     *
     * If the future has already been completed,
     * this will either be applied immediately or be scheduled asynchronously.
     *
     * Note that the returned value of `f` will be discarded.
     */
    onComplete<B>(f: (t: Try<A>) => B): void;
    /**
     * Returns whether the future had already been completed with
     * a value or an exception.
     *
     * $nonDeterministic
     */
    isCompleted(): boolean;
    /**
     * The current value of this `Future`.
     *
     * $nonDeterministic
     *
     * If the future was not completed the returned value will be `None`.
     * If the future was completed the value will be `Some(Success(t))`
     * if it contained a valid result, or `Some(Failure(error))` if it contained
     * an exception.
     */
    value(): Optional<Try<A>>;
    /**
     * The returned `Future` will be successfully completed with the `Error` of the original `Future`
     * if the original `Future` fails.
     *
     * If the original `Future` is successful, the returned `Future` is failed with a `NoSuchElementException`.
     */
    failed(): Future<Error>;
    /**
     * Asynchronously processes the value in the future once the value becomes available.
     *
     * WARNING: Will not be called if this future is never completed or if it is completed with a failure.
     *
     * $swallowsExceptions
     */
    foreach<B>(f: (a: A) => B): void;
    /**
     * Creates a new Future by applying the specified function to the result
     * of this Future. If there is any non-fatal exception thrown when 'f'
     * is applied then that exception will be propagated to the resulting future.
     */
    transform<B>(f: (t: Try<A>) => Try<B>): Future<B>;
    /**
     * Creates a new future by applying the 's' function to the successful result of
     * this future, or the 'f' function to the failed result. If there is any non-fatal
     * exception thrown when 's' or 'f' is applied, that exception will be propagated
     * to the resulting future.
     */
    transform1<B>(s: (a: A) => B, f: (e: Error) => Error): Future<B>;
    /**
     * Creates a new Future by applying the specified function, which produces a Future, to the result
     * of this Future. If there is any non-fatal exception thrown when 'f'
     * is applied then that exception will be propagated to the resulting future.
     */
    transformWith<B>(f: (t: Try<A>) => Future<B>): Future<B>;
    /**
     * Creates a new future by applying a function to the successful result of
     * this future. If this future is completed with an exception then the new
     * future will also contain this exception.
     */
    map<B>(f: (a: A) => B): Future<B>;
    /**
     * Creates a new future by applying a function to the successful result of
     * this future, and returns the result of the function as the new future.
     * If this future is completed with an exception then the new future will
     * also contain this exception.
     */
    flatMap<B>(f: (a: A) => Future<B>): Future<B>;
    /**
     * Creates a new future by filtering the value of the current future with a predicate.
     *
     * If the current future contains a value which satisfies the predicate, the new future will also hold that value.
     * Otherwise, the resulting future will fail with a `NoSuchElementException`.
     *
     * If the current future fails, then the resulting future also fails.
     */
    filter(f: (a: A) => boolean): Future<A>;
    /**
     * Creates a new future that will handle any matching Error that this
     * future might contain. If there is no match, or if this future contains
     * a valid result then the new future will contain the same.
     * @param f
     */
    recover<B extends A>(f: (e: Error) => Optional<B>): Future<A>;
    /**
     * Creates a new future that will handle any matching throwable that this
     * future might contain by assigning it a value of another future.
     *
     * If there is no match, or if this future contains
     * a valid result then the new future will contain the same result.
     * @param f
     */
    recoverWith<B extends A>(f: (e: Error) => Optional<Future<B>>): Future<A>;
    /**
     * Zips the values of `this` and `that` future, and creates
     * a new future holding the tuple of their results.
     *
     * If `this` future fails, the resulting future is failed
     * with the throwable stored in `this`.
     * Otherwise, if `that` future fails, the resulting future is failed
     * with the throwable stored in `that`.
     */
    zip<B>(fu: Future<B>): Future<[A, B]>;
    /**
     * Zips the values of `this` and `that` future using a function `f`,
     * and creates a new future holding the result.
     *
     * If `this` future fails, the resulting future is failed
     * with the throwable stored in `this`.
     * Otherwise, if `that` future fails, the resulting future is failed
     * with the throwable stored in `that`.
     * If the application of `f` throws a throwable, the resulting future
     * is failed with that throwable if it is non-fatal.
     * @param f
     */
    zipWith<B, C>(fu: Future<B>, f: (a: A, b: B) => C): Future<C>;
    /**
     * Creates a new future which holds the result of this future if it was completed successfully, or, if not,
     * the result of the `that` future if `that` is completed successfully.
     * If both futures are failed, the resulting future holds the throwable object of the first future.
     *
     * Using this method will not cause concurrent programs to become nondeterministic.
     */
    fallbackTo<B extends A>(fu: Future<B>): Future<A>;
    /**
     * Applies the side-effecting function to the result of this future, and returns
     * a new future with the result of this future.
     *
     * This method allows one to enforce that the callbacks are executed in a
     * specified order.
     *
     * Note that if one of the chained `andThen` callbacks throws
     * an exception, that exception is not propagated to the subsequent `andThen`
     * callbacks. Instead, the subsequent `andThen` callbacks are given the original
     * value of this future.
     */
    andThen<B>(f: (t: Try<A>) => B): Future<A>;


    // add methods
    apply1<B, C>(ob: Future<B>, f: (a: A, b: B) => C): Future<C>;
    apply2<B, C, D>(ob: Future<B>, oc: Future<C>, f: (a: A, b: B, c: C) => D): Future<D>;
    chain<B>(ob: Future<B>): FutureBuilder1<A, B>;
}

export function Future<A>(f: Promise<A> | (() => A)): Future<A> {
    if (f instanceof Promise) {
        return new FutureImpl(f);
    } else {
        return new FutureImpl<A>(
            new Promise((resolve, reject) => {
                Try(<() => A>f).fold(e => reject(e), a => resolve(a));
            })
        );
    }
}

export namespace Future {
    export function fromPromise<A>(p: Promise<A>): Future<A> {
        return new FutureImpl(p);
    }

    export function unit(): Future<void> {
        return new FutureImpl(Promise.resolve<void>(undefined), Success<void>(undefined));
    }

    export function failed<A>(e: Error): Future<A> {
        return new FutureImpl<A>(<Promise<A>>Promise.reject(e), Failure<A>(e));
    }

    export function successful<A>(a: A): Future<A> {
        return new FutureImpl(Promise.resolve(a), Success(a));
    }

    export function fromTry<A>(t: Try<A>): Future<A> {
        return t.fold((e) => this.failed(e), (a) => this.successful(a));
    }

    export function sequence<A>(fus: Array<Future<A>>): Future<Array<A>> {
        return new FutureImpl(Promise.all(fus.map(a => a.promise)));
    }

    export function firstCompletedOf<A>(fus: Array<Future<A>>): Future<A> {
        return new FutureImpl(Promise.race(fus.map(a => a.promise)));
    }

    export function find<A>(fus: Array<Future<A>>, f: (a: A) => boolean): Future<Optional<A>> {
        let searchRecursive = (fr: Array<Future<A>>): Future<Optional<A>> => {
            if (fr.length === 0) {
                return Future.successful<Optional<A>>(None);
            }
            const [fh, ...ft] = fr;
            return fh.transformWith(t =>
                t.fold(
                    e => searchRecursive(ft),
                    a => f(a) ? Future.successful(Optional.apply(a)) : searchRecursive(ft))
            );
        };
        return searchRecursive(fus);
    }

    export function foldLeft<A, B>(fu: Array<Future<A>>, zero: B, f: (b: B, a: A) => B): Future<B> {
        let recursive = (fr: Array<Future<A>>, acc: B): Future<B> => {
            if (fr.length === 0) {
                return Future.successful(acc);
            }
            const [fh, ...ft] = fr;
            return fh.flatMap(a => recursive(ft, f(acc, a)));
        };
        return recursive(fu, zero);
    }

    export function traverse<A, B>(fu: Array<A>, f: (a: A) => Future<B>): Future<Array<B>> {
        const fzero = Future.successful<Array<B>>([]);
        if (fu.length === 0) {
            return fzero;
        }
        return fu.reduce<Future<Array<B>>>((fbs, a) =>
                fbs.zipWith(f(a), (bs, fa) => {
                    bs.push(fa);
                    return bs;
                }),
            fzero);
    }
}

class FutureImpl<A> implements Future<A> {
    private completeValue: Optional<Try<A>> = None;

    constructor(private _promise: Promise<A>, already?: Try<A>) {
        if (already) {
            this.completeValue = Some(already);
        } else {
            _promise.then(
                a => this.completeValue = Some(Success(a)),
                e => this.completeValue = Some(Failure<A>(e))
            );
        }
    }

    get promise(): Promise<A> {
        return this._promise;
    }

    onComplete<B>(f: (t: Try<A>) => B): void {
        this.promise.then(a => f(Success(a)), e => f(Failure<A>(e)));
    }

    isCompleted(): boolean {
        return this.completeValue.nonEmpty;
    }

    value(): Optional<Try<A>> {
        return this.completeValue;
    }

    failed(): Future<Error> {
        return this.transform(t =>
            t.fold(
                e => Success(e),
                a => Failure<Error>(new Error('Future.failed not completed with a throwable.'))
            )
        );
    }

    foreach<B>(f: (a: A) => B): void {
        this.onComplete(t => t.foreach(f));
    }

    tryPromise<B>(f: () => Promise<B>): Promise<B> {
        try {
            return f();
        } catch (e) {
            return <Promise<B>>Promise.reject(e);
        }
    }

    transform<B>(f: (t: Try<A>) => Try<B>): Future<B> {
        return new FutureImpl(
            this.promise.then<B>(
                a => this.tryPromise(() => f(Success(a)).fold((e) => <Promise<B>>Promise.reject(e), (b) => Promise.resolve(b))),
                e => this.tryPromise(() => f(Failure<A>(e)).fold((e) => <Promise<B>>Promise.reject(e), (b) => Promise.resolve(b)))
            )
        );
    }

    transform1<B>(fs: (a: A) => B, ff: (e: Error) => Error): Future<B> {
        return this.transform<B>(t =>
            t.fold(
                e => {
                    try {
                        return Failure<B>(ff(e));
                    } catch (e) {
                        return Failure<B>(e);
                    }
                },
                a => Try(() => fs(a))
            )
        );
    }

    transformWith<B>(f: (t: Try<A>) => Future<B>): Future<B> {
        return new FutureImpl(
            this.promise.then<B>(
                a => this.tryPromise(() => f(Success(a)).promise),
                e => this.tryPromise(() => f(Failure<A>(e)).promise)
            )
        );
    }

    map<B>(f: (a: A) => B): Future<B> {
        return this.transform(t => t.map(f));
    }

    flatMap<B>(f: (a: A) => Future<B>): Future<B> {
        return this.transformWith(t => t.fold(e => Future.failed<B>(e), a => f(a)));
    }

    filter(f: (a: A) => boolean): Future<A> {
        return this.map(a => {
            if (f(a)) {
                return a;
            } else {
                throw new Error('Future.filter predicate is not satisfied');
            }
        });
    }

    recover<B extends A>(f: (e: Error) => Optional<B>): Future<A> {
        return this.transform(t => t.recover(f));
    }

    recoverWith<B extends A>(f: (e: Error) => Optional<Future<B>>): Future<A> {
        return this.transformWith(t =>
            t.fold(
                e => f(e).fold(Future.failed<B>(e), a => a),
                a => Future.successful(a)
            )
        );
    }

    zip<B>(fu: Future<B>): Future<[A, B]> {
        return this.flatMap(a => fu.map<[A, B]>(b => [a, b]));
    }

    zipWith<B, C>(fu: Future<B>, f: (a: A, b: B) => C): Future<C> {
        return this.flatMap(a => fu.map(b => f(a, b)));
    }

    fallbackTo<B extends A>(fu: Future<B>): Future<A> {
        return this.recoverWith(e => Some(fu)).recoverWith(e => Some(this));
    }

    andThen<B>(f: (t: Try<A>) => B): Future<A> {
        return this.transform(t => {
            try {
                f(t);
            } catch (e) {
                if (typeof console !== 'undefined') {
                    console.error(e);
                }
            }
            return t;
        });
    }

    apply1<B, C>(ob: Future<B>, f: (a: A, b: B) => C): Future<C> {
        return this.zipWith(ob, f);
    }

    apply2<B, C, D>(ob: Future<B>, oc: Future<C>, f: (a: A, b: B, c: C) => D): Future<D> {
        return this.flatMap(a => ob.flatMap(b => oc.map(c => f(a, b, c))));
    }

    chain<B>(ob: Future<B>): FutureBuilder1<A, B> {
        return new FutureBuilder1(this, ob);
    }
}

/**
 * FutureBuilder.
 */
export class FutureBuilder1<A, B> {
    constructor(private oa: Future<A>, private ob: Future<B>) {
    }

    run<C>(f: (a: A, b: B) => C): Future<C> {
        return this.oa.flatMap(a => this.ob.map(b => f(a, b)));
    }

    chain<C>(oc: Future<C>): FutureBuilder2<A, B, C> {
        return new FutureBuilder2(this.oa, this.ob, oc);
    }
}

export class FutureBuilder2<A, B, C> {
    constructor(private oa: Future<A>, private ob: Future<B>, private oc: Future<C>) {
    }

    run<D>(f: (a: A, b: B, c: C) => D): Future<D> {
        return this.oa.flatMap(a => this.ob.flatMap(b => this.oc.map(c => f(a, b, c))));
    }

    chain<D>(od: Future<D>): FutureBuilder3<A, B, C, D> {
        return new FutureBuilder3(this.oa, this.ob, this.oc, od);
    }
}

export class FutureBuilder3<A, B, C, D> {
    constructor(private oa: Future<A>, private ob: Future<B>, private oc: Future<C>, private od: Future<D>) {
    }

    run<E>(f: (a: A, b: B, c: C, d: D) => E): Future<E> {
        return this.oa.flatMap(a => this.ob.flatMap(b => this.oc.flatMap(c =>
            this.od.map(d => f(a, b, c, d)))));
    }

    chain<E>(oe: Future<E>): FutureBuilder4<A, B, C, D, E> {
        return new FutureBuilder4(this.oa, this.ob, this.oc, this.od, oe);
    }
}

export class FutureBuilder4<A, B, C, D, E> {
    constructor(private oa: Future<A>, private ob: Future<B>, private oc: Future<C>,
                private od: Future<D>, private oe: Future<E>) {
    }

    run<F>(f: (a: A, b: B, c: C, d: D, e: E) => F): Future<F> {
        return this.oa.flatMap(a => this.ob.flatMap(b => this.oc.flatMap(c => this.od.flatMap(d =>
            this.oe.map(e => f(a, b, c, d, e))))));
    }

    chain<F>(of: Future<F>): FutureBuilder5<A, B, C, D, E, F> {
        return new FutureBuilder5(this.oa, this.ob, this.oc, this.od, this.oe, of);
    }
}

export class FutureBuilder5<A, B, C, D, E, F> {
    constructor(private oa: Future<A>, private ob: Future<B>, private oc: Future<C>,
                private od: Future<D>, private oe: Future<E>, private of: Future<F>) {
    }

    run<G>(f: (a: A, b: B, c: C, d: D, e: E, f: F) => G): Future<G> {
        return this.oa.flatMap(a => this.ob.flatMap(b => this.oc.flatMap(c => this.od.flatMap(d => this.oe.flatMap(e =>
            this.of.map(ff => f(a, b, c, d, e, ff)))))));
    }
}