# @pppicado/structexe

Una biblioteca de gestion de estado reactivo y jerarquico para TypeScript. `structexe` permite a los desarrolladores crear estructuras de datos profundas y observables donde cualquier mutacion local o profunda desencadena reacciones precisas y dirigidas.

## Filosofia

`structexe` trata cada nodo en tu arquitectura de datos — desde objetos complejos, Maps y Sets hasta primitivos escalares — como una entidad rastreable. Utiliza asimilacion profunda de Proxy y boxing de primitivos (`String_`, `Number_`, `Boolean_`, `Date_`, `Symbol_`, `BigInt_`, `Primitive_`) para garantizar que cada acceso y mutacion de datos se supervise estrictamente y sea completamente reactivo, habilitando la verdadera "auto-vivificacion" (creacion automatica de propiedades profundas) y actualizaciones quirurgicas de UI.

## Instalacion

```bash
npm install @pppicado/structexe
```

## Conceptos Principales

- **`_exe_.newStruct_exe_(target)`**: La puerta de entrada a la reactividad. Convierte un objeto JavaScript plano, Array, Map o Set en un `TypeStruct_exe_<T>`, envolviendolo nativamente en un Proxy profundo.
- **`_exe_.set(target, path, value)`**: Muta propiedades de forma segura usando rutas jerarquicas (ej. `app|config|theme`). Si los nodos intermedios no existen, se generan automaticamente (auto-vivificacion). La auto-vivificacion **no** ocurre cuando se usa un objeto literal vacio `TypeStruct_exe_<{}>`.
- **`_exe_.react(target, path, action)`**: Suscribete a cambios en una ruta especifica. El callback `action` recibe un `datChangeObj` con detalles de la `ruta`, `datoActual` (valor anterior), `datoNuevo` (valor nuevo), `hito` (tipo de cambio) y `ambito` (alcance de la reaccion).
- **`_exe_.export(target)`**: Desenvuelve un objeto `structexe` reactivo de vuelta a un arbol de primitivos u objetos JavaScript limpio y sin Proxy, perfectamente serializable para transmision JSON.

## Uso Basico

### Inicializacion

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

### Mutacion Profunda y Auto-Vivificacion

```typescript
// Mutar una propiedad existente directamente
state.app.version = 2;

// Establecer una propiedad usando una ruta jerarquica
_exe_.set(state, "app|config|theme", "dark");
console.log(state.app.config.theme); // "dark" — el arbol config fue auto-vivificado
```

### Suscribiendose a Reacciones

```typescript
_exe_.react(state, "app|config|theme", (changeEvent) => {
    console.log("Tema cambiado!");
    console.log("Anterior:", changeEvent.datoActual);
    console.log("Nuevo:", changeEvent.datoNuevo);
    console.log("Ruta:", changeEvent.ruta);
    console.log("Tipo:", changeEvent.hito); // typeChange.create | typeChange.seter | typeChange.change
});

state.app.config.theme = "light"; // Desencadena la reaccion
```

### Mutacion Condicional (`setIfn_`)

```typescript
// Solo establece el valor si la propiedad no existe,
// es undefined, o actualmente iguala al parametro `oval`.
_exe_.setIfn_(state, "app|debug", true, false);
```

### Exportando Datos Limpios

```typescript
const plainData = _exe_.export(state);
const jsonString = JSON.stringify(plainData); // JSON limpio sin metadatos
```

## Caracteristicas Avanzadas

