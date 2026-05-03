/*********************************************************************************************************
** ███████╗ ████████╗ ██████╗  ██╗   ██╗  ██████╗ ████████╗            ███████╗██╗  ██╗███████╗         **
** ██╔════╝ ╚══██╔══╝ ██╔══██╗ ██║   ██║ ██╔════╝ ╚══██╔══╝            ██╔════╝╚██╗██╔╝██╔════╝         **
** ███████╗    ██║    ██████╔╝ ██║   ██║ ██║         ██║               █████╗   ╚███╔╝ █████╗           **
** ╚════██║    ██║    ██╔══██╗ ██║   ██║ ██║         ██║               ██╔══╝   ██╔██╗ ██╔══╝           **
** ███████║    ██║    ██║  ██║ ╚██████╔╝ ╚██████╗    ██║       ███████╗███████╗██╔╝ ██╗███████╗███████╗ **
** ╚══════╝    ╚═╝    ╚═╝  ╚═╝  ╚═════╝   ╚═════╝    ╚═╝       ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ **
*********************************************************************************************************/
/* Structexe
** Estructure of hierarchical mutagenic & deep proxy reactive , EHM&DPC
** By Pedro Pablo Picado Sánchez
*/

import { ActionChange, datChange, datChangeObj, internal_exe_property, InternalUtils, ManagementReactionObj, processingType, Reaction, ReactionObj, stateAmbitReaction, typeChange, TypeStruct_exe_ } from "./inernalUtils";
export type { ActionChange, datChange, Reaction, TypeStruct_exe_ };
export { datChangeObj, internal_exe_property, InternalUtils, ManagementReactionObj, processingType, ReactionObj, stateAmbitReaction, typeChange };

/**
 * *************************************************************************** 
 * @class _exe_
 *  Esta clase es la encargada de la gestión jerárquica de datos.
 *  Proporciona métodos para definir, liberar , aplicar trampas proxy y mutar propiedades de objetos.
 */
export class _exe_ {
  static intenal_utils = InternalUtils

  /**
   * Comprueba si un objeto tiene la propiedad internal_exe_property e implica que es un objeto gestionado por _exe_ con proxy.
   * @param target Objeto a comprobar.
   * @returns Verdadero si el objeto tiene la propiedad internal_exe_property, falso en caso contrario.
   */
  static be(target: any): boolean {
    return (target != null && typeof target == 'object' && internal_exe_property in target)
  }

  /**
   * *************************************************************************** 
   * @method newStruct_exe_ Método que crea una instancia de objeto gestionado 
   * por _exe_ dependiendo del tipo de objeto de importObj y la retorna como TypeStruct_exe_.
   * @param importObj Objeto a importar.
   * @returns {TypeStruct_exe_} Devuelve la instancia creada como TypeStruct_exe_.
   * @throws Error si el tipo de objeto no es compatible.
   */
  static newStruct_exe_<T extends object>(importObj: T, fatherStruct?: TypeStruct_exe_<any>, fatherProperty?: string): TypeStruct_exe_<T> {
    let typeStruct = _exe_.intenal_utils.gestType(importObj)
    return _exe_.intenal_utils.newProxy(importObj, typeStruct, fatherStruct, fatherProperty)
  }

  // /**
  //  * *************************************************************************** 
  //  * @method free Metodo que borra la propiedad de la instancia.
  //  * @param property Nombre de la propiedad
  //  * @returns {Data_exe_} debuelve el objeto contenedor de la instancia. 
  //  */
  // static free<T>(target: T, property: string = ''): T {
  //   if (_exe_.be(target)) {
  //     switch (_exe_.intenal_utils.gestType(target)) {
  //       case processingType.object:
  //         delete (target as unknown as Object)[property]
  //         break;
  //       case processingType.array:
  //         delete (target as unknown as Array<any>)[Number(property)]
  //         break;
  //       case processingType.map:
  //         (target as unknown as Map<any, any>).delete(property)
  //         break;
  //       case processingType.set:
  //         (target as unknown as Set<any>).delete((target as unknown as Set<any>).values[Number(property)])
  //     }
  //   }
  //   return target
  // }

