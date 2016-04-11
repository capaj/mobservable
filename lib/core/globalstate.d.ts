import { IAtom } from "./atom";
import { IDerivation } from "./derivation";
import { Reaction } from "./reaction";
export declare class MobXGlobals {
    /**
     * MobXGlobals version.
     * MobX compatiblity with other versions loaded in memory as long as this version matches.
     * It indicates that the global state still stores similar information
     */
    version: number;
    /**
     * Stack of currently running derivations
     */
    derivationStack: IDerivation[];
    /**
     * 'guid' for general purpose. Mostly debugging.
     */
    mobxGuid: number;
    /**
     * Are we in a transaction block? (and how many of them)
     */
    inTransaction: number;
    /**
     * Are we in an untracked block? (and how many of them)
     */
    inUntracked: number;
    /**
     * Are we currently running reactions?
     * Reactions are run after derivations using a trampoline.
     */
    isRunningReactions: boolean;
    /**
     * List of observables that have changed in a transaction.
     * After completing the transaction(s) these atoms will notify their observers.
     */
    changedAtoms: IAtom[];
    /**
     * List of scheduled, not yet executed, reactions.
     */
    pendingReactions: Reaction[];
    /**
     * Is it allowed to change observables at this point?
     * In general, MobX doesn't allow that when running computations and React.render.
     * To ensure that those functions stay pure.
     */
    allowStateChanges: boolean;
    /**
     * Used by createTransformer to detect that the global state has been reset.
     */
    resetId: number;
}
export declare const globalState: any;
export declare function getNextId(): number;
export declare function registerGlobals(): void;
/**
 * For testing purposes only; this will break the internal state of existing observables,
 * but can be used to get back at a stable state after throwing errors
 */
export declare function resetGlobalState(): void;
