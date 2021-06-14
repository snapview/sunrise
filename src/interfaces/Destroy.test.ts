import { destroy, Destroyable, isDestroyable, isDestroyed } from './Destroy'

describe('Destroy', () => {
    test('isDestroyable should check if the object is destroyable', () => {
        const x: Destroyable = {
            destroy: () => {},
            isDestroyed: () => false,
        }
        const y = {}
        const z = 123

        expect(isDestroyable(x)).toBe(true)
        expect(isDestroyable(y)).toBe(false)
        expect(isDestroyable(z)).toBe(false)
    })

    describe('isDestroyed', () => {
        test('shoul call the interface method when applied to a destroyable object', () => {
            const x: Destroyable = {
                destroy: () => {},
                isDestroyed: jest.fn(() => false),
            }
            const result = isDestroyed(x)
            expect(result).toBe(false)
            expect(x.isDestroyed).toBeCalled()
        })

        test('should return false if applied to a non-destroyable value', () => {
            expect(isDestroyed(123)).toBe(false)
        })
    })

    describe('destroy', () => {
        test('should trigger destroy function if applied to a destroyable object', () => {
            const x: Destroyable = {
                destroy: jest.fn(() => {}),
                isDestroyed: () => false,
            }
            destroy(x)
            expect(x.destroy).toBeCalledTimes(1)
        })

        test('should do nothing if applied to a non-destroyable value', () => {
            destroy(123)
        })
    })
})
