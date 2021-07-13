# Sunrise

Spreadsheet-like dataflow programming in TypeScript

### Example

```typescript
import { cell, formula, swap, deref } from 'sunrise'

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
-   Implement the `Derefencable` interface and can be dereferenced via `deref` function
-   Implement the `Destroyable` interface and can be destroyed via `destroy` function
-   Implement the `Subscribable` interface and can be subscribed via `subscribe` function
    and unsubscribed via `unsubscribe` function

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

In case you don't need a cell anymore, the cell can be destroyed with `destroy` function.
Be carefull because destroying the cell will also destroy all the dependent cells as well.
After destruction any operation on a cell is illegal and throw the `OperationOnDestroyedCellError`

```typescript
const x = cell<number>(1)
const y = formula((a) => a + 1, x)
destroy(x) // both x and y are destroyed now
```
