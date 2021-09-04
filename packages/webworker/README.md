<p align="center">
  <img src="./frecency.svg" />
</p>

## Overview

## Installation

```bash
npm i --save @frecency/core
npm i --save @frecency/indexeddb-datasource # if you need persistence
```

## Usage

```typescript
import createVisit from "@frecency/core";

const halflife = 7 * 24 * 60 * 60 * 1000; // 7 days
const visit = createVisit(halflife);

const visita = visit();
const visitb = visit(visita);
// ...
```

```typescript
//
// Very often you are not going to want keep the scores in memory, you may want
// to persist them so that they can be recalled later between pages, app
// launches, etc.
//
// For those working in the browser, we provide a datasource that can persist
// and recall scores from IndexedDB.
//

import { initDB } from "@frecency/indexeddb-datasource";

const datasource = initDB("unique-identitier-used-as-name-of-database");

await datasource.visit("namespace.selector", "contoso");
await datasource.visit("namespace.selector", "contoso");
await datasource.visit("namespace.selector", "acme");
await datasource.visit("namespace.selector", "contoso");
await datasource.visit("namespace.selector", "acme");
await datasource.visit("namespace.selector", "contoso");
await datasource.visit("namespace.selector", "contoso");
await datasource.visit("namespace.selector", "contoso");

// Results are returned ordered by their score
const list = await datasource.list("namespace.selector");
console.table({ list });
```