  /**
   * *************************************************************************** 
   * @method defineIfn Metodo que definirá y/o creará condicionalmente una propiedad de 
   * esta instancia si no está definida , entá definida a Undefined o tiene el valor indicado en el parametro oval.
   * @param property Nombre de la propiedad
   * @param value Objeto o valor a asignar
   * @param oval Valor de la propiedad que asumirá como Undefined , asignando value a la propiedad como si no estubiese definida.
   * @param muting Indica si se mutará el destino o no.
   * @returns {TypeStruct_exe_} debuelve el objeto contenedor de la instancia. 
   * @see define Este método utiliza el metodo define en caso de definir la propiedad     
   */
  static setIfn_<T>(target: T, property: string, value?: any, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    let actVal = _exe_.intenal_utils.getByStr(target, property)
    if (actVal == undefined || actVal.toString() != oval.toString())
      _exe_.set(target, property, value, muting)
    return (target as unknown as TypeStruct_exe_<T>)
  }
  /**
   * *************************************************************************** 
   * @method set Metodo que asignará y/o creará una o varias propiedades de 
   * esta instancia.
   * @param target Objeto de destino para la asignación 
   * @param path Ruta de la propiedad 
   * @param value Objeto o valor a asignar
   * @param muting Indica si se mutará el destino o no.
   * @param transformValue Indica si se transformará el valor al tipo de estructura de destino si existe
   * @returns {TypeStruct_exe_<T>} debuelve el objeto contenedor de la instancia. 
   */
  static set<T>(thisArg: any, path: string, value: T, muting?: boolean, transformValue: boolean = true): TypeStruct_exe_<T> {
    let returnValue: TypeStruct_exe_<T> = undefined as any
    if (!_exe_.be(thisArg)) {
      throw new Error("El objeto no tiene la propiedad _exe_ o no es compatible con la estructura jerárquica de datos.")
      // PPPS mejorar el mensaje de error
    }
    // Multiplexa la asignación de la propiedad a través de la ruta jerárquica con comodines
    _exe_.route(thisArg, path, (propertyValue: any, propertyName: string, structTarget: any, _exe_Path: string, TypeStruct_exe_: TypeStruct_exe_<any>) => {
      muting = (muting != undefined) ? muting : (_exe_.intenal_utils.get_exe_(TypeStruct_exe_)?.mutating ?? _exe_.intenal_utils.get_exe_(structTarget)?.mutating);
      returnValue = _exe_.intenal_utils.setProperty_strict(structTarget, propertyName, value) // PPPS en proceso , muting, transformValue, _exe_Path, TypeStruct_exe_
    }, (err: string) => { throw new Error(err) }, undefined, { transformValue: transformValue })
    return returnValue
  }
  /**	
   * ***************************************************************************
   * Recorre un Objeto por un path y devuelve el valor encontrado o undefined si no lo encuentra.
   * @param cursor Objeto por el cual se va a recorrer el path
   * @param path Path por el cual se va a recorrer el cursor
   * @param callBackfnOk Función que se va a llamar si se encuentra el valor
   * @param callbackfnKo Función que se va a llamar si no se encuentra el valor
   * @returns Valor encontrado o undefined si no se encuentra
   */
  static route(cursor: Object, path: string = '', callBackfnOk?: (value: any, property: string, struct: any, _exe_Path: string, TypeStruct_exe_: TypeStruct_exe_<any>) => void, callbackfnKo?: (err: string) => void, altOrigin?: { cursor: Object, path: string, _exe_Path: string, TypeStruct_exe_: TypeStruct_exe_<any> }, options?: { transformValue?: boolean }): any {
    let pathCursor = path
    let keyFind!: string
    let valueFind!: string
    let all!: boolean
    let propertyes!: Array<string>
    let property!: string
    let ok!: boolean
    let returnValue: any = undefined
    let iteration: boolean = false
    let _exe_Path: string | undefined = undefined
    let TypeStruct_exe_: TypeStruct_exe_<any> | undefined = undefined

    let koFunction = () => {
      // ¡¡¡ En desarrollo navegación por path no soportada totalmente para objetos no Data_exe_ PPPS        
      if (callbackfnKo) callbackfnKo('this is not a Data_exe_ object')
      return undefined
    }

    if (typeof cursor == 'object') {
      if (_exe_.be(cursor)) {
        if (path === '') path = _exe_.path(cursor)
        if (path[0] == '/') {
          cursor = _exe_.intenal_utils.get_exe_(cursor).rootManagement.root
          pathCursor = path.slice((path.length > 1 && path[1] === '|') ? 2 : 1)
        }
      } else if (altOrigin) {
        if (path === '') {
          if (callBackfnOk) callBackfnOk(cursor, altOrigin.path, altOrigin.cursor, altOrigin._exe_Path, altOrigin.TypeStruct_exe_)
          return cursor
        }
        if (path[0] === '/') {
          cursor = altOrigin.cursor
          pathCursor = path.slice((path.length > 1 && path[1] === '|') ? 2 : 1)  // eliminamos el primer / si hay uno y el | si hay uno
        }
      } else koFunction()

      propertyes = pathCursor.replaceAll('[', '|').replaceAll(']', '').split('|')
      property = (altOrigin) ? altOrigin.path : ''
      ok = true
      returnValue = cursor

      while (ok && propertyes.length && propertyes[0] != '') {

        if (_exe_.be(returnValue)) {
          _exe_Path = propertyes.join('|')
          TypeStruct_exe_ = returnValue as unknown as TypeStruct_exe_<any>
        } else if (altOrigin) {
          _exe_Path = _exe_Path || altOrigin._exe_Path
          TypeStruct_exe_ = TypeStruct_exe_ || altOrigin.TypeStruct_exe_
        } else if (TypeStruct_exe_ === undefined || _exe_Path === undefined) {
          throw new Error(`Error of hierarchy , path "${path}" , property "${property}", not found in cursor "${returnValue.toString()}" `)
        }

        property = (propertyes.shift() || '')
        cursor = returnValue

        if (['?', '*', '(?)', '(*)'].includes(property)) {
          all = true;
          property = "(?:?)"
        } else {
          all = false
        }

        if (property[0] != '(') {
          let found = false;
          returnValue = _exe_.intenal_utils.getByStr(cursor, property, () => { found = true; }, (err) => { found = false; })

          if (!found) {
            if (options?.transformValue) {
              if (propertyes.length > 0) {
                // Auto-vivify intermediate nodes
                _exe_.intenal_utils.setProperty_strict(cursor, property, {});
                returnValue = (cursor as any)[property];
              } else {
                // Gracefully pass the final missing node for assignment
                returnValue = undefined;
              }
            } else {
              ok = false;
            }
          }
        } else {
          [keyFind, valueFind] = property.slice(1, property.length - 1).split(':')
          ok = false
          _exe_.forEach(cursor, (value, realKey, stringKey) => {
            if ((keyFind === '?' || keyFind === stringKey) && (all || valueFind === value.toString())) {
              ok = true
              iteration = true
              returnValue = _exe_.route(value, propertyes.join('|'), callBackfnOk, callbackfnKo, { cursor: cursor, path: stringKey || '', _exe_Path: _exe_Path!, TypeStruct_exe_: TypeStruct_exe_! }, options)
            }
          })
          propertyes = []
        }
      }

      if (callbackfnKo && !ok && !iteration) callbackfnKo(`property ${property} not found in "${path}" rest path => ${propertyes.join('|')}`)
      if (callBackfnOk && ok && !iteration) callBackfnOk(returnValue, property, cursor, _exe_Path!, TypeStruct_exe_!)
      return returnValue

    } else {
      if (altOrigin) {
        if (path === '') {
          if (callBackfnOk) callBackfnOk(cursor, altOrigin.path, altOrigin.cursor, _exe_Path!, TypeStruct_exe_!)
          return cursor
        }
      }
      koFunction()
    }
  }

