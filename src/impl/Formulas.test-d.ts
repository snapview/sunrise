import { expectError, expectNotType, expectType, expectAssignable } from 'tsd'
import {
    FormulaCell,
    Cell,
    SourceCell,
    cell,
    map,
    not,
    toBool,
    byIndex,
    field,
} from '../index'

// not
{
    const boolCell = cell(false)
    const formulaCell = map((x) => (x === true ? false : true), boolCell)
    const justBool = map((x) => (x === true ? false : true), false)

    // since `not` is a formula, we expect `FormulaCell` as return type
    expectType<FormulaCell<boolean>>(not(boolCell))
    expectType<FormulaCell<boolean>>(not(formulaCell))

    // cannot pass plain boolean to `not`
    expectError(not(justBool))
    expectError(not(false))
}

// toBool
{
    const boolCell = cell(false)
    const formulaCell = map((x) => (x === true ? false : true), boolCell)
    const justBool = map((x) => (x === true ? false : true), false)

    // since `toBool` is a formula, we expect `FormulaCell` as return type
    expectType<FormulaCell<boolean>>(toBool(boolCell))
    expectType<FormulaCell<boolean>>(toBool(formulaCell))

    // cannot pass plain boolean to `toBool`
    expectError(toBool(justBool))
    expectError(toBool(false))
}

// byIndex
{
    const charArr = ['a', 'b', 'c']
    const charArrCell = cell(charArr)

    expectType<FormulaCell<string | undefined>>(byIndex(1, charArrCell))
    expectType<FormulaCell<string | undefined>>(byIndex(5, charArrCell))

    // cannot pass plain Array to `byIndex`
    expectError(byIndex(1, charArr))
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

    // cannot mix return types
    expectError<FormulaCell<boolean>>(field('a', objCell))
    expectError<FormulaCell<number>>(field('b', objCell))

    // cannot pass plain Object to `field`
    expectError(field('a', obj))
    expectError(field('x', obj))
}

// field with Record
{
    // Record
    const rec: Record<string, number | boolean> = { a: 1, b: false }
    const recCell = cell(rec)

    expectType<FormulaCell<boolean | number>>(field('a', recCell))
    expectType<FormulaCell<boolean | number>>(field('b', recCell))

    // can pass not-existing key of correct type
    expectAssignable<FormulaCell<boolean | number | undefined>>(
        field('x', recCell)
    )

    // cannot pass key of wrong type
    expectError(field(Symbol('x'), recCell))
    expectError(field(1, recCell))
    expectError<FormulaCell<number>>(field('a', recCell))
    expectError<FormulaCell<boolean>>(field('b', recCell))

    // cannot mix return types
    expectError<FormulaCell<boolean>>(field('a', recCell))
    expectError<FormulaCell<number>>(field('b', recCell))

    // cannot pass plain Object to `field`
    expectError(field('a', rec))
    expectError(field('x', rec))
}
