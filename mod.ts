import * as path from 'https://deno.land/x/fs/path/mod.ts';

// to supress error
const fileName: string = '';

export type TestFunc = (t: T) => void | Promise<void>;

export interface T {
  name: string;
  parent: T;
  run(name: string, func: TestFunc);
  error(...values: any);
}

class tImpl {
  constructor(private readonly _name, readonly parent: T) {}

  get name(): string {
    if (!this.parent) {
      return this._name;
    }
    return this.parent.name + '/' + this._name;
  }

  run(name: string, func: TestFunc) {
    name = name.replace(/ /g, '_');
    console.group();
    func(new tImpl(name, this));
    console.groupEnd();
  }

  error(...values: any) {
    console.log('- FAIL: ' + this.name);
    console.group();
    for (const value of values) {
      console.log(fileName + ': ', value);
    }
    console.groupEnd();
  }
}

export function generateTestSrc(filePath: string): string {
  return `
import * as tests from '${filePath}';
const fileName = '${path.basename(filePath)}';

export type TestFunc = (t: T) => void | Promise<void>;

export interface T {
  parent: T;
  name: string;
  run(name: string, func: TestFunc);
  error(...values: any);
}

class tImpl {
  constructor(private readonly _name, readonly parent: T) {}

  get name(): string {
    if (!this.parent) {
      return this._name;
    }
    return this.parent.name + '/' + this._name;
  }

  run(name: string, func: TestFunc) {
    name = name.replace(/ /g, '_');
    console.group();
    func(new tImpl(name, this));
    console.groupEnd();
  }

  error(...values: any) {
    console.log('- FAIL: ' + this.name);
    console.group();
    for (const value of values) {
      console.log(fileName + ': ', value);
    }
    console.groupEnd();
  }
}

for (const [testName, testFunc] of Object.entries(tests)) {
  const t = new tImpl(testName, null);
  testFunc(t);
}
  `;
}
