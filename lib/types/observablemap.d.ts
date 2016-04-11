import { IObjectChange } from "./observableobject";
import { Lambda } from "../utils/utils";
export interface IKeyValueMap<V> {
    [key: string]: V;
}
export declare type IMapEntries<V> = [string, V][];
export interface IObservableMapChange<T> extends IObjectChange<T, ObservableMap<T>> {
}
export declare class ObservableMap<V> {
    $mobx: {};
    private _data;
    private _hasMap;
    private _valueMode;
    private _events;
    name: string;
    id: number;
    private _keys;
    constructor(initialData?: IMapEntries<V> | IKeyValueMap<V>, valueModeFunc?: Function);
    private _has(key);
    has(key: string): boolean;
    set(key: string, value: V): void;
    delete(key: string): void;
    private _updateHasMapEntry(key, value);
    get(key: string): V;
    keys(): string[];
    values(): V[];
    entries(): IMapEntries<V>;
    forEach(callback: (value: V, key: string, object: IKeyValueMap<V>) => void, thisArg?: any): void;
    /** Merge another object into this object, returns this. */
    merge(other: ObservableMap<V> | IKeyValueMap<V>): ObservableMap<V>;
    clear(): void;
    size: number;
    /**
     * Returns a shallow non observable object clone of this map.
     * Note that the values migth still be observable. For a deep clone use mobx.toJSON.
     */
    toJs(): IKeyValueMap<V>;
    private isValidKey(key);
    private assertValidKey(key);
    toString(): string;
    /**
     * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
     * for callback details
     */
    observe(callback: (changes: IObservableMapChange<V>) => void): Lambda;
}
/**
 * Creates a map, similar to ES6 maps (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map),
 * yet observable.
 */
export declare function map<V>(initialValues?: IMapEntries<V> | IKeyValueMap<V>, valueModifier?: Function): ObservableMap<V>;
export declare function isObservableMap(thing: any): boolean;
