import { IObservable, IDepTreeNode } from "./observable";
/**
 * A derivation is everything that can be derived from the state (all the atoms) in a pure manner.
 * See https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
 */
export interface IDerivation extends IDepTreeNode, IObservable {
    observing: IObservable[];
    staleObservers: IDerivation[];
    observers: IDerivation[];
    dependencyStaleCount: number;
    dependencyChangeCount: number;
    onDependenciesReady(): boolean;
}
export declare function isComputingDerivation(): boolean;
export declare function checkIfStateModificationsAreAllowed(): void;
/**
 * Notify a derivation that one of the values it is observing has become stale
 */
export declare function notifyDependencyStale(derivation: IDerivation): void;
/**
 * Notify a derivation that one of the values it is observing has become stable again.
 * If all observed values are stable and at least one of them has changed, the derivation
 * will be scheduled for re-evaluation.
 */
export declare function notifyDependencyReady(derivation: IDerivation, dependencyDidChange: boolean): void;
/**
 * Executes the provided function `f` and tracks which observables are being accessed.
 * The tracking information is stored on the `derivation` object and the derivation is registered
 * as observer of any of the accessed observables.
 */
export declare function trackDerivedFunction<T>(derivation: IDerivation, f: () => T): T;
