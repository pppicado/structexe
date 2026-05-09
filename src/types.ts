/*********************************************************************************************************
** ███████╗ ████████╗ ██████╗  ██╗   ██╗  ██████╗ ████████╗            ███████╗██╗  ██╗███████╗         **
** ██╔════╝ ╚══██╔══╝ ██╔══██╗ ██║   ██║ ██╔════╝ ╚══██╔══╝            ██╔════╝╚██╗██╔╝██╔════╝         **
** ███████╗    ██║    ██████╔╝ ██║   ██║ ██║         ██║               █████╗   ╚███╔╝ █████╗           **
** ╚════██║    ██║    ██╔══██╗ ██║   ██║ ██║         ██║               ██╔══╝   ██╔██╗ ██╔══╝           **
** ███████║    ██║    ██║  ██║ ╚██████╔╝ ╚██████╗    ██║       ███████╗███████╗██╔╝ ██╗███████╗███████╗ **
** ╚══════╝    ╚═╝    ╚═╝  ╚═╝  ╚═════╝   ╚═════╝    ╚═╝       ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ **
*********************************************************************************************************/
/* Structexe - Pure Types & Constants
** By Pedro Pablo Picado Sánchez
*/

// Symbols
export const internal_exe_property = Symbol('internal_exe_property')
export const string_exe_property = '_exe_'

// Interfaces (forward declarations to avoid circular imports)
export interface ManagementHierarchicalData {
  path: string
  structObj: any
  proxyObj: any
  mutating: boolean
  observingGets: boolean
  processingType: processingType
  rootManagement: ManagementReactionsObj
}

export interface ManagementReactionsObj {
  callReact(cambio: datChangeObj): void
  observingGets: boolean
  getBuffer(): boolean
  setBuffer(valor: boolean): void
  clearBuffer(): void
  pushSubBuffer(): number
  popSubBuffer(id?: number): boolean
  clearSubBuffer(id?: number): boolean
  getContReactions(): number
  popReactions(propiedad?: string): Reaction[]
  pushReactions(reactions: Reaction[], ruta: string): Reaction[]
  declineReact(id: number | Reaction): Reaction
  react(cambio: datChangeObj, accion: ActionChange, thisArg: any, noDie?: boolean): Reaction
}

export interface _exe_Property { [string_exe_property]?: ManagementHierarchicalData; }

export type TypeStruct_exe_<T> =
  T extends Map<infer K, infer V> ? Map<K, TypeStruct_exe_<V>> & _exe_Property :
  T extends Set<infer U> ? Set<TypeStruct_exe_<U>> & _exe_Property :
  T extends Array<infer E> ? Array<TypeStruct_exe_<E>> & _exe_Property :
  T extends object ? { [K in keyof T]: TypeStruct_exe_<T[K]> } & _exe_Property
  : T & _exe_Property;

export type ActionChange = (change: datChangeObj) => void

export enum typeChange { 'create', 'seter', 'change', 'geter', 'delete' }
export enum stateAmbitReaction { all, local, childens, fathers, pause }
export enum processingType { unset, primitiveData, object, observ, noObserv, noMutation, array, map, set, function }

export const processingTypeSet = new Map<string, processingType>([
  ['null', processingType.unset],
  ['undefined', processingType.unset],
  ['object', processingType.object],
  ['array', processingType.array],
  ['map', processingType.map],
  ['set', processingType.set],
  ['function', processingType.function],
  ['observer', processingType.observ],
  ['noObserv', processingType.noObserv],
  ['noMutation', processingType.noMutation],
  ['regexp', processingType.primitiveData],
  ['weakSet', processingType.primitiveData],
  ['weakMap', processingType.primitiveData],
  ['date', processingType.primitiveData],
  ['error', processingType.primitiveData],
  ['promise', processingType.primitiveData],
  ['string', processingType.primitiveData],
  ['number', processingType.primitiveData],
  ['boolean', processingType.primitiveData],
  ['symbol', processingType.primitiveData],
  ['bigint', processingType.primitiveData],
])

/**
 * Clases especializadas para envolver primitivas respetando su naturaleza
 */
export class String_ extends String {
  constructor(public value: string) { super(value); }
  override valueOf() { return this.value; }
  override toString() { return String(this.value); }
  toJSON() { return this.value; }
}
export class Number_ extends Number {
  constructor(public value: number) { super(value); }
  override valueOf() { return this.value; }
  override toString() { return String(this.value); }
  toJSON() { return this.value; }
}
export class Boolean_ extends Boolean {
  constructor(public value: boolean) { super(value); }
  override valueOf() { return this.value; }
  override toString() { return String(this.value); }
  toJSON() { return this.value; }
}
export class Date_ extends Date {
  constructor(public value: Date) {
    super(value.getTime());
  }
  override valueOf() { return this.value.valueOf(); }
  override toString() { return this.value.toString(); }
  override toJSON() { return this.value.toJSON ? this.value.toJSON() : this.value.toISOString(); }
}
export class Symbol_ {
  constructor(public value: any) { }
  valueOf() { return this.value; }
  toString() { return String(this.value); }
  toJSON() { return this.value; }
}
export class BigInt_ {
  constructor(public value: any) { }
  valueOf() { return this.value; }
  toString() { return String(this.value); }
  toJSON() { return this.value; }
}
export class Primitive_ {
  constructor(public value: any) { }
  valueOf() { return this.value; }
  toString() { return String(this.value); }
  toJSON() { return this.value; }
}

// Forward interface for ManagementReactionObj
export interface ManagementReaction {
  calls: number
  status: stateAmbitReaction
  id: number
  [index: string]: any
}

export class ManagementReactionObj {
  constructor(inicialValues?: Partial<ManagementReactionObj>) { Object.assign(this, inicialValues) }
  [index: string]: any
  calls: number = 0
  status: stateAmbitReaction = stateAmbitReaction.local
  id: number = 0
}

export interface datChange {
  ruta: string
  datoNuevo: any
  datoActual: any
  hito: typeChange
  ambito: stateAmbitReaction
  thisArg: any
}

export class datChangeObj {
  constructor(inicialValues?: Partial<datChangeObj>) { Object.assign(this, inicialValues) }
  ruta: string = ''
  datoNuevo: any = undefined
  datoActual: any = undefined
  hito: typeChange = typeChange.change
  ambito: stateAmbitReaction = stateAmbitReaction.local
  thisArg: any = undefined
}

export interface Reaction {
  change: datChangeObj
  action: ActionChange
  thisArg: any
  calls: number
  manage: ManagementReaction
  declineReact: () => void
  [index: string]: any
}

export class ReactionObj {
  constructor(inicialValues?: Partial<ReactionObj>) {
    Object.assign(this, inicialValues)
    this.change = new datChangeObj(this.change)
    this.manage = new ManagementReactionObj(this.manage)
  }
  [index: string]: any
  change: datChangeObj = new datChangeObj()
  action: ActionChange = () => { }
  thisArg: any = undefined
  calls: number = 0
  manage!: ManagementReaction
  declineReact: () => void
}
