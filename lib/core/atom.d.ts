import { IObservable } from "./observable";
export interface IAtom extends IObservable {
    isDirty: boolean;
}
/**
 * Used by the transaction manager to signal observers that an atom is ready as soon as the transaction has ended.
 */
export declare function propagateAtomReady(atom: IAtom): void;
/**
 * Anything that can be used to _store_ state is an Atom in mobx. Atom's have two important jobs
 *
 * 1) detect when they are being _used_ and report this (using reportObserved). This allows mobx to make the connection between running functions and the data they used
 * 2) they should notify mobx whenever they have _changed_. This way mobx can re-run any functions (derivations) that are using this atom.
 */
export declare class Atom implements IAtom {
    name: string;
    onBecomeObserved: () => void;
    onBecomeUnobserved: () => void;
    id: number;
    isDirty: boolean;
    staleObservers: any[];
    observers: any[];
    /**
     * Create a new atom. For debugging purposes it is recommended to give it a name.
     * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
     */
    constructor(name?: string, onBecomeObserved?: () => void, onBecomeUnobserved?: () => void);
    /**
     * Invoke this method to notify mobx that your atom has been used somehow.
     */
    reportObserved(): void;
    /**
     * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
     */
    reportChanged(): void;
    private reportStale();
    private reportReady();
    toString(): string;
}
