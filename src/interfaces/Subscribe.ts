import { hasMethods } from '../Utils'
import { Recalculable } from './Recalculate'
import { Destroyable } from './Destroy'

export interface Subscribable {
    subscribe(subscriber: Recalculable & Destroyable): void
    unsubscribe(subscriber: Recalculable & Destroyable): void
}

export function isSubscribable(val: any): val is Subscribable {
    return hasMethods<Subscribable>(val, ['subscribe', 'unsubscribe'])
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
