# `@pppicado/structexe`

> Librería TypeScript pura para estado jerárquico reactivo con Proxy profundo.
> Documentación unificada en español: [`../../docs/`](../../docs/README.md).

## 📚 Documentación

Toda la información de este submódulo está centralizada en:

| Recurso | Enlace |
| :--- | :--- |
| **Estado** | [`../../docs/estado/structexe.md`](../../docs/estado/structexe.md) |
| **Planificación** | [`../../docs/planificacion/structexe.md`](../../docs/planificacion/structexe.md) |
| **Errores** | [`../../docs/errores/structexe.md`](../../docs/errores/structexe.md) |
| **Arquitectura** | [`../../docs/documentacion/arquitectura.md`](../../docs/documentacion/arquitectura.md) |
| **Testing** | [`../../docs/documentacion/testing.md`](../../docs/documentacion/testing.md) |
| **Build** | [`../../docs/documentacion/build-y-despliegue.md`](../../docs/documentacion/build-y-despliegue.md) |

## Inicio Rápido

```bash
# Compilar
npm run build:structexe

# Consumir
import { _exe_ } from '@pppicado/structexe';

const state = _exe_.newStruct_exe_({ a: 1, nested: {} });
state.nested.value = 42;  // auto-vivificación + reactividad
```

## Resumen Ejecutivo

- **Tipo:** Librería TypeScript (ESM + CJS + types).
- **Estado:** 🔴 Crítico — bugs pendientes, sin tests automatizados.
- **Bugs verificados (2026-06-04):** 13/18 del plan original arreglados, 4 parciales, 1 pendiente (CR-10 import circular). 19 bugs nuevos descubiertos.
- **Pendiente bloqueante:** Configurar test runner.

Ver [`../../docs/estado/structexe.md`](../../docs/estado/structexe.md) para detalle completo.

## Licencia

MIT
