import { _exe_, ManagementHierarchicalDataObj, ManagementReactionsObj } from "./structexe";
import { ManagementHierarchicalData } from "./structexe";

// config
export const internal_exe_property = Symbol('internal_exe_property')
export const string_exe_property = '_exe_'

export interface _exe_Property { [string_exe_property]?: ManagementHierarchicalData; }

export type TypeStruct_exe_<T> =
  T extends Map<infer K, infer V> ? Map<K, TypeStruct_exe_<V>> & _exe_Property :
  T extends Set<infer U> ? Set<TypeStruct_exe_<U>> & _exe_Property :
  T extends Array<infer E> ? Array<TypeStruct_exe_<E>> & _exe_Property :
  T extends object ? { [K in keyof T]: TypeStruct_exe_<T[K]> } & _exe_Property
  : T & _exe_Property;


type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type ActionChange = (change: datChangeObj) => void
export type OptionalParams<T> = Partial<T> | undefined;
export enum typeChange { 'create', 'seter', 'change', 'geter', 'delete' }
export enum stateAmbitReaction { all, local, childens, fathers, pause } // all = local + childens + fathers

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

interface JSONObject { [key: string]: JSONValue }
interface JSONArray extends Array<JSONValue> {}

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
  constructor(public value: any) { super(value); }
  override valueOf() { return this.value.valueOf(); }
  override toString() { return this.value.toString(); }
  override toJSON() { return this.value.toJSON ? this.value.toJSON() : this.value; }
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

export class InternalUtils {
  constructor() { }

  /**
   * *************************************************************************** 
   * @method get_name_simbol_internal_exe_property Método que obtiene el nombre de la propiedad internal_exe_property.
   * @returns {string} Devuelve el nombre de la propiedad internal_exe_property.
   */
  static get name_simbol_internal_exe_property() { return internal_exe_property }

  /**
   * @method ghostSet (USO INTERNO) Asigna un valor a una propiedad de una instancia de TypeStruct_exe_ sin lanzar reacciones.
   * @param thisArg Instancia de TypeStruct_exe_.
   * @param property property solo podrá tener nombres de las propiedades de thisArg  
   * @param value Valor a asignar.
   * @param muting Indica si se mutará el destino o no.
   * @returns {TypeStruct_exe_<T>} Devuelve la instancia con el valor asignado.
   */
  static ghostSet<T>(thisArg: any, property: string, value: T, muting?: boolean): TypeStruct_exe_<T> {
    let returValue!: TypeStruct_exe_<T>
    let manage = _exe_.intenal_utils.get_exe_(thisArg).rootManagement
    let manageBufferState = manage.getBuffer()
    let subBufferId: number = -1
    if (manageBufferState) subBufferId = manage.pushSubBuffer()
    manage.setBuffer(true)
    returValue = _exe_.set<T>(thisArg, property, value, muting)
    manage.clearBuffer()
    manage.setBuffer(false)
    if (manageBufferState) manage.popSubBuffer(subBufferId)
    manage.setBuffer(manageBufferState)
    return returValue
  }


  /**
   * *************************************************************************** 
   * @method setProperty (USO INTERNO) Asigna un valor a una propiedad de una instancia de TypeStruct_exe_.
   * @param thisArg Instancia de TypeStruct_exe_.
   * @param property property solo podrá tener nombres de las propiedades de thisArg  
   * @param value Valor a asignar.
   * @param muting Indica si se mutará el destino o no.
   * @param transformValue Indica si se transformará el valor al tipo de estructura de destino si existe
   * @returns {TypeStruct_exe_<T>} Devuelve la instancia con el valor asignado.
   */

