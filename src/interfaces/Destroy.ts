import { hasMethods } from '../Utils'

export interface Destroyable {
    destroy(): void
    isDestroyed(): boolean
}

export function isDestroyable(val: any): val is Destroyable {
    return hasMethods<Destroyable>(val, ['isDestroyed', 'destroy'])
}

export function destroy(val: any): void {
    if (isDestroyable(val)) {
        val.destroy()
    }
}

export function isDestroyed(val: any): boolean {
    if (isDestroyable(val)) {
        return val.isDestroyed()
    } else {
        return false
    }
}
