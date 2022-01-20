export const inc = (x: number) => x + 1
export const sum = (...nums: number[]) =>
    nums.reduce((x: number, y: number) => x + y, 0)
export const identity = <T>(x: T) => x
export const negate = (x: boolean) => !x
