import { expectError, expectNotType, expectType, expectAssignable } from 'tsd'
import { FormulaCell, Cell, SourceCell, cell, map } from '../index'

// formula with one input
{
    const numberCell = cell(1)
    const formulaCell = map((x) => x + 1, numberCell)
    const justNumber = map((x) => x + 1, 1)

    expectType<SourceCell<number>>(numberCell)

    expectType<FormulaCell<number>>(formulaCell)
    expectNotType<number>(formulaCell)

    expectType<number>(justNumber)
    expectNotType<FormulaCell<number>>(justNumber)

    expectError(map((x: string) => x.toUpperCase(), numberCell))
    expectError(map((x) => x.toUpperCase(), numberCell))
}

// formula with multiple input
{
    // values
    const numberCell = cell(1)
    const formulaNumberCell = map((x) => x + 1, numberCell)
    const justNumber = 1

    const stringCell = cell('a')
    const formulaStringCell = map((x) => x.toUpperCase(), stringCell)
    const justString = 'a'

    // functions passed to map
    const mapFn = (
        n1: number,
        n2: number,
        n3: number,
        s1: string,
        s2: string,
        s3: string
    ) =>
        [
            Math.round(n1) + Math.round(n2) + Math.round(n3),
            s1.toUpperCase() + s2.toUpperCase() + s3.toUpperCase(),
        ] as const
    const badMapFnNumber = (
        n1: number,
        n2: number,
        n3: boolean,
        s1: string,
        s2: string,
        s3: string
    ) =>
        [
            Math.round(n1) + Math.round(n2) + (n3 ? 1 : 2),
            s1.toUpperCase() + s2.toUpperCase() + s3.toUpperCase(),
        ] as const
    const badMapFnString = (
        n1: number,
        n2: number,
        n3: number,
        s1: string,
        s2: string,
        s3: boolean
    ) =>
        [
            Math.round(n1) + Math.round(n2) + Math.round(n3),
            s1.toUpperCase() + s2.toUpperCase() + (s3 ? 'true' : 'false'),
        ] as const

    // return values of map
    const mixedInput = map(
        mapFn,
        numberCell,
        formulaNumberCell,
        justNumber,
        stringCell,
        formulaStringCell,
        justString
    )
    const allFormulaInput = map(
        mapFn,
        formulaNumberCell,
        formulaNumberCell,
        formulaNumberCell,
        formulaStringCell,
        formulaStringCell,
        formulaStringCell
    )
    const allCellInput = map(
        mapFn,
        numberCell,
        numberCell,
        numberCell,
        stringCell,
        stringCell,
        stringCell
    )
    const allRawInput = map(
        mapFn,
        justNumber,
        justNumber,
        justNumber,
        justString,
        justString,
        justString
    )

    // tests
    expectType<FormulaCell<readonly [number, string]>>(mixedInput)
    expectType<FormulaCell<readonly [number, string]>>(allFormulaInput)
    expectType<FormulaCell<readonly [number, string]>>(allCellInput)
    expectType<readonly [number, string]>(allRawInput)

    expectNotType<readonly [number, string]>(mixedInput)
    expectNotType<readonly [number, string]>(allFormulaInput)
    expectNotType<readonly [number, string]>(allCellInput)
    expectNotType<FormulaCell<readonly [number, string]>>(allRawInput)

    expectError(
        map(
            badMapFnNumber,
            numberCell,
            formulaNumberCell,
            justNumber,
            stringCell,
            formulaStringCell,
            justString
        )
    )
    expectError(
        map(
            badMapFnString,
            numberCell,
            formulaNumberCell,
            justNumber,
            stringCell,
            formulaStringCell,
            justString
        )
    )
}
