import { ObservableValue } from "./observablevalue";
import { ComputedValue } from "../core/computedvalue";
import { ValueMode } from "./modifiers";
import { Lambda } from "../utils/utils";
import { SimpleEventEmitter } from "../utils/simpleeventemitter";
export interface IObjectChange<T, R> {
    name: string;
    object: R;
    type: string;
    oldValue?: T;
}
export interface IObservableObjectAdministration {
    type: Object;
    target: any;
    name: string;
    id: number;
    mode: ValueMode;
    values: {
        [key: string]: ObservableValue<any> | ComputedValue<any>;
    };
    events: SimpleEventEmitter;
}
export interface IIsObservableObject {
    $mobx: IObservableObjectAdministration;
}
export declare function asObservableObject(target: any, name?: string, mode?: ValueMode): IObservableObjectAdministration;
export declare function setObservableObjectProperty(adm: IObservableObjectAdministration, propName: string, value: any): void;
/**
    * Observes this object. Triggers for the events 'add', 'update', 'preupdate' and 'delete'.
    * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
    * for callback details
    */
export declare function observeObservableObject(object: IIsObservableObject, callback: (changes: IObjectChange<any, any>) => void, fireImmediately?: boolean): Lambda;
export declare function isObservableObject(thing: any): boolean;
