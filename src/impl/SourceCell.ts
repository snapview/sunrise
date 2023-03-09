import { Destroyable } from '../interfaces/Destroy'
import { Recalculable } from '../interfaces/Recalculate'
import { Cell } from '../interfaces/Cell'
import { OperationOnDestroyedCellError } from './OperationOnDestroyedCellError'
import { Updatable } from '../interfaces/Update'
import { equals } from '../interfaces/Equal'

export class SourceCell<T> implements Cell<T>, Updatable<T> {
    private val: T
    private destroyed: boolean = false
    private subs = new Set<Recalculable & Destroyable>()

    constructor(val: T) {
        this.val = val
    }

    public deref(): T {
        this.verifyIfDestroyed()
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

    public addSubscriber(subscriber: Recalculable & Destroyable): void {
        this.verifyIfDestroyed()
        this.subs.add(subscriber)
    }

    public removeSubscriber(subscriber: Recalculable & Destroyable): void {
        this.subs.delete(subscriber)
    }

    public reset(val: T): void {
        this.verifyIfDestroyed()
        this.setVal(val)
    }

    public swap(fn: (oldVal: T) => T): void {
        this.verifyIfDestroyed()
        setTimeout(() => {
            let oldVal = this.val

            while (true) {
                const newVal = fn(oldVal)
                if (oldVal === this.val) {
                    this.setVal(newVal)
                    break
                } else {
                    oldVal = this.val
                }
            }
        }, 0)
    }

    public notifySubscribers(): void {
        for (let subscriber of this.subs) {
            subscriber.recalculate()
        }
    }

    public get subscribers(): Set<Recalculable & Destroyable> {
        return this.subs
    }

    private setVal(newVal: T) {
        const oldVal = this.val
        this.val = newVal
        if (equals(oldVal, newVal)) return
        this.notifySubscribers()
    }

    private verifyIfDestroyed(): void {
        if (this.destroyed) {
            throw new OperationOnDestroyedCellError(
                'Operation is not supported on a destroyed cell',
            )
        }
    }
}

export function cell<T>(val: T): SourceCell<T> {
    return new SourceCell(val)
}
