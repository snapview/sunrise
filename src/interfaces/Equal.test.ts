import { Equal, equals } from './Equal'

export class Box<T> implements Equal {
    constructor(private val: T) {}

    public equals(that: Box<T>): boolean {
        return this.val === that.val
    }
}

describe('Equal', () => {
    describe('equals', () => {
        test('should use equals function if implemented', () => {
            const box: Equal = { equals: jest.fn((_) => false) }
            equals(box, 123)
            expect(box.equals).toBeCalled()
        })

        test('should use equality by link if Equal is not implemented', () => {
            const x = {}
            const y = x
            const z = {}

            expect(equals(x, y)).toBe(true)
            expect(equals(x, z)).toBe(false)
        })
    })
})
