import { IObservable } from "./observable";
import { IDerivation } from "./derivation";
import { Lambda } from "../utils/utils";
/**
 * A node in the state dependency root that observes other nodes, and can be observed itself.
 *
 * Computed values will update automatically if any observed value changes and if they are observed themselves.
 * If a computed value isn't actively used by another observer, but is inspect, it will compute lazily to return at least a consistent value.
 */
export declare class ComputedValue<T> implements IObservable, IDerivation {
    derivation: () => T;
    private scope;
    private compareStructural;
    name: string;
    id: number;
    isLazy: boolean;
    isComputing: boolean;
    staleObservers: IDerivation[];
    observers: IDerivation[];
    observing: IObservable[];
    dependencyChangeCount: number;
    dependencyStaleCount: number;
    protected value: T;
    /**
     * Peek into the current value of this computedObservable. Re-evaluate if needed but don't bind the current
     * exeuction context as an observer.
     */
    peek: () => T;
    /**
     * Create a new computed value based on a function expression.
     *
     * The `name` property is for debug purposes only.
     *
     * The `compareStructural` property indicates whether the return values should be compared structurally.
     * Normally, a computed value will not notify an upstream observer if a newly produced value is strictly equal to the previously produced value.
     * However, enabling compareStructural can be convienent if you always produce an new aggregated object and don't want to notify observers if it is structurally the same.
     * This is useful for working with vectors, mouse coordinates etc.
     */
    constructor(derivation: () => T, scope: Object, compareStructural: boolean, name?: string);
    onBecomeObserved(): void;
    onBecomeUnobserved(): void;
    onDependenciesReady(): boolean;
    /**
     * Returns the current value of this computed value.
     * Will evaluate it's computation first if needed.
     */
    get(): T;
    set(_: T): void;
    private trackAndCompute();
    observe(listener: (newValue: T, oldValue: T) => void, fireImmediately?: boolean): Lambda;
    toString(): string;
}
