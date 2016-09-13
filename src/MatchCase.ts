/* tslint:disable:no-use-before-declare */

/**
 * No Case Found error message
 */
export const NoCaseFound: string = 'no-case-found';

/**
 * Match statement
 * {{
 * Match( obj,
 *  Case( c => c === 'something', c => `c.toto`), ...
 * );
 * }}
 * @param a object to test
 * @param cases sets of cases to check.
 * @returns {B}
 * @throws 'no-case-found error' in case of no items match with cases.
 */
export function Match<A, B>(a: A, ...cases: Case<A, B>[]): B {
    const item = cases.find(c => c.test(a));
    if (!item) {
        throw new Error(NoCaseFound);
    }
    return item.exec(a);
}


/**
 * Case statement.
 * @param test to check if the item is usable.
 * @param exec transform.
 */
export type Case<A, B> = {
    test: (o: A) => boolean;
    exec: (o: A) => B;
}

export function Case<A, B>(test: (o: A) => boolean, exec: (o: A) => B): Case<A, B> {
    return {test, exec};
}