  /**
   * Recorre una estructura y ejecuta un callback por cada elemento.
   * @param target Estructura objetivo (objeto, array, map o set).
   * @param callbackfn Función a ejecutar por cada elemento.
   * @param thisArg Contexto opcional para el callback.
   * @returns void
   */
  static forEach(target: any, callbackfn: (value: any, realKey?: any, stringKey?: string, target?: any) => void, thisArg?: any): void {
    let arrayKeyValues: Array<[value: any, realKey: any, stringKey: string]> = []
    switch (_exe_.intenal_utils.gestType(target)) {
      case processingType.object:
        arrayKeyValues = (target != null) ? Object.entries(target).map((item) => [item[1], item[0], item[0].toString()]) : []
        break;
      case processingType.map:
        arrayKeyValues = Array.from((target as Map<any, any>).entries()).map((item) => [item[1], item[0], item[0].toString()])
        break;
      case processingType.set:
        arrayKeyValues = Array.from((target as Set<any>).values()).map((item, index) => [item, item, index.toString()])
        break;
      case processingType.array:
        arrayKeyValues = (target as any[]).map((item, index) => [item, index, index.toString()])
        break;
      default:
        arrayKeyValues = []
        break;
    }

    arrayKeyValues.forEach((item) => { callbackfn.call(thisArg, item[0], item[1], item[2], target) })

  };

  /**	
   * ***************************************************************************
   * @method export Exporta propiedades de esta instancia o esta instancia a un objeto plano o a un objeto aportado.
   * @param thisArg Instancia de la cual se exportaran propiedades
   * @param property Nombre de la propiedad a exportar
   * @param targetFill Objeto de destino de la exportación ¡¡ En desarrollo PPPS !!     
   * @returns Objeto plano o dato simple
   */
  static export(thisArg: any, property: string = '', targetFill?: object | any[] | Map<any, any> | Set<any>): any {
    // PPPS necesita desarrollar mejora de exportación adminiendo rutas desarrollar con route()
    let origen = (property == '') ? thisArg : _exe_.intenal_utils.getByStr(thisArg, property)
    let target: any = origen
    let descriptor: PropertyDescriptor
    switch (_exe_.intenal_utils.gestType(origen)) {
      case processingType.object: {
        target = new Object()
        _exe_.forEach(origen, (value, realKey) => {
          descriptor = { configurable: true, enumerable: true, value: _exe_.export(value), writable: true, }
          Object.defineProperty(target, realKey, descriptor)
        })
        break
      }
      case processingType.map: {
        target = new Map<any, any>()
        _exe_.forEach(origen, (value, realKey) => { target.set(realKey, _exe_.export(value)) })
        break
      }
      case processingType.set: {
        target = new Set<any>()
        _exe_.forEach(origen, (value) => { target.add(_exe_.export(value)) })
        break
      }
      case processingType.array: {
        target = new Array<any>()
        _exe_.forEach(origen, (value, realKey) => { target[realKey] = _exe_.export(value) })
        break
      }
      default:
        if (_exe_.be(origen)) {
          let structObj = (origen._exe_ as ManagementHierarchicalData).structObj;
          target = (structObj && 'value' in structObj) ? structObj.value : structObj;
        }
        // processingType.NoMutation, processingType.primitiveData, processingType.NoObserver, processingType.function, processingType.unset ...          
        break;
    }
    return target
  }


