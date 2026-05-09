# @pppicado/structexe

A hierarchical, reactive state management library for TypeScript. `structexe` empowers developers to create deep, observable data structures where any local or profound mutation triggers precise, targeted reactions.

## Philosophy

`structexe` treats every node in your data architecture — from complex objects, Maps, and Sets down to scalar primitives — as a trackable entity. It utilizes deep Proxy assimilation and primitive boxing (`String_`, `Number_`, `Boolean_`, `Date_`, `Symbol_`, `BigInt_`, `Primitive_`) to guarantee that every data access and mutation is strictly monitored and fully reactive, enabling true "auto-vivification" (automatic creation of deep properties) and surgical UI updates.

## Installation

```bash
npm install @pppicado/structexe
```

## Core Concepts

- **`_exe_.newStruct_exe_(target)`**: The gateway to reactivity. Converts a plain JavaScript object, Array, Map, or Set into a `TypeStruct_exe_<T>`, wrapping it natively in a deep Proxy.
- **`_exe_.set(target, path, value)`**: Safely mutate properties using hierarchical paths (e.g., `app|config|theme`). If intermediary nodes do not exist, they are automatically generated (auto-vivification). Auto-vivification does **not** occur when using an empty object literal `TypeStruct_exe_<{}>`.
- **`_exe_.react(target, path, action)`**: Subscribe to changes at a specific path. The `action` callback receives a `datChangeObj` detailing the `ruta` (path), `datoActual` (old value), `datoNuevo` (new value), `hito` (change type), and `ambito` (reaction scope).
- **`_exe_.export(target)`**: Unwraps a reactive `structexe` object back into a clean, unproxied JavaScript primitive or object tree, perfectly serializable for JSON payload transmission.

## Basic Usage

### Initialization

```typescript
import { _exe_ } from '@pppicado/structexe';

const rawTarget = {
  app: {
    name: "My App",
    version: 1
  },
  flags: new Set(['active']),
  users: new Map()
};

const state = _exe_.newStruct_exe_(rawTarget);
```

### Deep Mutation & Auto-Vivification

```typescript
// Mutate an existing property directly
state.app.version = 2;

// Set a property using a hierarchical path
_exe_.set(state, "app|config|theme", "dark");
console.log(state.app.config.theme); // "dark" — config tree was auto-vivified
```

### Subscribing to Reactions

```typescript
_exe_.react(state, "app|config|theme", (changeEvent) => {
    console.log("Theme changed!");
    console.log("Old:", changeEvent.datoActual);
    console.log("New:", changeEvent.datoNuevo);
    console.log("Path:", changeEvent.ruta);
    console.log("Type:", changeEvent.hito); // typeChange.create | typeChange.seter | typeChange.change
});

state.app.config.theme = "light"; // Triggers the reaction
```

### Conditional Mutation (`setIfn_`)

```typescript
// Only sets the value if the property does not exist,
// is undefined, or currently equals the `oval` parameter.
_exe_.setIfn_(state, "app|debug", true, false);
```

### Exporting Clean Data

```typescript
const plainData = _exe_.export(state);
const jsonString = JSON.stringify(plainData); // Clean JSON without metadata
```

## Advanced Features

- **Collection Support**: Native, deep reactivity for `Set` and `Map`. Iterating, adding, or deleting items correctly triggers the reaction tree.
- **Array Support**: Arrays are fully reactive with bracket notation paths (e.g., `items[0]|name`).
- **Wildcard Routing**: `_exe_.route` supports wildcard traversal syntax for dispatching changes or querying multiple nodes simultaneously.
- **Reaction Scopes**: Reactions can be scoped as `local` (exact path), `childens` (children of path), `fathers` (parents of path), or `all` (global).
- **Reaction Buffering**: Batch multiple changes and flush reactions all at once using the buffer/sub-buffer system (`getBuffer`, `setBuffer`, `pushSubBuffer`, `popSubBuffer`).
- **Named Change Types**: Changes are categorized as `create`, `seter`, `change`, `geter`, or `delete` via the `typeChange` enum.
- **Ghost Set**: `InternalUtils.ghostSet` allows assigning values without triggering reactions (useful for initialization or internal state updates).

## API Quick Reference

### Static Methods on `_exe_`

| Method | Signature | Description |
| :--- | :--- | :--- |
| `be` | `be(target: any): boolean` | Check if an object is managed by `_exe_`. |
| `newStruct_exe_` | `newStruct_exe_<T>(importObj: T): TypeStruct_exe_<T>` | Convert a plain object into a reactive struct. |
| `set` | `set<T>(target, path, value, muting?, transformValue?): TypeStruct_exe_<T>` | Set a value at a hierarchical path. |
| `setIfn_` | `setIfn_<T>(target, property, value?, oval?, muting?): TypeStruct_exe_<T>` | Conditionally set if property is undefined or matches `oval`. |
| `react` | `react(target, path \| datChangeObj, action, component?): Reaction` | Subscribe to changes at a path. |
| `declineReact` | `declineReact(target, idReaction): Reaction` | Pause/cancel a reaction. |
| `export` | `export(target, property?, targetFill?): any` | Unwrap to plain JS object. |
| `route` | `route(cursor, path?, ok?, ko?, altOrigin?, options?): any` | Traverse or query by hierarchical path. |
| `forEach` | `forEach(target, callback, thisArg?): void` | Iterate over object, array, map, or set. |
| `path` | `path(target): string` | Get the hierarchical path of an instance. |

### Instance Methods (via `_exe_` property)

Every `TypeStruct_exe_` instance exposes these methods through its `_exe_` property:

| Method | Description |
| :--- | :--- |
| `set(property, value, muting?)` | Set property and return the assigned value. |
| `set_(property, value, muting?)` | Set property and return the container instance. |
| `setIf(property, value, oval?, muting?)` | Conditional set, returns assigned value. |
| `setIf_(property, value, oval?, muting?)` | Conditional set, returns container instance. |
| `getByStr(property, ok?, ko?)` | Get a property by name. |
| `export(property?, targetFill?)` | Export to plain object. |
| `route(path?, ok?, ko?)` | Traverse by path. |
| `react(dat, action, thisArg?)` | Subscribe to changes. |

### Types & Enums

- `typeChange`: `create`, `seter`, `change`, `geter`, `delete`
- `stateAmbitReaction`: `all`, `local`, `childens`, `fathers`, `pause`
- `processingType`: `unset`, `primitiveData`, `object`, `observ`, `noObserv`, `noMutation`, `array`, `map`, `set`, `function`
- `ActionChange`: `(change: datChangeObj) => void`
- `datChangeObj`: `{ ruta, hito, ambito, datoNuevo, datoActual }`

## Important Notes

- **`_exe_.intenal_utils`** contains internal utilities (note the intentional historical spelling).
- **`gestType`** (not `getType`) is the internal type-guessing method.
- **Circular imports** exist between `structexe.ts` and `inernalUtils.ts` — this is a known architectural limitation.
- Several critical bugs are documented in [`CORRECTION_PLAN.md`](./CORRECTION_PLAN.md).

## License

MIT
