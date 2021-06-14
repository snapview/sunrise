export interface Updatable<T> {
    reset(newVal: T): void
    swap(fn: (oldVal: T) => T): void
}

export function reset<T>(val: T, cell: Updatable<T>): void {
    cell.reset(val)
}

export function swap<T>(fn: (oldVal: T) => T, cell: Updatable<T>): void {
    cell.swap(fn)
}
