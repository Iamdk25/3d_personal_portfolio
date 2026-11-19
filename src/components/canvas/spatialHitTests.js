// Each foreground canvas can give priority to its visible geometry during a background grab.
export const spatialHitTests = new WeakMap();
export const claimedBackgroundGestures = new WeakSet();