  // PPPS en proceso: muting: boolean, transformValue: boolean, _exe_Path: string, TypeStruct_exe_: TypeStruct_exe_<any>
  static setProperty_strict<T>(thisArg: any, property: string, value: T): TypeStruct_exe_<T> {
    let typeValue!: processingType
    let typeTarget!: processingType
    // let path = _exe_.path(TypeStruct_exe_)
    let oldValue = _exe_.export(thisArg, property)
    let target = _exe_.intenal_utils.getByStr(thisArg, property)
    let transformedValue: any = value
    let propertyCreated = false

    // muting = muting || _exe_.intenal_utils.get_exe_(TypeStruct_exe_).mutating
    // typeValue = (muting) ? _exe_.intenal_utils.gestType(value) : processingType.noMutation

    typeValue = _exe_.intenal_utils.gestType(value)
    typeTarget = _exe_.intenal_utils.gestType(target)

    let managementThisArg = _exe_.intenal_utils.get_exe_(thisArg);

    // 1. Manejo de Primitivos
    if (typeValue === processingType.primitiveData || typeValue === processingType.unset || typeValue === processingType.function) {
      if (_exe_.be(target) && 'value' in _exe_.intenal_utils.get_exe_(target).structObj) {
        let internalObj = _exe_.intenal_utils.get_exe_(target).structObj;
        internalObj.value = value;
        transformedValue = target;
      } else {
        let box: any;
        if (value === null || value === undefined) box = new Primitive_(value);
        else {
          switch (typeof value) {
            case 'string': box = new String_(value); break;
            case 'number': box = new Number_(value); break;
            case 'boolean': box = new Boolean_(value); break;
            case 'symbol': box = new Symbol_(value); break;
            case 'bigint': box = new BigInt_(value); break;
            case 'function': box = new Primitive_(value); break;
            default:
              if (value instanceof Date) box = new Date_(value);
              else box = new Primitive_(value);
              break;
          }
        }
        transformedValue = _exe_.intenal_utils.newProxy(box, typeValue, thisArg, property);
        propertyCreated = (target === undefined);
      }
    }
    // 2. Manejo de Estructuras Complejas
    else if (!(_exe_.be(value) && 'value' in _exe_.intenal_utils.get_exe_(value).structObj)) {
      transformedValue = _exe_.intenal_utils.newProxy(value, typeValue, thisArg, property);
      propertyCreated = (target === undefined);
    }
    else {
      transformedValue = value;
    }

    // 3. Asignación Real
    let rawTarget = managementThisArg.structObj;
    if (managementThisArg.processingType === processingType.map) {
      (rawTarget as Map<any, any>).set(property, transformedValue);
    } else if (managementThisArg.processingType === processingType.set) {
      (rawTarget as Set<any>).add(transformedValue);
    } else {
      rawTarget[property] = transformedValue;
    }

    // 4. Notificación de Cambio
    let pathSeparador = (managementThisArg.processingType === processingType.array || managementThisArg.processingType === processingType.map || managementThisArg.processingType === processingType.set) ? '[' + property + ']' : '|' + property;

    managementThisArg.rootManagement.callReact(new datChangeObj({
      ruta: managementThisArg.path + pathSeparador,
      hito: propertyCreated ? typeChange.create : typeChange.seter,
      ambito: stateAmbitReaction.local,
      datoNuevo: transformedValue,
      datoActual: oldValue
    }));

    return transformedValue as TypeStruct_exe_<T>
  }
  /**	
   * ***************************************************************************
   * @method getByStr Devuelve el valor de una propiedad de un objeto por su nombre.
   * @param target Objeto del cual se va a obtener el valor
   * @param property Nombre de la propiedad a obtener
   * @param callBackfnOk Función que se va a llamar si se encuentra el valor
   * @param callbackfnKo Función que se va a llamar si no se encuentra el valor
   * @returns Valor encontrado o undefined si no se encuentra
   */
  static getByStr(target: any, property: string, callBackfnOk?: (value: any) => void, callbackfnKo?: (err: string) => void): any {
    let value: any = undefined
    let err: string = ''
    let objectErr: string = ''

    switch (_exe_.intenal_utils.gestType(target)) {
      case processingType.object: {
        if (!(property in (target as object))) err = `property ${property} not found in "${target.toString()}"`
        // else value = Object.getOwnPropertyDescriptor(target, property)?.value        
        else value = (target as any)[property]
        break;
      }

      case processingType.map: {
        if ((target as Map<any, any>).has(property)) value = (target as Map<any, any>).get(property)
        else {
          let numProperty = Number(property)
          if (!isNaN(numProperty) && numProperty < (target as Map<any, any>).size)
            value = Array.from((target as Map<any, any>).values())[numProperty]
          else {
            objectErr = (_exe_.be(target)) ? _exe_.path(target) : target.toString()
            err = `property ${property} not found in " ${objectErr}"`
          }
        }
        break;
      }
      case processingType.set: {
        if ((target as Set<any>).has(property)) value = property
        else {
          let numProperty = Number(property)
          if (!isNaN(numProperty) && numProperty < (target as Set<any>).size) value = Array.from((target as Set<any>).values())[numProperty]
          else {
            objectErr = (_exe_.be(target)) ? _exe_.path(target) : target.toString()
            err = `property ${property} not found in " ${objectErr}"`
          }
        }
        break;
      }
      default:
        err = `Object or property typeError: ${property} in "${target.toString()}"`
    }

    if (err != '') {
      if (callbackfnKo) callbackfnKo(err)
    } else {
      if (callBackfnOk) callBackfnOk(value)
    }
    return value
  }


