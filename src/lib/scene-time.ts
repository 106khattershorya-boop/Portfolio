/**
 * Shared scene time.
 *
 * THREE.Clock.getElapsedTime() secretly calls getDelta(), which
 * resets the clock — every independent caller steals time from the
 * render loop and slows everyone else down (the camera rig's
 * delta-based damping ran ~10x too slow because of this).
 *
 * SceneClock (mounted first inside CityScene) reads the clock once
 * per frame; every other consumer reads the shared value.
 */
export const sceneTime = { t: 0 };
