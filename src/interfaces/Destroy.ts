import { hasMethods } from '../Utils'
import { Cell } from './Cell'

export interface Destroyable {
    destroy(): void
    isDestroyed(): boolean
}

export function isDestroyable(val: any): val is Destroyable {
    return hasMethods<Destroyable>(val, ['isDestroyed'])
}

export function destroy(val: any): void {
    if (isDestroyable(val)) {
        val.destroy()
    }
}

export function isDestroyed(val: Cell<any>): boolean {
    return val.isDestroyed()
}
