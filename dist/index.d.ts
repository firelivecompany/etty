interface TeastProps<T> {
    /**
     * A minimal delay before request will be considered as successful.
     * Defaults to `0`.
     */
    delay?: number;
    /** A list of available locales */
    locales: Array<string>;
    /** A locale with which the store will be initialized */
    initialLocale: string;
    /**
     * A function, that should request a translation.
     * @param locale locale for which the translations should be requested
     * @returns a Promise with the translation resolved or error catched
     */
    fetch: (locale: string) => Promise<T>;
    /**
     * A function that will be called once the `fetch()` will throw.
     * Does not being called during initialization.
     * For initialization fail use `init().catch()`.
     */
    onFetchError?: (error?: any) => void;
}
/** A class that represents a Teast store */
export default class Teast<T> {
    /**
     * @private
     * __observable__
     * Translations are being stored here
     */
    traslations: [string, T][];
    /**
     * __observable__
     * Flag that shows if the store is ready.
     * Becomes `true` after successful initialization
     */
    ready: boolean;
    /**
     * __observable__
     * Current acitve locale.
     * Can reffer to both loaded and loading translations
     */
    locale: string;
    /**
     * __observable__
     * Previously loaded locale.
     * Only exists if some new locale is now loading.
     */
    prevLocale: string;
    /**
     * @private
     * A function to fetch the translation.
     * Fetches a translation that is stored in `locale` property.
     * Only available after `init()`
     * @returns A promise with the translation data
     */
    fetch: () => Promise<T>;
    /**
     * A list of available locales.
     * Useful for rendering locale switch or something.
     */
    locales: Array<string>;
    /**
     * Initializes the Teast store instance.
     * @param props a bunch of Teast props
     * @returns a Promise that resolves when the Teast store is ready to go.
     */
    init: (props: TeastProps<T>) => Promise<T>;
    /**
     * @private
     * Check if translation for the specified locale is already loaded or not
     * @param locale locale to check
     * @returns `true` if the translation for this locale exist in store, otherwise `false`
     */
    isLoaded: (locale: string) => boolean;
    /**
     * @private
     * Get translation from the store for the specified locale.
     * Throws an Error if there is no such translation loaded.
     * This prevents you from forgot the Teast store initialization.
     */
    getTranslation: (locale: string) => T;
    /**
     * __action__
     * Loads the translation for the specified locale.
     * @param locale a locale for which the translation should be loaded
     * @returns `false` if the translation is already exist. `true` if translation needs to be loaded.
     * When `true` is returned, then current locale is being moved to `prevLocale`.
     * This triggers the `isTranslating` to be changed from `false` to `true`
     */
    loadTranslation: (locale: string) => boolean;
    /**
     * @private
     * __action__
     * Weak setting of the loaded translation to the store.
     * @param locale a locale for which a translation data should be set
     * @param data a translation data to set
     */
    setTranslation: (locale: string, data: T) => void;
    /**
     * __computed__
     * Displays if there is loading of the translation is being performed.
     */
    readonly isTranslating: boolean;
    /**
     * __computed__
     * Returns the _safe_ locale.
     * It means that you should use this for any third-party locale-dependable parts of your application.
     * This is always reffers to exactly loaded locale.
     */
    readonly loadedLocale: string;
    /**
     * __computed__
     * A translation for the loaded locale.
     */
    readonly $: T;
}
export {};