  /**
   * *************************************************************************** 
   * @method reaction Metodo que creará una reacción.
   * @param path Ruta de la propiedad a reaccionar.
   * @param action Acción a ejecutar.
   * @param component Componente a ejecutar.
   * @returns {Reaction} debuelve la reacción ejecutada.
   */
  static react(thisArg: any, path: string | datChangeObj, action: ActionChange, component?: Object): Reaction {

    let manager = _exe_.intenal_utils.get_exe_(thisArg)

    if (typeof path == 'string') {
      path = (path.indexOf('/') === 0) ? path : manager.path + ((path.indexOf('[') === 0) ? '' : '|') + path
      path = new datChangeObj({ ruta: path, hito: typeChange.change })
    }

    if (path.ruta == '')
      path.ambito = stateAmbitReaction.all
    else if (path.ambito == stateAmbitReaction.all)
      path.ruta = ''

    return manager.rootManagement.react(path, action, component)
  }

  /**
   * *************************************************************************** 
   * @method declineReaction Metodo que cancelará una reacción creada con reaction.
   * @param idReaction Identificador de la reacción.
   */
  static declineReact(thisArg: any, idReaction: number | Reaction): Reaction {
    let manager = _exe_.intenal_utils.get_exe_(thisArg)
    return manager.rootManagement.declineReact(idReaction)
  }

  /**
   * *************************************************************************** 
   * @method path Metodo que devolverá la ruta de la instancia.
   * @returns {string} debuelve la ruta de la instancia. 
   */
  static path(thisArg: any): string {
    let manager = _exe_.intenal_utils.get_exe_(thisArg)
    return manager.path
  }

}

export interface ManagementHierarchicalData extends ManagementHierarchicalDataObj, ProtoManagementHierarchicalDataObj { }
/**
 * @class managementHierarchicalDataObj
 * Datos de gestión para un elemento de estructura tipo Data_exe_
 * Su interfaz seria managementHierarchicalData
 * @see managementHierarchicalData
 */
export class ManagementHierarchicalDataObj {
  /**
   * Crea una instancia y aplica inicialización de parámetros si se proveen.
   * @param path Ruta de la estructura
   * @param structObj Objeto de la estructura
   * @param proxyObj Objeto proxy de la estructura
   * @param mutating Indica si se mutará el destino o no.
   * @param observing Indica si se observará el destino o no.
   * @param rootManagement Objeto de gestión raiz.
   */
  constructor(inicialValues?: Partial<ManagementHierarchicalDataObj>) { Object.assign(this, inicialValues) }
  path: string = '/'
  structObj!: any
  proxyObj!: any
  mutating: boolean = true
  observingGets: boolean = false
  processingType: processingType = processingType.object
  rootManagement!: ManagementReactionsObj
}


/**
 * @class ProtoManagementHierarchicalDataObj
 * Clase para los nodos de la estructura de datos jerárquica con eventos de cambio profundo.
 */
class ProtoManagementHierarchicalDataObj {
  /**
   * Crea una instancia base de gestión jerárquica para el prototipo de esta.
   */
  constructor() { }

