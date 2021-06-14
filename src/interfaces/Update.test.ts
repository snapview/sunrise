import { Updatable, reset, swap } from './Update'

describe('Update', () => {
    test('reset function should trigger the reset method', () => {
        const x: Updatable<number> = {
            reset: jest.fn((_: number) => {}),
            swap: (_: (oldVal: number) => 1) => {},
        }
        reset(2, x)
        expect(x.reset).toBeCalled()
    })

    test('reset function should trigger the reset method', () => {
        const x: Updatable<number> = {
            reset: (_: number) => {},
            swap: jest.fn((_: (oldVal: number) => 1) => {}),
        }
        swap((x) => x + 1, x)
        expect(x.swap).toBeCalled()
    })
})
