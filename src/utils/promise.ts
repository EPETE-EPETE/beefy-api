import { sleep } from './time';
import { ABORT_REASON_TIMEOUT } from './http/helpers';

export type DeferredPromise<T> = Promise<T> & {
  resolve: (value: T) => void;
  reject: (error: any) => void;
};

export function deferred<T>(): DeferredPromise<T> {
  let resolve: (value: T) => void;
  let reject: (error: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  }) as DeferredPromise<T>;

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}

export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Promise timed out')), timeout);
    promise.then(
      value => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export const retryPromiseWithBackOff = async <T>(
  f: (...args: any[]) => Promise<T>,
  args: any[] | undefined,
  label: string,
  nthTry = 1,
  delayTime: number = 200,
  maxTries: number = 5
): Promise<T> => {
  try {
    return args ? await f(args) : await f();
  } catch (e) {
    if (nthTry > maxTries) {
      return Promise.reject(e);
    }
    console.log(`retrying [${label}]: ${nthTry}/${maxTries}, awaiting ${2 ** (nthTry + 1) * delayTime}`);

    await sleep(2 ** (nthTry + 1) * delayTime);
    return retryPromiseWithBackOff(f, args, label, nthTry + 1, delayTime, maxTries);
  }
};

export function isResultFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isResultRejected<T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

type PromiseContextFulfilledResult<TContext, TResult> = PromiseFulfilledResult<TResult> & {
  context: TContext;
  elapsed: number;
};
type PromiseContextRejectedResult<TContext> = PromiseRejectedResult & { context: TContext };
type PromiseContextResult<TContext, TResult> =
  | PromiseContextFulfilledResult<TContext, TResult>
  | PromiseContextRejectedResult<TContext>;

export function contextAllSettled<TContext, TResult>(
  contexts: TContext[],
  mapper: (context: TContext) => Promise<TResult>
): Promise<Array<PromiseContextResult<TContext, TResult>>> {
  return Promise.all(
    contexts.map(async context => {
      const start = Date.now();
      try {
        const value = await mapper(context);
        return { status: 'fulfilled', value, context, elapsed: Date.now() - start };
      } catch (reason) {
        return { status: 'rejected', reason, context, elapsed: Date.now() - start };
      }
    })
  );
}

export function isContextResultFulfilled<TContext, TResult>(
  result: PromiseContextResult<TContext, TResult>
): result is PromiseContextFulfilledResult<TContext, TResult> {
  return result.status === 'fulfilled';
}

export function isContextResultRejected<TContext, TResult>(
  result: PromiseContextResult<TContext, TResult>
): result is PromiseContextRejectedResult<TContext> {
  return result.status === 'rejected';
}

export function getTimeoutAbortSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(ABORT_REASON_TIMEOUT), timeout);
  return controller.signal;
}

export class AsyncLock {
  private resolveFn: () => void;
  private lockPromise: Promise<void>;

  constructor() {
    this.resolveFn = () => {};
    this.lockPromise = Promise.resolve();
  }

  private async lock() {
    await this.lockPromise;
    this.lockPromise = new Promise(resolve => (this.resolveFn = resolve));
  }

  private unlock() {
    this.resolveFn();
  }

  async acquire<T>(callback: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await callback();
    } finally {
      this.unlock();
    }
  }

  static acquireAll<T>(locks: AsyncLock[], callback: () => Promise<T>): Promise<T> {
    if (locks.length === 0) {
      return callback();
    }
    if (locks.length === 1) {
      return locks[0].acquire(callback);
    }
    return locks[0].acquire(() => AsyncLock.acquireAll(locks.slice(1), callback));
  }
}
