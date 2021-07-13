export const inc = (x: number) => x + 1
export const sum = (...nums: number[]) =>
    nums.reduce((x: number, y: number) => x + y, 0)
export const identity = <T>(x: T) => x
export const negate = (x: boolean) => !x

export function mockFn<T>(fn: (...oldVals: T[]) => T) {
    let counter = 0
    const map: Map<number, () => void> = new Map()

    const result = (...oldVals: T[]) => {
        counter++
        const resolve = map.get(counter)
        if (resolve) resolve()
        map.delete(counter)
        return fn(...oldVals)
    }

    result.expectToBeCalledTimes = (times: number) => {
        if (times === counter) return Promise.resolve()
        if (counter > times)
            return Promise.reject(
                `Called ${counter} times, expected to be called ${times} times`
            )
        const promise = new Promise((resolve) =>
            map.set(times, resolve as () => void)
        )
        return promise
    }

    return result
}