  /**
   * *************************************************************************** 
   * @method gestType Metodo que devolverá el tipo procesado que deberá recibir el dato.
   * @param valueTest Instancia a testear.
   * @returns {processingType} debuelve el tipo procesado dato. 
   * @see processingType
   */
  static gestType(valueTest: any): processingType {
    let detailed = _exe_.intenal_utils.gestTypeDetailed(valueTest)
    return processingTypeSet.get(detailed) || processingTypeSet.set(detailed, processingType.object).get(detailed) || processingType.unset
  }

  /**
   * *************************************************************************** 
   * @method gestTypeDetailed Metodo que devolverá el tipo procesado que deberá recibir el dato.
   * @param valueTest Instancia a testear.
   * @returns {processingType} debuelve el tipo procesado dato. 
   * @see processingType
   */
  static gestTypeDetailed(valueTest: any): string {

    let detailed: string

    if (valueTest === null) return "null";
    switch (typeof valueTest) {
      case 'string': detailed = "string"; break;
      case 'number': detailed = "number"; break;
      case 'boolean': detailed = "boolean"; break;
      case 'undefined': detailed = "undefined"; break;
      case 'symbol': detailed = "symbol"; break;
      case 'bigint': detailed = "bigint"; break;
      case 'function': detailed = "function"; break;
      case 'object': detailed = "object"; break;
    }
    if (detailed == "object") {
      if (_exe_.be(valueTest) && 'value' in _exe_.intenal_utils.get_exe_(valueTest).structObj) {
        return _exe_.intenal_utils.gestTypeDetailed(_exe_.intenal_utils.get_exe_(valueTest).structObj.value);
      }
      switch (valueTest.constructor.name) {
        case "Boolean":
        case "Boolean_": detailed = "boolean"; break;
        case "Number":
        case "Number_": detailed = "number"; break;
        case "BigInt":
        case "BigInt_": detailed = "bigint"; break;
        case "String":
        case "String_": detailed = "string"; break;
        case "Symbol":
        case "Symbol_": detailed = "symbol"; break;
        case "RegExp": detailed = "regexp"; break;
        case 'Date':
        case 'Date_': detailed = "date"; break;
        case "WeakMap": detailed = "weakMap"; break;
        case "WeakSet": detailed = "weakSet"; break;
        case "Map": detailed = "map"; break;
        case "Set": detailed = "set"; break;
        case "Array": detailed = "array"; break;
        // case "Object": 
        default: detailed = valueTest.constructor.name; break;
      }
    }
    return detailed
  }

  /**
   * *************************************************************************** 
   * @method get_exe_ Metodo que devolverá los datos de gestion de la instancia.
   * @param TypeStruct_exe_ Instancia The wich to obtain the gestion data.
   * @returns {managementHierarchicalData} The gestion data of the instance.
   */
  static get_exe_(TypeStruct_exe_: TypeStruct_exe_<any>): ManagementHierarchicalData {
    return TypeStruct_exe_ ? (TypeStruct_exe_ as any)[internal_exe_property] : undefined;
  }

