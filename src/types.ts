/* tslint:disable:no-use-before-declare */

export type Supplier< A > = () => A;
export type Predicate< A > = ( a: A ) => boolean;
export type Mapper< A, B > = ( a: A ) => B;
export type Func< A > = ( a: A ) => void;