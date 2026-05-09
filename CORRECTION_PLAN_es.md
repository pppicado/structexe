# Plan de Correccion - structexe

> **Fecha de analisis:** 2026-05-05
> **Archivos analizados:**
> - `src/structexe.ts`
> - `src/inernalUtils.ts`
> - `src/index.ts`
> - `test.ts`
> - `debug6.ts`

---

## Tabla de Contenidos

1. [Errores Criticos](#errores-criticos)
2. [Errores Importantes](#errores-importantes)
3. [Errores Menores](#errores-menores)
4. [Plan de Accion Recomendado](#plan-de-accion-recomendado)
5. [Notas Arquitectonicas](#notas-arquitectonicas)

---

## Errores Criticos

Estos errores provocan crashes en runtime, comportamiento silenciosamente incorrecto, o corrupcion de estado.

---

### CR-01: Precedencia del operador ternario rota en `observingGets` para arrays/objetos

**Archivo:** `src/inernalUtils.ts`
**Linea:** ~527 (dentro del proxy handler `get` para `processingType.array` / `processingType.object`)

```typescript
ruta: managementHierarchicalData.path + (typeProcessing == processingType.array) ? '[' + property.toString() + ']' : '|' + property.toString(),
```

**Motivo del problema:**
El operador `+` tiene mayor precedencia que `?`. La expresion se evalua como:

```typescript
(managementHierarchicalData.path + (typeProcessing == processingType.array)) ? ... : ...
```

Por lo tanto, cuando `typeProcessing` es `array`, el lado izquierdo del ternario es un string no vacio (truthy), y siempre se toma la rama `[prop]`. Cuando es `object`, el lado izquierdo es un string (tambien truthy porque `path` termina en `/`), y tambien se evalua a `[prop]`.

**Impacto:**
Todas las notificaciones de `get` (cuando `observingGets` esta activo) generan rutas malformadas como `/|app[version]` en vez de `/|app|version`. Esto rompe el sistema de reacciones porque las suscripciones nunca coinciden con la ruta notificada.

**Posibles soluciones:**

1. **Parentesis explicitos (recomendado):**
   ```typescript
   ruta: managementHierarchicalData.path + ((typeProcessing == processingType.array) ? '[' + property.toString() + ']' : '|' + property.toString()),
   ```

2. **Funcion auxiliar de separador:**
   ```typescript
   const sep = (type: processingType, prop: string) =>
     type === processingType.array ? `[${prop}]` : `|${prop}`;
   ```

---

### CR-02: `Map.prototype.set` no devuelve booleano

**Archivo:** `src/inernalUtils.ts`
**Lineas:** 681, 770

```typescript
if (valueBound(propertyKey, propertyValue)) {
    // notifica cambio
}
```

**Motivo del problema:**
`Map.prototype.set(key, value)` devuelve la instancia del Map (para encadenamiento), **no** un booleano indicando exito. El valor retornado es siempre truthy, por lo que la condicion `if` siempre entra, y se notifican cambios incluso cuando el valor es identico al anterior.

**Impacto:**
Reacciones duplicadas/spam. Si haces `map.set('k', 'v')` y luego `map.set('k', 'v')`, se disparan dos notificaciones. Esto puede causar loops infinitos en reacciones que re-escriben valores.

**Posibles soluciones:**

1. **Comparar oldValue antes de notificar:**
   ```typescript
   let oldValue = target.get(propertyKey);
   valueBound(propertyKey, propertyValue);
   if (oldValue !== propertyValue) {
       // notificar
   }
   ```

2. **Usar `has` + comparacion:**
   ```typescript
   const had = target.has(propertyKey);
   const old = had ? target.get(propertyKey) : undefined;
   target.set(propertyKey, propertyValue);
   if (!had || old !== propertyValue) {
       // notificar
   }
   ```

---

### CR-03: `getByStr` no soporta `processingType.array`

**Archivo:** `src/inernalUtils.ts`
**Linea:** 236 (switch de `getByStr`)

```typescript
switch (_exe_.intenal_utils.gestType(target)) {
    case processingType.object: { ... }
    case processingType.map: { ... }
    case processingType.set: { ... }
    default:
        err = `Object or property typeError: ${property} in "${target.toString()}"`
}
```

**Motivo del problema:**
El `switch` maneja `object`, `map` y `set`, pero **no tiene case para `processingType.array`**. Cuando se intenta leer una propiedad de un array gestionado por `_exe_`, cae en el `default` y devuelve error.

**Impacto:**
Cualquier operacion que internamente use `getByStr` sobre un array falla. Esto incluye asignaciones profundas, lecturas, y posiblemente exportacion.

**Posibles soluciones:**

1. **Agregar case para array:**
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

2. **Delegar a `Reflect.get` para todos los casos que no sean Map/Set:**
   ```typescript
   case processingType.object:
   case processingType.array:
       value = Reflect.get(target, property);
       if (value === undefined && !(property in target))
           err = `property ${property} not found`;
       break;
   ```

---

### CR-04: `setIfn_` crashea con `oval` por defecto `undefined`

**Archivo:** `src/structexe.ts`
**Linea:** 87

```typescript
static setIfn_<T>(target: T, property: string, value?: any, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    let actVal = _exe_.intenal_utils.getByStr(target, property);
    if (actVal == undefined || actVal.toString() != oval.toString())
        _exe_.set(target, property, value, muting);
    ...
}
```

**Motivo del problema:**
Si no se pasa `oval`, su valor por defecto es `undefined`. Si `actVal` no es `undefined` (por ejemplo, es `0` o `''`), la condicion `actVal == undefined` es `false`, y se evalua `oval.toString()`, que es `undefined.toString()` -> **TypeError: Cannot read properties of undefined (reading 'toString')**.

**Impacto:**
Crash en runtime cada vez que se usa `setIfn_` o `setIf` con un valor existente y sin proveer el parametro `oval`.

**Posibles soluciones:**

1. **Guarda explicita para `undefined`:**
   ```typescript
   if (actVal == undefined || (oval !== undefined && actVal.toString() != oval.toString()))
   ```

2. **Usar `Object.is` o comparacion estricta con guarda:**
   ```typescript
   const shouldSet = actVal === undefined ||
                       (oval !== undefined && actVal?.toString() !== oval?.toString());
   ```

3. **Revisar la semantica deseada:** Realmente se quiere que `oval` sea opcional? Si es obligatorio, marcarlo sin valor por defecto.

---

### CR-05: `value.toString()` sin guarda en `route` wildcard

**Archivo:** `src/structexe.ts`
**Linea:** 210

```typescript
if ((keyFind === '?' || keyFind === stringKey) && (all || valueFind === value.toString())) {
```

**Motivo del problema:**
En el metodo `route`, cuando se usa la sintaxis de wildcard `(propiedad:valor)`, se compara `valueFind` (string extraido del path) con `value.toString()`. Si `value` es `null` o `undefined`, `value.toString()` lanza TypeError.

**Impacto:**
Crash al iterar sobre estructuras que contienen valores `null` o `undefined` usando wildcards en `route`.

**Posibles soluciones:**

1. **Usar template string con coercion segura:**
   ```typescript
   (all || valueFind === String(value))
   ```

2. **Normalizacion previa:**
   ```typescript
   const valueStr = value == null ? '' : String(value);
   ```

---

### CR-06: `gestTypeDetailed` crashea con objetos sin `constructor`

**Archivo:** `src/inernalUtils.ts`
**Linea:** 320

```typescript
if (detailed == "object") {
    ...
    switch (valueTest.constructor.name) {
```

**Motivo del problema:**
Los objetos creados con `Object.create(null)` no tienen propiedad `constructor`. Acceder a `valueTest.constructor.name` lanza TypeError.

**Impacto:**
Crash si se intenta wrappear un objeto null-prototype. Ademas, si `valueTest` es un objeto cuyo constructor fue sobreescrito a `undefined`, tambien crashea.

**Posibles soluciones:**

1. **Guarda explicita:**
   ```typescript
   if (detailed === "object") {
       if (valueTest != null && valueTest.constructor != null && valueTest.constructor.name != null) {
           switch (valueTest.constructor.name) { ... }
       } else {
           detailed = "object";
       }
   }
   ```

2. **Usar `Object.prototype.toString.call` como fallback:**
   ```typescript
   const ctorName = valueTest?.constructor?.name ?? Object.prototype.toString.call(valueTest).slice(8, -1);
   ```

---

### CR-07: `popSubBuffer` / `clearSubBuffer` tratan `id=0` como `undefined`

**Archivo:** `src/structexe.ts`
**Lineas:** 599-601, 628-630

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

**Motivo del problema:**
El primer subBuffer tiene `id = 1` (por `contSubBufferReactions++` antes de `push`). Sin embargo, si en algun momento el contador empieza en 0 o se resetea, `id = 0` es falsy. La expresion `(id)` evalua `0` como `false`, y `!id` evalua `0` como `true`.

**Impacto:**
- `popSubBuffer(0)` extrae el ultimo buffer en vez del de id 0.
- `clearSubBuffer(0)` limpia **todos** los subBuffers.

**Posibles soluciones:**

1. **Chequear contra `undefined` explicitamente:**
   ```typescript
   let subBuffer = (id !== undefined) ? ... : ...
   if (id === undefined) this.subBufferReactions = []
   ```

2. **Usar un contador que nunca sea 0:**
   ```typescript
   this.contSubBufferReactions = 1; // inicializar en 1
   ```

---

### CR-08: `propertyCreated` mal calculado para propiedades con valor `undefined`

**Archivo:** `src/inernalUtils.ts`
**Linea:** 187

```typescript
propertyCreated = (target === undefined)
```

**Motivo del problema:**
`target` es el resultado de `getByStr(thisArg, property)`. Si una propiedad **existe** pero su valor es `undefined`, `target` sera `undefined`. El codigo asume que la propiedad no existia y reporta `typeChange.create` en vez de `typeChange.seter`.

**Impacto:**
Notificaciones incorrectas. Las suscripciones a `typeChange.create` se disparan cuando en realidad hubo una actualizacion. Las suscripciones a `typeChange.seter` no se disparan.

**Posibles soluciones:**

1. **Usar `in` o `hasOwnProperty`:**
   ```typescript
   const propertyCreated = !(property in thisArg);
   // o para ser mas estricto con props de prototype:
   // const propertyCreated = !Object.prototype.hasOwnProperty.call(thisArg, property);
   ```

2. **Usar `Reflect.has`:**
   ```typescript
   const propertyCreated = !Reflect.has(thisArg, property);
   ```

**Nota:** Para Map/Set, `in` no funciona; se necesita `has()`.

---

### CR-09: Claves no-string se pierden en asimilacion recursiva de Map

**Archivo:** `src/inernalUtils.ts`
**Lineas:** 841-848

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

**Motivo del problema:**
`setProperty_strict` recibe `property: string` como segundo parametro. Si `key` es un objeto (por ejemplo, `new Map([[{id:1}, 'value']])`), se convierte implicitamente a string (`[object Object]`), perdiendo la identidad de la clave.

**Impacto:**
Los Map con claves no-primitivas se corrompen durante la asimilacion. La clave original se pierde y se reemplaza por su representacion string.

**Posibles soluciones:**

1. **Permitir `property: string | symbol | object` en `setProperty_strict`:**
   Cambiar la firma del metodo para aceptar cualquier tipo de clave y manejar internamente la diferencia entre objetos, arrays, Map y Set.

2. **Para Map, usar `set` nativo en vez de `setProperty_strict`:**
   ```typescript
   const proxiedVal = _exe_.be(val) ? val : InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, '__tmp__', val);
   mapTarget.set(key, proxiedVal);
   // Luego eliminar '__tmp__' si se uso
   ```
   *(Nota: esto es un hack; la solucion correcta es refactorizar `setProperty_strict`)*

---

### CR-10: Importacion circular entre `structexe.ts` e `inernalUtils.ts`

**Archivo:** `src/structexe.ts` linea 14, `src/inernalUtils.ts` linea 1

```typescript
// structexe.ts
import { ActionChange, ... } from "./inernalUtils";

// inernalUtils.ts
import { _exe_, ManagementHierarchicalDataObj, ManagementReactionsObj } from "./structexe";
```

**Motivo del problema:**
Aunque TypeScript/JavaScript pueden manejar importaciones circulares en algunos casos, esto es un anti-patron. Dependiendo del orden de evaluacion del bundler o runtime, puede provocar que `_exe_` sea `undefined` cuando `InternalUtils` intenta usarlo estaticamente.

**Impacto:**
- Fragilidad ante cambios de bundler.
- Dificulta el testing unitario (mocks).
- Posible `undefined` en tiempo de ejecucion si el modulo no esta completamente inicializado.

**Posibles soluciones:**

1. **Extraer tipos y constantes a un tercer archivo (`types.ts` o `constants.ts`):**
   ```
   types.ts       -> enums, interfaces, tipos
   inernalUtils.ts -> logica pura, importa types.ts
   structexe.ts    -> orquestacion, importa types.ts e inernalUtils.ts
   ```

2. **Usar inyeccion de dependencias:**
   Pasar `_exe_` como parametro en vez de importarlo estaticamente en `InternalUtils`.

---

## Errores Importantes

Estos errores no causan crashes inmediatos, pero generan comportamiento incorrecto o fragilidad.

---

### IM-01: Parametros `muting` y `transformValue` ignorados en `_exe_.set`

**Archivo:** `src/structexe.ts`
**Linea:** 111

```typescript
returnValue = _exe_.intenal_utils.setProperty_strict(structTarget, propertyName, value)
// PPPS en proceso , muting, transformValue, _exe_Path, TypeStruct_exe_
```

**Motivo del problema:**
El metodo `_exe_.set` recibe `muting` y `transformValue` como parametros, pero no los pasa a `setProperty_strict`. El comentario indica que esta "en proceso", pero la API publica ya los expone.

**Impacto:**
Los usuarios que intenten usar `muting: false` para evitar la transformacion de objetos en estructuras proxy, o `transformValue: false` para mantener tipos originales, no obtendran el comportamiento esperado.

**Posibles soluciones:**

1. **Propagacion inmediata de parametros:**
   ```typescript
   returnValue = _exe_.intenal_utils.setProperty_strict(structTarget, propertyName, value, muting, transformValue);
   ```
   Y actualizar la firma de `setProperty_strict` para recibirlos.

2. **Documentar como no-op temporal:**
   Si realmente no estan implementados, marcar los parametros como `@deprecated` o `@internal` en la documentacion hasta que se implementen.

---

### IM-02: Notificaciones durante inicializacion (asimilacion recursiva)

**Archivo:** `src/inernalUtils.ts`
**Lineas:** 832-860 (dentro de `newProxy`)

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

**Motivo del problema:**
Durante la creacion de un proxy, se recorren todas las propiedades iniciales y se llaman a `setProperty_strict`, que dispara `callReact` con `typeChange.create` o `typeChange.seter`.

**Impacto:**
Cualquier reaccion registrada antes de la creacion del proxy (imposible actualmente, pero si se anade buffering), o las reacciones globales, reciben notificaciones por datos que el usuario nunca modifico. Esto genera ruido y posibles efectos secundarios no deseados.

**Posibles soluciones:**

1. **Desactivar notificaciones durante inicializacion:**
   ```typescript
   const wasBuffering = managementHierarchicalData.rootManagement.getBuffer();
   if (!wasBuffering) managementHierarchicalData.rootManagement.setBuffer(true);
   // ... asimilacion recursiva ...
   if (!wasBuffering) {
       managementHierarchicalData.rootManagement.setBuffer(false); // flush o clear
       managementHierarchicalData.rootManagement.clearBuffer();    // descartar notificaciones de init
   }
   ```

2. **Usar ghostSet o asignacion directa:**
   En vez de `setProperty_strict`, asignar directamente al `structObj` sin pasar por el proxy. Luego, despues de la inicializacion, los getters devolveran los valores ya wrappeados.

---

### IM-03: `declineReact` sin guarda de existencia

**Archivo:** `src/structexe.ts`
**Linea:** 693

```typescript
declineReact(id: number | Reaction): Reaction {
    if (typeof id != 'number') id = id.manage.id
    let reaction = this.reactions[id]
    if (reaction.manage.status != stateAmbitReaction.pause) {
```

**Motivo del problema:**
Si `id` no existe en `this.reactions`, `reaction` es `undefined`. La siguiente linea intenta acceder a `reaction.manage.status` -> crash.

**Impacto:**
Crash al intentar pausar una reaccion que ya fue eliminada o cuyo id es invalido.

**Posibles soluciones:**

1. **Guarda simple:**
   ```typescript
   if (!reaction) return undefined as any; // o lanzar error controlado
   ```

2. **Lanzar error descriptivo:**
   ```typescript
   if (!reaction) throw new Error(`Reaction with id ${id} not found`);
   ```

---

### IM-04: `route` con path vacio y `_exe_Path` undefined

**Archivo:** `src/structexe.ts`
**Lineas:** 220-221

```typescript
if (callBackfnOk && ok && !iteration) callBackfnOk(returnValue, property, cursor, _exe_Path!, TypeStruct_exe_!)
```

**Motivo del problema:**
Si el path es `''` y no hay iteracion, `_exe_Path` y `TypeStruct_exe_` pueden ser `undefined`. El operador `!` (non-null assertion) le dice al compilador que confie, pero en runtime son `undefined`.

**Impacto:**
Callbacks de `route` reciben `undefined` donde esperan string/object. Si el callback usa `_exe_Path` para construir rutas, generara strings como `"undefined|prop"`.

**Posibles soluciones:**

1. **Asignar valores por defecto antes del callback:**
   ```typescript
   const finalPath = _exe_Path ?? '';
   const finalStruct = TypeStruct_exe_ ?? cursor;
   if (callBackfnOk && ok && !iteration) callBackfnOk(returnValue, property, cursor, finalPath, finalStruct);
   ```

---

### IM-05: Codigo duplicado (`processingType.noObserv` aparece dos veces)

**Archivo:** `src/inernalUtils.ts`
**Lineas:** 609-629 y 715-731

**Motivo del problema:**
El bloque `case processingType.noObserv:` esta definido dos veces en el mismo `switch` de `newProxy`. El segundo nunca se ejecuta porque el primero ya captura el caso.

**Impacto:**
- Deuda tecnica.
- El segundo bloque podria ser una version "mejorada" que quedo olvidada.
- Si se modifica el primero pensando que es el unico, el segundo queda inconsistente (aunque inalcanzable).

**Posibles soluciones:**

1. **Eliminar el duplicado:**
   Comparar ambos bloques y conservar el mas completo/correcto.

2. **Revisar si deberian ser casos distintos:**
   Quizas uno era `noObserv` y el otro `noMutation`, y hubo un error de copiar/pegar.

---

## Errores Menores

Estos son typos, errores de estilo o deuda tecnica que no impactan el funcionamiento inmediato.

---

### MN-01: Typo en nombre de archivo

**Archivo:** `src/inernalUtils.ts`

Falta la 't': `inernalUtils.ts` -> `internalUtils.ts`

**Impacto:**
Ninguno funcional, pero confunde a desarrolladores y rompe convenciones de nombres.

**Posibles soluciones:**
Renombrar el archivo y actualizar todos los imports.

---

### MN-02: Typo en propiedad estatica

**Archivo:** `src/structexe.ts`
**Linea:** 25

```typescript
static intenal_utils = InternalUtils
```

Falta la 't': `intenal_utils` -> `internal_utils`

**Impacto:**
API publica con typo. Rompe la consistencia.

**Posibles soluciones:**
Renombrar la propiedad. Si es parte de la API publica, mantener ambos como alias temporalmente con `@deprecated`.

---

### MN-03: `Date_` no copia objetos Date correctamente

**Archivo:** `src/inernalUtils.ts`
**Lineas:** 75-79

```typescript
export class Date_ extends Date {
    constructor(public value: any) { super(value); }
```

**Motivo del problema:**
Si `value` es ya un objeto `Date`, `super(dateObj)` invoca el constructor de `Date` con un objeto Date, que internamente llama `valueOf()` del objeto, obteniendo un timestamp. Esto funciona, pero si `value` es un `Date` invalido (`new Date('invalid')`), el comportamiento puede ser inconsistente.

**Impacto:**
Minimo, pero la intencion del wrapper parece ser preservar el valor original. El `super` transforma el input.

**Posibles soluciones:**

1. **Usar timestamp para el super:**
   ```typescript
   constructor(public value: Date) {
       super(value.getTime());
   }
   ```

2. **O no extender `Date` y usar composicion:**
   ```typescript
   export class Date_ {
       constructor(public value: Date) {}
       valueOf() { return this.value.valueOf(); }
       toString() { return this.value.toString(); }
       toJSON() { return this.value.toJSON(); }
   }
   ```

---

## Plan de Accion Recomendado

### Fase 1: Seguridad y estabilidad (inmediata)
1. **CR-04** (`setIfn_` crash) — Un metodo muy usado que crashea facilmente.
2. **CR-03** (`getByStr` sin array) — Afecta operaciones basicas sobre arrays.
3. **CR-06** (`gestTypeDetailed` crash) — Cualquier objeto sin constructor rompe la libreria.
4. **CR-07** (`id=0` falsy) — Bug silencioso que puede corromper estado de buffering.

### Fase 2: Correccion de comportamiento
5. **CR-01** (precedencia ternaria) — Rompe `observingGets` completamente.
6. **CR-02** (`Map.set` booleano) — Causa reacciones duplicadas.
7. **CR-08** (`propertyCreated` mal calculado) — Notificaciones incorrectas.
8. **CR-05** (`value.toString()` sin guarda) — Crash en wildcards con null.

### Fase 3: Robustez y refactor
9. **CR-09** (claves Map no-string) — Soporte completo de Map.
10. **CR-10** (importacion circular) — Mejora arquitectonica.
11. **IM-01** (`muting` ignorado) — Completar API.
12. **IM-02** (notificaciones en init) — Reducir ruido.
13. **IM-03** (`declineReact` guarda) — Manejo de errores.

### Fase 4: Limpieza
14. **IM-05** (codigo duplicado) — Eliminar.
15. **IM-04** (`route` undefined) — Tipado seguro.
16. **MN-01, MN-02** (typos) — Renombrar.
17. **MN-03** (`Date_`) — Revisar semantica.

---

## Notas Arquitectonicas

### Sobre `setProperty_strict`
Este metodo es el corazon de la libreria. Actualmente:
- No respeta `muting`.
- No respeta `transformValue`.
- No maneja claves no-string para Map.
- Notifica cambios incluso durante inicializacion.

Se recomienda una refactorizacion profunda de este metodo, posiblemente separando responsabilidades:
- `assignValue`: solo asigna al `structObj`.
- `wrapValue`: convierte el valor en proxy si corresponde.
- `notifyChange`: dispara reacciones.

### Sobre el sistema de rutas
El sistema de rutas con `|` y `[index]` es sensible. Se recomienda:
- Validar que los nombres de propiedades no contengan `|` (o escaparlos).
- Documentar la gramatica de paths soportada.
- Considerar normalizar arrays siempre a `[index]` y objetos a `|prop`.

### Sobre pruebas
El archivo `test.ts` actual es un script manual, no un test suite automatizado. Se recomienda migrar a un framework de testing (Jest, Vitest, Mocha) con cobertura para:
- Creacion de proxies (object, array, map, set, primitivos).
- Asignaciones profundas.
- Reacciones (local, children, fathers, all).
- Buffering de reacciones.
- Exportacion.
- Edge cases: null, undefined, Object.create(null), claves objeto en Map.

---

*Documento generado automaticamente a partir del analisis de codigo.*
