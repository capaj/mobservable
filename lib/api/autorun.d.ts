import { Lambda } from "../utils/utils";
import { Reaction } from "../core/reaction";
/**
 * Creates a reactive view and keeps it alive, so that the view is always
 * updated if one of the dependencies changes, even when the view is not further used by something else.
 * @param view The reactive view
 * @param scope (optional)
 * @returns disposer function, which can be used to stop the view from being updated in the future.
 */
export declare function autorun(view: Lambda, scope?: any): Lambda & {
    $mosbservable: Reaction;
};
/**
 * Similar to 'observer', observes the given predicate until it returns true.
 * Once it returns true, the 'effect' function is invoked an the observation is cancelled.
 * @param predicate
 * @param effect
 * @param scope (optional)
 * @returns disposer function to prematurely end the observer.
 */
export declare function when(predicate: () => boolean, effect: Lambda, scope?: any): Lambda & {
    $mosbservable: Reaction;
};
export declare function autorunUntil(predicate: () => boolean, effect: Lambda, scope?: any): any;
export declare function autorunAsync(func: Lambda, delay?: number, scope?: any): Lambda & {
    $mosbservable: Reaction;
};
