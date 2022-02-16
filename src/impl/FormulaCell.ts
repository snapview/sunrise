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

export function formula<S1 extends Value<unknown>, T, U1 = UnwrapCell<S1>>(
    fn: (val1: U1) => T,
    input1: S1
): S1 extends Cell<any> ? FormulaCell<T> : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>
>(
    fn: (val1: U1, val2: U2) => T,
    input1: S1,
    input2: S2
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>
>(
    fn: (val1: U1, val2: U2, val3: U3) => T,
    input1: S1,
    input2: S2,
    input3: S3
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    S4 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>,
    U4 = UnwrapCell<S4>
>(
    fn: (val1: U1, val2: U2, val3: U3, val4: U4) => T,
    input1: S1,
    input2: S2,
    input3: S3,
    input4: S4
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : S4 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    S4 extends Value<unknown>,
    S5 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>,
    U4 = UnwrapCell<S4>,
    U5 = UnwrapCell<S5>
>(
    fn: (val1: U1, val2: U2, val3: U3, val4: U4, val5: U5) => T,
    input1: S1,
    input2: S2,
    input3: S3,
    input4: S4,
    input5: S5
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : S4 extends Cell<any>
    ? FormulaCell<T>
    : S5 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    S4 extends Value<unknown>,
    S5 extends Value<unknown>,
    S6 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>,
    U4 = UnwrapCell<S4>,
    U5 = UnwrapCell<S5>,
    U6 = UnwrapCell<S6>
>(
    fn: (val1: U1, val2: U2, val3: U3, val4: U4, val5: U5, val6: U6) => T,
    input1: S1,
    input2: S2,
    input3: S3,
    input4: S4,
    input5: S5,
    input6: S6
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : S4 extends Cell<any>
    ? FormulaCell<T>
    : S5 extends Cell<any>
    ? FormulaCell<T>
    : S6 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    S4 extends Value<unknown>,
    S5 extends Value<unknown>,
    S6 extends Value<unknown>,
    S7 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>,
    U4 = UnwrapCell<S4>,
    U5 = UnwrapCell<S5>,
    U6 = UnwrapCell<S6>,
    U7 = UnwrapCell<S7>
>(
    fn: (
        val1: U1,
        val2: U2,
        val3: U3,
        val4: U4,
        val5: U5,
        val6: U6,
        val7: U7
    ) => T,
    input1: S1,
    input2: S2,
    input3: S3,
    input4: S4,
    input5: S5,
    input6: S6,
    input7: S7
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : S4 extends Cell<any>
    ? FormulaCell<T>
    : S5 extends Cell<any>
    ? FormulaCell<T>
    : S6 extends Cell<any>
    ? FormulaCell<T>
    : S7 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    S4 extends Value<unknown>,
    S5 extends Value<unknown>,
    S6 extends Value<unknown>,
    S7 extends Value<unknown>,
    S8 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>,
    U4 = UnwrapCell<S4>,
    U5 = UnwrapCell<S5>,
    U6 = UnwrapCell<S6>,
    U7 = UnwrapCell<S7>,
    U8 = UnwrapCell<S8>
>(
    fn: (
        val1: U1,
        val2: U2,
        val3: U3,
        val4: U4,
        val5: U5,
        val6: U6,
        val7: U7,
        val8: U8
    ) => T,
    input1: S1,
    input2: S2,
    input3: S3,
    input4: S4,
    input5: S5,
    input6: S6,
    input7: S7,
    input8: S8
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : S4 extends Cell<any>
    ? FormulaCell<T>
    : S5 extends Cell<any>
    ? FormulaCell<T>
    : S6 extends Cell<any>
    ? FormulaCell<T>
    : S7 extends Cell<any>
    ? FormulaCell<T>
    : S8 extends Cell<any>
    ? FormulaCell<T>
    : T
export function formula<
    S1 extends Value<unknown>,
    S2 extends Value<unknown>,
    S3 extends Value<unknown>,
    S4 extends Value<unknown>,
    S5 extends Value<unknown>,
    S6 extends Value<unknown>,
    S7 extends Value<unknown>,
    S8 extends Value<unknown>,
    S9 extends Value<unknown>,
    T,
    U1 = UnwrapCell<S1>,
    U2 = UnwrapCell<S2>,
    U3 = UnwrapCell<S3>,
    U4 = UnwrapCell<S4>,
    U5 = UnwrapCell<S5>,
    U6 = UnwrapCell<S6>,
    U7 = UnwrapCell<S7>,
    U8 = UnwrapCell<S8>,
    U9 = UnwrapCell<S9>
>(
    fn: (
        val1: U1,
        val2: U2,
        val3: U3,
        val4: U4,
        val5: U5,
        val6: U6,
        val7: U7,
        val8: U8,
        val9: U9
    ) => T,
    input1: S1,
    input2: S2,
    input3: S3,
    input4: S4,
    input5: S5,
    input6: S6,
    input7: S7,
    input8: S8,
    input9: S9
): S1 extends Cell<any>
    ? FormulaCell<T>
    : S2 extends Cell<any>
    ? FormulaCell<T>
    : S3 extends Cell<any>
    ? FormulaCell<T>
    : S4 extends Cell<any>
    ? FormulaCell<T>
    : S5 extends Cell<any>
    ? FormulaCell<T>
    : S6 extends Cell<any>
    ? FormulaCell<T>
    : S7 extends Cell<any>
    ? FormulaCell<T>
    : S8 extends Cell<any>
    ? FormulaCell<T>
    : S9 extends Cell<any>
    ? FormulaCell<T>
    : T
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
