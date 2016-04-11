import { Lambda } from "./utils";
export declare type ISimpleEventListener = {
    (...data: any[]): void;
};
export declare class SimpleEventEmitter {
    listeners: ISimpleEventListener[];
    emit(...data: any[]): any;
    on(listener: ISimpleEventListener): Lambda;
    once(listener: ISimpleEventListener): Lambda;
}
