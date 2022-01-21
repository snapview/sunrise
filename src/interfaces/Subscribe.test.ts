import { Destroyable } from './Destroy'
import { Recalculable } from './Recalculate'
import {
    Subscribable,
    isSubscribable,
    subscribe,
    unsubscribe,
} from './Subscribe'

const subscriber: Recalculable & Destroyable = {
    recalculate: () => {},
    destroy: () => {},
    isDestroyed: () => false,
}

describe('Subscribe', () => {
    test('isSubscribable should check the accordance to Subscribable interface', () => {
        const x: Subscribable = {
            addSubscriber: (_: Recalculable & Destroyable) => {},
            removeSubscriber: (_: Recalculable & Destroyable) => {},
        }
        const y = {}
        const z = 123

        expect(isSubscribable(x)).toBe(true)
        expect(isSubscribable(y)).toBe(false)
        expect(isSubscribable(z)).toBe(false)
    })

    describe('addSubscriber', () => {
        test('should trigger addSubscriber method if applied to a subscribable object', () => {
            const x: Subscribable = {
                addSubscriber: jest.fn((_: Recalculable & Destroyable) => {}),
                removeSubscriber: (_: Recalculable & Destroyable) => {},
            }
            subscribe(subscriber, x)
            expect(x.addSubscriber).toBeCalledTimes(1)
        })

        test('should do nothing if applied to a non-subscribable value', () => {
            subscribe(subscriber, 123)
        })
    })

    describe('removeSubscriber', () => {
        test('should trigger unsubscribe method if applied to a subscribable object', () => {
            const x: Subscribable = {
                addSubscriber: (_: Recalculable & Destroyable) => {},
                removeSubscriber: jest.fn(
                    (_: Recalculable & Destroyable) => {}
                ),
            }
            unsubscribe(subscriber, x)
            expect(x.removeSubscriber).toBeCalledTimes(1)
        })

        test('should do nothing if applied to a non-subscribable value', () => {
            unsubscribe(subscriber, 123)
        })
    })
})
