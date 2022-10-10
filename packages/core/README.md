# `@rxhtml/core`

**This is very unfinished :)**

Transform RxJS Observables into *serializable* DOM updates. 

## Usage

```ts
import { html } from "@rxhtml/core";
import { BehaviorSubject, tap } from "rxjs";

const value$ = new BehaviorSubject(0);

const renders$ = html`<input type="button" value=${value$}>`.pipe(
    tap(res => console.log(res))
);

values$.next(1);

/**
 * 
 * Output:
 * { 
 *   name: "value",
 *   action: "ATTRIBUTE",
 *   selector: "[data-rxhtml-0]", // a random id
 *   value: 1
 * }
 * 
 */ 

```

## Dependencies

- RxJS
- Some morphing library TBD: either nanomorph or Alpine morph