  /**
   *  *************************************************************************** 
   * @method export Metodo que devolverá un valor de una instancia eliminando sus proxys.
   * @param TypeStruct_exe_ Instancia de la que quieremos exportar el contenido.
   * @param property Parámetro opcional. Propiedar a extrarer del objeto. 
   * @returns {any} Devuelve el valor natural perdiendo las propiedades reactivas y la metadata
   */
  static export(TypeStruct_exe_: TypeStruct_exe_<any>, property?: string): any {
    if (_exe_.be(TypeStruct_exe_) && 'value' in (TypeStruct_exe_ as any)[internal_exe_property].structObj) {
      return (TypeStruct_exe_ as any)[internal_exe_property].structObj.value;
    }
    let target = (property) ? (TypeStruct_exe_ as any)[property] : TypeStruct_exe_;
    if (_exe_.be(target) && 'value' in (target as any)[internal_exe_property].structObj) {
      return (target as any)[internal_exe_property].structObj.value;
    }
    return target
  }

  /**
   * *************************************************************************** 
   * @method stringify Permite serializar cualquier instancia de forma determinista ,segura y evitando los ciclos.
   * @param input Instancia a serializar.
   * @param space Parámetro opcional. Indica el espacio de indentación.
   * @returns {string} Devuelve el string serializado del objeto.
   */
  static stringify<T>(input: T, space?: number): string {
    const seen = new WeakMap<object, string>();

    const unwrapPrimitiveWrapper = (value: any): any => {

      // === WRAPPERS PERSONALIZADOS ===
      if (
        value instanceof String_ ||
        value instanceof Number_ ||
        value instanceof Boolean_ ||
        value instanceof Date_ ||
        value instanceof Symbol_ ||
        value instanceof BigInt_ ||
        value instanceof Primitive_
      ) {
        return value.valueOf();
      }

      // === WRAPPERS NATIVOS JS ===
      if (
        value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean
      ) {
        return value.valueOf();
      }

      return value;
    };

    const normalize = (value: any, path: string): JSONValue => {

      value = unwrapPrimitiveWrapper(value);

      // === PRIMITIVOS REALES ===
      if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        return value;
      }

      if (typeof value === 'bigint') {
        return value.toString();
      }

      if (typeof value === 'symbol') {
        return value.toString();
      }

      if (
        typeof value === 'undefined' ||
        typeof value === 'function'
      ) {
        return null;
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      if (Array.isArray(value)) {
        return value.map((v, i) => normalize(v, `${path}[${i}]`));
      }

      if (typeof value === 'object') {

        if (seen.has(value)) {
          return `[Circular → ${seen.get(value)}]`;
        }

        seen.set(value, path);

        const obj: JSONObject = {};
        const keys = Object.keys(value).sort();

        for (const key of keys) {
          const normalized = normalize(value[key], `${path}.${key}`);
          if (normalized !== null || value[key] === null) {
            obj[key] = normalized;
          }
        }

        return obj;
      }

      return null;
    };

    return JSON.stringify(normalize(input, '$'), null, space);
  }

