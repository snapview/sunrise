import { isCell } from '../interfaces/Cell'
import { deref } from '../interfaces/Deref'
import { destroy, Destroyable } from '../interfaces/Destroy'
import { Recalculable } from '../interfaces/Recalculate'
import { OperationOnDestroyedCellError } from './OperationOnDestroyedCellError'
import { cell, SourceCell } from './SourceCell'

const inc = (x: number) => x + 1

describe('SourceCell', () => {
    test('should be constructable with an initial value', () => {
        const x = new SourceCell(1)
        expect(isCell(x)).toBeTruthy()
    })

    test('should be dereferencable', () => {
        const val: number = 1
        const x = new SourceCell(val)
        expect(x.deref()).toBe(val)
    })

    describe('destroy', () => {
        test('should mark the cell as destroyed', () => {
            const x = new SourceCell(1)
            destroy(x)
            expect(x.isDestroyed()).toBe(true)
        })

        test('should destroy all subscribers and clean up the list of subscribers', () => {
            const subscriber1: Recalculable & Destroyable = {
                recalculate: () => {},
                destroy: jest.fn(() => {}),
                isDestroyed: () => false,
            }
            const subscriber2: Recalculable & Destroyable = {
                recalculate: () => {},
                destroy: jest.fn(() => {}),
                isDestroyed: () => false,
            }
            const x = new SourceCell(1)
            x.subscribe(subscriber1)
            x.subscribe(subscriber2)
            destroy(x)

            expect(subscriber1.destroy).toBeCalledTimes(1)
            expect(subscriber2.destroy).toBeCalledTimes(1)
            expect(x.subscribers.size).toBe(0)
        })
    })

    describe('subscribe/unsubscribe', () => {
        test('subscribe should add the subscriber to the list of subscribers', () => {
            const x = new SourceCell(1)
            const subscriber: Recalculable & Destroyable = {
                recalculate: () => {},
                destroy: () => {},
                isDestroyed: () => false,
            }
            x.subscribe(subscriber)
            expect(x.subscribers.has(subscriber)).toBe(true)
        })

        test('unsubscribe should remove the subscriber from the list of subscribers', () => {
            const x = new SourceCell(1)
            const subscriber: Recalculable & Destroyable = {
                recalculate: () => {},
                destroy: () => {},
                isDestroyed: () => false,
            }
            x.subscribe(subscriber)
            x.unsubscribe(subscriber)
            expect(x.subscribers.has(subscriber)).toBe(false)
        })
    })

    describe('reset', () => {
        test('should update the value', () => {
            const x = new SourceCell(1)
            x.reset(2)
            expect(x.deref()).toBe(2)
        })

        test('should notify subscibers about update', () => {
            const subscriber1: Recalculable & Destroyable = {
                recalculate: jest.fn(() => {}),
                destroy: () => {},
                isDestroyed: () => false,
            }
            const subscriber2: Recalculable & Destroyable = {
                recalculate: jest.fn(() => {}),
                destroy: () => {},
                isDestroyed: () => false,
            }
            const x = new SourceCell(1)
            x.subscribe(subscriber1)
            x.subscribe(subscriber2)

            x.reset(2)
            expect(subscriber1.recalculate).toBeCalled()
            expect(subscriber2.recalculate).toBeCalled()
        })

        test('should NOT notify subscribers if updated to the same value', () => {
            const subscriber1: Recalculable & Destroyable = {
                recalculate: jest.fn(() => {}),
                destroy: () => {},
                isDestroyed: () => false,
            }
            const subscriber2: Recalculable & Destroyable = {
                recalculate: jest.fn(() => {}),
                destroy: () => {},
                isDestroyed: () => false,
            }
            const x = new SourceCell(1)
            x.subscribe(subscriber1)
            x.subscribe(subscriber2)

            x.reset(1)
            expect(subscriber1.recalculate).not.toBeCalled()
            expect(subscriber2.recalculate).not.toBeCalled()
        })

        test('should NOT notify subscribers if updated to the EQUAL value', () => {
            const subscriber1: Recalculable & Destroyable = {
                recalculate: jest.fn(() => {}),
                destroy: () => {},
                isDestroyed: () => false,
            }
            const subscriber2: Recalculable & Destroyable = {
                recalculate: jest.fn(() => {}),
                destroy: () => {},
                isDestroyed: () => false,
            }
            const val = { equals: (_: any) => true }
            const x = new SourceCell(val)
            x.subscribe(subscriber1)
            x.subscribe(subscriber2)
            x.reset(val)

            expect(subscriber1.recalculate).not.toBeCalled()
            expect(subscriber2.recalculate).not.toBeCalled()
        })

        test('should trigger the OperationOnDestroyedCellError if reset a destroyed cell', () => {
            try {
                const x = new SourceCell(1)
                x.destroy()
                x.reset(2)
                fail('should not reach this place')
            } catch (err) {
                expect(err).toBeInstanceOf(OperationOnDestroyedCellError)
            }
        })
    })

    describe('swap', () => {
        test('should trigger the OperationOnDestroyedCellError if swap a destroyed cell', async () => {
            try {
                const x = new SourceCell(1)
                x.destroy()
                x.swap(inc)
                fail('should not reach this place')
            } catch (err) {
                expect(err).toBeInstanceOf(OperationOnDestroyedCellError)
            }
        })

        test('should properly swap the value', (done) => {
            const x = new SourceCell(1)
            x.swap(inc)
            x.swap((oldVal) => {
                expect(oldVal).toBe(2)
                done()
                return oldVal
            })
        })

        test('should keep being consistent in async environment', (done) => {
            const x = new SourceCell(0)
            let expected = 0
            for (let i = 1; i <= 100; i++) {
                x.swap((oldVal) => oldVal + i)
                expected += i
            }
            x.swap((oldVal) => {
                expect(oldVal).toBe(expected)
                done()
                return oldVal
            })
        })
    })
})
