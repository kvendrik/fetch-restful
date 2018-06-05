# FetchREST(ful)

[![CircleCI](https://circleci.com/gh/kvendrik/fetch-restful.svg?style=svg)](https://circleci.com/gh/kvendrik/fetch-restful)
[![Coverage Status](https://coveralls.io/repos/github/kvendrik/fetch-restful/badge.svg?branch=master&q=261781)](https://coveralls.io/github/kvendrik/fetch-restful?branch=master&q=261781)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 A wrapper around fetch for REST API dependent projects.

## Installation

```
yarn add fetch-restful
```

## Usage

### Constructor

```ts
const request = new FetchREST(
  GlobalRequestOptions | GlobalRequestOptionsGetter,
);
```

* [`GlobalRequestOptions`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L21) - request options that will be used as the defaults for every outgoing request.
* [`GlobalRequestOptionsGetter`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L24) - a method that returns a `GlobalRequestOptions` object.

### Request methods.

```ts
await request.get('/users', QueryObject, RequestOptions | RequestOptionsGetter);
await request.post('/users', Payload, RequestOptions | RequestOptionsGetter);
await request.patch('/users', Payload, RequestOptions | RequestOptionsGetter);
await request.put('/users', Payload, RequestOptions | RequestOptionsGetter);
await request.delete('/users', Payload, RequestOptions | RequestOptionsGetter);
```

* [`QueryObject`](https://github.com/kvendrik/fetch-restful/blob/master/src/queryObjectToString.ts#L3) - object with query parameters to use.
* [`Payload`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L4) - your request payload.
* [`RequestOptions`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L14) - request options that will be merged with your global request options.
* [`RequestOptionsGetter`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L19) - a method that returns a `RequestOptions` object.

### Middleware

Use the middleware method to define a function that will be added to the promise chain for all outgoing requests.

```ts
request.middleware(Middleware);
```

* [`Middleware`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L26) - method that will be added to the promise chain.

## Examples

### Basic `GET`.

```ts
const request = new FetchREST({
  apiUrl: 'https://api.github.com',
});

await request.get('/users/kvendrik');
```

### Basic `GET` with query.

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://api.github.com',
});

await fetchRest.get('/users', {
  limit: 20,
  skip: 10,
  userIds: ['23181', '72819', '21819'],
});
```

### Using an options getter.

```ts
const fetchRest = new FetchREST(() => ({
  apiUrl: 'https://yourapi.com',
  headers: {
    'X-Timestamp': new Date().getTime(),
  },
}));

await fetchRest.get('/users/kvendrik');
```

### Setting global headers.

```ts
const request = new FetchREST({
  apiUrl: 'https://api.github.com',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

await request.get('/users/kvendrik');
```

### Overriding headers.

```ts
const request = new FetchREST({
  apiUrl: 'https://api.github.com',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

await request.get(
  '/users/kvendrik',
  {},
  {
    headers: {
      Authorization: 'Bearer xxx',
    },
  },
);
```

### Adding data to all responses.

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://api.github.com',
});

fetchRest.middleware(request =>
  request.then(response => ({...response, timestamp: new Date().getTime()})),
);

await fetchRest.get('/users/kvendrik');
```

### Global and local error handling (resolved).

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://non-existent-url',
});

fetchRest.middleware(request =>
  request.catch(error => {
    console.log('ERROR', error);
    return {body: null, status: 0, success: false};
  }),
);

await fetchRest.get('/users/kvendrik');
```

### Global and local error handling (unresolved).

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://non-existent-url',
});

fetchRest.middleware(request =>
  request.catch(error => {
    console.log('ERROR (triggered first)', error);
    throw error;
  }),
);

fetchRest
  .get('/users/kvendrik')
  .then(res => {
    console.log('RESPONSE (not triggered)', res);
  })
  .catch(error => {
    console.log('ERROR_LOCAL (triggered second)', error);
  });
```

### Cancelling a request.

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://api.github.com',
});

const abortToken = fetchRest.getAbortToken();
fetchRest.get('/users', {}, {abortToken});
fetchRest.abort(abortToken);
```

### Request timeout.

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://api.github.com',
});

fetchRest.get('/users', {}, {timeout: 500});
```

### Working with multiple APIs.

```ts
const githubApi = new FetchREST({
  apiUrl: 'https://api.github.com',
});

const appApi = new FetchREST({
  apiUrl: 'https://api.yourapp.com',
});

await githubApi.get('/users');
await appApi.get('/users');
```

## 🏗 Contributing

1.  Make your changes.
2.  Add/Alter the appropriate tests.
3.  Make sure all tests pass (`yarn lint && yarn test`).
4.  Create a PR.
