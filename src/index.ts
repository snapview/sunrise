export { Dereferencable, isDereferencable, deref } from './interfaces/Deref'
export {
    Destroyable,
    isDestroyable,
    destroy,
    isDestroyed,
} from './interfaces/Destroy'
export { Recalculable } from './interfaces/Recalculate'
export {
    Subscribable,
    isSubscribable,
    subscribe,
    unsubscribe,
} from './interfaces/Subscribe'
export { Cell, Value, isCell } from './interfaces/Cell'
export { OperationOnDestroyedCellError } from './impl/OperationOnDestroyedCellError'
export { SourceCell, cell, reset, swap } from './impl/SourceCell'
export { FormulaCell, formula, map } from './impl/FormulaCell'
export { history, field, byIndex, toBool, not } from './impl/Formulas'
