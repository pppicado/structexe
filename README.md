# @pppicado/structexe

A hierarchical, reactive state management library for TypeScript. `structexe` empowers developers to create deep, observable data structures where any local or profound mutation triggers precise, targeted reactions.

## Philosophy

`structexe` treats every node in your data architecture from complex objects, Maps, and Sets down to scalar primitives as a trackable entity. It utilizes deep Proxy assimilation and primitive boxing (`PrimitiveBox_exe_`) to guarantee that every data access and mutation is strictly monitored and fully reactive, enabling true "auto-vivification" (automatic creation of deep properties) and surgical UI updates.

## Installation

```bash
npm install @pppicado/structexe
```

## Core Concepts

-   **`_exe_.newStruct_exe_(target)`**: The gateway to reactivity. Converts a plain JavaScript object, Array, Map, or Set into a `TypeStruct_exe_<T>`, wrapping it natively in a deep Proxy.
-   **`_exe_.set(target, path, value)`**: Safely mutate properties using hierarchical paths (e.g., `app|config|theme`). 
If intermediary nodes do not exist, they are automatically generated (auto-vivification) in _exe_.set or _exe_.route.
But if you use TypeStruct_exe_ like `TypeStruct_exe_<{}>` not will be auto-vivification.
-   **`_exe_.react(target, path, callback)`**: Subscribe to changes at a specific path. The callback receives a `datChangeObj` detailing the `ruta` (path), `datoActual` (old value), and `datoNuevo` (new value).
-   **`_exe_.export(target)`**: Unwraps a reactive `structexe` object back into a clean, unproxied JavaScript primitive or object tree, perfectly serializable for JSON payload transmission.

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

// Assimilate the plain object into a reactive struct
const state = _exe_.newStruct_exe_(rawTarget);
```

### Deep Mutation & Auto-Vivification

Mutate data at any depth. Primitives are automatically wrapped in `PrimitiveBox_exe_` to preserve tracking metadata without losing scalar transparency.

```typescript
// Mutating an existing property
state.app.version = 2; // Handled natively!

// Setting a property using a path
_exe_.set(state, "app|config|theme", "dark");
console.log(state.app.config.theme); // "dark" (config tree was auto-vivified)
```

### Subscribing to Reactions

Target specific nodes in your state tree to listen for updates.

```typescript
_exe_.react(state, "app|config|theme", (changeEvent) => {
    console.log("Theme changed!");
    console.log("Old:", changeEvent.datoActual);
    console.log("New:", changeEvent.datoNuevo);
    console.log("Path:", changeEvent.ruta); // Result: app|config|theme
});

// Trigger the reaction natively or via _exe_.set
state.app.config.theme = "light";
```

### Exporting Clean Data

When you need to send your state out of your application (e.g., to a REST API), unwrap it effortlessly:

```typescript
const plainData = _exe_.export(state);
const jsonString = JSON.stringify(plainData); // Clean JSON without metadata pollution
```

## Advanced Features

-   **Collection Support**: Native, deep reactivity for `Set` and `Map`. Iterating, adding, or deleting items correctly triggers the reaction tree.
-   **Wildcard Routing**: `_exe_.route` and `_exe_.set` support wildcard traversal syntax for dispatching changes or querying multiple nodes simultaneously.
-   **Action Processing**: Define named internal actions within the state to encapsulate complex domain logic through dispatchable `ActionChange` configurations.

## License
MIT
