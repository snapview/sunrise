import { Cell, isCell } from './Cell'
import { Destroyable } from './Destroy'
import { Recalculable } from './Recalculate'

describe('Cell', () => {
    test('isCell should check the accordance to the Cell interface', () => {
        const x: Cell<number> = {
            deref: () => 123,
            destroy: () => {},
            isDestroyed: () => false,
            subscribe: (_: Recalculable & Destroyable) => {},
            unsubscribe: (_: Recalculable & Destroyable) => {},
        }
        const y = {}
        const z = 123

        expect(isCell(x)).toBe(true)
        expect(isCell(y)).toBe(false)
        expect(isCell(z)).toBe(false)
    })
})