  /**
   * *************************************************************************** 
   * @method setIf_  Metodo que definirá y/o creará condicionalmente una propiedad de 
   * esta instancia si no está definida , entá definida a Undefined o tiene el valor indicado en el parametro oval.
   * @param property Nombre de la propiedad
   * @param value Objeto o valor a asignar
   * @param oval Valor de la propiedad que asumirá como Undefined , asignando value a la propiedad como si no estubiese definida.
   * @param muting Indica si se mutará el destino o no.
   * @returns {Data_exe_} setIf_ debuelve el objeto contenedor de la instancia setIf debuelve valor de la propiedad asignada. 
   * @see _exe_.set Este método utiliza el metodo set en caso de definir la propiedad     
   */
  public setIf_<T>(property: string, value: T, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    return _exe_.setIfn_((this as unknown as ManagementHierarchicalData).proxyObj, property || '', value, oval, muting)
  }
  /**
     * *************************************************************************** 
     * @method setIf Metodo que definirá y/o creará condicionalmente una propiedad de 
     * esta instancia si no está definida , entá definida a Undefined o tiene el valor indicado en el parametro oval.
     * @param property Nombre de la propiedad
     * @param value Objeto o valor a asignar
     * @param oval Valor de la propiedad que asumirá como Undefined , asignando value a la propiedad como si no estubiese definida.
     * @param muting Indica si se mutará el destino o no.
     * @returns {TypeStruct_exe_<T>} Debuelve la propiedad asignada. 
     * @see _exe_.set Este método utiliza el metodo set en caso de definir la propiedad     
     */
  public setIf<T>(property: string, value: T, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    return (_exe_.setIfn_((this as unknown as ManagementHierarchicalData).proxyObj, property || '', value, oval, muting) as TypeStruct_exe_<any>)._exe_.getByStr(property)
  }

  /** 
   * ***************************************************************************
   * @method set_ Metodo que definirá y/o creará una propiedad parseando los datos según parametro y proxeando la estructura. 
   * @param property Nombre de la propiedad
   * @param value Objeto o valor a asignar
   * @param muting Indica si debe de transformar los Objetos de las propiedades en una estructura de DatosObj recursivamente.
   * @returns {Data_exe_} debuelve el objeto contenedor de la instancia. 
   */
  public set_<T>(property: string, value: any, muting?: boolean): TypeStruct_exe_<T> {
    return _exe_.set((this as unknown as ManagementHierarchicalData).proxyObj, property, value, muting)
  }
  /**
   * @method set Define o crea una propiedad y devuelve el valor asignado.
   * @param property Nombre de la propiedad.
   * @param value Objeto o valor a asignar.
   * @param muting Indica si debe transformar objetos en estructura jerárquica.
   * @returns {TypeStruct_exe_<T>} Valor de la propiedad asignada.
   */
  public set<T>(property: string, value: any, muting?: boolean): TypeStruct_exe_<T> {
    return (_exe_.set((this as unknown as ManagementHierarchicalData).proxyObj, property, value, muting) as TypeStruct_exe_<any>)._exe_.getByStr(property)
  }

  /**
   * ***************************************************************************
   * @method getByStr Devuelve el valor de la propiedad indicada.
   * @param property Nombre de la propiedad.
   * @param callBackfnOk Función a ejecutar si se encuentra el valor.
   * @param callbackfnKo Función a ejecutar si no se encuentra el valor.
   * @returns {any} Valor de la propiedad indicada o undefined.
   */
  public getByStr(property: string, callBackfnOk?: (value: any) => void, callbackfnKo?: (err: string) => void): any {
    return _exe_.intenal_utils.getByStr((this as unknown as ManagementHierarchicalData).proxyObj, property, callBackfnOk, callbackfnKo)
  }

  /**	
   * ***************************************************************************
   * @method export Permite exportar propiedades de esta instancia de DatosObj o propiedad a un objeto plano o a un objeto aportado.
   * @param property Nombre de la propiedad a exportar
   * @param targetFill Objeto de destino de la exportación ¡¡¡ En desarrollo PPPS!!!
   * @returns {any} Objeto plano rellenado o dato simple
   */
  public export(property: string = '', targetFill?: object | any[] | Map<any, any> | Set<any>): any {
    return _exe_.export((this as unknown as ManagementHierarchicalData).proxyObj, property, targetFill)
  }

  public route(path: string = '', callBackfnOk?: (value: any, property: string, struct: any) => void, callbackfnKo?: (err: string) => void): any {
    return _exe_.route((this as unknown as ManagementHierarchicalData).proxyObj, path, callBackfnOk, callbackfnKo)
  }

  /**
   * ***************************************************************************
   * @method react Permite suscribirse a los eventos de cambio de las propiedades de esta instancia de DatosObj o sus hijos.
   * @param dat Ruta de la propiedad a la que nos suscribimos u objeto con las opciones de la suscripción , 
   * @param accion Metodo a ejecutar cuando se produce un cambio en la propiedad    
   * @param thisArg Objeto al que se asignará el contexto this cuando se ejecute la acción 
   * @returns {Reaction} Subscripcion para desuscribirse del evento y ver estado
   */
  public react(dat: string | datChange, accion: ActionChange, thisArg?: any): Reaction {
    thisArg = thisArg || (this as unknown as ManagementHierarchicalData).proxyObj
    if (typeof dat == 'string') {
      dat = (dat.indexOf('/') === 0) ? dat : thisArg.path + '|' + dat
      // mejorar la forma de concatenar rutas PPPS , [] para array,map y set
      dat = new datChangeObj({ ruta: dat })
    }
    return thisArg.rootManagement.react(dat, accion, thisArg)
  }
}

