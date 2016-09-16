/** export */
import {Optional, Some, None}  from './Optional'
import {Either, Left, Right}   from './Either'
import {Try, Success, Failure} from './Try'
import {Match, Case}           from './MatchCase'
import {PartialFunction}       from './PartialFunction'
import {Future}                from './Future'

const scalts = {
    Optional,
    Some,
    None,
    Either,
    Left,
    Right,
    Try,
    Success,
    Failure,
    Match,
    Case,
    PartialFunction,
    Future
};

export = scalts