  /**
   * *************************************************************************** 
   * @method proxyStruct Metodo que creará un proxy para la instancia de la clase.
   * @param type Tipo de instancia a crear.
   * @param fatherStruct Instancia padre.
   * @param fatherProperty Propiedad padre.
   * @returns {TypeStruct_exe_} debuelve la instancia proxy. 
   */
  static newProxy<T>(thisArg: T, type: processingType, fatherStruct?: TypeStruct_exe_<any>, fatherProperty?: string): TypeStruct_exe_<T> {
    let typeProcessing = type
    let managementHierarchicalData = new ManagementHierarchicalDataObj({ processingType: type }) as ManagementHierarchicalData
    managementHierarchicalData.structObj = thisArg
    switch (type) {
      case processingType.primitiveData:
      case processingType.unset:
      case processingType.function: {
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as object), {
          get(target: object, property: string | symbol, receiver: any) {
            if (property === internal_exe_property || property === string_exe_property) return managementHierarchicalData as ManagementHierarchicalData;
            return Reflect.get(target, property, receiver);
          },
          set(target: object, property: string, val: any, receiver: any) {
            return Reflect.set(target, property, val, receiver);
          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true;
            return Reflect.has(target, property);
          }
        }) as any;
        break;
      }
      case processingType.array:
      case processingType.object: {
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as object), {
          defineProperty(target: object, property: string, descriptor: PropertyDescriptor) {
            managementHierarchicalData.set(property.toString(), descriptor.value)
            // Posible mejora con validación de fallo creación de propiedad PPPS
            return true
          },
          set(target: object, property: string, val: any, receiver: any) {
            managementHierarchicalData.set(property.toString(), val)
            // Posible mejora con validación de fallo asignación PPPS
            return true
          },
          get(target: object, property: string | symbol, receiver: any) {
            if (property == internal_exe_property) return managementHierarchicalData as ManagementHierarchicalData
            if (property === string_exe_property && !(string_exe_property in target)) {
              return managementHierarchicalData as ManagementHierarchicalData
            } else {
              let value = Reflect.get(target, property, receiver)
              if (managementHierarchicalData.rootManagement.observingGets) {
                managementHierarchicalData.rootManagement.callReact(new datChangeObj({
                  ruta: managementHierarchicalData.path + (typeProcessing == processingType.array) ? '[' + property.toString() + ']' : '|' + property.toString(),
                  hito: typeChange.geter,
                  ambito: stateAmbitReaction.local,
                  datoNuevo: value,
                  datoActual: undefined
                }))
              }
              return value
            }

          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true
            return Reflect.has(target, property)
          },
        } as ProxyHandler<Object>) as TypeStruct_exe_<any>
        break
      }
      case processingType.set:
      case processingType.map: {
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as Map<any, any> | Set<any>), {
          defineProperty(target: object, property: string, descriptor: PropertyDescriptor) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (Reflect.defineProperty(target, property, descriptor)) {
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + '|' + property,
                hito: typeChange.create,
                ambito: stateAmbitReaction.local,
                datoNuevo: descriptor.value,
                datoActual: undefined
              }))
              return true
            } else return false
          },
          set(target: object, property: string, val: any, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            let oldValue = Object.getOwnPropertyDescriptor(target, property)?.value
            if (Reflect.set(target, property, val, receiver)) {
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + '|' + property,
                hito: typeChange.seter,
                ambito: stateAmbitReaction.local,
                datoNuevo: val,
                datoActual: oldValue
              }))
              return true
            } else return false
          },
          get(target: object, property: string | symbol, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (property == internal_exe_property) return managementHierarchicalData as ManagementHierarchicalData
            var receiverSafe = ((target instanceof Set) || (target instanceof Map)) ? target : receiver;
            var value = (property === string_exe_property && !(string_exe_property in target)) ? management_exe_ : Reflect.get(target, property, receiverSafe);
            if (typeof value === "function" && ((target instanceof Set) || (target instanceof Map))) {
              if (property === 'set' || property === 'add') {
                value = function (propertyKey: any, propertyValue: any) {
                  if (property === 'add') {
                    management_exe_.set(propertyKey?.toString() ?? 'null', propertyKey)
                  } else {
                    management_exe_.set(propertyKey, propertyValue)
                  }
                  return management_exe_.proxyObj
                }
              } else value = value.bind(target)
            } else if (management_exe_.rootManagement.observingGets) {
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + '[' + property.toString() + ']',
                hito: typeChange.geter,
                ambito: stateAmbitReaction.local,
                datoNuevo: value,
                datoActual: undefined
              }))
            }
            return value;
          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true
            return Reflect.has(target, property)
          },
        } as ProxyHandler<Object>) as TypeStruct_exe_<any>
        break
      }
      case processingType.noObserv: {
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as object), {
          get(target: object, property: string | symbol, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (property == internal_exe_property) return managementHierarchicalData as ManagementHierarchicalData
            var value = (property === string_exe_property && !(string_exe_property in target)) ? management_exe_ : Reflect.get(target, property, receiver);
            if (typeof value === "function" && ((target instanceof Set) || (target instanceof Map))) {
              let valueBound = value.bind(target)
              value = function (propertyKey: any, propertyValue: any) {
                return valueBound(propertyKey, propertyValue)
              }
            }
            return value;
          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true
            return Reflect.has(target, property)
          },
        } as ProxyHandler<Object>) as any
        break
      }

      case processingType.observ: {
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as object), {
          defineProperty(target: object, property: string, descriptor: PropertyDescriptor) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (Reflect.defineProperty(target, property, descriptor)) {
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + '|' + property,
                hito: typeChange.create,
                ambito: stateAmbitReaction.local,
                datoNuevo: descriptor.value,
                datoActual: undefined
              }))
              return true
            } else return false
          },
          set(target: object, property: string, val: any, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            let oldValue = Object.getOwnPropertyDescriptor(target, property)?.value
            if (Reflect.set(target, property, val, receiver)) {
              let propertySep = (Array.isArray(target)) ? '[' + property + ']' : '|' + property
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + propertySep,
                hito: typeChange.seter,
                ambito: stateAmbitReaction.local,
                datoNuevo: val,
                datoActual: oldValue
              }))
              return true
            } else return false
          },
          get(target: object, property: string | symbol, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (property == internal_exe_property) return managementHierarchicalData as ManagementHierarchicalData
            var receiverSafe = ((target instanceof Set) || (target instanceof Map)) ? target : receiver;
            var value = (property === string_exe_property && !(string_exe_property in target)) ? management_exe_ : Reflect.get(target, property, receiverSafe);
            if (typeof value === "function" && ((target instanceof Set) || (target instanceof Map))) {
              if (property === 'set' || property === 'add') {
                let valueBound = value.bind(target)
                value = function (propertyKey: any, propertyValue: any) {
                  let oldValue = Object.getOwnPropertyDescriptor(target, propertyKey)?.value
                  if (property === 'add') {
                    if (valueBound(propertyKey)) {
                      management_exe_.rootManagement.callReact(new datChangeObj({
                        ruta: management_exe_.path + '[' + propertyKey?.toString() + ']',
                        hito: typeChange.seter,
                        ambito: stateAmbitReaction.local,
                        datoNuevo: propertyKey,
                        datoActual: oldValue
                      }))
                    }
                  } else {
                    if (valueBound(propertyKey, propertyValue)) {
                      management_exe_.rootManagement.callReact(new datChangeObj({
                        ruta: management_exe_.path + '[' + propertyKey?.toString() + ']',
                        hito: typeChange.seter,
                        ambito: stateAmbitReaction.local,
                        datoNuevo: propertyValue,
                        datoActual: oldValue
                      }))
                    }
                  }
                  return management_exe_.proxyObj
                }
              }
            } else if (management_exe_.rootManagement.observingGets) {
              let propertySep = (Array.isArray(target)) ? '[' + property.toString() + ']' : '|' + property.toString()
              management_exe_.rootManagement.callReact(
                new datChangeObj({
                  ruta: management_exe_.path + propertySep,
                  hito: typeChange.geter,
                  ambito: stateAmbitReaction.local,
                  datoNuevo: value,
                  datoActual: undefined
                }))
            }
            return value;
          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true
            return Reflect.has(target, property)
          },
        } as ProxyHandler<Object>) as TypeStruct_exe_<any>
        break
      }
      case processingType.noObserv: {
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as object), {
          get(target: object, property: string | symbol, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (property == internal_exe_property) return managementHierarchicalData as ManagementHierarchicalData
            var receiverSafe = ((target instanceof Set) || (target instanceof Map)) ? target : receiver;
            var value = (property === string_exe_property && !(string_exe_property in target)) ? management_exe_ : Reflect.get(target, property, receiverSafe);
            if ((typeof value === "function" && ((target instanceof Set) || (target instanceof Map))) && ((property === 'set' || property === 'add')))
              value = value.bind(target)
            return value;
          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true
            return Reflect.has(target, property)
          },
        } as ProxyHandler<Object>) as TypeStruct_exe_<any>
        break
      }
      default:
        managementHierarchicalData.proxyObj = new Proxy((thisArg as unknown as object), {
          defineProperty(target: object, property: string, descriptor: PropertyDescriptor) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (Reflect.defineProperty(target, property, descriptor)) {
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + '|' + property,
                hito: typeChange.create,
                ambito: stateAmbitReaction.local,
                datoNuevo: descriptor.value,
                datoActual: undefined
              }))
              return true
            } else return false
          },
          set(target: object, property: string, val: any, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            let oldValue = Object.getOwnPropertyDescriptor(target, property)?.value
            if (Reflect.set(target, property, val, receiver)) {
              let propertySep = (Array.isArray(target)) ? '[' + property + ']' : '|' + property
              management_exe_.rootManagement.callReact(new datChangeObj({
                ruta: management_exe_.path + propertySep,
                hito: typeChange.seter,
                ambito: stateAmbitReaction.local,
                datoNuevo: val,
                datoActual: oldValue
              }))
              return true
            } else return false
          },
          get(target: object, property: string | symbol, receiver: any) {
            let management_exe_ = managementHierarchicalData as ManagementHierarchicalData
            if (property == internal_exe_property) return managementHierarchicalData as ManagementHierarchicalData
            var receiverSafe = ((target instanceof Set) || (target instanceof Map)) ? target : receiver;
            var value = (property === string_exe_property && !(string_exe_property in target)) ? management_exe_ : Reflect.get(target, property, receiverSafe);
            if (typeof value === "function" && ((target instanceof Set) || (target instanceof Map))) {
              if (property === 'set' || property === 'add') {
                let valueBound = value.bind(target)
                value = function (propertyKey: any, propertyValue: any) {
                  let oldValue = Object.getOwnPropertyDescriptor(target, propertyKey)?.value
                  if (property === 'add') {
                    if (valueBound(propertyKey)) {
                      management_exe_.rootManagement.callReact(new datChangeObj({
                        ruta: management_exe_.path + '[' + propertyKey?.toString() + ']',
                        hito: typeChange.seter,
                        ambito: stateAmbitReaction.local,
                        datoNuevo: propertyKey,
                        datoActual: oldValue
                      }))
                    }
                  } else {
                    if (valueBound(propertyKey, propertyValue)) {
                      management_exe_.rootManagement.callReact(new datChangeObj({
                        ruta: management_exe_.path + '[' + propertyKey?.toString() + ']',
                        hito: typeChange.seter,
                        ambito: stateAmbitReaction.local,
                        datoNuevo: propertyValue,
                        datoActual: oldValue
                      }))
                    }
                  }
                  return management_exe_.proxyObj
                }
              }
            } else if (management_exe_.rootManagement.observingGets) {
              let propertySep = (Array.isArray(target)) ? '[' + property.toString() + ']' : '|' + property.toString()
              management_exe_.rootManagement.callReact(
                new datChangeObj({
                  ruta: management_exe_.path + propertySep,
                  hito: typeChange.geter,
                  ambito: stateAmbitReaction.local,
                  datoNuevo: value,
                  datoActual: undefined
                }))
            }
            return value;
          },
          has(target, property) {
            if (property === internal_exe_property || property === string_exe_property) return true
            return Reflect.has(target, property)
          },
        } as ProxyHandler<Object>) as TypeStruct_exe_<any>
        break
    }
    if (fatherStruct && fatherProperty) {
      if ([processingType.array, processingType.set, processingType.map].includes(_exe_.intenal_utils.gestType(fatherStruct)))
        fatherProperty = '[' + fatherProperty + ']'
      else
        fatherProperty = '|' + fatherProperty
      managementHierarchicalData.path = _exe_.path(fatherStruct) + fatherProperty
      managementHierarchicalData.rootManagement = _exe_.intenal_utils.get_exe_(fatherStruct).rootManagement
    } else managementHierarchicalData.rootManagement = new ManagementReactionsObj(managementHierarchicalData.proxyObj)

    // --- RECURSIVE ASSIMILATION ---
    // Iterate over immediate keys to safely box primitives or create deep proxies
    if (thisArg && typeof thisArg === 'object') {
      let stateGets = managementHierarchicalData.rootManagement.observingGets;
      managementHierarchicalData.rootManagement.observingGets = false;

      if (typeProcessing === processingType.array || typeProcessing === processingType.object) {
        for (let key in thisArg) {
          if (Object.prototype.hasOwnProperty.call(thisArg, key)) {
            let initialValue = (thisArg as any)[key];
            if (!_exe_.be(initialValue)) {
              InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, key, initialValue);
            }
          }
        }
      } else if (typeProcessing === processingType.map) {
        let mapTarget = thisArg as unknown as Map<any, any>;
        let copyEntries = Array.from(mapTarget.entries());
        for (let [key, val] of copyEntries) {
          if (!_exe_.be(val)) {
            InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, key, val);
          }
        }
      } else if (typeProcessing === processingType.set) {
        let setTarget = thisArg as unknown as Set<any>;
        let copyValues = Array.from(setTarget.values());
        setTarget.clear();
        for (let val of copyValues) {
          if (!_exe_.be(val)) {
            InternalUtils.setProperty_strict(managementHierarchicalData.proxyObj, val.toString(), val);
          } else {
            setTarget.add(val);
          }
        }
      }

      managementHierarchicalData.rootManagement.observingGets = stateGets;
    }

    return managementHierarchicalData.proxyObj
  }

}

