// -- Deref --

export interface Dereferencable<T> {
    deref(): T
}

export function isDereferencable<T>(
    val: Dereferencable<T> | T
): val is Dereferencable<T> {
    return val instanceof Object && 'deref' in val
}

export function deref<T>(val: Dereferencable<T> | T): T {
    if (isDereferencable(val)) {
        return val.deref()
    } else {
        return val
    }
}

// -- Destroy --

export interface Destroyable {
    destroy(): void
    isDestroyed(): boolean
}

export function isDestroyable<T>(val: any): val is Destroyable {
    return val instanceof Object && 'destroy' in val && 'isDestroyed' in val
}

export function destroy(val: any): void {
    if (isDestroyable(val)) {
        val.destroy()
    }
}

export function isDestroyed(val: Cell<any>): boolean {
    return val.isDestroyed()
}

// ------------

export interface Recalculable {
    recalculate(): void
}

// -- Subscriptions --

export interface Subscribable {
    subscribe(subscriber: Recalculable & Destroyable): void
    unsubscribe(subscriber: Recalculable & Destroyable): void
}

export function isSubscribable(val: any): val is Subscribable {
    return val instanceof Object && 'subscribe' in val && 'unsubscribe' in val
}

export function subscribe(
    subscriber: Recalculable & Destroyable,
    val: any
): void {
    if (isSubscribable(val)) val.subscribe(subscriber)
}

export function unsubscribe(
    subscriber: Recalculable & Destroyable,
    val: any
): void {
    if (isSubscribable(val)) val.unsubscribe(subscriber)
}

// ------------------

export interface Cell<T> extends Dereferencable<T>, Destroyable, Subscribable {}

export type Value<T> = T | Cell<T>

export function isCell<T>(val: Value<T>): val is Cell<T> {
    return isDereferencable(val) && isDestroyable(val) && isSubscribable(val)
}

// ------------------

// -- Source Cell --

export class OperationOnDestroyedCellError extends Error {}

export class SourceCell<T> implements Cell<T> {
    // undefined means the cell was destroyed
    private val: T
    private destroyed: boolean = false
    private subs = new Set<Recalculable & Destroyable>()

    constructor(val: T) {
        this.val = val
    }

    public deref(): T {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Impossible to deref a destroyed cell'
            )
        }
        return this.val
    }

    public destroy(): void {
        this.destroyed = true
        for (let subscriber of this.subs) {
            subscriber.destroy()
        }
        this.subs.clear()
    }

    public isDestroyed(): boolean {
        return this.destroyed
    }

    public subscribe(subscriber: Recalculable & Destroyable): void {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Impossible to subscribe a destroyed cell'
            )
        }
        this.subs.add(subscriber)
    }

    public unsubscribe(subscriber: Recalculable & Destroyable): void {
        this.subs.delete(subscriber)
    }

    public reset(val: T): void {
        if (this.val === val) return
        this.val = val
        this.notifySubscribers()
    }

    public swap(fn: (oldVal: T) => T): void {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Impossible to swap a destroyed cell'
            )
        }
        const oldVal = this.val
        setTimeout(() => {
            const newVal = fn(oldVal)
            // STM is implemented here. Apply changes only if the value didn't change while we
            // were doing calculations. Otherwise start from the very beginning
            if (oldVal === this.val) {
                this.reset(newVal)
            } else {
                this.swap(fn)
            }
        }, 0)
    }

    private notifySubscribers(): void {
        if (this.destroyed) return

        for (let subscriber of this.subs) {
            subscriber.recalculate()
        }
    }
}

export function cell<T>(val: T): SourceCell<T> {
    return new SourceCell(val)
}

export function reset<T>(val: T, cell: SourceCell<T>): void {
    cell.reset(val)
}

export function swap<T>(fn: (oldVal: T) => T, cell: SourceCell<T>): void {
    cell.swap(fn)
}

// -- Formula Cell --

export class FormulaCell<T> implements Cell<T>, Recalculable {
    // undefined means the cell was destroyed
    private val: T
    private destroyed: boolean = false
    private readonly fn: Function
    private readonly sources: (Cell<T> | T)[]
    private subs = new Set<Recalculable & Destroyable>()

    constructor(fn: Function, ...sources: (Cell<T> | T)[]) {
        this.fn = fn
        this.sources = sources
        sources.forEach((source) => subscribe(this, source))
        this.val = this.recalculate()
    }

