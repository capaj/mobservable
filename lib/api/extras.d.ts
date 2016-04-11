import { IDepTreeNode } from "../core/observable";
import { Lambda } from "../utils/utils";
export interface IDependencyTree {
    id: number;
    name: string;
    dependencies?: IDependencyTree[];
}
export interface IObserverTree {
    id: number;
    name: string;
    observers?: IObserverTree[];
}
export interface ITransitionEvent {
    id: number;
    name: string;
    state: string;
    changed: boolean;
    node: IDepTreeNode;
}
/**
    * If strict is enabled, views are not allowed to modify the state.
    * This is a recommended practice, as it makes reasoning about your application simpler.
    */
export declare function allowStateChanges<T>(allowStateChanges: boolean, func: () => T): T;
export declare function reportTransition(node: IDepTreeNode, state: string, changed?: boolean): void;
export declare function getDependencyTree(thing: any): IDependencyTree;
export declare function getObserverTree(thing: any): IObserverTree;
export declare function trackTransitions(extensive?: boolean, onReport?: (lines: ITransitionEvent) => void): Lambda;