- **Soporte de Colecciones**: Reactividad profunda y nativa para `Set` y `Map`. Iterar, agregar o eliminar elementos dispara correctamente el arbol de reacciones.
- **Soporte de Arrays**: Los arrays son completamente reactivos con rutas de notacion de corchetes (ej. `items[0]|name`).
- **Rutas con Comodin**: `_exe_.route` soporta sintaxis de recorrido con comodines para despachar cambios o consultar multiples nodos simultaneamente.
- **Alcances de Reaccion**: Las reacciones pueden tener alcance `local` (ruta exacta), `childens` (hijos de la ruta), `fathers` (padres de la ruta) o `all` (global).
- **Buffering de Reacciones**: Agrupa multiples cambios y desencadena reacciones de una sola vez usando el sistema de buffer/sub-buffer (`getBuffer`, `setBuffer`, `pushSubBuffer`, `popSubBuffer`).
- **Tipos de Cambio Nombrados**: Los cambios se categorizan como `create`, `seter`, `change`, `geter` o `delete` mediante el enum `typeChange`.
- **Ghost Set**: `InternalUtils.ghostSet` permite asignar valores sin disparar reacciones (util para inicializacion o actualizaciones internas de estado).

## Referencia Rapida del API

### Metodos Estaticos de `_exe_`

| Metodo | Firma | Descripcion |
| :--- | :--- | :--- |
| `be` | `be(target: any): boolean` | Comprueba si un objeto es gestionado por `_exe_`. |
| `newStruct_exe_` | `newStruct_exe_<T>(importObj: T): TypeStruct_exe_<T>` | Convierte un objeto plano en una estructura reactiva. |
| `set` | `set<T>(target, path, value, muting?, transformValue?): TypeStruct_exe_<T>` | Establece un valor en una ruta jerarquica. |
| `setIfn_` | `setIfn_<T>(target, property, value?, oval?, muting?): TypeStruct_exe_<T>` | Establece condicionalmente si la propiedad es undefined o coincide con `oval`. |
| `react` | `react(target, path \| datChangeObj, action, component?): Reaction` | Suscribirse a cambios en una ruta. |
| `declineReact` | `declineReact(target, idReaction): Reaction` | Pausar/cancelar una reaccion. |
| `export` | `export(target, property?, targetFill?): any` | Desenvolver a objeto JS plano. |
| `route` | `route(cursor, path?, ok?, ko?, altOrigin?, options?): any` | Recorrer o consultar por ruta jerarquica. |
| `forEach` | `forEach(target, callback, thisArg?): void` | Iterar sobre objeto, array, map o set. |
| `path` | `path(target): string` | Obtener la ruta jerarquica de una instancia. |

### Metodos de Instancia (via propiedad `_exe_`)

Cada instancia `TypeStruct_exe_` expone estos metodos a traves de su propiedad `_exe_`:

| Metodo | Descripcion |
| :--- | :--- |
| `set(property, value, muting?)` | Establece propiedad y devuelve el valor asignado. |
| `set_(property, value, muting?)` | Establece propiedad y devuelve la instancia contenedora. |
| `setIf(property, value, oval?, muting?)` | Set condicional, devuelve valor asignado. |
| `setIf_(property, value, oval?, muting?)` | Set condicional, devuelve instancia contenedora. |
| `getByStr(property, ok?, ko?)` | Obtiene una propiedad por nombre. |
| `export(property?, targetFill?)` | Exportar a objeto plano. |
| `route(path?, ok?, ko?)` | Recorrer por ruta. |
| `react(dat, action, thisArg?)` | Suscribirse a cambios. |

### Tipos y Enums

- `typeChange`: `create`, `seter`, `change`, `geter`, `delete`
- `stateAmbitReaction`: `all`, `local`, `childens`, `fathers`, `pause`
- `processingType`: `unset`, `primitiveData`, `object`, `observ`, `noObserv`, `noMutation`, `array`, `map`, `set`, `function`
- `ActionChange`: `(change: datChangeObj) => void`
- `datChangeObj`: `{ ruta, hito, ambito, datoNuevo, datoActual }`

## Notas Importantes

- **`_exe_.intenal_utils`** contiene utilidades internas (notese la ortografia historica intencional).
- **`gestType`** (no `getType`) es el metodo interno de inferencia de tipos.
- **Importaciones circulares** existen entre `structexe.ts` e `inernalUtils.ts` — esta es una limitacion arquitectonica conocida.
- Varios bugs criticos estan documentados en [`CORRECTION_PLAN.md`](./CORRECTION_PLAN.md).

## Licencia

MIT
