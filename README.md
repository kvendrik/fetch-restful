# [WIP] FetchREST(ful)
[![CircleCI](https://circleci.com/gh/kvendrik/fetch-restful.svg?style=svg)](https://circleci.com/gh/kvendrik/fetch-restful)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 A wrapper around fetch for REST API dependent projects.

## Installation
```
yarn add fetch-restful
```

## Usage

1. Create an instance of `FetchREST` with your perferred [`GlobalRequestOptions`](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L39).
```ts
const request = FetchREST(GlobalRequestOptions);
```

2. Use any of the request request methods using your newly created instance.
```ts
await request.get('/users', QueryObject, RequestOptions);
await request.post('/users', Payload, RequestOptions);
await request.patch('/users', Payload, RequestOptions);
await request.put('/users', Payload, RequestOptions);
await request.delete('/users', Payload, RequestOptions);
```

- [**`QueryObject`**](https://github.com/kvendrik/fetch-rest/blob/master/src/queryObjectToString.ts#L1) - object with query parameters to use.
- [**`Payload`**](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L4) - your request payload.
- [**`RequestOptions`**](https://github.com/kvendrik/fetch-rest/blob/master/src/FetchREST.ts#L16) - request options that will be merged with your global request options.
