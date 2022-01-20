import { hasMethods } from '../Utils'
import { Recalculable } from './Recalculate'
import { Destroyable } from './Destroy'

export interface Subscribable {
    addSubscriber(subscriber: Recalculable & Destroyable): void
    removeSubscriber(subscriber: Recalculable & Destroyable): void
}

export function isSubscribable(val: any): val is Subscribable {
    return hasMethods<Subscribable>(val, ['addSubscriber', 'removeSubscriber'])
}

export function subscribe(
    subscriber: Recalculable & Destroyable,
    val: any
): void {
    if (isSubscribable(val)) val.addSubscriber(subscriber)
}

export function unsubscribe(
    subscriber: Recalculable & Destroyable,
    val: any
): void {
    if (isSubscribable(val)) val.removeSubscriber(subscriber)
}
