import { hasMethods } from '../Utils'

export interface Dereferencable<T> {
    deref(): T
}

export function isDereferencable<T>(val: Dereferencable<T> | T): val is Dereferencable<T> {
    return hasMethods<Dereferencable<T>>(val, ['deref'])
}

export function deref<T>(val: Dereferencable<T> | T): T {
    if (isDereferencable(val)) {
        return val.deref()
    } else {
        return val
    }
}
