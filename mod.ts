import * as path from 'https://deno.land/x/fs/path/mod.ts';

// to suppress error
const fileName: string = 'no_file_name';

export type TestFunc = (t: T) => void | Promise<void>;

const consoleLogIndentWidth = 4;

function indentedConsoleLog(level: number, ...values: any) {
  const baseLevel = console.indentLevel;
  console.indentLevel = level * consoleLogIndentWidth;
  console.log(...values);
  console.indentLevel = baseLevel;
}

interface common {
  ran: boolean; // Test was executed.
  failed: boolean; // Test has failed.
  skipped: boolean; // Test has been skipped.
  done: boolean; // Test is finished and all subtests have completed.

  finished: boolean; // Test function has completed.
  hasSub: boolean; // Test has sub test.
  runner: string; // function name of tRunner running the test

  parent: common;
  level: number; // Nesting depth of test.
  name: string; // Name of test.
  start: Date; // Time test has started.
  duration: number;
  sub: Array<T>; // Queue of subtests.
}

export interface T {
  common;
  run(name: string, func: TestFunc);
  error(...values: any);
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
      indentedConsoleLog(this.level + 1, fileName + ': ', value);
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
    indentedConsoleLog(this.level, '--- FAIL: ' + this.name);
  }
}

export function generateTestSrc(filePath: string): string {
  return `
import * as tests from '${filePath}';
const filePath = '${filePath}';
const fileName = '${path.basename(filePath)}';

export type TestFunc = (t: T) => void | Promise<void>;

const consoleLogIndentWidth = 4;

function indentedConsoleLog(level: number, ...values: any) {
  const baseLevel = console.indentLevel;
  console.indentLevel = level * consoleLogIndentWidth;
  console.log(...values);
  console.indentLevel = baseLevel;
}

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
      indentedConsoleLog(this.level + 1, fileName + ': ', value);
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
    indentedConsoleLog(this.level, '--- FAIL: ' + this.name);
  }
}

let hasError = false;

for (const [testName, testFunc] of Object.entries(tests)) {
  const t = new tImpl(testName, 0, null);
  testFunc(t);
  hasError = hasError || t.hasError;
}

if (hasError) {
  console.log('FAIL');
  console.log('FAIL ' + filePath);
}
  `;
}
