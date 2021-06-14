import { hasMethods } from '../Utils'

export interface Equal {
    equals(that: any): boolean
}

export function equals<T>(x: T, y: any): boolean {
    if (hasMethods<Equal>(x, ['equals'])) {
        return x.equals(y)
    } else {
        return x === y
    }
}
