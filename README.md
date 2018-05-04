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
const request = new FetchREST(GlobalRequestOptions);
```

* [`GlobalRequestOptions`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L41) - request options that will be used as the defaults for every outgoing request.

### Request methods.

```ts
await request.get('/users', QueryObject, RequestOptions);
await request.post('/users', Payload, RequestOptions);
await request.patch('/users', Payload, RequestOptions);
await request.put('/users', Payload, RequestOptions);
await request.delete('/users', Payload, RequestOptions);
```

* [`QueryObject`](https://github.com/kvendrik/fetch-rest/blob/master/src/queryObjectToString.ts#L1) - object with query parameters to use.
* [`Payload`](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L4) - your request payload.
* [`RequestOptions`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L18) - request options that will be merged with your global request options.

### Middleware

Use the middleware method to define a function that will be added to the promise chain for all outgoing requests.

```ts
request.middleware(Middleware);
```

* [`Middleware`](https://github.com/kvendrik/fetch-restful/blob/master/src/FetchREST.ts#L45) - method that will be added to the promise chain.

## Examples

### Basic `GET`

```ts
const request = new FetchREST({
  apiUrl: 'https://api.github.com',
});

await request.get('/users/kvendrik');
```

### Basic `GET` with JSON headers

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

### Basic `GET` with JSON headers and override

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

### Basic `GET` with timestamp added to all responses

```ts
const fetchRest = new FetchREST({
  apiUrl: 'https://api.github.com',
});

fetchRest.middleware(request =>
  request.then(response => ({...response, timestamp: new Date().getTime()})),
);

await fetchRest.get('/users/kvendrik');
```

### Basic `GET` with global error handler (resolved)

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

### Basic `GET` with global and local error handler (unresolved)

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

## 🏗 Contributing

1.  Make your changes.
2.  Add/Alter the appropriate tests.
3.  Make sure all tests pass (`yarn lint && yarn test`).
4.  Create a PR.
