import { useSyncExternalStore } from 'react';

export interface A11yPrefs {
    /** Root font size in percent: 90 | 100 | 115 | 130 */
    size: number;
    contrast: boolean;
    grayscale: boolean;
    links: boolean;
    spacing: boolean;
    motion: boolean;
}

export const SIZES = [90, 100, 115, 130] as const;

const KEY = 'a11y-prefs';
const defaults: A11yPrefs = { size: 100, contrast: false, grayscale: false, links: false, spacing: false, motion: false };

let state: A11yPrefs = load();
const listeners = new Set<() => void>();

function load(): A11yPrefs {
    try {
        return { ...defaults, ...JSON.parse(window.localStorage.getItem(KEY) ?? '{}') };
    } catch {
        return defaults;
    }
}

/** Writes the preferences onto <html>; styles for the classes live in app.css. */
function apply(p: A11yPrefs): void {
    const root = document.documentElement;
    const filters = [p.contrast && 'contrast(1.35)', p.grayscale && 'grayscale(1)'].filter(Boolean).join(' ');

    root.style.fontSize = p.size === 100 ? '' : `${p.size}%`;
    root.style.setProperty('--a11y-filter', filters || 'none');
    root.classList.toggle('a11y-contrast', p.contrast);
    root.classList.toggle('a11y-links', p.links);
    root.classList.toggle('a11y-spacing', p.spacing);
    root.classList.toggle('a11y-no-motion', p.motion);
}

export function initializeAccessibility(): void {
    apply(state);
}

export function setA11y(change: Partial<A11yPrefs>): void {
    state = { ...state, ...change };
    window.localStorage.setItem(KEY, JSON.stringify(state));
    apply(state);
    listeners.forEach((l) => l());
}

export function resetA11y(): void {
    setA11y(defaults);
}

export const isA11yDefault = (p: A11yPrefs) => (Object.keys(defaults) as (keyof A11yPrefs)[]).every((k) => p[k] === defaults[k]);

export function useA11y(): A11yPrefs {
    return useSyncExternalStore(
        (cb) => {
            listeners.add(cb);

            return () => listeners.delete(cb);
        },
        () => state,
    );
}