// Enlazar prototipos sin usar una instancia concreta
Object.setPrototypeOf(ManagementHierarchicalDataObj.prototype, ProtoManagementHierarchicalDataObj.prototype);
// Restaurar constructor para no romper instanceof/constructor
(ManagementHierarchicalDataObj.prototype as any).constructor = ManagementHierarchicalDataObj;

type ReactionsSubtypeChange<T> = Record<string, T>
type ReactionsSubStateAmbitReaction<T> = Record<typeChange, ReactionsSubtypeChange<T>>
type IndexReactions<T> = Record<stateAmbitReaction, ReactionsSubStateAmbitReaction<T>>

// esta función crea un índice de reacciones instanciado con toda la estructura necesaria
function createIndexReactions<T>(): IndexReactions<T> {

  const indexReactions = {} as IndexReactions<T>
  const stateValues = Object.values(stateAmbitReaction).filter((value): value is stateAmbitReaction => typeof value === 'number')
  const typeValues = Object.values(typeChange).filter((value): value is typeChange => typeof value === 'number')

  stateValues.forEach((state) => {
    const typeRecord = {} as ReactionsSubStateAmbitReaction<T>
    typeValues.forEach((type) => { typeRecord[type] = {} as ReactionsSubtypeChange<T> })
    indexReactions[state] = typeRecord
  })

  return indexReactions
}

class bufferReactions {
  constructor(inicialValues?: Partial<bufferReactions>) { Object.assign(this, inicialValues) }
  index: IndexReactions<number> = createIndexReactions<number>()
  cont: number = 0
  reactions: Record<number, datChange> = {} as Record<number, datChange>
}

export interface ManagementReactions extends ManagementReactionsObj { }
/** @interface ManagementReactionsObj
 * @description Interface of the management of reactions
 */
export class ManagementReactionsObj {
  /**
   * Crea un gestor de reacciones asociado a un nodo raíz.
   * @param rootDatos Nodo raíz de la estructura jerárquica.
   */
  constructor(rootDatos: TypeStruct_exe_<any>) {
    this.root = rootDatos
  }

  /** @property Counter of reactions */
  private contReactions = 0
  /** @property Index hierarchical of reactions */
  private index: IndexReactions<number[]> = createIndexReactions<number[]>()
  /** @property Buffer of reactions */
  private bufferReactions: bufferReactions = new bufferReactions()
  /** @property Counter of SubBuffers */
  private contSubBufferReactions = 0
  /** @property pila de BufferReactios */
  private subBufferReactions: Array<{ id: number, bufferReactions: bufferReactions }> = []

  /** @property list of reactions */
  private reactions: Record<number, Reaction> = {}
  /** @property Root of the hierarchical data */
  public root!: TypeStruct_exe_<any>

  /** @property List of objects that do not mutate */
  public UserNoMutationObjs = []
  /** @property Flag of mutation general */
  public modeMutation = true
  /** @property Flag of observing gets */
  public observingGets = false
  /** @property flag for use Buffer of reactions */
  private buffer: boolean = false

  /** 
   * @method getBuffer Obtiene el estado del buffer de reacciones.
   * @returns Verdadero si el buffer está activo, falso en caso contrario.
   */
  public getBuffer() { return this.buffer }

  /** 
   * @method setBuffer Establece el estado del buffer de reacciones.
   * @param valor Verdadero para activar el buffer, falso para desactivarlo.
   */
  public setBuffer(valor: boolean) {
    if (!this.buffer && valor) {
      this.buffer = valor
      this._exe_Buffer()
    }
  }

  /** 
   * @method pushSubBuffer Añade el buffer al SubBuffer como ultima posición de una pila.   
   */
  public pushSubBuffer(): number {
    this.contSubBufferReactions++
    this.subBufferReactions.push({ id: this.contSubBufferReactions, bufferReactions: this.bufferReactions })
    this.bufferReactions = new bufferReactions()
    return this.contSubBufferReactions
  }

  /** 
   * @method popSubBuffer Extrae el último buffer de reacciones de la pila.
   * @param id Identificador opcional del buffer a extraer. Si no se proporciona, se extrae el último buffer añadido.
   * @returns Verdadero si se extrajo el buffer con éxito, falso si no se encontró el buffer.
   */
  public popSubBuffer(id?: number): boolean {
    let subBuffer = (id) ? this.subBufferReactions.find((subBuffer) => subBuffer.id == id) : this.subBufferReactions.pop()
    this.subBufferReactions = this.subBufferReactions.filter((subBuffer) => subBuffer.id != id)
    if (subBuffer) {
      Object.keys(this.bufferReactions.reactions).forEach((key) => {
        let cambio = this.bufferReactions.reactions[Number(key)]
        subBuffer!.bufferReactions.index[cambio.hito][cambio.ambito][cambio.ruta] = Number(key)
        subBuffer!.bufferReactions.reactions[Number(key)] = cambio
      })
      this.bufferReactions.index = subBuffer.bufferReactions.index
      this.bufferReactions.reactions = subBuffer.bufferReactions.reactions
      return true
    } else {
      return false
    }
  }

