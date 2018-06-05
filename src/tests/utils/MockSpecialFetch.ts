type AbortWindow = Window & {
  AbortController: AbortController;
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

    window.fetch = (url, options = {}) =>
      new Promise((resolve, reject) => {
        const abortSignal = options.signal;

        if (!abortSignal) {
          reject(new Error('No signal given.'));
          return;
        }

        lastOptions = options;

        abortSignal.onabort = () =>
          reject(new Error('DOMException: The user aborted a request.'));
      });

    return {
      lastOptions() {
        return lastOptions;
      },
    };
  }
}
