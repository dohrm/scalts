/* tslint:disable:no-use-before-declare */

import { Predicate, Func, Mapper, Supplier } from './types'
import { Map }                               from './Map'
import { Optional }                          from './Optional'

export interface List< A > {

    /**
     * Applies a function `f` to all elements of this $coll.
     *
     *  @param  f   the function that is applied for its side-effect to every element.
     *              The result of function `f` is discarded.
     *
     *  @tparam  U  the type parameter describing the result of function `f`.
     *              This result will always be ignored. Typically `U` is `Unit`,
     *              but this is not necessary.
     *
     *  @usecase def foreach(f: A => Unit): Unit
     *    @inheritdoc
     *
     *    Note: this method underlies the implementation of most other bulk operations.
     *    It's important to implement this method in an efficient way.
     *
     */
    foreach( f: Func< A > ): void;
    foreach( f: ( item: A, idx: number ) => void ): void;

    /**
     * Tests whether this $coll is empty.
     *
     *  @return    `true` if the $coll contain no elements, `false` otherwise.
     */
    isEmpty(): boolean;


    append( ...items: A[] ): List< A >;
    prepend( ...items: A[] ): List< A >;

    map< B >( f: Mapper< A, B > ): List< B >;
    flatMap< B >( f: Mapper< A, List< B > > ): List< B >;

    filter( f: Predicate< A > ): List< A >;
    filterNot( f: Predicate< A > ): List< A >;

    partition( f: Predicate< A > ): [ List<A>, List<A> ];

    groupBy( f: Mapper< A, string > ): Map< string, A >;

    forall( f: Predicate< A > ): boolean;
    exists( f: Predicate< A > ): boolean;

    find( f: Predicate< A > ): Optional< A >;

    head(): A;
    headOptional(): Optional< A >;
    tail(): List< A >;
}