    public deref(): T {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Impossible to deref a destroyed cell'
            )
        }
        return this.val
    }

    public recalculate(): T {
        const newVal = this.fn(...this.sources.map(deref))
        if (newVal === this.val) return this.val
        this.val = newVal
        this.notifySubscribers()
        return this.val
    }

    public subscribe(subscriber: Recalculable & Destroyable): void {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Impossible to subscribe a destroyed cell'
            )
        }
        this.subs.add(subscriber)
    }

    public unsubscribe(subscriber: Recalculable & Destroyable): void {
        this.subs.delete(subscriber)
    }

    public destroy(): void {
        for (let subscriber of this.subs) {
            subscriber.destroy()
        }
        for (let source of this.sources) {
            unsubscribe(this, source)
        }
        this.subs.clear()
        this.destroyed = true
    }

    public isDestroyed(): boolean {
        return this.destroyed
    }

    private notifySubscribers(): void {
        if (!this.val) return

        for (let subscriber of this.subs) {
            subscriber.recalculate()
        }
    }
}

export function formula<F1, T>(
    fn: (val1: F1) => T,
    input1: Value<F1>
): FormulaCell<T>
export function formula<F1, F2, T>(
    fn: (val1: F1, val2: F2) => T,
    input1: Value<F1>,
    input2: Value<F2>
): FormulaCell<T>
export function formula<F1, F2, F3, T>(
    fn: (val1: F1, val2: F2, val3: F3) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, T>(
    fn: (val1: F1, val2: F2, val3: F3, val4: F4) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>,
    input4: Value<F4>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, F5, T>(
    fn: (val1: F1, val2: F2, val3: F3, val4: F4, val5: F5) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>,
    input4: Value<F4>,
    input5: Value<F4>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, F5, F6, T>(
    fn: (val1: F1, val2: F2, val3: F3, val4: F4, val5: F5, val6: F6) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>,
    input4: Value<F4>,
    input5: Value<F4>,
    input6: Value<F6>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, F5, F6, F7, T>(
    fn: (
        val1: F1,
        val2: F2,
        val3: F3,
        val4: F4,
        val5: F5,
        val6: F6,
        val7: F7
    ) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>,
    input4: Value<F4>,
    input5: Value<F4>,
    input6: Value<F6>,
    input7: Value<F7>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, F5, F6, F7, F8, T>(
    fn: (
        val1: F1,
        val2: F2,
        val3: F3,
        val4: F4,
        val5: F5,
        val6: F6,
        val7: F7,
        val8: F8
    ) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>,
    input4: Value<F4>,
    input5: Value<F4>,
    input6: Value<F6>,
    input7: Value<F7>,
    input8: Value<F8>
): FormulaCell<T>
export function formula<F1, F2, F3, F4, F5, F6, F7, F8, F9, T>(
    fn: (
        val1: F1,
        val2: F2,
        val3: F3,
        val4: F4,
        val5: F5,
        val6: F6,
        val7: F7,
        val8: F8,
        val9: F9
    ) => T,
    input1: Value<F1>,
    input2: Value<F2>,
    input3: Value<F3>,
    input4: Value<F4>,
    input5: Value<F4>,
    input6: Value<F6>,
    input7: Value<F7>,
    input8: Value<F8>,
    input9: Value<F9>
): FormulaCell<T>
export function formula<T>(
    fn: Function,
    ...sources: Value<any>[]
): FormulaCell<T> {
    return new FormulaCell(fn, ...sources)
}

export const map = formula

// -- Some helpful formula cells --

/**
 * Accepts a cell and creates a cell of tuple [newValue, oldValue]
 * initially oldValue is undefined
 */
export function history<T>(cell: Value<T>): FormulaCell<[T, T | undefined]> {
    let oldVal: T | undefined = undefined
    return formula((newVal) => {
        const result: [T, T | undefined] = [newVal, oldVal]
        oldVal = newVal
        return result
    }, cell)
}

/**
 * Accepts a field name and a cell a record and creates a new cell
 * that represents a single field of the source cell
 */
export function field<F, K extends keyof F>(
    fieldName: K,
    fromCell: Cell<F>
): FormulaCell<F[K]> {
    return formula((fromVal) => fromVal[fieldName], fromCell)
}

export function byIndex<T>(
    index: number,
    source: Cell<T[]>
): FormulaCell<T | undefined> {
    return formula((fromVal) => fromVal[index], source)
}

export function toBool(source: Cell<any>): FormulaCell<boolean> {
    return formula((fromVal) => Boolean(fromVal), source)
}

export function not(source: Cell<any>): FormulaCell<boolean> {
    return formula((fromVal) => !Boolean(fromVal), source)
}