  /** @method clearBuffer Limpia el buffer de reacciones.
   * @description Elimina todas las reacciones almacenadas en el buffer.
   */
  public clearBuffer() {
    this.bufferReactions = new bufferReactions()
  }

  /** @method clearSubBuffer Limpia el buffer de reacciones.
   * @description Elimina todas las reacciones almacenadas en el SubBuffer especificado.
   * @param id Identificador opcional del SubBuffer a limpiar. Si no se proporciona, se limpian todos los SubBuffers.
   * @returns Verdadero si se limpió el SubBuffer con éxito, falso si no se encontró el SubBuffer.
   */
  public clearSubBuffer(id?: number): boolean {
    let returnValue: boolean = false
    if (!id) this.subBufferReactions = []
    this.subBufferReactions = this.subBufferReactions.filter((subBuffer) => {
      if (subBuffer.id != id) return true
      else {
        returnValue = true
        return false
      }
    })
    return returnValue
  }

  /**
   * @method getContReactions Obtiene el contador interno de reacciones.
   * @returns Número total de reacciones registradas.
   */
  public getContReactions() {
    return this.contReactions
  }

  /**
   * @method popReactions Extrae reacciones asociadas a una propiedad o todas si no se indica.
   * @param propiedad Propiedad de la que se extraen las reacciones.
   * @returns Lista de reacciones extraídas.
   */
  popReactions(propiedad?: string): Reaction[] {
    if (propiedad == undefined) {
      let reactionsDonadas = Object.values(this.reactions)
      this.reactions = {}
      this.index = createIndexReactions()
      return reactionsDonadas
    } else {
      // donaremos solo las subcripciones que cuelguen de la propiedad indicada
      // esto se puede optimizar pero no es crítico
      let reactionsDonadas = Object.values(this.reactions).filter((reaction) => reaction.change.ruta.indexOf(this.root._exe_.path + '|' + propiedad) === 0)
      reactionsDonadas.forEach((reaction) => {
        reaction.change.ruta = reaction.change.ruta.replace(this.root._exe_.path + '|' + propiedad, '/')
        this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta] = this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta].filter((index) => index != reaction.manage.id)
      })
      return reactionsDonadas
    }
  }

  /**
   * @method pushReactions Inserta reacciones en el gestor ajustando sus rutas.
   * @param reactions Lista de reacciones.
   * @param ruta Ruta base donde se insertan.
   * @returns Lista de reacciones insertadas.
  */
  pushReactions(reactions: Reaction[], ruta: string): Reaction[] {
    reactions.forEach((reaction) => {
      this.contReactions++
      reaction.change.ruta = reaction.change.ruta.replace('/', ruta)
      reaction.manage.id = this.contReactions
      this.reactions[this.contReactions] = reaction
    })
    return reactions
  }

  /** 
   * @method declineReact Pausa una reacción activa y la mueve al estado pause.
   * @param id Id de la reacción o la reacción misma.
   * @returns Reacción pausada.
   */
  declineReact(id: number | Reaction): Reaction {
    if (typeof id != 'number') id = id.manage.id
    let reaction = this.reactions[id]
    if (reaction.manage.status != stateAmbitReaction.pause) {
      reaction.manage.status = stateAmbitReaction.pause
      this.index[reaction.change.hito][stateAmbitReaction.pause][reaction.change.ruta].push(id)
      this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta] = this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta].filter((idActiva) => idActiva != id)
    }
    return reaction
  }

  /**
   * @method react Registra o reactiva una reacción para un cambio específico.
   * @param cambio Objeto de cambio.
   * @param accion Acción a ejecutar.
   * @param thisArg Contexto de ejecución.
   * @param noDie Reservado para futuros comportamientos de persistencia.
   * @returns Reacción registrada o reactivada.
   */
  react(cambio: datChangeObj, accion: ActionChange, thisArg: any, noDie = false): Reaction {
    let reaction: Reaction | undefined = undefined

    if (!this.index[cambio.hito][cambio.ambito].hasOwnProperty(cambio.ruta)) this.index[cambio.hito][cambio.ambito][cambio.ruta] = []

    this.index[cambio.hito][cambio.ambito][cambio.ruta].forEach((index) => {
      if (this.reactions[index].action === accion && this.reactions[index].thisArg === thisArg) reaction = this.reactions[index]
    })

    if (this.index[cambio.hito][stateAmbitReaction.pause]?.hasOwnProperty(cambio.ruta)) {
      this.index[cambio.hito][stateAmbitReaction.pause][cambio.ruta].forEach((index) => {
        if (this.reactions[index].action === accion && this.reactions[index].thisArg === thisArg) {
          reaction = this.reactions[index]
          reaction.manage.status = reaction?.change.ambito || stateAmbitReaction.local
          this.index[cambio.hito][stateAmbitReaction.pause][reaction?.change.ruta || ''] = this.index[cambio.hito][stateAmbitReaction.pause][reaction?.change.ruta || ''].filter((id) => id != index)
          this.index[cambio.hito][reaction?.change.ambito || stateAmbitReaction.local][cambio.ruta].push(index)
        }
      })
    }

    if (!reaction) {
      this.contReactions++
      let declineReactFunction = (() => { this.declineReact(this.contReactions) }).bind(this)
      reaction = new ReactionObj({
        "change": cambio,
        "action": accion,
        "thisArg": thisArg,
        "manage": new ManagementReactionObj({ id: this.contReactions, status: cambio.ambito }),
        "declineReact": declineReactFunction
      })
      this.index[cambio.hito][cambio.ambito][cambio.ruta].push(this.contReactions)
      this.reactions[this.contReactions] = reaction
    }

    return reaction
  }

  callReact(cambio: datChangeObj) {
    if (!this.getBuffer()) {
      this._exe_React(cambio)
    } else {
      this.bufferReactions.index[cambio.hito][cambio.ambito][cambio.ruta] = this.bufferReactions.cont
      this.bufferReactions.reactions[this.bufferReactions.cont] = cambio
      this.bufferReactions.cont++
    }
  }

  private _exe_Buffer() {
    this.bufferReactions.index
    Object.values(this.bufferReactions.index).forEach((ambitoOfHito) => {
      Object.values(ambitoOfHito).forEach((rutaOfAmbito) => {
        Object.values(rutaOfAmbito).forEach((indexChange) => {
          this._exe_React(this.bufferReactions.reactions[indexChange])
        })
      })
    })
    this.clearBuffer()
  }


  /**
   * Ejecuta las reacciones registradas para un cambio.
   * @param cambio Objeto de cambio.
   * @returns void
   */
  private _exe_React(dataChange: datChangeObj) {

    // filtraremos las reacciones locales
    if (this.index[dataChange.hito][stateAmbitReaction.local].hasOwnProperty(dataChange.ruta))
      this.index[dataChange.hito][stateAmbitReaction.local][dataChange.ruta].forEach((idActiva) => {
        this.reactions[idActiva].manage.calls++
        this.reactions[idActiva].action.apply(this.reactions[idActiva].thisArg, [dataChange])
      })

    // filtraremos las rutas que sean un segmento de la actual siendo estos los padres y llamando a sus subcripciones de tipo hijo
    dataChange.ruta.split('|').forEach((nivel, index) => {
      let ruta = dataChange.ruta.split('|', index).join('|')
      if (this.index[dataChange.hito][stateAmbitReaction.childens].hasOwnProperty(ruta))
        this.index[dataChange.hito][stateAmbitReaction.childens][ruta].forEach((idActiva) => {
          let hijo = new datChangeObj(dataChange)
          hijo.ambito = stateAmbitReaction.childens
          this.reactions[idActiva].manage.calls++
          this.reactions[idActiva].action.apply(this.reactions[idActiva].thisArg, [hijo])
        })
    })

    // filtraremos las rutas que empiecen por la ruta actual siendo estos los hijos y llamando a sus subcripciones de tipo padre
    let rutasPadre = Object.keys(this.index[dataChange.hito][stateAmbitReaction.fathers]).filter((ruta) => ruta.indexOf(dataChange.ruta) === 0)
    rutasPadre.forEach((ruta) => {
      this.index[dataChange.hito][stateAmbitReaction.fathers][ruta].forEach((idActiva) => {
        let cambioPadre = new datChangeObj(dataChange)
        cambioPadre.ambito = stateAmbitReaction.fathers
        this.reactions[idActiva].manage.calls++
        this.reactions[idActiva].action.apply(this.reactions[idActiva].thisArg, [cambioPadre])
      })
    })

    // reacciones globales
    if (this.index[dataChange.hito][stateAmbitReaction.all].hasOwnProperty('')) {
      this.index[dataChange.hito][stateAmbitReaction.all][''].forEach((idActiva) => {
        this.reactions[idActiva].manage.calls++
        this.reactions[idActiva].action.apply(this.reactions[idActiva].thisArg, [dataChange])
      })
    }

    // si el hito no es change y los datos distintos, ejecutaremos la llamada para change
    if (dataChange.hito != typeChange.change && _exe_.intenal_utils.stringify(dataChange.datoActual) != _exe_.intenal_utils.stringify(dataChange.datoNuevo)) {
      dataChange.hito = typeChange.change
      this._exe_React(dataChange)
    }

  }

}    
