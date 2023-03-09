import { Cell, Value } from '../interfaces/Cell'
import { FormulaCell, formula, UnwrapCell } from './FormulaCell'

type HistoryResult<T> = [T, T | undefined]
/**
 * Accepts a cell and creates a cell of tuple [newValue, oldValue]
 * initially oldValue is undefined
 */
export function history<T extends Value<unknown>>(
    cell: T,
): T extends Cell<any> ? FormulaCell<HistoryResult<UnwrapCell<T>>> : HistoryResult<UnwrapCell<T>> {
    let oldVal: UnwrapCell<T> | undefined = undefined
    return formula((newVal: UnwrapCell<T>) => {
        const result: HistoryResult<UnwrapCell<T>> = [newVal, oldVal]
        oldVal = newVal
        return result
    }, cell)
}

/**
 * check if `string`, `number` or `symbol` themselves are key
 */
type IsRecord<T> = string extends keyof T
    ? true
    : number extends keyof T
    ? true
    : symbol extends keyof T
    ? true
    : false

/**
 * Accepts a field name and a cell a record and creates a new cell
 * that represents a single field of the source cell
 */
export function field<T extends Value<unknown>, K extends keyof UnwrapCell<T>>(
    fieldName: K,
    fromCell: T,
): T extends Cell<any>
    ? FormulaCell<
          IsRecord<UnwrapCell<T>> extends true ? UnwrapCell<T>[K] | undefined : UnwrapCell<T>[K]
      >
    : IsRecord<UnwrapCell<T>> extends true
    ? UnwrapCell<T>[K] | undefined
    : UnwrapCell<T>[K] {
    return formula((fromVal) => fromVal[fieldName], fromCell)
}

export function byIndex<T extends Value<unknown[]>, U extends number>(
    index: U,
    source: T,
): T extends Cell<any> ? FormulaCell<UnwrapCell<T>[U] | undefined> : UnwrapCell<T>[U] | undefined {
    return formula((fromVal) => fromVal[index], source)
}

export function toBool<T extends Value<unknown>>(
    source: T,
): T extends Cell<any> ? FormulaCell<boolean> : boolean {
    return formula((fromVal) => Boolean(fromVal), source)
}

export function not<T extends Value<unknown>>(
    source: T,
): T extends Cell<any> ? FormulaCell<boolean> : boolean {
    return formula((fromVal) => !Boolean(fromVal), source)
}
