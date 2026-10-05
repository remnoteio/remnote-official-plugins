const assert = require('node:assert/strict');
const { test } = require('node:test');
const React = require('react');
const { act, create } = require('react-test-renderer');
const { useFetch } = require('../src/hooks/useFetch.ts');

function renderLookup(t, url) {
  let state;
  function Lookup({ url }) {
    state = useFetch(url, null);
    return React.createElement(
      'div',
      null,
      state.isLoading
        ? 'Loading'
        : state.isError
          ? 'Error'
          : JSON.stringify(state.response),
    );
  }
  let root;
  act(() => {
    root = create(React.createElement(Lookup, { url }));
  });
  t.after(() => {
    act(() => root.unmount());
  });
  return {
    get state() {
      return state;
    },
    get text() {
      return root.toJSON().children[0];
    },
    select(url) {
      act(() => root.update(React.createElement(Lookup, { url })));
    },
  };
}

const flush = () => act(async () => {});

for (const failure of ['network', 'invalid JSON']) {
  test(`${failure} failure ends loading and reports the error`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      if (failure === 'network') throw new TypeError('Failed to fetch');
      return {
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected JSON');
        },
      };
    });
    const lookup = renderLookup(t, '/peculiarity');
    await flush();
    assert.equal(lookup.text, 'Error');
    assert.equal(
      lookup.state.errorMessage,
      failure === 'network' ? 'Failed to fetch' : 'Unexpected JSON',
    );
  });
}

test('a stalled request times out instead of leaving the spinner open', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(
    globalThis,
    'fetch',
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  const lookup = renderLookup(t, '/peculiarity');
  assert.equal(lookup.text, 'Loading');
  await act(async () => t.mock.timers.tick(10_000));
  assert.equal(lookup.text, 'Error');
  assert.equal(lookup.state.errorMessage, 'Dictionary lookup timed out.');
});

test('a successful lookup after a failure shows the new definition', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === '/peculiarity') throw new TypeError('Failed to fetch');
    return { ok: true, json: async () => [{ word: 'peculiar' }] };
  });
  const lookup = renderLookup(t, '/peculiarity');
  await flush();
  lookup.select('/peculiar');
  await flush();
  assert.equal(lookup.text, '[{"word":"peculiar"}]');
  assert.equal(lookup.state.isError, false);
});

test('a missing word keeps the provider response for the no-definition view', async (t) => {
  const response = { title: 'No Definitions Found' };
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 404,
    json: async () => response,
  }));
  const lookup = renderLookup(t, '/unknown');
  await flush();
  assert.equal(lookup.text, JSON.stringify(response));
  assert.equal(lookup.state.isError, false);
});

test('an HTTP server failure reports an error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 503,
    statusText: 'Service Unavailable',
    json: async () => ({ message: 'Service Unavailable' }),
  }));
  const lookup = renderLookup(t, '/peculiarity');
  await flush();
  assert.equal(lookup.text, 'Error');
  assert.match(lookup.state.errorMessage, /503.*Service Unavailable/);
});

test('an older response cannot replace the newly selected word', async (t) => {
  let finishOld;
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === '/peculiarity')
      return new Promise((resolve) => {
        finishOld = resolve;
      });
    return { ok: true, json: async () => [{ word: 'peculiar' }] };
  });
  const lookup = renderLookup(t, '/peculiarity');
  lookup.select('/peculiar');
  await flush();
  await act(async () =>
    finishOld({ ok: true, json: async () => [{ word: 'peculiarity' }] }),
  );
  assert.equal(lookup.text, '[{"word":"peculiar"}]');
});

test('clearing the selection ends loading and ignores the cancelled request', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  const lookup = renderLookup(t, '/peculiarity');
  lookup.select(null);
  await flush();
  assert.equal(lookup.text, 'null');
  assert.equal(lookup.state.isError, false);
});
