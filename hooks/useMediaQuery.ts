import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
    // Return a default value for server-side rendering or non-browser environments
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
        return true;
    }

    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        
        // Browsers have updated the API, but some still use the old one.
        // `addEventListener` is preferred.
        try {
            mediaQueryList.addEventListener('change', listener);
        } catch (e) {
            mediaQueryList.addListener(listener); // Deprecated
        }
        
        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch (e) {
                mediaQueryList.removeListener(listener); // Deprecated
            }
        };
    }, [query]);

    return matches;
};
