# Correction Plan - structexe

> **Analysis Date:** 2026-05-05
> **Files Analyzed:**
> - `src/structexe.ts`
> - `src/inernalUtils.ts`
> - `src/index.ts`
> - `test.ts`
> - `debug6.ts`

---

## Table of Contents

1. [Critical Errors](#critical-errors)
2. [Important Errors](#important-errors)
3. [Minor Errors](#minor-errors)
4. [Recommended Action Plan](#recommended-action-plan)
5. [Architectural Notes](#architectural-notes)

---

## Critical Errors

These errors cause runtime crashes, silently incorrect behavior, or state corruption.

---

### CR-01: Broken ternary operator precedence in `observingGets` for arrays/objects

**File:** `src/inernalUtils.ts`
**Line:** ~527 (inside proxy handler `get` for `processingType.array` / `processingType.object`)

```typescript
ruta: managementHierarchicalData.path + (typeProcessing == processingType.array) ? '[' + property.toString() + ']' : '|' + property.toString(),
```

**Root Cause:**
The `+` operator has higher precedence than `?`. The expression evaluates as:

```typescript
(managementHierarchicalData.path + (typeProcessing == processingType.array)) ? ... : ...
```

Therefore, when `typeProcessing` is `array`, the left side of the ternary is a non-empty string (truthy), and the `[prop]` branch is always taken. When it is `object`, the left side is also a string (truthy because `path` ends in `/`), so it also evaluates to `[prop]`.

**Impact:**
All `get` notifications (when `observingGets` is active) generate malformed routes like `/|app[version]` instead of `/|app|version`. This breaks the reaction system because subscriptions never match the notified route.

**Possible Solutions:**

1. **Explicit parentheses (recommended):**
   ```typescript
   ruta: managementHierarchicalData.path + ((typeProcessing == processingType.array) ? '[' + property.toString() + ']' : '|' + property.toString()),
   ```

2. **Helper separator function:**
   ```typescript
   const sep = (type: processingType, prop: string) =>
     type === processingType.array ? `[${prop}]` : `|${prop}`;
   ```

---

### CR-02: `Map.prototype.set` does not return a boolean

**File:** `src/inernalUtils.ts`
**Lines:** 681, 770

```typescript
if (valueBound(propertyKey, propertyValue)) {
    // notify change
}
```

**Root Cause:**
`Map.prototype.set(key, value)` returns the Map instance (for chaining), **not** a boolean indicating success. The return value is always truthy, so the `if` condition always enters, and changes are notified even when the value is identical to the previous one.

**Impact:**
Duplicate/spam reactions. If you do `map.set('k', 'v')` and then `map.set('k', 'v')`, two notifications are fired. This can cause infinite loops in reactions that re-write values.

**Possible Solutions:**

1. **Compare oldValue before notifying:**
   ```typescript
   let oldValue = target.get(propertyKey);
   valueBound(propertyKey, propertyValue);
   if (oldValue !== propertyValue) {
       // notify
   }
   ```

2. **Use `has` + comparison:**
   ```typescript
   const had = target.has(propertyKey);
   const old = had ? target.get(propertyKey) : undefined;
   target.set(propertyKey, propertyValue);
   if (!had || old !== propertyValue) {
       // notify
   }
   ```

---

### CR-03: `getByStr` does not support `processingType.array`

**File:** `src/inernalUtils.ts`
**Line:** 236 (`getByStr` switch)

```typescript
switch (_exe_.intenal_utils.gestType(target)) {
    case processingType.object: { ... }
    case processingType.map: { ... }
    case processingType.set: { ... }
    default:
        err = `Object or property typeError: ${property} in "${target.toString()}"`
}
```

**Root Cause:**
The `switch` handles `object`, `map`, and `set`, but **has no case for `processingType.array`**. When trying to read a property from an array managed by `_exe_`, it falls into `default` and returns an error.

**Impact:**
Any operation that internally uses `getByStr` on an array fails. This includes deep assignments, reads, and possibly export.

**Possible Solutions:**

1. **Add array case:**
   ```typescript
   case processingType.array: {
       let numProperty = Number(property);
       if (!isNaN(numProperty) && numProperty >= 0 && numProperty < (target as any[]).length)
           value = (target as any[])[numProperty];
       else
           err = `property ${property} not found in array`;
       break;
   }
   ```

2. **Delegate to `Reflect.get` for all non-Map/Set cases:**
   ```typescript
   case processingType.object:
   case processingType.array:
       value = Reflect.get(target, property);
       if (value === undefined && !(property in target))
           err = `property ${property} not found`;
       break;
   ```

---

### CR-04: `setIfn_` crashes with default `oval` of `undefined`

**File:** `src/structexe.ts`
**Line:** 87

```typescript
static setIfn_<T>(target: T, property: string, value?: any, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    let actVal = _exe_.intenal_utils.getByStr(target, property);
    if (actVal == undefined || actVal.toString() != oval.toString())
        _exe_.set(target, property, value, muting);
    ...
}
```

**Root Cause:**
If `oval` is not passed, its default value is `undefined`. If `actVal` is not `undefined` (for example, it is `0` or `''`), the condition `actVal == undefined` is `false`, and `oval.toString()` is evaluated, which is `undefined.toString()` -> **TypeError: Cannot read properties of undefined (reading 'toString')**.

**Impact:**
Runtime crash every time `setIfn_` or `setIf` is used with an existing value and without providing the `oval` parameter.

**Possible Solutions:**

1. **Explicit guard for `undefined`:**
   ```typescript
   if (actVal == undefined || (oval !== undefined && actVal.toString() != oval.toString()))
   ```

2. **Use `Object.is` or strict comparison with guard:**
   ```typescript
   const shouldSet = actVal === undefined ||
                       (oval !== undefined && actVal?.toString() !== oval?.toString());
   ```

3. **Review desired semantics:** Is `oval` really meant to be optional? If it is required, mark it without a default value.

---

### CR-05: `value.toString()` without guard in `route` wildcard

**File:** `src/structexe.ts`
**Line:** 210

```typescript
if ((keyFind === '?' || keyFind === stringKey) && (all || valueFind === value.toString())) {
```

**Root Cause:**
In the `route` method, when using wildcard syntax `(property:value)`, `valueFind` (a string extracted from the path) is compared with `value.toString()`. If `value` is `null` or `undefined`, `value.toString()` throws a TypeError.

**Impact:**
Crash when iterating over structures containing `null` or `undefined` values using wildcards in `route`.

**Possible Solutions:**

1. **Use template string with safe coercion:**
   ```typescript
   (all || valueFind === String(value))
   ```

2. **Prior normalization:**
   ```typescript
   const valueStr = value == null ? '' : String(value);
   ```

---

### CR-06: `gestTypeDetailed` crashes with objects without `constructor`

**File:** `src/inernalUtils.ts`
**Line:** 320

```typescript
if (detailed == "object") {
    ...
    switch (valueTest.constructor.name) {
```

**Root Cause:**
Objects created with `Object.create(null)` do not have a `constructor` property. Accessing `valueTest.constructor.name` throws a TypeError.

**Impact:**
Crash if attempting to wrap a null-prototype object. Also crashes if `valueTest` is an object whose constructor was overwritten to `undefined`.

**Possible Solutions:**

1. **Explicit guard:**
   ```typescript
   if (detailed === "object") {
       if (valueTest != null && valueTest.constructor != null && valueTest.constructor.name != null) {
           switch (valueTest.constructor.name) { ... }
       } else {
           detailed = "object";
       }
   }
   ```

2. **Use `Object.prototype.toString.call` as fallback:**
   ```typescript
   const ctorName = valueTest?.constructor?.name ?? Object.prototype.toString.call(valueTest).slice(8, -1);
   ```

---

### CR-07: `popSubBuffer` / `clearSubBuffer` treat `id=0` as `undefined`

**File:** `src/structexe.ts`
**Lines:** 599-601, 628-630

```typescript
public popSubBuffer(id?: number): boolean {
    let subBuffer = (id) ? this.subBufferReactions.find(...) : this.subBufferReactions.pop()
    this.subBufferReactions = this.subBufferReactions.filter((subBuffer) => subBuffer.id != id)
    ...
}

public clearSubBuffer(id?: number): boolean {
    if (!id) this.subBufferReactions = []
    ...
}
```

**Root Cause:**
The first subBuffer has `id = 1` (from `contSubBufferReactions++` before `push`). However, if the counter ever starts at 0 or resets, `id = 0` is falsy. The expression `(id)` evaluates `0` as `false`, and `!id` evaluates `0` as `true`.

**Impact:**
- `popSubBuffer(0)` extracts the last buffer instead of the one with id 0.
- `clearSubBuffer(0)` clears **all** subBuffers.

**Possible Solutions:**

1. **Check against `undefined` explicitly:**
   ```typescript
   let subBuffer = (id !== undefined) ? ... : ...
   if (id === undefined) this.subBufferReactions = []
   ```

2. **Use a counter that is never 0:**
   ```typescript
   this.contSubBufferReactions = 1; // initialize at 1
   ```

---

### CR-08: `propertyCreated` miscalculated for properties with `undefined` value

**File:** `src/inernalUtils.ts`
**Line:** 187

```typescript
propertyCreated = (target === undefined)
```

**Root Cause:**
`target` is the result of `getByStr(thisArg, property)`. If a property **exists** but its value is `undefined`, `target` will be `undefined`. The code assumes the property did not exist and reports `typeChange.create` instead of `typeChange.seter`.

**Impact:**
Incorrect notifications. Subscriptions to `typeChange.create` fire when there was actually an update. Subscriptions to `typeChange.seter` do not fire.

**Possible Solutions:**

1. **Use `in` or `hasOwnProperty`:**
   ```typescript
   const propertyCreated = !(property in thisArg);
   // or to be stricter with prototype props:
   // const propertyCreated = !Object.prototype.hasOwnProperty.call(thisArg, property);
   ```

2. **Use `Reflect.has`:**
   ```typescript
   const propertyCreated = !Reflect.has(thisArg, property);
   ```

**Note:** For Map/Set, `in` does not work; `has()` is needed.

---

### CR-09: Non-string keys are lost in recursive Map assimilation

**File:** `src/inernalUtils.ts`
**Lines:** 841-848

```typescript
} else if (typeProcessing === processingType.map) {
    let mapTarget = thisArg as unknown as Map<any, any>;
    let copyEntries = Array.from(mapTarget.entries());
    for (let [key, val] of copyEntries) {
        if (!_exe_.be(val)) {
            InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, key, val);
        }
    }
}
```

**Root Cause:**
`setProperty_strict` takes `property: string` as its second parameter. If `key` is an object (for example, `new Map([[{id:1}, 'value']])`), it is implicitly converted to string (`[object Object]`), losing key identity.

**Impact:**
Maps with non-primitive keys are corrupted during assimilation. The original key is lost and replaced by its string representation.

**Possible Solutions:**

1. **Allow `property: string | symbol | object` in `setProperty_strict`:**
   Change the method signature to accept any key type and internally handle the difference between objects, arrays, Map, and Set.

2. **For Map, use native `set` instead of `setProperty_strict`:**
   ```typescript
   const proxiedVal = _exe_.be(val) ? val : InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, '__tmp__', val);
   mapTarget.set(key, proxiedVal);
   // Then remove '__tmp__' if used
   ```
   *(Note: this is a hack; the correct solution is to refactor `setProperty_strict`)*

---

### CR-10: Circular import between `structexe.ts` and `inernalUtils.ts`

**File:** `src/structexe.ts` line 14, `src/inernalUtils.ts` line 1

```typescript
// structexe.ts
import { ActionChange, ... } from "./inernalUtils";

// inernalUtils.ts
import { _exe_, ManagementHierarchicalDataObj, ManagementReactionsObj } from "./structexe";
```

**Root Cause:**
Although TypeScript/JavaScript can handle circular imports in some cases, this is an anti-pattern. Depending on bundler or runtime evaluation order, `_exe_` may be `undefined` when `InternalUtils` tries to use it statically.

**Impact:**
- Fragility against bundler changes.
- Makes unit testing difficult (mocks).
- Possible `undefined` at runtime if the module is not fully initialized.

**Possible Solutions:**

1. **Extract types and constants to a third file (`types.ts` or `constants.ts`):**
   ```
   types.ts       -> enums, interfaces, types
   inernalUtils.ts -> pure logic, imports types.ts
   structexe.ts    -> orchestration, imports types.ts and inernalUtils.ts
   ```

2. **Use dependency injection:**
   Pass `_exe_` as a parameter instead of statically importing it in `InternalUtils`.

---

## Important Errors

These errors do not cause immediate crashes, but generate incorrect behavior or fragility.

---

### IM-01: `muting` and `transformValue` parameters ignored in `_exe_.set`

**File:** `src/structexe.ts`
**Line:** 111

```typescript
returnValue = _exe_.intenal_utils.setProperty_strict(structTarget, propertyName, value)
// PPPS en proceso , muting, transformValue, _exe_Path, TypeStruct_exe_
```

**Root Cause:**
The `_exe_.set` method receives `muting` and `transformValue` as parameters, but does not pass them to `setProperty_strict`. The comment indicates it is "in progress", but the public API already exposes them.

**Impact:**
Users trying to use `muting: false` to avoid transforming objects into proxy structures, or `transformValue: false` to keep original types, will not get the expected behavior.

**Possible Solutions:**

1. **Immediate parameter propagation:**
   ```typescript
   returnValue = _exe_.intenal_utils.setProperty_strict(structTarget, propertyName, value, muting, transformValue);
   ```
   And update the `setProperty_strict` signature to receive them.

2. **Document as temporary no-op:**
   If they are truly not implemented, mark the parameters as `@deprecated` or `@internal` in documentation until implemented.

---

### IM-02: Notifications during initialization (recursive assimilation)

**File:** `src/inernalUtils.ts`
**Lines:** 832-860 (inside `newProxy`)

```typescript
if (typeProcessing === processingType.array || typeProcessing === processingType.object) {
    for (let key in thisArg) {
        if (Object.prototype.hasOwnProperty.call(thisArg, key)) {
            let initialValue = (thisArg as any)[key];
            if (!_exe_.be(initialValue)) {
                InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, key, initialValue);
            }
        }
    }
}
```

**Root Cause:**
During proxy creation, all initial properties are iterated and `setProperty_strict` is called, which triggers `callReact` with `typeChange.create` or `typeChange.seter`.

**Impact:**
Any reaction registered before proxy creation (currently impossible, but if buffering is added), or global reactions, receive notifications for data the user never modified. This generates noise and possible unwanted side effects.

**Possible Solutions:**

1. **Disable notifications during initialization:**
   ```typescript
   const wasBuffering = managementHierarchicalData.rootManagement.getBuffer();
   if (!wasBuffering) managementHierarchicalData.rootManagement.setBuffer(true);
   // ... recursive assimilation ...
   if (!wasBuffering) {
       managementHierarchicalData.rootManagement.setBuffer(false); // flush or clear
       managementHierarchicalData.rootManagement.clearBuffer();    // discard init notifications
   }
   ```

2. **Use ghostSet or direct assignment:**
   Instead of `setProperty_strict`, assign directly to `structObj` without going through the proxy. Then, after initialization, getters will return already-wrapped values.

---

### IM-03: `declineReact` without existence guard

**File:** `src/structexe.ts`
**Line:** 693

```typescript
declineReact(id: number | Reaction): Reaction {
    if (typeof id != 'number') id = id.manage.id
    let reaction = this.reactions[id]
    if (reaction.manage.status != stateAmbitReaction.pause) {
```

**Root Cause:**
If `id` does not exist in `this.reactions`, `reaction` is `undefined`. The next line attempts to access `reaction.manage.status` -> crash.

**Impact:**
Crash when trying to pause a reaction that has already been removed or whose id is invalid.

**Possible Solutions:**

1. **Simple guard:**
   ```typescript
   if (!reaction) return undefined as any; // or throw controlled error
   ```

2. **Throw descriptive error:**
   ```typescript
   if (!reaction) throw new Error(`Reaction with id ${id} not found`);
   ```

---

### IM-04: `route` with empty path and undefined `_exe_Path`

**File:** `src/structexe.ts`
**Lines:** 220-221

```typescript
if (callBackfnOk && ok && !iteration) callBackfnOk(returnValue, property, cursor, _exe_Path!, TypeStruct_exe_!)
```

**Root Cause:**
If the path is `''` and there is no iteration, `_exe_Path` and `TypeStruct_exe_` may be `undefined`. The `!` operator (non-null assertion) tells the compiler to trust, but at runtime they are `undefined`.

**Impact:**
`route` callbacks receive `undefined` where they expect string/object. If the callback uses `_exe_Path` to build routes, it will generate strings like `"undefined|prop"`.

**Possible Solutions:**

1. **Assign default values before callback:**
   ```typescript
   const finalPath = _exe_Path ?? '';
   const finalStruct = TypeStruct_exe_ ?? cursor;
   if (callBackfnOk && ok && !iteration) callBackfnOk(returnValue, property, cursor, finalPath, finalStruct);
   ```

---

### IM-05: Duplicated code (`processingType.noObserv` appears twice)

**File:** `src/inernalUtils.ts`
**Lines:** 609-629 and 715-731

**Root Cause:**
The `case processingType.noObserv:` block is defined twice in the same `newProxy` `switch`. The second one never executes because the first one already captures the case.

**Impact:**
- Technical debt.
- The second block might be an "improved" version that was forgotten.
- If the first one is modified thinking it is the only one, the second becomes inconsistent (although unreachable).

**Possible Solutions:**

1. **Remove the duplicate:**
   Compare both blocks and keep the most complete/correct one.

2. **Check if they should be different cases:**
   Perhaps one was `noObserv` and the other `noMutation`, and there was a copy/paste error.

---

## Minor Errors

These are typos, style errors, or technical debt that do not impact immediate functionality.

---

### MN-01: Typo in file name

**File:** `src/inernalUtils.ts`

Missing 't': `inernalUtils.ts` -> `internalUtils.ts`

**Impact:**
No functional impact, but confuses developers and breaks naming conventions.

**Possible Solutions:**
Rename the file and update all imports.

---

### MN-02: Typo in static property

**File:** `src/structexe.ts`
**Line:** 25

```typescript
static intenal_utils = InternalUtils
```

Missing 't': `intenal_utils` -> `internal_utils`

**Impact:**
Public API with typo. Breaks consistency.

**Possible Solutions:**
Rename the property. If it is part of the public API, keep both as a temporary alias with `@deprecated`.

---

### MN-03: `Date_` does not correctly copy Date objects

**File:** `src/inernalUtils.ts`
**Lines:** 75-79

```typescript
export class Date_ extends Date {
    constructor(public value: any) { super(value); }
```

**Root Cause:**
If `value` is already a `Date` object, `super(dateObj)` invokes the `Date` constructor with a Date object, which internally calls `valueOf()` on the object, obtaining a timestamp. This works, but if `value` is an invalid `Date` (`new Date('invalid')`), behavior may be inconsistent.

**Impact:**
Minimal, but the wrapper's intent seems to be preserving the original value. The `super` transforms the input.

**Possible Solutions:**

1. **Use timestamp for super:**
   ```typescript
   constructor(public value: Date) {
       super(value.getTime());
   }
   ```

2. **Or do not extend `Date` and use composition:**
   ```typescript
   export class Date_ {
       constructor(public value: Date) {}
       valueOf() { return this.value.valueOf(); }
       toString() { return this.value.toString(); }
       toJSON() { return this.value.toJSON(); }
   }
   ```

---

## Recommended Action Plan

### Phase 1: Security and stability (immediate)
1. **CR-04** (`setIfn_` crash) — A very commonly used method that crashes easily.
2. **CR-03** (`getByStr` without array) — Affects basic operations on arrays.
3. **CR-06** (`gestTypeDetailed` crash) — Any object without a constructor breaks the library.
4. **CR-07** (`id=0` falsy) — Silent bug that can corrupt buffering state.

### Phase 2: Behavior correction
5. **CR-01** (ternary precedence) — Completely breaks `observingGets`.
6. **CR-02** (`Map.set` boolean) — Causes duplicate reactions.
7. **CR-08** (`propertyCreated` miscalculated) — Incorrect notifications.
8. **CR-05** (`value.toString()` without guard) — Crash in wildcards with null.

### Phase 3: Robustness and refactoring
9. **CR-09** (Map non-string keys) — Full Map support.
10. **CR-10** (circular import) — Architectural improvement.
11. **IM-01** (`muting` ignored) — Complete the API.
12. **IM-02** (notifications on init) — Reduce noise.
13. **IM-03** (`declineReact` guard) — Error handling.

### Phase 4: Cleanup
14. **IM-05** (duplicated code) — Remove.
15. **IM-04** (`route` undefined) — Safe typing.
16. **MN-01, MN-02** (typos) — Rename.
17. **MN-03** (`Date_`) — Review semantics.

---

## Architectural Notes

### About `setProperty_strict`
This method is the heart of the library. Currently:
- Does not respect `muting`.
- Does not respect `transformValue`.
- Does not handle non-string keys for Map.
- Notifies changes even during initialization.

A deep refactoring of this method is recommended, possibly separating responsibilities:
- `assignValue`: only assigns to `structObj`.
- `wrapValue`: converts the value to proxy if applicable.
- `notifyChange`: fires reactions.

### About the route system
The route system with `|` and `[index]` is sensitive. It is recommended to:
- Validate that property names do not contain `|` (or escape them).
- Document the supported path grammar.
- Consider normalizing arrays always to `[index]` and objects to `|prop`.

### About tests
The current `test.ts` file is a manual script, not an automated test suite. It is recommended to migrate to a testing framework (Jest, Vitest, Mocha) with coverage for:
- Proxy creation (object, array, map, set, primitives).
- Deep assignments.
- Reactions (local, children, fathers, all).
- Reaction buffering.
- Export.
- Edge cases: null, undefined, Object.create(null), object keys in Map.

---

*Document generated automatically from code analysis.*
