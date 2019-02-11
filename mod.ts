import * as path from 'https://deno.land/x/fs/path/mod.ts';

// to supress error
const fileName: string = 'no_file_name';

export type TestFunc = (t: T) => void | Promise<void>;

export type TError = any;

export interface T {
  name: string;
  parent: T;
  run(name: string, func: TestFunc);
  error(...values: any);
  hasError: boolean;
  markAsError();
}

class tImpl {
  constructor(
    private readonly _name,
    private readonly level,
    readonly parent: T
  ) {}

  private _hasError: boolean;

  get name(): string {
    if (!this.parent) {
      return this._name;
    }
    return this.parent.name + '/' + this._name;
  }

  run(name: string, func: TestFunc) {
    name = name.replace(/ /g, '_');
    const t = new tImpl(name, this.level + 1, this);
    func(t);
  }

  error(...values: any) {
    this.markAsError();
    for (const value of values) {
      this.indentedConsoleLog(fileName + ': ', value);
    }
  }

  get hasError(): boolean {
    return this._hasError;
  }

  markAsError() {
    if (this.hasError) {
      return;
    }
    this._hasError = true;
    if (this.parent) {
      this.parent.markAsError();
    }
    this.indentedConsoleLog('- FAIL: ' + this.name);
  }

  indentedConsoleLog(...values: any) {
    console.indentLevel = this.level;
    console.log(...values);
    console.indentLevel = 0;
  }
}

export function generateTestSrc(filePath: string): string {
  return `
import * as tests from '${filePath}';
const fileName = '${path.basename(filePath)}';

export type TestFunc = (t: T) => void | Promise<void>;

export interface T {
  name: string;
  parent: T;
  run(name: string, func: TestFunc);
  error(...values: any);
  hasError: boolean;
  markAsError();
}

class tImpl {
  constructor(
    private readonly _name,
    private readonly level,
    readonly parent: T
  ) {}

  private _hasError: boolean;

  get name(): string {
    if (!this.parent) {
      return this._name;
    }
    return this.parent.name + '/' + this._name;
  }

  run(name: string, func: TestFunc) {
    name = name.replace(/ /g, '_');
    const t = new tImpl(name, this.level + 1, this);
    func(t);
  }

  error(...values: any) {
    this.markAsError();
    for (const value of values) {
      this.indentedConsoleLog(fileName + ': ', value);
    }
  }

  get hasError(): boolean {
    return this._hasError;
  }

  markAsError() {
    if (this.hasError) {
      return;
    }
    this._hasError = true;
    if (this.parent) {
      this.parent.markAsError();
    }
    this.indentedConsoleLog('- FAIL: ' + this.name);
  }

  indentedConsoleLog(...values: any) {
    console.indentLevel = this.level;
    console.log(...values);
    console.indentLevel = 0;
  }
}

for (const [testName, testFunc] of Object.entries(tests)) {
  const t = new tImpl(testName, 0, null);
  testFunc(t);
}
  `;
}
