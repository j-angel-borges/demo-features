/**
 * Zentry Commercial Demo Suite - Lightweight E2E Test Harness & Assertion Engine
 * Designed for pure Node/tsx execution with rich reporting, nested describe support,
 * hook inheritance, and zero external dependencies.
 */

export interface TestCase {
  id: string;
  name: string;
  suiteName: string;
  fn: () => void | Promise<void>;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  error?: Error;
  durationMs: number;
}

export interface TestSuite {
  name: string;
  parent: TestSuite | null;
  tests: TestCase[];
  beforeAllFns: Array<() => void | Promise<void>>;
  afterAllFns: Array<() => void | Promise<void>>;
  beforeEachFns: Array<() => void | Promise<void>>;
  afterEachFns: Array<() => void | Promise<void>>;
}

export interface TestRunReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  suites: {
    name: string;
    tests: {
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      durationMs: number;
      error?: string;
    }[];
  }[];
}

class TestRegistry {
  suites: Map<string, TestSuite> = new Map();
  currentSuite: TestSuite | null = null;
  globalBeforeEachFns: Array<() => void | Promise<void>> = [];
  globalAfterEachFns: Array<() => void | Promise<void>> = [];

  getOrCreateSuite(name: string, parent: TestSuite | null): TestSuite {
    const fullName = parent ? `${parent.name} > ${name}` : name;
    if (!this.suites.has(fullName)) {
      this.suites.set(fullName, {
        name: fullName,
        parent,
        tests: [],
        beforeAllFns: [],
        afterAllFns: [],
        beforeEachFns: [],
        afterEachFns: [],
      });
    }
    return this.suites.get(fullName)!;
  }

  reset() {
    this.suites.clear();
    this.currentSuite = null;
    this.globalBeforeEachFns = [];
    this.globalAfterEachFns = [];
  }
}

export const registry = new TestRegistry();

export function describe(name: string, fn: () => void) {
  const previousSuite = registry.currentSuite;
  const suite = registry.getOrCreateSuite(name, previousSuite);
  registry.currentSuite = suite;
  try {
    fn();
  } finally {
    registry.currentSuite = previousSuite;
  }
}

export function it(name: string, fn: () => void | Promise<void>) {
  if (!registry.currentSuite) {
    describe('Default Suite', () => {
      it(name, fn);
    });
    return;
  }
  const testId = `${registry.currentSuite.name} > ${name}`;
  registry.currentSuite.tests.push({
    id: testId,
    name,
    suiteName: registry.currentSuite.name,
    fn,
    status: 'pending',
    durationMs: 0,
  });
}

export const test = it;

export function beforeAll(fn: () => void | Promise<void>) {
  if (registry.currentSuite) {
    registry.currentSuite.beforeAllFns.push(fn);
  }
}

export function afterAll(fn: () => void | Promise<void>) {
  if (registry.currentSuite) {
    registry.currentSuite.afterAllFns.push(fn);
  }
}

export function beforeEach(fn: () => void | Promise<void>) {
  if (registry.currentSuite) {
    registry.currentSuite.beforeEachFns.push(fn);
  } else {
    registry.globalBeforeEachFns.push(fn);
  }
}

export function afterEach(fn: () => void | Promise<void>) {
  if (registry.currentSuite) {
    registry.currentSuite.afterEachFns.push(fn);
  } else {
    registry.globalAfterEachFns.push(fn);
  }
}

