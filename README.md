# Sunrise

Spreadsheet-like dataflow programming in TypeScript

### Example

```typescript
import { cell, formula, swap, deref } from '@snapview/sunrise'

const inc = (a) => a + 1

// Source Cell with initial value 1
const x = cell<number>(1)
// Formula Cell created by incrementing the source cell
const y = formula(inc, x)
// Formula Cell without any value, but with side effect
const printCell = formula(console.log, y)
// Swapping the value of initial source cell
swap(inc, x)

deref(x) // 2
deref(y) // 3, this value is already printed to console because of printCell
```

## Overview

Sunrise provides a spreadsheet-like computing environment consisting
of **source cells** and **formula cells** and introduces the `Cell`
interface to represent both

### All Cells

-   Contain values
-   Implement the `Dereferencable` interface and their value can be extracted via the `deref` function
-   Implement the `Destroyable` interface and can be destroyed via the `destroy` function
-   Implement the `Subscribable` interface and can be subscribed via the `subscribe` function
    and unsubscribed via the `unsubscribe` function

### Source Cells

The source cell is just a container including a value of arbitrary type. To construct
the source cell the `cell` function should be used

```typescript
const a = cell<number>(1) // a cell of number
const b = cell<string>('hello') // a cell of string
const c = cell({ x: 1, y: 2 }) // an object cell
const d = cell<string | undefined>(undefined) // a cell that can be either string or undefined
```

To receive the current value of a cell the `deref` function is used. Unlike many other
reactive libraries in **Sunrise** this is considered to be a totally valid operation.
A cell is not a stream or any other magic thing, it's just a box with a value inside

```typescript
deref(a) // 1
deref(b) // 'hello'
deref(c) // { x: 1, y: 2 }
deref(d) // undefined
```

There are two ways to change a value inside a cell `reset` and `swap`. `reset` just
sets a new value to and `swap` accepts a function from old value to new value, applies
it and swap the cell to the new value

```typescript
const a = cell<number>(1)
reset(2, a)
deref(a) // 2
swap((x) => x + 1)
deref(a) // 3
```

`reset` and `swap` are async operations, the new value will be set not immediately, but
they implement the [Software Transaction Memory](https://en.wikipedia.org/wiki/Software_transactional_memory)
and they are always consistent.

In case you don't need a cell anymore, the cell can be destroyed with the `destroy` function.
Be careful because destroying the cell will also destroy all the dependent cells as well.
After the destruction, any operation on a cell is illegal, and throw the `OperationOnDestroyedCellError`

```typescript
const x = cell<number>(1)
const y = formula((a) => a + 1, x)
destroy(x) // both x and y are destroyed now
```

### Formula Cells

A formula cell is a sort of materialized view of a function. You can look at it as a cell with a formula inside in some table processor program. To create a formula cell
you need a formula (function) and an arbitrary number of source cells as an input

```typescript
const a = cell<number>(1)
const b = formula((x) => x + 1, a) // now b is always an increment of a
deref(b) // 2
reset(5, a)
deref(b) // 6
```

You can also use simple values as input to `formula` instead of cells. This might be
quite handy when you don't know if the input is a cell or just a value

```typescript
const x = cell<number>(1)
const y = cell<number>(2)
const z: number = 3

const sum = formula((a, b, c) => a + b + c, x, y, z)
deref(sum) // 6
reset(5, x)
deref(sum) // 10
```

#### Predefined formula cells

There are quite some formula cells predefined for faster cell generations

##### Object's field

To extract one field from an object you can use the `field` function

```typescript
const x = cell({ a: 1, b: 2 })
const fld = field('a', x)
deref(fld) // 1
swap((x) => ({ ...x, a: 2 }), x)
deref(fld) // 2
```

##### An element of an array

To extract an element from an array by index you can use the `byIndex` function.
The type of the result is `Cell<T | undefined>` because it's not guaranteed
that the element is presented

```typescript
const x = cell(['a', 'b', 'c'])
const el = byIndex(1, x)
deref(el) // 'b'
swap((x) => ['z', ...x], x)
deref(el) // 'a'
```

##### Convert to boolean

To check that an element is truthy you can use the `toBool` function.

```typescript
const x = cell(1)
deref(toBool(x)) // true
const y = cell<string | undefined>(undefined)
deref(toBool(y)) // false
```

##### Negation

```typescript
const x = cell<boolean>(true)
deref(not(x)) // false
const y = cell(1)
deref(not(y)) // false
```

##### History

In some cases, it's useful to have both the old cell's value and the new one.
For this purpose, `history` can be used. It serves a tuple with the old and new
values inside. Be aware, initially, the old value is `undefined`

```typescript
const x = cell<number>(1)
const hist = history(x)
deref(hist) // [1, undefined]
reset(2, x)
deref(hist) // [2, 1]
```

## License

Sunrise is [MIT licensed](./LICENSE.md).
