import Lenis from 'lenis';

/** Inertial page scrolling for the whole app. Skipped when the user prefers reduced motion. */
export function initializeSmoothScroll(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const lenis = new Lenis({ lerp: 0.08, allowNestedScroll: true });

    const frame = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
}
