[![Build Status](https://travis-ci.org/dohrm/scalts.svg?branch=master)](https://travis-ci.org/dohrm/scalts)
[![Test Coverage](https://codeclimate.com/github/dohrm/scalts/badges/coverage.svg)](https://codeclimate.com/github/dohrm/scalts/coverage)


# scalts

The goal of this library is to provide some scala like monades and functional feature.

* Optional (Some, None)
* Either (Left, Right)
* Try (Success, Failure)
* Future

And have something for-comprehension for each of this features

like scalaz with like a [scalaz ApplicativeBuilder](https://github.com/scalaz/scalaz/blob/scalaz-seven/core/src/main/scala/scalaz/syntax/ApplySyntax.scala).

## Installation


`npm i scalts --save`


## Optional

Represents optional values. Instances of `Optional` are either an instance of Some or the object None.

The goal here is to never use `null` or `undefined` (thx to `strictNullChecks` instruction of TypeScript ).


```
ìmport { Optional, Some, None } from 'scalts';
```
```
const foo: Optional< string >   = Optional.apply( 'Bar' ); // Some( 'Bar' );
const error: Optional< string > = Optional.apply< string >( null ); // None

const mapper: ( s: string ) => {foo: string} = s => { foo: s };

foo.map( mapper ); // Some( { foo: 'Bar' } )
error.map( mapper ); // None
```

```
const opt1: Optional< string > = Optional.apply( 'The' );
const opt2: Optional< string > = Optional.apply( 'awser' );
const opt3: Optional< boolean >= Optional.apply( true );
const opt4: Optional< number > = Optional.apply( 42 );
const opt5: Optional< number > = None;


const fn = ( a: string, b: sring, c: boolean, d: number ) => {
   return a + ' ' + b + ' ' + ( c ? 'is' : 'isn\'t' ) + ' ' + d;
}

Some( 'The' ).chain( () => Some( 'answer' ) )
             .chain( () => Some( true ) )
             .chain( () => Some( 42 ) )
             .run( fn ); // Some( 'The answer is 42' );

Some( 'The' ).chain( <Optional< string > >None )
             .chain( Some( true ) )
             .chain( Some( 42 ) )
             .run( fn ); // None



```


## Either

ONGOING

## Try

ONGOING

## Future

ONGOING

## for-comprehension

ONGOING
