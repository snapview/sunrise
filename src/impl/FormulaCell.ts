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

export type UnwrapCell<T> = T extends Cell<infer U> ? U : T
type InferReturn<T> = T extends (...args: any[]) => infer U ? U : never

export function formula<
    T1 extends Value<unknown>,
    FN extends (val1: UnwrapCell<T1>) => unknown,
    R = InferReturn<FN>
>(fn: FN, input1: T1): T1 extends Cell<any> ? FormulaCell<R> : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    FN extends (val1: UnwrapCell<T1>, val2: UnwrapCell<T2>) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    T4 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>,
        val4: UnwrapCell<T4>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3,
    input4: T4
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : T4 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    T4 extends Value<unknown>,
    T5 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>,
        val4: UnwrapCell<T4>,
        val5: UnwrapCell<T5>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3,
    input4: T4,
    input5: T5
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : T4 extends Cell<any>
    ? FormulaCell<R>
    : T5 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    T4 extends Value<unknown>,
    T5 extends Value<unknown>,
    T6 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>,
        val4: UnwrapCell<T4>,
        val5: UnwrapCell<T5>,
        val6: UnwrapCell<T6>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3,
    input4: T4,
    input5: T5,
    input6: T6
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : T4 extends Cell<any>
    ? FormulaCell<R>
    : T5 extends Cell<any>
    ? FormulaCell<R>
    : T6 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    T4 extends Value<unknown>,
    T5 extends Value<unknown>,
    T6 extends Value<unknown>,
    T7 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>,
        val4: UnwrapCell<T4>,
        val5: UnwrapCell<T5>,
        val6: UnwrapCell<T6>,
        val7: UnwrapCell<T7>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3,
    input4: T4,
    input5: T5,
    input6: T6,
    input7: T7
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : T4 extends Cell<any>
    ? FormulaCell<R>
    : T5 extends Cell<any>
    ? FormulaCell<R>
    : T6 extends Cell<any>
    ? FormulaCell<R>
    : T7 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    T4 extends Value<unknown>,
    T5 extends Value<unknown>,
    T6 extends Value<unknown>,
    T7 extends Value<unknown>,
    T8 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>,
        val4: UnwrapCell<T4>,
        val5: UnwrapCell<T5>,
        val6: UnwrapCell<T6>,
        val7: UnwrapCell<T7>,
        val8: UnwrapCell<T8>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3,
    input4: T4,
    input5: T5,
    input6: T6,
    input7: T7,
    input8: T8
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : T4 extends Cell<any>
    ? FormulaCell<R>
    : T5 extends Cell<any>
    ? FormulaCell<R>
    : T6 extends Cell<any>
    ? FormulaCell<R>
    : T7 extends Cell<any>
    ? FormulaCell<R>
    : T8 extends Cell<any>
    ? FormulaCell<R>
    : R
export function formula<
    T1 extends Value<unknown>,
    T2 extends Value<unknown>,
    T3 extends Value<unknown>,
    T4 extends Value<unknown>,
    T5 extends Value<unknown>,
    T6 extends Value<unknown>,
    T7 extends Value<unknown>,
    T8 extends Value<unknown>,
    T9 extends Value<unknown>,
    FN extends (
        val1: UnwrapCell<T1>,
        val2: UnwrapCell<T2>,
        val3: UnwrapCell<T3>,
        val4: UnwrapCell<T4>,
        val5: UnwrapCell<T5>,
        val6: UnwrapCell<T6>,
        val7: UnwrapCell<T7>,
        val8: UnwrapCell<T8>,
        val9: UnwrapCell<T9>
    ) => unknown,
    R = InferReturn<FN>
>(
    fn: FN,
    input1: T1,
    input2: T2,
    input3: T3,
    input4: T4,
    input5: T5,
    input6: T6,
    input7: T7,
    input8: T8,
    input9: T9
): T1 extends Cell<any>
    ? FormulaCell<R>
    : T2 extends Cell<any>
    ? FormulaCell<R>
    : T3 extends Cell<any>
    ? FormulaCell<R>
    : T4 extends Cell<any>
    ? FormulaCell<R>
    : T5 extends Cell<any>
    ? FormulaCell<R>
    : T6 extends Cell<any>
    ? FormulaCell<R>
    : T7 extends Cell<any>
    ? FormulaCell<R>
    : T8 extends Cell<any>
    ? FormulaCell<R>
    : T9 extends Cell<any>
    ? FormulaCell<R>
    : R
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
