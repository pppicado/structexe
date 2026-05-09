/*********************************************************************************************************
** ███████╗ ████████╗ ██████╗  ██╗   ██╗  ██████╗ ████████╗            ███████╗██╗  ██╗███████╗         **
** ██╔════╝ ╚══██╔══╝ ██╔══██╗ ██║   ██║ ██╔════╝ ╚══██╔══╝            ██╔════╝╚██╗██╔╝██╔════╝         **
** ███████╗    ██║    ██████╔╝ ██║   ██║ ██║         ██║               █████╗   ╚███╔╝ █████╗           **
** ╚════██║    ██║    ██╔══██╗ ██║   ██║ ██║         ██║               ██╔══╝   ██╔██╗ ██╔══╝           **
** ███████║    ██║    ██║  ██║ ╚██████╔╝ ╚██████╗    ██║       ███████╗███████╗██╔╝ ██╗███████╗███████╗ **
** ╚══════╝    ╚═╝    ╚═╝  ╚═╝  ╚═════╝   ╚═════╝    ╚═╝       ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ **
*********************************************************************************************************/
/* Structexe
** EN: Hierarchical mutagenic & deep proxy reactive data structures (EHM&DPC)
** ES: Estructuras de datos jerárquicas mutagénicas y reactivas con proxy profundo (EHM&DPC)
** By Pedro Pablo Picado Sánchez
*/

import { ActionChange, datChange, datChangeObj, internal_exe_property, InternalUtils, ManagementReactionObj, processingType, Reaction, ReactionObj, stateAmbitReaction, typeChange, TypeStruct_exe_ } from "./internalUtils";
export type { ActionChange, datChange, Reaction, TypeStruct_exe_ };
export { datChangeObj, internal_exe_property, InternalUtils, ManagementReactionObj, processingType, ReactionObj, stateAmbitReaction, typeChange };

/**
 * *************************************************************************** 
 * @class _exe_
 *  EN: This class is responsible for hierarchical data management.
 *      Provides methods to define, release, apply proxy traps, and mutate object properties.
 *  ES: Esta clase es la encargada de la gestión jerárquica de datos.
 *      Proporciona métodos para definir, liberar, aplicar trampas proxy y mutar propiedades de objetos.
 */
export class _exe_ {
  static internal_utils = InternalUtils

  /**
   * EN: Checks if an object has the internal_exe_property, implying it is managed by _exe_ with a proxy.
   * ES: Comprueba si un objeto tiene la propiedad internal_exe_property e implica que es un objeto gestionado por _exe_ con proxy.
   * @param target EN: Object to check. ES: Objeto a comprobar.
   * @returns EN: True if the object has internal_exe_property, false otherwise. ES: Verdadero si el objeto tiene la propiedad internal_exe_property, falso en caso contrario.
   */
  static be(target: any): boolean {
    return (target != null && typeof target == 'object' && internal_exe_property in target)
  }

  /**
   * *************************************************************************** 
   * @method newStruct_exe_ 
   *  EN: Method that creates a managed object instance depending on the type of importObj and returns it as TypeStruct_exe_.
   *  ES: Método que crea una instancia de objeto gestionado por _exe_ dependiendo del tipo de objeto de importObj y la retorna como TypeStruct_exe_.
   * @param importObj EN: Object to import. ES: Objeto a importar.
   * @returns {TypeStruct_exe_} EN: Returns the created instance as TypeStruct_exe_. ES: Devuelve la instancia creada como TypeStruct_exe_.
   * @throws Error EN: if the object type is not compatible. ES: si el tipo de objeto no es compatible.
   */
  static newStruct_exe_<T extends object>(importObj: T, fatherStruct?: TypeStruct_exe_<any>, fatherProperty?: string): TypeStruct_exe_<T> {
    let typeStruct = _exe_.internal_utils.gestType(importObj)
    return _exe_.internal_utils.newProxy(importObj, typeStruct, fatherStruct, fatherProperty)
  }

