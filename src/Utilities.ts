import { Argument, AllArguments } from "./Arguments";
import { GetPropertyState } from './states/GetPropertyState';
import { InitialState } from './states/InitialState';
import { Context } from './Context';
import * as util from 'util';

export type Call = any[] // list of args

export enum Type {
    method = 'method',
    property = 'property'
}

export enum SubstituteMethods {
    received = 'received',
    didNotReceive = 'didNotReceive',
    mimicks = 'mimicks',
    throws = 'throws',
    returns = 'returns'
}

export const Nothing = Symbol();
export type Nothing = typeof Nothing

export function stringifyArguments(args: any[]) {
    args = args.map(x => util.inspect(x));
    return args && args.length > 0 ? 'arguments [' + args.join(', ') + ']' : 'no arguments';
};

export function areArgumentArraysEqual(a: any[], b: any[]) {
    if (a.find(x => x instanceof AllArguments) || b.find(b => b instanceof AllArguments)) {
        return true;
    }

    for (var i = 0; i < Math.max(b.length, a.length); i++) {
        if (!areArgumentsEqual(b[i], a[i])) {
            return false;
        }
    }

    return true;
}

export function stringifyCalls(calls: Call[]) {

    if (calls.length === 0)
        return ' (no calls)';

    let output = '';
    for (let call of calls) {
        output += '\n-> call with ' + (call.length ? stringifyArguments(call) : '(no arguments)')
    }

    return output;
};

export function areArgumentsEqual(a: any, b: any) {

    if (a instanceof Argument && b instanceof Argument)
        return false;

    if (a instanceof AllArguments || b instanceof AllArguments)
        return true;

    if (a instanceof Argument)
        return a.matches(b);

    if (b instanceof Argument)
        return b.matches(a);

    return deepEqual(a, b);
};

function deepEqual(a: any, b: any): boolean {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    if (typeof a === 'object' && a !== null && b !== null) {
        if (!(typeof b === 'object')) return false;
        if (a.constructor !== b.constructor) return false;
        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) return false;
        for (const key in a) {
            if (!deepEqual(a[key], b[key])) return false;
        }
        return true;
    }
    return a === b;
}

export function Get(recorder: InitialState, context: Context, property: PropertyKey) {
    const existingGetState = recorder.getPropertyStates.find(state => state.property === property);
    if (existingGetState) {
        context.state = existingGetState;
        return context.get(void 0, property);
    }

    const getState = new GetPropertyState(property);
    context.state = getState;

    recorder.recordGetPropertyState(property, getState);

    return context.get(void 0, property);
}