import { Cell, Value } from '../interfaces/Cell'
import { FormulaCell, formula } from './FormulaCell'

/**
 * Accepts a cell and creates a cell of tuple [newValue, oldValue]
 * initially oldValue is undefined
 */
export function history<T>(cell: Value<T>): FormulaCell<[T, T | undefined]> {
    let oldVal: T | undefined = undefined
    return formula((newVal) => {
        const result: [T, T | undefined] = [newVal, oldVal]
        oldVal = newVal
        return result
    }, cell)
}

/**
 * Accepts a field name and a cell a record and creates a new cell
 * that represents a single field of the source cell
 */
export function field<F, K extends keyof F>(
    fieldName: K,
    fromCell: Cell<F>
): FormulaCell<F[K]> {
    return formula((fromVal) => fromVal[fieldName], fromCell)
}

export function byIndex<T>(
    index: number,
    source: Cell<T[]>
): FormulaCell<T | undefined> {
    return formula((fromVal) => fromVal[index], source)
}

export function toBool(source: Cell<any>): FormulaCell<boolean> {
    return formula((fromVal) => Boolean(fromVal), source)
}

export function not(source: Cell<any>): FormulaCell<boolean> {
    return formula((fromVal) => !Boolean(fromVal), source)
}
