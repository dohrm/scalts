/* tslint:disable:no-use-before-declare */

import {Optional} from './Optional'
import {Try} from './Try'
import {Match, Case} from './MatchCase'

/**
 *
 */
export interface PartialFunction<A, B> {
    /**
     * Execute function.
     */
    (arg: A): B;
    /**
     * Checks if a value is contained in the function's domain.
     *
     * @param  x   the value to test
     * @return `'''true'''`, iff `x` is in the domain of this function, `'''false'''` otherwise.
     */
    isDefinedAt(arg: A): boolean;
    /**
     * Composes this partial function with a fallback partial function which
     * gets applied where this partial function is not defined.
     */
    orElse(p: PartialFunction<A, B>): PartialFunction<A, B>;
    /**
     * Composes this partial function with a transformation function that
     * gets applied to results of this partial function.
     */
    andThen<C>(p: PartialFunction<B, C>): PartialFunction<A, C>;
    /**
     * Turns this partial function into a plain function returning an `Optional` result.
     */
    lift(): (arg: A) => Optional<B>;
    /**
     * Applies this partial function to the given argument when it is contained in the function domain.
     * Applies fallback function where this partial function is not defined.
     */
    applyOrElse(arg: A, orElse: (arg: A) => B): B
}

export function PartialFunction<A, B>(...cases: Case<A, B>[]): PartialFunction<A, B> {
    return generate<A, B>(
        arg => Match(arg, ...cases),
        arg => !!cases.find(c => c.test(arg))
    );
}

function orElse<A, B>(a: PartialFunction<A, B>, b: PartialFunction<A, B>): PartialFunction<A, B> {
    return generate<A, B>(
        arg => a.isDefinedAt(arg) ? a(arg) : b(arg),
        arg => a.isDefinedAt(arg) || b.isDefinedAt(arg)
    )
}

function andThen<A, B, C>(a: PartialFunction<A, B>, b: PartialFunction<B, C>): PartialFunction<A, C> {
    let resB: B;
    const f = (arg: A):B => {
        if(!resB) {
            resB = a(arg)
        }
        return resB;
    };
    return generate<A, C>(
        arg => b(f(arg)),
        arg => a.isDefinedAt(arg) && b.isDefinedAt(f(arg))
    )
}

function generate<A, B>(f: (arg: A) => B, find: (arg: A) => boolean): PartialFunction<A, B> {
    const res: any = (arg: A) => f(arg);
    res.isDefinedAt = (arg: A): boolean => find(arg);
    res.orElse = (other: PartialFunction<A, B>): PartialFunction<A, B> => orElse(res, other);
    res.andThen = <C>(other: PartialFunction<B, C>): PartialFunction<A, C> => andThen(res, other);
    res.lift = () => (arg: A): Optional<B> => Try(() => f(arg)).toOptional();
    res.applyOrElse = (arg: A, orElse: (arg: A) => B): B => Try(() => f(arg)).getOrElse(() => orElse(arg));
    return res;
}
