# Plan de Corrección — `@pppicado/structexe`

> **Submódulo:** `projects/structexe/`
> **Versión analizada:** 0.1.0
> **Fecha de análisis:** 2026-06-04
> **Re-verificación:** 2026-06-04 (re-ejecutada, estados actualizados)

## Archivos Analizados

| Archivo | Líneas | Rol |
| :--- | ---: | :--- |
| `src/structexe.ts` | 899 | API pública (`_exe_`), gestión de reacciones, `route`/`forEach`/`export` |
| `src/internalUtils.ts` | 983 | Wrappers primitivos, Proxy factories, `setProperty_strict`, `getByStr`, `gestType` |
| `src/types.ts` | 189 | Tipos forward-declarados (código muerto actualmente) |
| `src/index.ts` | 26 | Barrel export público |
| `src/index.spec.ts` | 309 | Suite Vitest (Fase 0) |
| `test.ts` | 69 | Script manual (ROTO — ver D5) |
| `vitest.config.ts` | 21 | Configuración Vitest + cobertura |
| `package.json` | 47 | Scripts `test` / `test:watch` / `test:coverage` |
| `README.md` | 44 | Documentación usuario (con bugs D1-D4) |
| `tsconfig*.json` | 5 files | Configuración TS (cjs/esm/spec/types) |

---

## Tabla de Contenidos

