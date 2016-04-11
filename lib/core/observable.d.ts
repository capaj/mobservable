import { IDerivation } from "./derivation";
export interface IDepTreeNode {
    id: number;
    name: string;
    observers?: IDerivation[];
    observing?: IObservable[];
}
export interface IObservable extends IDepTreeNode {
    staleObservers: IDerivation[];
    observers: IDerivation[];
    onBecomeObserved(): any;
    onBecomeUnobserved(): any;
}
export declare function addObserver(observable: IObservable, node: IDerivation): void;
export declare function removeObserver(observable: IObservable, node: IDerivation): void;
export declare function reportObserved(observable: IObservable): void;
export declare function propagateStaleness(observable: IObservable | IDerivation): void;
export declare function propagateReadiness(observable: IObservable | IDerivation, valueDidActuallyChange: boolean): void;
/**
 * TODO: just delete this, and introduce peek() on observables (and computed) instead? This is unelegant and unecessarily weird.
 */
export declare function untracked<T>(action: () => T): T;
