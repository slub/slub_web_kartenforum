/**
 * Created by nicolas.looschen@pikobytes.de on 11/11/2021
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package
 */
import { useEffect, useState } from "react";

/**
 * Allow access to local storage
 * found here: https://usehooks-typescript.com/react-hook/use-local-storage
 * @param key
 * @param initialValue
 */
export function useLocalStorage(key, initialValue) {
    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = () => {
        // Prevent build error "window is undefined" but keep keep working
        if (typeof window === "undefined") {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    };

    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(readValue);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        // Prevent build error "window is undefined" but keeps working
        if (typeof window == "undefined") {
            console.warn(
                `Tried setting localStorage key “${key}” even though environment is not a client`
            );
        }

        try {
            // Allow value to be a function so we have the same API as useState
            const newValue =
                value instanceof Function ? value(storedValue) : value;

            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(newValue));

            // Save state
            setStoredValue(newValue);

            // We dispatch a custom event so every useLocalStorage hook are notified
            window.dispatchEvent(new Event("local-storage"));
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    };

    useEffect(() => {
        setStoredValue(readValue());
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setStoredValue(readValue());
        };

        // this only works for other documents, not the current one
        window.addEventListener("storage", handleStorageChange);

        // this is a custom event, triggered in writeValueToLocalStorage
        window.addEventListener("local-storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("local-storage", handleStorageChange);
        };
    }, []);

    return [storedValue, setValue];
}

/**
 * Allows the invocation of an event handler before the window unloads
 * found here: https://stackoverflow.com/questions/66713004/react-execute-function-on-website-exit-without-giving-an-alert-warning
 *
 * @param handler - eventHandler called before unload of the window
 */
export const useOnPageLeave = (handler) => {
    useEffect(() => {
        const terminationEvent =
            "onpagehide" in window.self ? "pagehide" : "unload";
        window.addEventListener(terminationEvent, handler, { capture: true });

        return () => {
            window.removeEventListener(terminationEvent, handler, {
                capture: true,
            });
        };
    }, [handler]);
};
