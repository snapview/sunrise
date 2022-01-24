import { deref } from '../interfaces/Deref'
import { Cell, isCell, Value } from '../interfaces/Cell'
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
        let newVal = this.val
        const args = this.sources.map(deref)
        try {
            newVal = this.fn(...args)
        } catch (e) {
            console.warn(
                'An error\n',
                e,
                '\noccurred while recalculating\n',
                this,
                '\nwith the following arguments\n',
                args
            )
            return this.val
        }
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

    public get subscribers(): Set<Recalculable & Destroyable> {
        return this.subs
    }
}

export function formula<S1, T>(
    fn: (val1: S1) => T,
    input1: Value<S1>
): FormulaCell<T> | T
export function formula<S1, S2, T>(
    fn: (val1: S1, val2: S2) => T,
    input1: Value<S1>,
    input2: Value<S2>
): FormulaCell<T> | T
export function formula<S1, S2, S3, T>(
    fn: (val1: S1, val2: S2, val3: S3) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>
): FormulaCell<T> | T
export function formula<S1, S2, S3, S4, T>(
    fn: (val1: S1, val2: S2, val3: S3, val4: S4) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>,
    input4: Value<S4>
): FormulaCell<T> | T
export function formula<S1, S2, S3, S4, S5, T>(
    fn: (val1: S1, val2: S2, val3: S3, val4: S4, val5: S5) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>,
    input4: Value<S4>,
    input5: Value<S4>
): FormulaCell<T> | T
export function formula<S1, S2, S3, S4, S5, S6, T>(
    fn: (val1: S1, val2: S2, val3: S3, val4: S4, val5: S5, val6: S6) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>,
    input4: Value<S4>,
    input5: Value<S4>,
    input6: Value<S6>
): FormulaCell<T> | T
export function formula<S1, S2, S3, S4, S5, S6, S7, T>(
    fn: (
        val1: S1,
        val2: S2,
        val3: S3,
        val4: S4,
        val5: S5,
        val6: S6,
        val7: S7
    ) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>,
    input4: Value<S4>,
    input5: Value<S4>,
    input6: Value<S6>,
    input7: Value<S7>
): FormulaCell<T> | T
export function formula<S1, S2, S3, S4, S5, S6, S7, S8, T>(
    fn: (
        val1: S1,
        val2: S2,
        val3: S3,
        val4: S4,
        val5: S5,
        val6: S6,
        val7: S7,
        val8: S8
    ) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>,
    input4: Value<S4>,
    input5: Value<S4>,
    input6: Value<S6>,
    input7: Value<S7>,
    input8: Value<S8>
): FormulaCell<T> | T
export function formula<S1, S2, S3, S4, S5, S6, S7, S8, S9, T>(
    fn: (
        val1: S1,
        val2: S2,
        val3: S3,
        val4: S4,
        val5: S5,
        val6: S6,
        val7: S7,
        val8: S8,
        val9: S9
    ) => T,
    input1: Value<S1>,
    input2: Value<S2>,
    input3: Value<S3>,
    input4: Value<S4>,
    input5: Value<S4>,
    input6: Value<S6>,
    input7: Value<S7>,
    input8: Value<S8>,
    input9: Value<S9>
): FormulaCell<T> | T
export function formula<T>(
    fn: Function,
    ...sources: Value<unknown>[]
): FormulaCell<T> | T {
    if (sources.some(isCell)) {
        return new FormulaCell(fn, ...sources)
    } else {
        return fn(...sources)
    }
}

export const map = formula
