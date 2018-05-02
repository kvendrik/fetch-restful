# [WIP] FetchREST(ful)

[![CircleCI](https://circleci.com/gh/kvendrik/fetch-restful.svg?style=svg)](https://circleci.com/gh/kvendrik/fetch-restful)
[![Coverage Status](https://coveralls.io/repos/github/kvendrik/fetch-restful/badge.svg?branch=master)](https://coveralls.io/github/kvendrik/fetch-restful?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 A wrapper around fetch for REST API dependent projects.

## Installation

```
yarn add fetch-restful
```

## Usage

1.  Create an instance of `FetchREST` with your perferred [`GlobalRequestOptions`](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L39).

```ts
const request = new FetchREST(GlobalRequestOptions);
```

2.  Use any of the request methods using your newly created instance.

```ts
await request.get('/users', QueryObject, RequestOptions);
await request.post('/users', Payload, RequestOptions);
await request.patch('/users', Payload, RequestOptions);
await request.put('/users', Payload, RequestOptions);
await request.delete('/users', Payload, RequestOptions);
```

* [**`QueryObject`**](https://github.com/kvendrik/fetch-rest/blob/master/src/queryObjectToString.ts#L1) - object with query parameters to use.
* [**`Payload`**](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L4) - your request payload.
* [**`RequestOptions`**](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L16) - request options that will be merged with your global request options.

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

## 🏗 Contributing
1. Make your changes.
2. Add/Alter the appropriate tests.
3. Make sure all tests pass (`yarn ci`).
4. Create a PR.
