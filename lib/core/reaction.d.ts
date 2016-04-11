import { IObservable } from "./observable";
import { IDerivation } from "./derivation";
import { Lambda } from "../utils/utils";
/**
 * Reactions are a special kind of derivations. Several things distinguishes them from normal reactive computations
 *
 * 1) They will always run, whether they are used by other computations or not.
 * This means that they are very suitable for triggering side effects like logging, updating the DOM and making network requests.
 * 2) They are not observable themselves
 * 3) They will always run after any 'normal' derivations
 * 4) They are allowed to change the state and thereby triggering themselvs again, as long as they make sure the state propagates to a stable state in a reasonable amount of iterations.
 *
 * The state machine of a Reaction is as follows:
 *
 * 1) after creating, the reaction should be started by calling `runReaction` or by scheduling it (see also `autorun`)
 * 2) the `onInvalidate` handler should somehow result in a call to `this.track(someFunction)`
 * 3) all observables accessed in `someFunction` will be observed by this reaction.
 * 4) as soon as some of the dependencies has changed the Reaction will be rescheduled for another run (after the current mutation or transaction). `isScheduled` will yield true once a dependency is stale and during this period
 * 5) `onInvalidate` will be called, and we are back at step 1.
 *
 */
export declare class Reaction implements IDerivation {
    name: string;
    private onInvalidate;
    id: number;
    staleObservers: IDerivation[];
    observers: IDerivation[];
    observing: IObservable[];
    dependencyChangeCount: number;
    dependencyStaleCount: number;
    isDisposed: boolean;
    _isScheduled: boolean;
    constructor(name: string, onInvalidate: () => void);
    onBecomeObserved(): void;
    onBecomeUnobserved(): void;
    onDependenciesReady(): boolean;
    schedule(): void;
    isScheduled(): boolean;
    /**
     * internal, use schedule() if you intend to kick off a reaction
     */
    runReaction(): void;
    track(fn: () => void): void;
    dispose(): void;
    getDisposer(): Lambda & {
        $mosbservable: Reaction;
    };
    toString(): string;
}
export declare function runReactions(): void;
