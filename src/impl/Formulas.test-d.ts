import { expectError, expectNotType, expectType, expectAssignable } from 'tsd'
import {
    Cell,
    FormulaCell,
    SourceCell,
    byIndex,
    cell,
    field,
    formula,
    map,
    not,
    toBool,
} from '../index'

// not
{
    const boolCell = cell(false)
    const formulaCell = map((x) => (x === true ? false : true), boolCell)
    const justBool = map((x) => (x === true ? false : true), false)

    // since `not` is a formula, we expect `FormulaCell` as return type
    expectType<FormulaCell<boolean>>(not(boolCell))
    expectType<FormulaCell<boolean>>(not(formulaCell))

    // can pass plain boolean to `not` too
    expectType<boolean>(not(justBool))
    expectType<boolean>(not(false))
    expectType<boolean>(not(1))
}

// toBool
{
    const boolCell = cell(false)
    const formulaCell = map((x) => (x === true ? false : true), boolCell)
    const justBool = map((x) => (x === true ? false : true), false)

    // since `toBool` is a formula, we expect `FormulaCell` as return type
    expectType<FormulaCell<boolean>>(toBool(boolCell))
    expectType<FormulaCell<boolean>>(toBool(formulaCell))

    // can pass plain boolean to `toBool` too
    expectType<boolean>(toBool(justBool))
    expectType<boolean>(toBool(false))
    expectType<boolean>(toBool(1))
}

// byIndex with Array
{
    const charArr = ['a', 'b', 'c']
    const charArrCell = cell(charArr)

    expectType<FormulaCell<string | undefined>>(byIndex(1, charArrCell))
    expectType<FormulaCell<string | undefined>>(byIndex(5, charArrCell))

    // can pass plain Array to `byIndex` too
    expectType<string | undefined>(byIndex(1, charArr))
}

// byIndex with Tuple
{
    const tuple: [string, number, boolean] = ['a', 2, true]
    const tupleCell = cell(tuple)

    const x = byIndex(4, tupleCell)
    expectType<FormulaCell<string | undefined>>(byIndex(0, tupleCell))
    expectType<FormulaCell<number | undefined>>(byIndex(1, tupleCell))
    expectType<FormulaCell<boolean | undefined>>(byIndex(2, tupleCell))
    expectType<FormulaCell<undefined>>(byIndex(3, tupleCell))

    // can pass plain Tuple to `byIndex` too
    expectType<string | undefined>(byIndex(0, tuple))
    expectType<number | undefined>(byIndex(1, tuple))
    expectType<boolean | undefined>(byIndex(2, tuple))
    expectType<undefined>(byIndex(3, tuple))
}

// field with Object
{
    const obj = { a: 1, b: false }
    const objCell = cell(obj)

    expectType<FormulaCell<number>>(field('a', objCell))
    expectType<FormulaCell<boolean>>(field('b', objCell))
    expectAssignable<FormulaCell<boolean | number>>(field('a', objCell))
    expectAssignable<FormulaCell<boolean | number>>(field('b', objCell))

    // cannot pass unknown key
    expectError(field('x', objCell))
    expectError(field(1, objCell))
    expectError(field(Symbol('x'), objCell))
    expectError(field('x', obj))
    expectError(field(1, obj))
    expectError(field(Symbol('x'), obj))

    // cannot mix return types
    expectError<FormulaCell<boolean>>(field('a', objCell))
    expectError<FormulaCell<number>>(field('b', objCell))

    // can pass plain Object to `field` too
    expectType<number>(field('a', obj))
    expectType<boolean>(field('b', obj))
}

// field with string indexed Record
{
    const rec: Record<string, number | boolean> = { a: 1, b: false }
    const recCell = cell(rec)

    expectType<FormulaCell<number | boolean | undefined>>(field('a', recCell))
    expectType<FormulaCell<number | boolean | undefined>>(field('b', recCell))
    // Notice: non-existing key 'c'
    expectType<FormulaCell<number | boolean | undefined>>(field('c', recCell))

    // cannot pass key of wrong type
    expectError(field(Symbol('x'), recCell))
    expectError(field(1, recCell))

    // cannot expect specific type
    expectError<FormulaCell<number>>(field('a', recCell))
    expectError<FormulaCell<boolean>>(field('b', recCell))

    // can pass plain Record to `field` too
    expectType<number | boolean | undefined>(field('a', rec))
    expectType<number | boolean | undefined>(field('x', rec))
}

// field with number indexed Record
{
    const rec: Record<number, number | boolean> = { 1: 1, 2: false }
    const recCell = cell(rec)

    expectType<FormulaCell<number | boolean | undefined>>(field(1, recCell))
    expectType<FormulaCell<number | boolean | undefined>>(field(2, recCell))
    // Notice: non-existing key 3
    expectType<FormulaCell<number | boolean | undefined>>(field(3, recCell))

    // cannot pass key of wrong type
    expectError(field(Symbol('x'), recCell))
    expectError(field('a', recCell))
    expectError(field('1', recCell))

    // cannot expect specific type
    expectError<FormulaCell<number>>(field(1, recCell))
    expectError<FormulaCell<boolean>>(field(2, recCell))

    // can pass plain Record to `field` too
    expectType<number | boolean | undefined>(field(1, rec))
    expectType<number | boolean | undefined>(field(2, rec))
}

// field with symbol indexed Record
{
    const s1 = Symbol('a')
    const s2 = Symbol('b')
    const rec: Record<symbol, number | boolean> = { [s1]: 1, [s2]: false }
    const recCell = cell(rec)

    expectType<FormulaCell<number | boolean | undefined>>(field(s1, recCell))
    expectType<FormulaCell<number | boolean | undefined>>(field(s2, recCell))
    // Notice: non-existing key Symbol('c')
    expectType<FormulaCell<number | boolean | undefined>>(field(Symbol('c'), recCell))

    // cannot pass key of wrong type
    expectError(field(1, recCell))
    expectError(field('a', recCell))
    expectError(field('1', recCell))

    // cannot expect specific type
    expectError<FormulaCell<number>>(field(s1, recCell))
    expectError<FormulaCell<boolean>>(field(s2, recCell))

    // can pass plain Record to `field` too
    expectType<number | boolean | undefined>(field(s1, rec))
    expectType<number | boolean | undefined>(field(s2, rec))
}
