import { Dereferencable, isDereferencable } from './Deref'
import { Destroyable, isDestroyable } from './Destroy'
import { Subscribable, isSubscribable } from './Subscribe'

export interface Cell<T> extends Dereferencable<T>, Destroyable, Subscribable {}

export type Value<T> = T | Cell<T>

export function isCell<T>(val: Value<T>): val is Cell<T> {
    return isDereferencable(val) && isDestroyable(val) && isSubscribable(val)
}
