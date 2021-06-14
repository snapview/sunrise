import { isDereferencable, deref } from './Deref'

describe('Deref', () => {
    test('isDereferencable should check if the value satisfyes the Dereferencable interface', () => {
        const x = { deref: () => 1 }
        const y = 1
        const z = { a: 1 }
        expect(isDereferencable(x)).toBe(true)
        expect(isDereferencable(y)).toBe(false)
        expect(isDereferencable(z)).toBe(false)
    })

    describe('deref', () => {
        test('should return the inner value of the dereferenced object', () => {
            const x = { deref: () => 1 }
            expect(deref(x)).toBe(1)
        })

        test('should return the value itself if not dereferencable', () => {
            const x = { a: 'just a value' }
            expect(deref(x)).toBe(x)
        })
    })
})
