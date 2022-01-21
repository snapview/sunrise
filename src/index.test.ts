import { FormulaCell } from './impl/FormulaCell'
import {
    cell,
    deref,
    formula,
    destroy,
    isDestroyed,
    subscribe,
    unsubscribe,
    OperationOnDestroyedCellError,
} from './index'
import { inc } from './TestUtils'

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('deref', () => {
    it('should deref a souce cell', () => {
        const sc = cell<number>(1)
        expect(deref(sc)).toBe(1)
    })

    it('should deref a formula cell', () => {
        const sc = cell<number>(1)
        const fc = formula(inc, sc)
        expect(deref(fc)).toBe(2)
    })

    it('should deref any value', () => {
        const x = 1
        expect(deref(x)).toBe(x)
    })

    it('should throw an error if cell was destroyed', () => {
        const x = cell<number>(1)
        destroy(x)
        expect(() => deref(x)).toThrowError()
    })
})

describe('destruction', () => {
    it('should destroy source cell', () => {
        const x = cell<number>(1)
        destroy(x)
        expect(isDestroyed(x)).toBeTruthy()
    })

    it('should destroy formula cell', () => {
        const x = cell<number>(1)
        const y = formula(inc, x)
        destroy(y)
        expect(isDestroyed(y)).toBeTruthy()
    })

    it('should destroy all dependent cells', () => {
        const x = cell<number>(1)
        const y = formula(inc, x)
        const z = formula(inc, y)
        destroy(x)
        expect(isDestroyed(x))
        expect(isDestroyed(y))
        expect(isDestroyed(z))
    })

    it('should do nothing with undestroyable values', () => {
        destroy(1)
    })
})

describe('subscribe/unsubscribe', () => {
    it('should trigger the OperationOnDestroyedCellError when subscribe to the destroyed cell', () => {
        const x = cell<number>(1)
        destroy(x)
        try {
            const y = formula(inc, x)
            fail('Error should be triggered')
        } catch (err) {
            expect(err).toBeInstanceOf(OperationOnDestroyedCellError)
        }
    })

    it('subscribe should have no effect on the simple value', () => {
        const x = cell<number>(1)
        const y = new FormulaCell(inc, x)
        subscribe(y, 1)
    })

    it('unsubscribe should have no effect on the simple value', () => {
        const x = cell<number>(1)
        const y = new FormulaCell(inc, x)
        unsubscribe(y, 1)
    })
})
