import { Atom } from "../core/atom";
import { ValueMode } from "./modifiers";
import { Lambda } from "../utils/utils";
export declare class ObservableValue<T> extends Atom {
    protected mode: ValueMode;
    hasUnreportedChange: boolean;
    private events;
    protected value: T;
    constructor(value: T, mode: ValueMode, name?: string);
    set(newValue: T): boolean;
    get(): T;
    observe(listener: (newValue: T, oldValue: T) => void, fireImmediately?: boolean): Lambda;
    toString(): string;
}
