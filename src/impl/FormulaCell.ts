import { deref } from '../interfaces/Deref'
import { Cell, Value } from '../interfaces/Cell'
import { Destroyable } from '../interfaces/Destroy'
import { Recalculable } from '../interfaces/Recalculate'
import { subscribe, unsubscribe } from '../interfaces/Subscribe'
import { OperationOnDestroyedCellError } from './OperationOnDestroyedCellError'
import { equals } from '../interfaces/Equal'

export class FormulaCell<T> implements Cell<T>, Recalculable {
    private val: T
    private destroyed: boolean = false
    private readonly fn: Function
    private readonly sources: unknown[]
    private subs = new Set<Recalculable & Destroyable>()

    constructor(fn: Function, ...sources: unknown[]) {
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
        if (equals(newVal, this.val)) return this.val
        this.val = newVal
        this.notifySubscribers()
        return this.val
    }

    public addSubscriber(subscriber: Recalculable & Destroyable): void {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Impossible to subscribe a destroyed cell'
            )
        }
        this.subs.add(subscriber)
    }

    public removeSubscriber(subscriber: Recalculable & Destroyable): void {
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
    ...sources: Value<unknown>[]
): FormulaCell<T> {
    return new FormulaCell(fn, ...sources)
}

export const map = formula
