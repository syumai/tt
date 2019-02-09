# tt

- tt is a test runner for deno.
- This module is based on `go test`.

## Status

- WIP

## Usage

- example/add_test.ts

```ts
import { T } from '../mod.ts';
import { add } from './add.ts';

export function testAdd(t: T) {
  t.run('1 + 1 must be 2', t => {
    const want = 2;
    const got = add(1, 1);
    if (want !== got) {
      t.error(`want: ${want}, got: ${got}`);
    }
  });

  t.run('1 + 2 must be 3', t => {
    const want = 3;
    const got = add(1, 2);
    if (want !== got) {
      t.error(`want: ${want}, got: ${got}`);
    }
  });
}
```

```sh
$ cd example
$ tt
  - FAIL: testAdd/1_+_1_must_be_2
    add_test.ts:  want: 2, got: 0
  - FAIL: testAdd/1_+_2_must_be_3
    add_test.ts:  want: 3, got: -1
```
