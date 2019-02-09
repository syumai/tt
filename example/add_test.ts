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
