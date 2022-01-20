import { cell } from './SourceCell'
import { deref } from '../interfaces/Deref'
import { swap, reset } from '../interfaces/Update'
import { history, field, toBool, not, byIndex } from './Formulas'

// @ts-ignore
global.setTimeout = (fn: Function, _?: number) => fn()

it('history cell', () => {
    const x = cell(1)
    const y = history(x)
    expect(deref(y)).toStrictEqual([1, undefined])
    reset(2, x)
    expect(deref(y)).toStrictEqual([2, 1])
    reset(3, x)
    expect(deref(y)).toStrictEqual([3, 2])
    swap((x) => x + 1, x)
    expect(deref(y)).toStrictEqual([4, 3])
})

it('field cell', () => {
    const x = cell({ a: 1, b: 2 })
    const a = field('a', x)
    expect(deref(a)).toBe(1)
    swap((x) => ({ ...x, a: 2 }), x)
    expect(deref(a)).toBe(2)
})

it('byIndex cell', () => {
    const x = cell<number[]>([1, 2, 3])
    const i = byIndex<number>(0, x)
    expect(deref(i)).toBe(1)
})

it('toBool should create a boolean cell', () => {
    const x = cell<number>(1)
    const y = cell<undefined>(undefined)
    const boolX = toBool(x)
    const boolY = toBool(y)
    expect(deref(boolX)).toBe(true)
    expect(deref(boolY)).toBe(false)
})

it('not should create a boolean cell with negated value', () => {
    const x = cell<number>(1)
    const y = cell<undefined>(undefined)
    const boolX = not(x)
    const boolY = not(y)
    expect(deref(boolX)).toBe(false)
    expect(deref(boolY)).toBe(true)
})
