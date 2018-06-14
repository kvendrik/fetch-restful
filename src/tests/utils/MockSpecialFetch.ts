export type AbortWindow = Window & {
  AbortController: AbortController;
  AbortSignal: AbortSignal;
};

export default class MockSpecialFetch {
  private originals = {
    fetch: window.fetch,
    AbortController: (window as AbortWindow).AbortController,
  };

  restore() {
    window.fetch = this.originals.fetch;
    (window as AbortWindow).AbortController = this.originals.AbortController;
  }

  // eslint-disable-next-line class-methods-use-this
  failingFetch() {
    window.fetch = () =>
      new Promise(() => {
        throw new Error('Network request failed.');
      });
  }

  // eslint-disable-next-line class-methods-use-this
  abortableFetch() {
    let lastOptions: RequestInit = {};

    window.fetch = (_url, options) =>
      new Promise((_resolve, reject) => {
        const abortSignal = options!.signal;
        lastOptions = options!;

        abortSignal!.onabort = () =>
          reject(new Error('DOMException: The user aborted a request.'));
      });

    return {
      lastOptions() {
        return lastOptions;
      },
    };
  }
}