// ---------------------------------------------------------------------------
// Matchers & Expectations
// ---------------------------------------------------------------------------

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== 'object') return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect(actual: any) {
  let isNot = false;

  const matchers = {
    get not() {
      isNot = !isNot;
      return matchers;
    },

    toBe(expected: any) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} ${isNot ? 'not to be' : 'to be'} ${JSON.stringify(expected)}`
        );
      }
    },

    toEqual(expected: any) {
      const pass = deepEqual(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} ${isNot ? 'not to equal' : 'to equal'} ${JSON.stringify(expected)}`
        );
      }
    },

    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be truthy' : 'to be truthy'}`);
      }
    },

    toBeFalsy() {
      const pass = !actual;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be falsy' : 'to be falsy'}`);
      }
    },

    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'to be undefined' : 'to be defined'}`);
      }
    },

    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be undefined' : 'to be undefined'}`);
      }
    },

    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be null' : 'to be null'}`);
      }
    },

    toBeGreaterThan(expected: number) {
      const pass = typeof actual === 'number' && actual > expected;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be >' : 'to be >'} ${expected}`);
      }
    },

    toBeGreaterThanOrEqual(expected: number) {
      const pass = typeof actual === 'number' && actual >= expected;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be >=' : 'to be >='} ${expected}`);
      }
    },

    toBeLessThan(expected: number) {
      const pass = typeof actual === 'number' && actual < expected;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be <' : 'to be <'} ${expected}`);
      }
    },

    toBeLessThanOrEqual(expected: number) {
      const pass = typeof actual === 'number' && actual <= expected;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be <=' : 'to be <='} ${expected}`);
      }
    },

    toBeCloseTo(expected: number, precision: number = 2) {
      const pass = Math.abs(actual - expected) < Math.pow(10, -precision) / 2;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'not to be close to' : 'to be close to'} ${expected} with precision ${precision}`);
      }
    },

    toContain(item: any) {
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(String(item));
      } else if (Array.isArray(actual)) {
        pass = actual.some(x => deepEqual(x, item));
      } else if (actual instanceof Set || actual instanceof Map) {
        pass = actual.has(item);
      }
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected collection ${isNot ? 'not to contain' : 'to contain'} ${JSON.stringify(item)}`);
      }
    },

    toHaveLength(expected: number) {
      const pass = actual != null && typeof actual.length === 'number' && actual.length === expected;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected length ${isNot ? 'not to be' : 'to be'} ${expected}, got ${actual?.length}`);
      }
    },

    toMatch(pattern: RegExp | string) {
      const reg = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      const pass = typeof actual === 'string' && reg.test(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected "${actual}" ${isNot ? 'not to match' : 'to match'} ${pattern}`);
      }
    },

    toThrow(expectedMessage?: string | RegExp) {
      let threw = false;
      let error: any = null;
      if (typeof actual !== 'function') {
        throw new AssertionError('Expected a function to test toThrow()');
      }
      try {
        actual();
      } catch (err) {
        threw = true;
        error = err;
      }
      if (!threw && !isNot) {
        throw new AssertionError('Expected function to throw an error, but it did not throw');
      }
      if (threw && isNot) {
        throw new AssertionError(`Expected function not to throw, but it threw: ${error?.message || error}`);
      }
      if (threw && !isNot && expectedMessage) {
        const msg = error?.message || String(error);
        if (typeof expectedMessage === 'string' && !msg.includes(expectedMessage)) {
          throw new AssertionError(`Expected error message to contain "${expectedMessage}", got "${msg}"`);
        }
        if (expectedMessage instanceof RegExp && !expectedMessage.test(msg)) {
          throw new AssertionError(`Expected error message to match ${expectedMessage}, got "${msg}"`);
        }
      }
    },
  };

  return matchers;
}

// ---------------------------------------------------------------------------
// Test Execution Runner with Inherited Hooks
// ---------------------------------------------------------------------------

function collectBeforeEachFns(suite: TestSuite): Array<() => void | Promise<void>> {
  const fns: Array<() => void | Promise<void>> = [];
  let current: TestSuite | null = suite;
  while (current) {
    fns.unshift(...current.beforeEachFns);
    current = current.parent;
  }
  return [...registry.globalBeforeEachFns, ...fns];
}

function collectAfterEachFns(suite: TestSuite): Array<() => void | Promise<void>> {
  const fns: Array<() => void | Promise<void>> = [];
  let current: TestSuite | null = suite;
  while (current) {
    fns.push(...current.afterEachFns);
    current = current.parent;
  }
  return [...fns, ...registry.globalAfterEachFns];
}

export async function runAllSuites(): Promise<TestRunReport> {
  const startTime = Date.now();
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const suitesReport: TestRunReport['suites'] = [];

  for (const suite of registry.suites.values()) {
    if (suite.tests.length === 0) continue;

    const suiteReportTests: TestRunReport['suites'][0]['tests'] = [];
    const beforeEachList = collectBeforeEachFns(suite);
    const afterEachList = collectAfterEachFns(suite);

    // Run beforeAll
    for (const fn of suite.beforeAllFns) {
      await fn();
    }

    for (const testCase of suite.tests) {
      total++;
      const testStart = Date.now();

      // Run beforeEach hierarchy
      for (const fn of beforeEachList) {
        await fn();
      }

      try {
        await testCase.fn();
        testCase.status = 'passed';
        testCase.durationMs = Date.now() - testStart;
        passed++;
        suiteReportTests.push({
          name: testCase.name,
          status: 'passed',
          durationMs: testCase.durationMs,
        });
      } catch (err: any) {
        testCase.status = 'failed';
        testCase.error = err;
        testCase.durationMs = Date.now() - testStart;
        failed++;
        suiteReportTests.push({
          name: testCase.name,
          status: 'failed',
          durationMs: testCase.durationMs,
          error: err?.stack || err?.message || String(err),
        });
      }

      // Run afterEach hierarchy
      for (const fn of afterEachList) {
        await fn();
      }
    }

    // Run afterAll
    for (const fn of suite.afterAllFns) {
      await fn();
    }

    suitesReport.push({
      name: suite.name,
      tests: suiteReportTests,
    });
  }

  return {
    total,
    passed,
    failed,
    skipped,
    durationMs: Date.now() - startTime,
    suites: suitesReport,
  };
}