  // /**
  //  * *************************************************************************** 
  //  * @method free Metodo que borra la propiedad de la instancia.
  //  * @param property Nombre de la propiedad
  //  * @returns {Data_exe_} debuelve el objeto contenedor de la instancia. 
  //  */
  // static free<T>(target: T, property: string = ''): T {
  //   if (_exe_.be(target)) {
  //     switch (_exe_.internal_utils.gestType(target)) {
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
   * @method setIfn_ 
   *  EN: Method that will define and/or conditionally create a property of this instance
   *      if it is not defined, is defined as Undefined, or has the value indicated in the oval parameter.
   *  ES: Método que definirá y/o creará condicionalmente una propiedad de esta instancia
   *      si no está definida, está definida a Undefined o tiene el valor indicado en el parámetro oval.
   * @param property EN: Property name. ES: Nombre de la propiedad.
   * @param value EN: Object or value to assign. ES: Objeto o valor a asignar.
   * @param oval EN: Property value assumed as Undefined, assigning value to the property as if it were not defined. ES: Valor de la propiedad que asumirá como Undefined, asignando value a la propiedad como si no estuviese definida.
   * @param muting EN: Indicates whether the destination will be mutated or not. ES: Indica si se mutará el destino o no.
   * @returns {TypeStruct_exe_} EN: Returns the container object of the instance. ES: Devuelve el objeto contenedor de la instancia. 
   * @see _exe_.set EN: This method uses the set method if the property needs to be defined. ES: Este método utiliza el método set en caso de definir la propiedad.
   */
  static setIfn_<T>(target: T, property: string, value?: any, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    let actVal = _exe_.internal_utils.getByStr(target, property)
    if (actVal == undefined || (oval !== undefined && actVal?.toString() !== oval?.toString()))
      _exe_.set(target, property, value, muting)
    return (target as unknown as TypeStruct_exe_<T>)
  }
  /**
   * *************************************************************************** 
   * @method set 
   *  EN: Method that assigns and/or creates one or more properties of this instance.
   *  ES: Método que asignará y/o creará una o varias propiedades de esta instancia.
   * @param target EN: Destination object for the assignment. ES: Objeto de destino para la asignación.
   * @param path EN: Property path. ES: Ruta de la propiedad.
   * @param value EN: Object or value to assign. ES: Objeto o valor a asignar.
   * @param muting EN: Indicates whether the destination will be mutated or not. ES: Indica si se mutará el destino o no.
   * @param transformValue EN: Indicates whether the value will be transformed to the destination structure type if it exists. ES: Indica si se transformará el valor al tipo de estructura de destino si existe.
   * @returns {TypeStruct_exe_<T>} EN: Returns the container object of the instance. ES: Devuelve el objeto contenedor de la instancia. 
   */
  static set<T>(thisArg: any, path: string, value: T, muting?: boolean, transformValue: boolean = true): TypeStruct_exe_<T> {
    let returnValue: TypeStruct_exe_<T> = undefined as any
    if (!_exe_.be(thisArg)) {
      throw new Error("El objeto no tiene la propiedad _exe_ o no es compatible con la estructura jerárquica de datos.")
      // PPPS mejorar el mensaje de error
    }
    // EN: Multiplexes property assignment through the hierarchical path with wildcards.
    // ES: Multiplexa la asignación de la propiedad a través de la ruta jerárquica con comodines.
    _exe_.route(thisArg, path, (propertyValue: any, propertyName: string, structTarget: any, _exe_Path: string, TypeStruct_exe_: TypeStruct_exe_<any>) => {
      muting = (muting != undefined) ? muting : (_exe_.internal_utils.get_exe_(TypeStruct_exe_)?.mutating ?? _exe_.internal_utils.get_exe_(structTarget)?.mutating);
      returnValue = _exe_.internal_utils.setProperty_strict(structTarget, propertyName, value, muting, transformValue)
    }, (err: string) => { throw new Error(err) }, undefined, { transformValue: transformValue })
    return returnValue
  }
  /**	
   * ***************************************************************************
   * @method route
   *  EN: Traverses an Object by a path and returns the found value or undefined if not found.
   *  ES: Recorre un Objeto por un path y devuelve el valor encontrado o undefined si no lo encuentra.
   * @param cursor EN: Object to traverse the path. ES: Objeto por el cual se va a recorrer el path.
   * @param path EN: Path to traverse the cursor. ES: Path por el cual se va a recorrer el cursor.
   * @param callBackfnOk EN: Function to call if the value is found. ES: Función que se va a llamar si se encuentra el valor.
   * @param callbackfnKo EN: Function to call if the value is not found. ES: Función que se va a llamar si no se encuentra el valor.
   * @returns EN: Found value or undefined if not found. ES: Valor encontrado o undefined si no se encuentra.
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
          cursor = _exe_.internal_utils.get_exe_(cursor).rootManagement.root
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
          returnValue = _exe_.internal_utils.getByStr(cursor, property, () => { found = true; }, (err) => { found = false; })

          if (!found) {
            if (options?.transformValue) {
              if (propertyes.length > 0) {
                // EN: Auto-vivify intermediate nodes
                // ES: Auto-vivificar nodos intermedios
                _exe_.internal_utils.setProperty_strict(cursor, property, {});
                returnValue = (cursor as any)[property];
              } else {
                // EN: Gracefully pass the final missing node for assignment
                // ES: Pasar amablemente el nodo final faltante para asignación
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
            if ((keyFind === '?' || keyFind === stringKey) && (all || valueFind === String(value))) {
              ok = true
              iteration = true
              returnValue = _exe_.route(value, propertyes.join('|'), callBackfnOk, callbackfnKo, { cursor: cursor, path: stringKey || '', _exe_Path: _exe_Path!, TypeStruct_exe_: TypeStruct_exe_! }, options)
            }
          })
          propertyes = []
        }
      }

      const finalPath = _exe_Path ?? '';
      const finalStruct = TypeStruct_exe_ ?? cursor;
      if (callbackfnKo && !ok && !iteration) callbackfnKo(`property ${property} not found in "${path}" rest path => ${propertyes.join('|')}`)
      if (callBackfnOk && ok && !iteration) callBackfnOk(returnValue, property, cursor, finalPath, finalStruct)
      return returnValue

    } else {
      if (altOrigin) {
        if (path === '') {
          const finalPath = _exe_Path ?? altOrigin._exe_Path ?? '';
          const finalStruct = TypeStruct_exe_ ?? altOrigin.TypeStruct_exe_ ?? cursor;
          if (callBackfnOk) callBackfnOk(cursor, altOrigin.path, altOrigin.cursor, finalPath, finalStruct)
          return cursor
        }
      }
      koFunction()
    }
  }

  /**
   * @method forEach
   *  EN: Traverses a structure and executes a callback for each element.
   *  ES: Recorre una estructura y ejecuta un callback por cada elemento.
   * @param target EN: Target structure (object, array, map, or set). ES: Estructura objetivo (objeto, array, map o set).
   * @param callbackfn EN: Function to execute for each element. ES: Función a ejecutar por cada elemento.
   * @param thisArg EN: Optional context for the callback. ES: Contexto opcional para el callback.
   * @returns void
   */
  static forEach(target: any, callbackfn: (value: any, realKey?: any, stringKey?: string, target?: any) => void, thisArg?: any): void {
    let arrayKeyValues: Array<[value: any, realKey: any, stringKey: string]> = []
    switch (_exe_.internal_utils.gestType(target)) {
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
   * @method export
   *  EN: Exports properties of this instance or this instance to a plain object or to a provided object.
   *  ES: Exporta propiedades de esta instancia o esta instancia a un objeto plano o a un objeto aportado.
   * @param thisArg EN: Instance from which properties will be exported. ES: Instancia de la cual se exportarán propiedades.
   * @param property EN: Name of the property to export. ES: Nombre de la propiedad a exportar.
   * @param targetFill EN: Target object for the export. ES: Objeto de destino de la exportación.
   * @returns EN: Plain object or simple data. ES: Objeto plano o dato simple.
   */
  static export(thisArg: any, property: string = '', targetFill?: object | any[] | Map<any, any> | Set<any>): any {
    // PPPS necesita desarrollar mejora de exportación adminiendo rutas desarrollar con route()
    let origen = (property == '') ? thisArg : _exe_.internal_utils.getByStr(thisArg, property)
    let target: any = origen
    let descriptor: PropertyDescriptor
    switch (_exe_.internal_utils.gestType(origen)) {
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
   * @method react
   *  EN: Method that creates a reaction.
   *  ES: Método que creará una reacción.
   * @param path EN: Path of the property to react to. ES: Ruta de la propiedad a reaccionar.
   * @param action EN: Action to execute. ES: Acción a ejecutar.
   * @param component EN: Component to execute. ES: Componente a ejecutar.
   * @returns {Reaction} EN: Returns the executed reaction. ES: Devuelve la reacción ejecutada.
   */
  static react(thisArg: any, path: string | datChangeObj, action: ActionChange, component?: Object): Reaction {

    let manager = _exe_.internal_utils.get_exe_(thisArg)

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
   * @method declineReaction
   *  EN: Method that cancels a reaction created with reaction.
   *  ES: Método que cancelará una reacción creada con reaction.
   * @param idReaction EN: Reaction identifier. ES: Identificador de la reacción.
   */
  static declineReact(thisArg: any, idReaction: number | Reaction): Reaction {
    let manager = _exe_.internal_utils.get_exe_(thisArg)
    return manager.rootManagement.declineReact(idReaction)
  }

  /**
   * *************************************************************************** 
   * @method path
   *  EN: Method that returns the path of the instance.
   *  ES: Método que devolverá la ruta de la instancia.
   * @returns {string} EN: Returns the path of the instance. ES: Devuelve la ruta de la instancia. 
   */
  static path(thisArg: any): string {
    let manager = _exe_.internal_utils.get_exe_(thisArg)
    return manager.path
  }

}

export interface ManagementHierarchicalData extends ManagementHierarchicalDataObj, ProtoManagementHierarchicalDataObj { }
/**
 * @class ManagementHierarchicalDataObj
 *  EN: Management data for a Data_exe_ type structure element.
 *      Its interface is ManagementHierarchicalData.
 *  ES: Datos de gestión para un elemento de estructura tipo Data_exe_.
 *      Su interfaz sería ManagementHierarchicalData.
 * @see ManagementHierarchicalData
 */
export class ManagementHierarchicalDataObj {
  /**
   * EN: Creates an instance and applies parameter initialization if provided.
   * ES: Crea una instancia y aplica inicialización de parámetros si se proveen.
   * @param path EN: Structure path. ES: Ruta de la estructura.
   * @param structObj EN: Structure object. ES: Objeto de la estructura.
   * @param proxyObj EN: Proxy object of the structure. ES: Objeto proxy de la estructura.
   * @param mutating EN: Indicates whether the destination will be mutated or not. ES: Indica si se mutará el destino o no.
   * @param observing EN: Indicates whether the destination will be observed or not. ES: Indica si se observará el destino o no.
   * @param rootManagement EN: Root management object. ES: Objeto de gestión raíz.
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
 *  EN: Class for nodes of the hierarchical data structure with deep change events.
 *  ES: Clase para los nodos de la estructura de datos jerárquica con eventos de cambio profundo.
 */
class ProtoManagementHierarchicalDataObj {
  /**
   * EN: Creates a base hierarchical management instance for the prototype of this.
   * ES: Crea una instancia base de gestión jerárquica para el prototipo de esta.
   */
  constructor() { }

  /**
   * *************************************************************************** 
   * @method setIf_ 
   *  EN: Method that will define and/or conditionally create a property of this instance
   *      if it is not defined, is defined as Undefined, or has the value indicated in the oval parameter.
   *  ES: Método que definirá y/o creará condicionalmente una propiedad de esta instancia
   *      si no está definida, está definida a Undefined o tiene el valor indicado en el parámetro oval.
   * @param property EN: Property name. ES: Nombre de la propiedad.
   * @param value EN: Object or value to assign. ES: Objeto o valor a asignar.
   * @param oval EN: Property value assumed as Undefined. ES: Valor de la propiedad que asumirá como Undefined.
   * @param muting EN: Indicates whether the destination will be mutated or not. ES: Indica si se mutará el destino o no.
   * @returns {Data_exe_} EN: setIf_ returns the container object of the instance; setIf returns the assigned property value. ES: setIf_ devuelve el objeto contenedor de la instancia; setIf devuelve el valor de la propiedad asignada. 
   * @see _exe_.set EN: This method uses the set method if the property needs to be defined. ES: Este método utiliza el método set en caso de definir la propiedad.
   */
  public setIf_<T>(property: string, value: T, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    return _exe_.setIfn_((this as unknown as ManagementHierarchicalData).proxyObj, property || '', value, oval, muting)
  }
  /**
     * *************************************************************************** 
     * @method setIf 
     *  EN: Method that will define and/or conditionally create a property of this instance
     *      if it is not defined, is defined as Undefined, or has the value indicated in the oval parameter.
     *  ES: Método que definirá y/o creará condicionalmente una propiedad de esta instancia
     *      si no está definida, está definida a Undefined o tiene el valor indicado en el parámetro oval.
     * @param property EN: Property name. ES: Nombre de la propiedad.
     * @param value EN: Object or value to assign. ES: Objeto o valor a asignar.
     * @param oval EN: Property value assumed as Undefined. ES: Valor de la propiedad que asumirá como Undefined.
     * @param muting EN: Indicates whether the destination will be mutated or not. ES: Indica si se mutará el destino o no.
     * @returns {TypeStruct_exe_<T>} EN: Returns the assigned property value. ES: Devuelve la propiedad asignada. 
     * @see _exe_.set EN: This method uses the set method if the property needs to be defined. ES: Este método utiliza el método set en caso de definir la propiedad.
     */
  public setIf<T>(property: string, value: T, oval: any = undefined, muting?: boolean): TypeStruct_exe_<T> {
    return (_exe_.setIfn_((this as unknown as ManagementHierarchicalData).proxyObj, property || '', value, oval, muting) as TypeStruct_exe_<any>)._exe_.getByStr(property)
  }

  /** 
   * ***************************************************************************
   * @method set_ 
   *  EN: Method that defines and/or creates a property parsing data according to parameter and proxying the structure.
   *  ES: Método que definirá y/o creará una propiedad parseando los datos según parámetro y proxeando la estructura.
   * @param property EN: Property name. ES: Nombre de la propiedad.
   * @param value EN: Object or value to assign. ES: Objeto o valor a asignar.
   * @param muting EN: Indicates whether property objects should be transformed into a DataObj structure recursively. ES: Indica si debe de transformar los Objetos de las propiedades en una estructura de DatosObj recursivamente.
   * @returns {Data_exe_} EN: Returns the container object of the instance. ES: Devuelve el objeto contenedor de la instancia. 
   */
  public set_<T>(property: string, value: any, muting?: boolean): TypeStruct_exe_<T> {
    return _exe_.set((this as unknown as ManagementHierarchicalData).proxyObj, property, value, muting)
  }
  /**
   * @method set 
   *  EN: Defines or creates a property and returns the assigned value.
   *  ES: Define o crea una propiedad y devuelve el valor asignado.
   * @param property EN: Property name. ES: Nombre de la propiedad.
   * @param value EN: Object or value to assign. ES: Objeto o valor a asignar.
   * @param muting EN: Indicates whether objects should be transformed into a hierarchical structure. ES: Indica si debe transformar objetos en estructura jerárquica.
   * @returns {TypeStruct_exe_<T>} EN: Assigned property value. ES: Valor de la propiedad asignada.
   */
  public set<T>(property: string, value: any, muting?: boolean): TypeStruct_exe_<T> {
    return (_exe_.set((this as unknown as ManagementHierarchicalData).proxyObj, property, value, muting) as TypeStruct_exe_<any>)._exe_.getByStr(property)
  }

  /**
   * ***************************************************************************
   * @method getByStr 
   *  EN: Returns the value of the indicated property.
   *  ES: Devuelve el valor de la propiedad indicada.
   * @param property EN: Property name. ES: Nombre de la propiedad.
   * @param callBackfnOk EN: Function to execute if the value is found. ES: Función a ejecutar si se encuentra el valor.
   * @param callbackfnKo EN: Function to execute if the value is not found. ES: Función a ejecutar si no se encuentra el valor.
   * @returns {any} EN: Value of the indicated property or undefined. ES: Valor de la propiedad indicada o undefined.
   */
  public getByStr(property: string, callBackfnOk?: (value: any) => void, callbackfnKo?: (err: string) => void): any {
    return _exe_.internal_utils.getByStr((this as unknown as ManagementHierarchicalData).proxyObj, property, callBackfnOk, callbackfnKo)
  }

  /**	
   * ***************************************************************************
   * @method export 
   *  EN: Allows exporting properties of this DatosObj instance or property to a plain object or to a provided object.
   *  ES: Permite exportar propiedades de esta instancia de DatosObj o propiedad a un objeto plano o a un objeto aportado.
   * @param property EN: Name of the property to export. ES: Nombre de la propiedad a exportar.
   * @param targetFill EN: Target object for the export. ES: Objeto de destino de la exportación.
   * @returns {any} EN: Plain filled object or simple data. ES: Objeto plano rellenado o dato simple.
   */
  public export(property: string = '', targetFill?: object | any[] | Map<any, any> | Set<any>): any {
    return _exe_.export((this as unknown as ManagementHierarchicalData).proxyObj, property, targetFill)
  }

  public route(path: string = '', callBackfnOk?: (value: any, property: string, struct: any) => void, callbackfnKo?: (err: string) => void): any {
    return _exe_.route((this as unknown as ManagementHierarchicalData).proxyObj, path, callBackfnOk, callbackfnKo)
  }

  /**
   * ***************************************************************************
   * @method react 
   *  EN: Allows subscribing to change events of the properties of this DatosObj instance or its children.
   *  ES: Permite suscribirse a los eventos de cambio de las propiedades de esta instancia de DatosObj o sus hijos.
   * @param dat EN: Path of the property to subscribe to, or object with subscription options. ES: Ruta de la propiedad a la que nos suscribimos u objeto con las opciones de la suscripción.
   * @param accion EN: Method to execute when a change occurs in the property. ES: Método a ejecutar cuando se produce un cambio en la propiedad.
   * @param thisArg EN: Object to which the this context will be assigned when the action is executed. ES: Objeto al que se asignará el contexto this cuando se ejecute la acción.
   * @returns {Reaction} EN: Subscription to unsubscribe from the event and check status. ES: Subscripción para desuscribirse del evento y ver estado.
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

// EN: this function creates a reactions index instantiated with all the necessary structure
// ES: esta función crea un índice de reacciones instanciado con toda la estructura necesaria
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
 * @description EN: Interface of the management of reactions. ES: Interfaz de la gestión de reacciones.
 */
export class ManagementReactionsObj {
  /**
   * EN: Creates a reactions manager associated with a root node.
   * ES: Crea un gestor de reacciones asociado a un nodo raíz.
   * @param rootDatos EN: Root node of the hierarchical structure. ES: Nodo raíz de la estructura jerárquica.
   */
  constructor(rootDatos: TypeStruct_exe_<any>) {
    this.root = rootDatos
  }

  /** @property EN: Counter of reactions. ES: Contador de reacciones. */
  private contReactions = 0
  /** @property EN: Hierarchical index of reactions. ES: Índice jerárquico de reacciones. */
  private index: IndexReactions<number[]> = createIndexReactions<number[]>()
  /** @property EN: Buffer of reactions. ES: Buffer de reacciones. */
  private bufferReactions: bufferReactions = new bufferReactions()
  /** @property EN: Counter of SubBuffers. ES: Contador de SubBuffers. */
  private contSubBufferReactions = 0
  /** @property EN: Stack of BufferReactions. ES: Pila de BufferReactions. */
  private subBufferReactions: Array<{ id: number, bufferReactions: bufferReactions }> = []

  /** @property EN: List of reactions. ES: Lista de reacciones. */
  private reactions: Record<number, Reaction> = {}
  /** @property EN: Root of the hierarchical data. ES: Raíz de los datos jerárquicos. */
  public root!: TypeStruct_exe_<any>

  /** @property EN: List of objects that do not mutate. ES: Lista de objetos que no mutan. */
  public UserNoMutationObjs = []
  /** @property EN: General mutation flag. ES: Bandera de mutación general. */
  public modeMutation = true
  /** @property EN: Flag of observing gets. ES: Bandera de observación de gets. */
  public observingGets = false
  /** @property EN: Flag for using Buffer of reactions. ES: Bandera para usar Buffer de reacciones. */
  private buffer: boolean = false

  /** 
   * @method getBuffer 
   *  EN: Gets the state of the reactions buffer.
   *  ES: Obtiene el estado del buffer de reacciones.
   * @returns EN: True if the buffer is active, false otherwise. ES: Verdadero si el buffer está activo, falso en caso contrario.
   */
  public getBuffer() { return this.buffer }

  /** 
   * @method setBuffer 
   *  EN: Sets the state of the reactions buffer.
   *  ES: Establece el estado del buffer de reacciones.
   * @param valor EN: True to activate the buffer, false to deactivate. ES: Verdadero para activar el buffer, falso para desactivarlo.
   */
  public setBuffer(valor: boolean) {
    if (!this.buffer && valor) {
      this.buffer = valor
      this._exe_Buffer()
    }
  }

  /** 
   * @method pushSubBuffer 
   *  EN: Adds the buffer to the SubBuffer as the last position of a stack.
   *  ES: Añade el buffer al SubBuffer como última posición de una pila.
   */
  public pushSubBuffer(): number {
    this.contSubBufferReactions++
    this.subBufferReactions.push({ id: this.contSubBufferReactions, bufferReactions: this.bufferReactions })
    this.bufferReactions = new bufferReactions()
    return this.contSubBufferReactions
  }

  /** 
   * @method popSubBuffer 
   *  EN: Extracts the last reactions buffer from the stack.
   *  ES: Extrae el último buffer de reacciones de la pila.
   * @param id EN: Optional identifier of the buffer to extract. If not provided, the last added buffer is extracted. ES: Identificador opcional del buffer a extraer. Si no se proporciona, se extrae el último buffer añadido.
   * @returns EN: True if the buffer was successfully extracted, false if the buffer was not found. ES: Verdadero si se extrajo el buffer con éxito, falso si no se encontró el buffer.
   */
  public popSubBuffer(id?: number): boolean {
    let subBuffer = (id !== undefined) ? this.subBufferReactions.find((subBuffer) => subBuffer.id == id) : this.subBufferReactions.pop()
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

  /** @method clearBuffer 
   * @description EN: Clears the reactions buffer. ES: Limpia el buffer de reacciones.
   * @description EN: Removes all reactions stored in the buffer. ES: Elimina todas las reacciones almacenadas en el buffer.
   */
  public clearBuffer() {
    this.bufferReactions = new bufferReactions()
  }

  /** @method clearSubBuffer 
   * @description EN: Clears the reactions buffer. ES: Limpia el buffer de reacciones.
   * @description EN: Removes all reactions stored in the specified SubBuffer. ES: Elimina todas las reacciones almacenadas en el SubBuffer especificado.
   * @param id EN: Optional identifier of the SubBuffer to clear. If not provided, all SubBuffers are cleared. ES: Identificador opcional del SubBuffer a limpiar. Si no se proporciona, se limpian todos los SubBuffers.
   * @returns EN: True if the SubBuffer was successfully cleared, false if the SubBuffer was not found. ES: Verdadero si se limpió el SubBuffer con éxito, falso si no se encontró el SubBuffer.
   */
  public clearSubBuffer(id?: number): boolean {
    let returnValue: boolean = false
    if (id === undefined) this.subBufferReactions = []
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
   * @method getContReactions 
   *  EN: Gets the internal reactions counter.
   *  ES: Obtiene el contador interno de reacciones.
   * @returns EN: Total number of registered reactions. ES: Número total de reacciones registradas.
   */
  public getContReactions() {
    return this.contReactions
  }

  /**
   * @method popReactions 
   *  EN: Extracts reactions associated with a property or all if not indicated.
   *  ES: Extrae reacciones asociadas a una propiedad o todas si no se indica.
   * @param propiedad EN: Property from which reactions are extracted. ES: Propiedad de la que se extraen las reacciones.
   * @returns EN: List of extracted reactions. ES: Lista de reacciones extraídas.
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
   * @method pushReactions 
   *  EN: Inserts reactions into the manager adjusting their paths.
   *  ES: Inserta reacciones en el gestor ajustando sus rutas.
   * @param reactions EN: List of reactions. ES: Lista de reacciones.
   * @param ruta EN: Base path where they are inserted. ES: Ruta base donde se insertan.
   * @returns EN: List of inserted reactions. ES: Lista de reacciones insertadas.
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
   * @method declineReact 
   *  EN: Pauses an active reaction and moves it to the pause state.
   *  ES: Pausa una reacción activa y la mueve al estado pause.
   * @param id EN: Reaction id or the reaction itself. ES: Id de la reacción o la reacción misma.
   * @returns EN: Paused reaction. ES: Reacción pausada.
   */
  declineReact(id: number | Reaction): Reaction {
    if (typeof id != 'number') id = id.manage.id
    let reaction = this.reactions[id]
    if (!reaction) throw new Error(`Reaction with id ${id} not found`)
    if (reaction.manage.status != stateAmbitReaction.pause) {
      reaction.manage.status = stateAmbitReaction.pause
      this.index[reaction.change.hito][stateAmbitReaction.pause][reaction.change.ruta].push(id)
      this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta] = this.index[reaction.change.hito][reaction.change.ambito][reaction.change.ruta].filter((idActiva) => idActiva != id)
    }
    return reaction
  }

  /**
   * @method react 
   *  EN: Registers or reactivates a reaction for a specific change.
   *  ES: Registra o reactiva una reacción para un cambio específico.
   * @param cambio EN: Change object. ES: Objeto de cambio.
   * @param accion EN: Action to execute. ES: Acción a ejecutar.
   * @param thisArg EN: Execution context. ES: Contexto de ejecución.
   * @param noDie EN: Reserved for future persistence behaviors. ES: Reservado para futuros comportamientos de persistencia.
   * @returns EN: Registered or reactivated reaction. ES: Reacción registrada o reactivada.
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
   * @method _exe_React
   *  EN: Executes the registered reactions for a change.
   *  ES: Ejecuta las reacciones registradas para un cambio.
   * @param cambio EN: Change object. ES: Objeto de cambio.
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
    if (dataChange.hito != typeChange.change && _exe_.internal_utils.stringify(dataChange.datoActual) != _exe_.internal_utils.stringify(dataChange.datoNuevo)) {
      dataChange.hito = typeChange.change
      this._exe_React(dataChange)
    }

  }

}    
