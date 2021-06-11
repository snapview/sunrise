import { Destroyable } from '../interfaces/Destroy'
import { Recalculable } from '../interfaces/Recalculate'
import { Cell } from '../interfaces/Cell'
import { OperationOnDestroyedCellError } from './OperationOnDestroyedCellError'

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
