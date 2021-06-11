export function hasMethods<T>(val: any, methods: (keyof T)[]): val is T {
    return val instanceof Object && methods.every((method) => method in val)
}