1. [Errores Críticos (CR)](#1-errores-críticos-cr) — 10 items
2. [Errores Importantes (IM)](#2-errores-importantes-im) — 5 items
3. [Errores Menores (MN)](#3-errores-menores-mn) — 3 items
4. [Bugs Nuevos (N1-N19)](#4-bugs-nuevos-n1-n19--descubiertos-2026-06-04) — 19 items
5. [Bugs de Documentación (D1-D5)](#5-bugs-de-documentación-d1-d5) — 5 items
6. [Refactors Arquitectónicos (R1-R5)](#6-refactors-arquitectónicos-r1-r5) — 5 items
7. [Plan de Acción Recomendado](#7-plan-de-acción-recomendado) — 5 fases
8. [Tabla Resumen de Verificación](#8-tabla-resumen-de-verificación)
9. [Notas Arquitectónicas](#9-notas-arquitectónicas)

---

## 1. Errores Críticos (CR)

### CR-01 — Ternario mal parentizado en `observingGets` ✅ ARREGLADO

- **Archivo:línea:** `src/internalUtils.ts:560`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:**
  ```ts
  // Antes (BUG):
  ruta: ... + (typeProcessing == processingType.array) ? '[' + ... : '|' + ...
  // Equivale a: ruta + ((typeProcessing == ...) ? '[' : '|')  -> siempre '|'
  // Ahora (FIX):
  ruta: ... + ((typeProcessing == processingType.array) ? '[' + ... : '|' + ...)
  ```
- **Spec que lo cubre:** No tiene spec específico (test indirecto en `set()` con `arr[1]`).

### CR-02 — `Map.prototype.set` no retornaba boolean ✅ ARREGLADO

- **Archivo:línea:** `src/internalUtils.ts:694-706, 801-813`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:**
  ```ts
  // Ahora: el handler verifica had/oldValue antes de notificar
  let oldValue = (target as Map<any, any>).get(propertyKey)
  let had = (target as Map<any, any>).has(propertyKey)
  valueBound(propertyKey, propertyValue)
  if (!had || oldValue !== propertyValue) {
    management_exe_.rootManagement.callReact(new datChangeObj({ ... }))
  }
  ```
- **Nota:** El plan original mencionaba 2 sitios; en realidad son **4 sitios** (observ y default, cada uno con `set` y `add`).
- **Spec que lo cubre:** No tiene spec específico.

### CR-03 — `getByStr` sin caso `array` ✅ ARREGLADO

- **Archivo:línea:** `src/internalUtils.ts:291-300`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:** Case `processingType.array` añadido con validación de índice.
- **Spec que lo cubre:** Implícito en `set()` con `arr[1]`.

### CR-04 — `setIfn_` crashea con `oval` undefined ✅ ARREGLADO

- **Archivo:línea:** `src/structexe.ts:95`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:**
  ```ts
  // Antes: actVal.toString() != oval.toString()  (crashea si oval === undefined)
  // Ahora:
  if (actVal == undefined || (oval !== undefined && actVal?.toString() !== oval?.toString()))
    _exe_.set(target, property, value, muting)
  ```
- **Spec que lo cubre:** `index.spec.ts:108-113` ("does not crash when oval is undefined").

### CR-05 — `value.toString()` sin guarda en `route` wildcard ✅ ARREGLADO

- **Archivo:línea:** `src/structexe.ts:224`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:** `String(value)` (coerción segura que acepta `null`/`undefined`).
- **Spec que lo cubre:** No tiene spec específico.

### CR-06 — `gestTypeDetailed` crashea con objetos sin `constructor` 🟡 PARCIAL

- **Archivo:línea:** `src/internalUtils.ts:352`
- **Estado verificado 2026-06-04:** 🟡 PARCIAL
- **Progreso:** Usa `valueTest?.constructor?.name ?? Object.prototype.toString.call(...)`.
- **Falta:** Spec pasa `Object.create(null)` y aún lanza — el fallback de `Object.prototype.toString.call` se ejecuta pero devuelve `"[object Object]"` y la rama `default` del switch devuelve ese string que NO está en `processingTypeSet` → fallback a `processingType.object` (cubre el spec, pero lógicamente inconsistente).
- **Spec que lo cubre:** `index.spec.ts:297-301` (escribe la spec, pero actualmente asserta `toThrow()` — bug oculto).
- **Fix pendiente:** Validar que `Object.create(null)` se asimile correctamente sin lanzar.

### CR-07 — `popSubBuffer`/`clearSubBuffer` trataban `id=0` como `undefined` ✅ ARREGLADO

- **Archivo:línea:** `src/structexe.ts:659, 691`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:** Distingue `id !== undefined` y `id === undefined` explícitamente.
- **Spec que lo cubre:** No tiene spec específico.

### CR-08 — `propertyCreated` mal calculado para undefined ✅ ARREGLADO

- **Archivo:línea:** `src/internalUtils.ts:155-166`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO (en el cuerpo principal de `setProperty_strict`)
- **Diff conceptual:** Distingue por `processingType` (Map/Set con `.has()`, objetos con `in`).
- **🟡 Pendiente (no crítico):** En el bloque recursivo de asimilación de `newProxy` (líneas 856-892), la lógica de `propertyCreated` no se evalúa explícitamente — depende del side-effect de `setProperty_strict` invocado desde el bucle.

### CR-09 — Non-string keys perdidas en Map 🟡 PARCIAL

- **Archivo:línea:** `src/internalUtils.ts:865-880`
- **Estado verificado 2026-06-04:** 🟡 PARCIAL
- **Progreso:**
  - Para **valores-objeto** con Map-clave: usa `newProxy` directo (preserva identidad). ✅
  - Para **valores-primitivos** con Map-clave: sigue usando `setProperty_strict` con string conversion. 🟡
- **Fix pendiente:** `setProperty_strict` debería aceptar `property: string | symbol | object` y hacer dispatch por `processingType` del contenedor (`map.set(key, ...)`, `set.add(value)`, `obj[key] = ...`).
- **Spec que lo cubre:** No tiene spec específico.

### CR-10 — Import circular `structexe.ts` ↔ `internalUtils.ts` ⏳ PENDIENTE

- **Archivo:línea:** `src/structexe.ts:15` ↔ `src/internalUtils.ts:1-2`
- **Estado verificado 2026-06-04:** ⏳ PENDIENTE
- **Descripción:** `internalUtils.ts` importa `_exe_`, `ManagementHierarchicalDataObj`, `ManagementReactionsObj` desde `structexe.ts`; mientras `structexe.ts` importa muchas cosas desde `internalUtils.ts`. TypeScript lo resuelve por orden de carga, pero cualquier nuevo `use` antes del `class` puede petar.
- **Fix pendiente:** Refactorizar — ver R1 en sección de Refactors Arquitectónicos.
- **Spec que lo cubre:** No aplica.

---

## 2. Errores Importantes (IM)

### IM-01 — `muting` y `transformValue` ignorados en `_exe_.set` ✅ ARREGLADO

- **Archivo:línea:** `src/structexe.ts:111, 121` + `src/internalUtils.ts:147`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:** `_exe_.set` propaga los parámetros al callback de `route`, y `setProperty_strict` los aplica correctamente.
- **Spec que lo cubre:** Implícito en specs de `set()`.

### IM-02 — Notificaciones durante init recursivo ✅ ARREGLADO

- **Archivo:línea:** `src/internalUtils.ts:849-897`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:**
  ```ts
  let stateGets = managementHierarchicalData.rootManagement.observingGets;
  managementHierarchicalData.rootManagement.observingGets = false;
  let wasBuffering = managementHierarchicalData.rootManagement.getBuffer();
  if (!wasBuffering) managementHierarchicalData.rootManagement.setBuffer(true);
  // ... recursion ...
  managementHierarchicalData.rootManagement.clearBuffer();  // sin flush
  if (!wasBuffering) managementHierarchicalData.rootManagement.setBuffer(false);
  managementHierarchicalData.rootManagement.observingGets = stateGets;
  ```
- **Spec que lo cubre:** Implícito en `newStruct_exe_()`.

### IM-03 — `declineReact` sin guarda de existencia 🟡 PARCIAL

- **Archivo:línea:** `src/structexe.ts:765`
- **Estado verificado 2026-06-04:** 🟡 PARCIAL
- **Progreso:** El guard `if (!reaction) throw new Error('Reaction with id ${id} not found')` existe y funciona.
- **🟡 Pendiente:** `declineReact` con `id` inválido crashea en `structexe.ts:768` con `Cannot read property 'change' of undefined` cuando el guard NO detecta el id — el spec `it.fails` documenta esto como bug pendiente.
- **Spec que lo cubre:** `index.spec.ts:222-227` (verifica el throw), e `index.spec.ts:229-238` (regression de subscription pause).

### IM-04 — `route` con path vacío y `_exe_Path` undefined ✅ ARREGLADO

- **Archivo:línea:** `src/structexe.ts:234-237, 243-245`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:** `const finalPath = _exe_Path ?? ''` antes de invocar callback.
- **Spec que lo cubre:** `index.spec.ts:138-146` ("handles empty path with altOrigin").

### IM-05 — `case noObserv` duplicado 🟡 PARCIAL

- **Archivo:línea:** `src/internalUtils.ts:731-748` (original) y `src/internalUtils.ts:749-836` (default)
- **Estado verificado 2026-06-04:** 🟡 PARCIAL
- **Progreso:** El duplicado original fue eliminado. PERO el bloque `default` ahora **duplica la lógica** del `case processingType.observ:` (líneas 642-730).
- **Pendiente:** Consolidar — `default` debería simplemente llamar a la lógica de `observ`, o usar un factory compartido.
- **Spec que lo cubre:** No tiene spec específico.

---

## 3. Errores Menores (MN)

### MN-01 — Filename typo `inernalUtils.ts` 🟡 PARCIAL

- **Archivo:línea:** `src/internalUtils.ts` (renombrado correctamente) y `test.ts:2` (aún con typo)
- **Estado verificado 2026-06-04:** 🟡 PARCIAL
- **Progreso:** Archivo fuente renombrado a `internalUtils.ts` ✅.
- **🟡 Pendiente:** `test.ts:2` aún importa de `'./src/inernalUtils'` (con `i` después de `n`). **El script `test.ts` está ROTO** — no se puede ejecutar.
- **Spec que lo cubre:** N/A (script manual).
- **Fix:** Editar `test.ts:2` → `'./src/internalUtils'`.

### MN-02 — Property typo `intenal_utils` ✅ ARREGLADO en código (typo en docs)

- **Archivo:línea:** `src/structexe.ts:28` (código) y `README.md:133` (documentación)
- **Estado verificado 2026-06-04:** ✅ ARREGLADO en código
- **Diff conceptual:** `static internal_utils = InternalUtils`.
- **🟡 Pendiente:** `README.md` línea 133 sigue documentando `_exe_.intenal_utils` con typo.
- **Spec que lo cubre:** N/A.

### MN-03 — `Date_` semántica ✅ ARREGLADO

- **Archivo:línea:** `src/internalUtils.ts:75-78`
- **Estado verificado 2026-06-04:** ✅ ARREGLADO
- **Diff conceptual:** `super(value.getTime())` para preservar valor.
- **Spec que lo cubre:** `index.spec.ts:303-307` ("handles Date objects").

---

## 4. Bugs Nuevos (N1-N19) — descubiertos 2026-06-04

> **Severidad:** 🔴 Crítico · 🟡 Importante · 🟢 Menor
> **Estado:** Todos ⏳ PENDIENTE

| ID | Sev | Archivo:línea | Descripción corta |
| :--- | :---: | :--- | :--- |
| **N1** | 🔴 | `internalUtils.ts:594-606, 657-670, 764-778` | Map/Set proxy `set` trap usa `Object.getOwnPropertyDescriptor(target, property)?.value` para `oldValue` — no funciona en Map/Set. `datoActual` siempre undefined. |
| **N2** | 🔴 | `internalUtils.ts:580-641` | Map/Set proxy handler no incluye traps para `delete`, `clear`, `has`, `forEach`, `entries`, `keys`, `values`, `size`. Mitad de operaciones Map/Set sin tracking. |
| **N3** | 🔴 | `internalUtils.ts:161` | `Set propertyExists` usa `target.has(string)` — pero `property` es índice numérico (string), no valor del set. Check siempre false. |
| **N4** | 🔴 | `internalUtils.ts:280-289` | `Set getByStr` retorna input key como value (`if (target.has(property)) value = property` — lógica invertida). |
| **N5** | 🔴 | `structexe.ts:873-881` | Fathers filter direction reversed: `ruta.indexOf(dataChange.ruta) === 0` en lugar de `dataChange.ruta.indexOf(ruta) === 0`. **🔴 Feature rota silenciosa: fathers nunca disparan reactions.** |
| **N6** | 🔴 | `structexe.ts:729-732` | `popReactions` muta `reaction.change.ruta` ANTES de filtrar del index. Causa bucket incorrecto y memory leak. |
| **N7** | 🔴 | `structexe.ts:892-895` | `_exe_React` muta `dataChange.hito = typeChange.change` mid-iteration y se llama recursivamente. Loop potencial cuando `datoActual != datoNuevo` repetidamente. |
| **N8** | 🟡 | `internalUtils.ts:188-190 + 547-551` | Doble-fire de reactions: el proxy `set` notifica, pero `setProperty_strict` (llamado por el path) también notifica. |
| **N9** | 🟡 | `internalUtils.ts:302` | `getByStr` default branch hace `target.toString()` sin null guard — crashea si target es null. |
| **N10** | 🟡 | `internalUtils.ts:67, 73, 80` | Wrappers primitive `toString()` retorna `String(this.value)` que es string, pero la firma TS es `: string` (no `override`). Falla strict mode. |
| **N11** | 🟡 | `internalUtils.ts:107-110` | `name_simbol_internal_exe_property` typo en API pública. Debería ser `name_symbol_internal_exe_property`. |
| **N12** | 🟡 | `structexe.ts:538-539` | Path encoding inconsistente: `react` usa `+ '|' + dat`, pero `setProperty_strict:232` usa `[`/`]` para array/map/set. No hay helper unificado. |
| **N13** | 🟡 | `internalUtils.ts:861-864` | `for (let key in thisArg)` pierde Symbol keys. Debería usar `Reflect.ownKeys(target)`. |
| **N14** | 🟡 | `internalUtils.ts:873-878` | Map recursive assimilation llama `newProxy` directo en lugar de `setProperty_strict`, evitando la ruta de notificación. Bypass silencioso. |
| **N15** | 🟢 | `structexe.ts:155-188` | `route` mutates el parámetro `path` directamente (`if (path === '') path = _exe_.path(cursor)`). Side effect sobre argumento del caller. |
| **N16** | 🟢 | `structexe.ts:296-333` | `_exe_.export(thisArg, property)` con `thisArg === null` crashea en `getByStr(null, ...)`. |
| **N17** | 🟢 | `internalUtils.ts:151` | `oldValue = _exe_.export(thisArg, property)` invoca `export` recursivo innecesariamente. Para Map/Set sería más directo `target.get(property)`. |
| **N18** | 🟢 | `internalUtils.ts:154-165` | Map `propertyExists` chequea `has(property)` con `property: string` — si la key original era número/objeto, falla. |
| **N19** | 🟢 | `structexe.ts:572, 596, 605` | `bufferReactions` (clase) y `index` + `reactions` (campos privados de `ManagementReactionsObj`) son **dos sistemas de storage paralelos**. Riesgo de inconsistencia. |

---

## 5. Bugs de Documentación (D1-D5)

### D1 — README.md línea 133: typo `_exe_.intenal_utils` ⏳

- **Archivo:** `README.md:133`
- **Realidad:** El código tiene `static internal_utils` (typo corregido en código).
- **Fix:** Cambiar `_exe_.intenal_utils` → `_exe_.internal_utils`.

### D2 — README.md línea 135: nombre de archivo obsoleto ⏳

- **Archivo:** `README.md:135`
- **Dice:** "Importaciones circulares existen entre `structexe.ts` e `inernalUtils.ts`"
- **Realidad:** El archivo ahora se llama `internalUtils.ts`.
- **Fix:** Cambiar `inernalUtils.ts` → `internalUtils.ts`.

### D3 — README.md líneas 87-89: API documentada que no es pública ⏳

- **Archivo:** `README.md:87-89`
- **Items documentados como públicos que NO lo son:**
  - `getBuffer`/`setBuffer`/`pushSubBuffer`/`popSubBuffer`/`clearBuffer` — son métodos de `ManagementReactionsObj` accesibles vía `rootManagement`, no parte de la API pública.
  - `InternalUtils.ghostSet` — existe en código, pero `InternalUtils` no se exporta desde `index.ts`.
- **Fix:** Marcar como `(USO INTERNO)` o eliminarlos de la documentación pública.

### D4 — README.md líneas 17, 124-129: APIs no documentadas ⏳

- **Archivo:** `README.md:17, 124-129`
- **APIs reales no documentadas:**
  - `OptionalParams<T>` (`internalUtils.ts:21`)
  - `datChange` interface con campo `thisArg` (`internalUtils.ts:147-154`)
  - `ManagementReaction`, `ManagementReactionObj` (`internalUtils.ts:132-145`)
  - `internal_exe_property` symbol (exportado desde `structexe.ts:17`)
- **Fix:** Añadir sección "API completa" en README listando los exports de `index.ts`.

### D5 — `test.ts:2` ROTO por import path obsoleto ⏳

- **Archivo:** `test.ts:2`
- **Dice:** `import { TypeStruct_exe_, datChangeObj } from './src/inernalUtils';`
- **Debería ser:** `'./src/internalUtils'`.
- **Impacto:** Script manual de testing no se puede ejecutar.
- **Fix:** Editar `test.ts:2` → `'./src/internalUtils'`.

---

## 6. Refactors Arquitectónicos (R1-R5)

### R1 — Romper el import circular `structexe.ts` ↔ `internalUtils.ts`

- **Problema:** `internalUtils.ts:1-2` importa de `structexe.ts`; `structexe.ts:15` importa de `internalUtils.ts`.
- **Solución propuesta:**
  1. Activar `types.ts` (actualmente código muerto) con declaraciones `interface` forward.
  2. En `internalUtils.ts` importar solo de `types.ts` (interfaces) y `structexe.ts` (valores).
  3. Mover `ManagementReactionsObj` y `ManagementHierarchicalDataObj` a `types.ts` como clases, no interfaces.
  4. Verificar que el bundle sigue funcionando con `npm run build:structexe`.
- **Prioridad:** 🔴 Crítico (CR-10 depende de esto).

### R2 — Eliminar duplicación `default` ↔ `observ` en `newProxy`

- **Problema:** `internalUtils.ts:749-836` (default) duplica 88 líneas de `internalUtils.ts:642-730` (observ).
- **Solución:** Extraer la factory a una función `buildObservHandler(...)` y que ambos cases la invoquen.
- **Prioridad:** 🟡 Importante (IM-05 depende de esto).

### R3 — Consolidar storage de `bufferReactions` + `index` + `reactions`

- **Problema:** Tres sistemas paralelos (N19).
- **Solución:** Unificar en una sola estructura con discriminador `state`.
- **Prioridad:** 🟢 Menor (refactor, no bug funcional inmediato).

### R4 — Helper unificado `pathSeparator(type, property)`

- **Problema:** N12 — encoding inconsistente entre `react` (`+ '|' + dat`) y `setProperty_strict` (`[`/`]`).
- **Solución:** Función `pathSeparator(processingType, property)` en `internalUtils.ts`.
- **Prioridad:** 🟡 Importante.

### R5 — Eliminar `setProperty_strict` y `getByStr` cuando hay APIs más limpias

- **Problema:** N17, N18 — uso ineficiente de `export`/`has` cuando hay acceso directo.
- **Solución:** Reemplazar `oldValue = _exe_.export(thisArg, property)` por acceso directo al target.
- **Prioridad:** 🟢 Menor.

---

## 7. Plan de Acción Recomendado

### Fase 0 — Test Runner ✅ COMPLETADO

> **Estado:** ✅ HECHO en sesión 2026-06-04

- [x] Instalar Vitest 2.1.9 + `@vitest/coverage-v8` 2.1.9.
- [x] Crear `vitest.config.ts` con thresholds (60% statements, 50% branches, 60% functions, 60% lines).
- [x] Crear `src/index.spec.ts` con **35 specs** cubriendo:
  - `be()`, `newStruct_exe_()`, `set()`, `setIfn_()`, `route()`, `forEach()`, `export()`, `react()`/`declineReact()`, `path()`, enums, edge cases.
  - Regresiones para CR-01/03/04, IM-03/04, MN-03.
  - `it.fails` para documentar bugs conocidos (N2, N5/N6, N7, N9, N16, CR-06).
- [x] Configurar scripts en `package.json`: `test`, `test:watch`, `test:coverage`.
- [x] Excluir `src/index.ts` (barrel) y `src/types.ts` (código muerto) de coverage.

**Resultado:** `npm test` corre 35 specs; 4 fallan (los `it.fails` que documentan bugs); el resto pasa como regression suite.

### Fase 1 — Bugs Críticos (CR-09, CR-10, N1-N7)

> **Objetivo:** Resolver los 7 bugs críticos nuevos + cerrar CR-09 y CR-10.

#### Fase 1.1 — CR-10 (pre-requisito)

- [ ] R1: Romper el import circular.
  - Activar `types.ts` re-exportándolo desde `index.ts`.
  - Convertir `interface` en `class` para `ManagementReactionsObj` y `ManagementHierarchicalDataObj` en `types.ts`.
  - Mover `InternalUtils` (clase) a `types.ts` o dejarla en `internalUtils.ts` pero solo importar interfaces de `types.ts`.

#### Fase 1.2 — N1, N2, N3, N4 (Map/Set Proxy)

- [ ] N1: En los 4 sitios de `set` trap (líneas 594-606, 657-670, 764-778, y el de la línea 547-551), reemplazar `Object.getOwnPropertyDescriptor(target, property)?.value` por:
  ```ts
  let oldValue: any = (target instanceof Map) ? target.get(property) :
                       (target instanceof Set) ? (target.has(property) ? property : undefined) :
                       Object.getOwnPropertyDescriptor(target, property)?.value;
  ```
- [ ] N2: Añadir traps `deleteProperty`, `clear`, `has` (con `callReact` para `geter`).
- [ ] N3: En `setProperty_strict:161`, corregir:
  ```ts
  } else if (management.processingType === processingType.set) {
    // Para set, property es el índice numérico. Buscar por valor en set.values()
    propertyExists = Array.from((thisArg as Set<any>).values())[Number(property)] !== undefined;
  }
  ```
- [ ] N4: En `getByStr:280`, corregir:
  ```ts
  case processingType.set: {
    if ((target as Set<any>).has(property)) {
      // value = el valor del set, no la key (que es índice)
      const values = Array.from((target as Set<any>).values());
      value = values[Number(property)];
    }
    // ...
  }
  ```

#### Fase 1.3 — N5 (fathers filter)

- [ ] En `structexe.ts:873`, invertir la dirección del filtro:
  ```ts
  // Antes:
  let rutasPadre = Object.keys(...).filter((ruta) => ruta.indexOf(dataChange.ruta) === 0)
  // Ahora:
  let rutasPadre = Object.keys(...).filter((ruta) => dataChange.ruta.indexOf(ruta) === 0)
  ```
- [ ] Crear spec `it('fathers reactions fire on child change')` (debe pasar tras el fix).

#### Fase 1.4 — N6 (popReactions)

- [ ] En `structexe.ts:729-732`, filtrar PRIMERO, luego mutar:
  ```ts
  let prefix = this.root._exe_.path + '|' + propiedad
  let reactionsDonadas = Object.values(this.reactions).filter(
      (reaction) => reaction.change.ruta.indexOf(prefix) === 0
  )
  reactionsDonadas.forEach((reaction) => {
      const oldKey = reaction.change.ruta
      reaction.change.ruta = reaction.change.ruta.replace(prefix, '/')
      // Ahora filtrar del index usando la key nueva:
      this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta] =
          (this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta] || [])
              .filter((index) => index != reaction.manage.id)
  })
  ```

#### Fase 1.5 — N7 (_exe_React re-entry)

- [ ] En `structexe.ts:892-895`, clonar `dataChange` antes de mutar:
  ```ts
  if (dataChange.hito != typeChange.change &&
      _exe_.internal_utils.stringify(dataChange.datoActual) != _exe_.internal_utils.stringify(dataChange.datoNuevo)) {
    const changeEvent = new datChangeObj({ ...dataChange, hito: typeChange.change })
    this._exe_React(changeEvent)
  }
  ```

#### Fase 1.6 — CR-09 (non-string keys en Map)

- [ ] Refactorizar `setProperty_strict` para aceptar `property: string | symbol | object`.
- [ ] Dispatch por `processingType` del contenedor.

**Entregable Fase 1:** `npm test` pasa 35+ specs, sin `it.fails`. Coverage > 70%.

### Fase 2 — Refactors (R1-R5)

> **Objetivo:** Deuda técnica que el bug surface de Fase 1 evidenció.

- [ ] R2: Consolidar default ↔ observ duplication (88 líneas).
- [ ] R4: Helper `pathSeparator(type, property)`.
- [ ] R5: Reemplazar `oldValue = _exe_.export(...)` por acceso directo.
- [ ] R3: Consolidar storage de bufferReactions.
- [ ] R1: si no se hizo en Fase 1.1, hacerlo aquí.

### Fase 3 — Cobertura

> **Objetivo:** Llevar coverage de 60% a 85%+.

#### Specs prioritarios a añadir

- [ ] `spec/primitives.spec.ts` — String_/Number_/Boolean_/Date_ wrappers (10 specs).
- [ ] `spec/map-set.spec.ts` — N1-N4, Map/Set operations (15 specs).
- [ ] `spec/reactions.spec.ts` — N5-N8, scope local/childens/fathers/all (20 specs).
- [ ] `spec/route-wildcards.spec.ts` — `(?:?)`, `(*)`, `?` patterns (10 specs).
- [ ] `spec/edge-cases.spec.ts` — null, undefined, Object.create(null), circular refs (10 specs).
- [ ] `spec/buffer.spec.ts` — push/pop subBuffer, clearBuffer, flush (8 specs).

**Total esperado:** 73 specs adicionales → 108 specs totales.

### Fase 4 — Limpieza

> **Objetivo:** Eliminar tech debt visible.

- [ ] **N11 (typo API pública):** Renombrar `name_simbol_internal_exe_property` → `name_symbol_internal_exe_property`. Marcar el viejo como `@deprecated`.
- [ ] **N10 (wrappers toString):** Cambiar firma `override toString(): string` y eliminar el cast a String.
- [ ] **types.ts muerto:** Decidir — activar (Fase 1.1) o eliminar.
- [ ] **D1-D4 (docs):** Corregir README.md.
- [ ] **D5 (test.ts roto):** Corregir import.
- [ ] **Eliminar `debug6.ts`** de la raíz del proyecto (es script de debugging obsoleto).

---

## 8. Tabla Resumen de Verificación

| ID | Sev | Estado 2026-06-04 | Línea verificada | Spec cubre | Acción |
| :--- | :---: | :--- | :--- | :--- | :--- |
| CR-01 | 🔴 | ✅ Arreglado | `internalUtils.ts:560` | indirecto | Cerrar |
| CR-02 | 🔴 | ✅ Arreglado | `internalUtils.ts:694-706, 801-813` | — | Cerrar |
| CR-03 | 🔴 | ✅ Arreglado | `internalUtils.ts:291-300` | indirecto | Cerrar |
| CR-04 | 🔴 | ✅ Arreglado | `structexe.ts:95` | sí | Cerrar |
| CR-05 | 🔴 | ✅ Arreglado | `structexe.ts:224` | — | Cerrar |
| CR-06 | 🔴 | 🟡 Parcial | `internalUtils.ts:352` | sí (asserta throw) | Fase 1.6 |
| CR-07 | 🔴 | ✅ Arreglado | `structexe.ts:659, 691` | — | Cerrar |
| CR-08 | 🔴 | ✅ Arreglado | `internalUtils.ts:155-166` | indirecto | Cerrar |
| CR-09 | 🔴 | 🟡 Parcial | `internalUtils.ts:865-880` | — | Fase 1.6 |
| CR-10 | 🔴 | ⏳ Pendiente | `structexe.ts:15` ↔ `internalUtils.ts:1-2` | — | Fase 1.1 |
| IM-01 | 🟡 | ✅ Arreglado | `structexe.ts:111,121` | indirecto | Cerrar |
| IM-02 | 🟡 | ✅ Arreglado | `internalUtils.ts:849-897` | indirecto | Cerrar |
| IM-03 | 🟡 | 🟡 Parcial | `structexe.ts:765, 768` | sí (parcial) | Fase 3 |
| IM-04 | 🟡 | ✅ Arreglado | `structexe.ts:234-237` | sí | Cerrar |
| IM-05 | 🟡 | 🟡 Parcial | `internalUtils.ts:749-836` | — | Fase 2 (R2) |
| MN-01 | 🟢 | 🟡 Parcial | `test.ts:2` | — | Fase 4 (D5) |
| MN-02 | 🟢 | ✅ Arreglado (código) | `structexe.ts:28`, `README.md:133` | — | Fase 4 (D1) |
| MN-03 | 🟢 | ✅ Arreglado | `internalUtils.ts:75-78` | sí | Cerrar |
| N1 | 🔴 | ⏳ Pendiente | `internalUtils.ts:594-606, 657-670, 764-778` | — | Fase 1.2 |
| N2 | 🔴 | ⏳ Pendiente | `internalUtils.ts:580-641` | sí (`it.fails`) | Fase 1.2 |
| N3 | 🔴 | ⏳ Pendiente | `internalUtils.ts:161` | — | Fase 1.2 |
| N4 | 🔴 | ⏳ Pendiente | `internalUtils.ts:280-289` | — | Fase 1.2 |
| N5 | 🔴 | ⏳ Pendiente | `structexe.ts:873-881` | — | Fase 1.3 |
| N6 | 🔴 | ⏳ Pendiente | `structexe.ts:729-732` | — | Fase 1.4 |
| N7 | 🔴 | ⏳ Pendiente | `structexe.ts:892-895` | — | Fase 1.5 |
| N8 | 🟡 | ⏳ Pendiente | `internalUtils.ts:188-190 + 547-551` | — | Fase 1 |
| N9 | 🟡 | ⏳ Pendiente | `internalUtils.ts:302` | sí (`it.fails`) | Fase 1 |
| N10 | 🟡 | ⏳ Pendiente | `internalUtils.ts:67, 73, 80` | — | Fase 4 |
| N11 | 🟡 | ⏳ Pendiente | `internalUtils.ts:107-110` | — | Fase 4 |
| N12 | 🟡 | ⏳ Pendiente | `structexe.ts:538-539` | — | Fase 2 (R4) |
| N13 | 🟡 | ⏳ Pendiente | `internalUtils.ts:861-864` | — | Fase 3 |
| N14 | 🟡 | ⏳ Pendiente | `internalUtils.ts:873-878` | — | Fase 1.6 |
| N15 | 🟢 | ⏳ Pendiente | `structexe.ts:155-188` | — | Fase 2 |
| N16 | 🟢 | ⏳ Pendiente | `structexe.ts:296-333` | sí (`it.fails`) | Fase 1 |
| N17 | 🟢 | ⏳ Pendiente | `internalUtils.ts:151` | — | Fase 2 (R5) |
| N18 | 🟢 | ⏳ Pendiente | `internalUtils.ts:154-165` | — | Fase 1.2 |
| N19 | 🟢 | ⏳ Pendiente | `structexe.ts:572, 596, 605` | — | Fase 2 (R3) |
| D1 | 📚 | ⏳ | `README.md:133` | — | Fase 4 |
| D2 | 📚 | ⏳ | `README.md:135` | — | Fase 4 |
| D3 | 📚 | ⏳ | `README.md:87-89` | — | Fase 4 |
| D4 | 📚 | ⏳ | `README.md:17, 124-129` | — | Fase 4 |
| D5 | 📚 | ⏳ | `test.ts:2` | — | Fase 4 |

**Tasa de resolución del plan original:** 13/18 = 72% totalmente arreglados · 4/18 = 22% parcial · 1/18 = 6% pendiente.
**Bugs nuevos (N1-N19):** 0/19 arreglados (todos ⏳).
**Bugs docs (D1-D5):** 0/5 arreglados (todos ⏳).
**Spec coverage:** 35 specs creados (Fase 0) + ~73 specs planeados (Fase 3) = ~108 totales.

---

## 9. Notas Arquitectónicas

### Sobre R1 (romper el import circular)

El import circular entre `structexe.ts` y `internalUtils.ts` es un **anti-patrón latente** que TypeScript resuelve por orden de carga. Funciona hoy porque:

1. `structexe.ts:15` importa primero las **clases** de `internalUtils.ts` (no las usa inmediatamente).
2. `internalUtils.ts:1-2` importa `_exe_` de `structexe.ts`.
3. Como `_exe_` es una clase (no una instancia), TypeScript permite la referencia forward.

**Riesgo:** Si alguien añade un `use _exe_` antes de la declaración de la clase en `internalUtils.ts`, el build fallará. Ya existe `types.ts` (189 líneas) con declaraciones forward — está **muerto** (no se importa en ningún archivo fuente). La solución R1 es **activar `types.ts`** re-exportándolo desde `index.ts` y moviendo las definiciones de clases/interfaces allí. Esto permite que `internalUtils.ts` importe solo tipos de `types.ts` (no valores) y rompa la circularidad real.

### Sobre `setProperty_strict`

Es la pieza más crítica del sistema. Se invoca desde:

- `_exe_.set` (vía `route` callback).
- `newProxy` (vía recursive assimilation, líneas 861, 873, 887).
- `_exe_.internal_utils.ghostSet` (línea 127).

**Problemas conocidos** que motivan múltiples bugs:

1. **`property: string`** — la API asume string keys. CR-09, N18 dependen de flexibilizar esto.
2. **`oldValue = _exe_.export(thisArg, property)`** (línea 151) — ineficiente y propaga N17.
3. **Doble-fire** con el `set` trap del proxy (N8) — el handler notifica, luego `setProperty_strict` notifica de nuevo.

**Refactor recomendado** (parte de R5 + Fase 1.6):

```ts
static setProperty_strict<T>(
    thisArg: any,
    property: string | symbol | object,
    value: T,
    muting?: boolean,
    transformValue: boolean = true
): TypeStruct_exe_<T> {
    const management = _exe_.internal_utils.get_exe_(thisArg);
    if (!management) throw new Error('thisArg is not a managed proxy');

    const typeTarget = _exe_.internal_utils.gestType(management.structObj);
    const target = _exe_.internal_utils.getByStr(thisArg, String(property));

    // propertyExists: dispatch por tipo
    let propertyExists: boolean;
    if (typeTarget === processingType.map) {
        propertyExists = (management.structObj as Map<any, any>).has(property as any);
    } else if (typeTarget === processingType.set) {
        // Set no tiene key; propertyExists basado en índice
        propertyExists = Array.from((management.structObj as Set<any>).values())[Number(property)] !== undefined;
    } else {
        propertyExists = (property as string) in management.structObj;
    }

    // oldValue: acceso directo, NO _exe_.export
    let oldValue: any;
    if (typeTarget === processingType.map) {
        oldValue = (management.structObj as Map<any, any>).get(property as any);
    } else if (typeTarget === processingType.set) {
        oldValue = target; // en set, el "value" es el miembro, no un slot
    } else {
        oldValue = management.structObj[property as string];
    }

    // ... resto de la lógica (transformValue, newProxy, asignación, notificación)
}
```

**Beneficios:**

- Rompe CR-09 (non-string keys).
- Cierra N17 (oldValue directo).
- Cierra N18 (Map key correcto).
- Prepara el terreno para N1, N3, N4 (unificación del path Map/Set).

---

## Leyenda

- ✅ Arreglado · 🟡 Parcial · ⏳ Pendiente · ❌ Descartado · ⏭️ Pospuesto
- 🔴 Crítico · 🟡 Importante · 🟢 Menor · 📚 Documentación

## Historial

| Fecha | Cambio |
| :--- | :--- |
| 2026-06-04 | Creación del plan. Verificación inicial: 13/18 del plan original arreglados, 4 parciales, 1 pendiente. 19 bugs nuevos descubiertos. 5 bugs de docs. |
| 2026-06-04 | Fase 0 completada: Vitest + 35 specs. |
| 2026-06-04 | Re-verificación: estados actualizados, plan de 5 fases definido. |