export interface ManagementReaction extends ManagementReactionObj { }
/**
 * @class ManagementReactionObj para las instancias de @see ManagementReactionObj
 * Este objeto es utilizado como respuesta en los eventos de _exe_
 * @see _exe_
 * @see ManagementReaction
 */
export class ManagementReactionObj {
  /**
   * Crea una instancia de ManagementReactionObj con parámetros opcionales.
   * @param parametros Parámetros de inicialización.
   */
  constructor(inicialValues?: Partial<ManagementReactionObj>) { Object.assign(this, inicialValues) }
  [index: string]: any
  /** @property Número de llamadas al evento */
  "calls": number = 0
  /** @property Estado de la subscripción */
  "status": stateAmbitReaction = stateAmbitReaction.local
  /** @property Indice de la subscripción */
  "id": number = 0
}


export interface Reaction extends ReactionObj { }
/**
 * @class ReactionObj Instancia de Reaction
 * Este objeto es utilizado como respuesta del contrato en _exe_.react
 * @see Reaction
 * @see _exe_
 */
export class ReactionObj {
  /**
   * Crea una reacción y normaliza sus objetos de cambio y gestión.
   * @param parametros Parámetros de inicialización.
   */
  constructor(inicialValues?: Partial<ReactionObj>) {
    Object.assign(this, inicialValues)
    this.change = new datChangeObj(this.change)
    this.manage = new ManagementReactionObj(this.manage)
  }
  [index: string]: any
  /** @property Objeto de cambio de datos */
  "change": datChangeObj = new datChangeObj()
  /** @property Función a ejecutar cuando cambia el valor */
  "action": ActionChange = () => { }
  /** @property Contexto en el que se ejecutará la función */
  "thisArg": any = undefined
  /** @property Objeto de gestión de subscripción */
  "calls": number = 0
  /** @property Objeto de gestión de subscripción */
  "manage"!: ManagementReaction
  /** @property Función para cancelar la subscripción */
  "declineReact": () => void
}

export interface datChange extends datChangeObj { }
/**
 * @interface datChange Este objeto es utilizado como respuesta en los eventos de la estructura
 * @class datChangeObj
 * @see datChange
 * @see TypeStruct_exe_
 */
export class datChangeObj {
  /**
   * @constructor 
   * @param ruta Ruta del cambio o listaParametros
   * @param hito Hito del cambio
   * @param ambito Ambito del cambio
   * @param datoNuevo Dato Nuevo
   * @param datoActual Dato Actual
   */
  constructor(inicialValues?: Partial<datChangeObj>) { Object.assign(this, inicialValues) }
  "ruta": string = ''
  "datoNuevo": any = undefined
  "datoActual": any = undefined
  "hito": typeChange = typeChange.change
  "ambito": stateAmbitReaction = stateAmbitReaction.local
  "thisArg": any = undefined
}
