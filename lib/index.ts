import { observable, action, computed, IObservableArray } from "mobx"

interface TeastProps<T> {
	/** 
	 * A minimal delay before request will be considered as successful.  
	 * Defaults to `0`.
	 */
	delay?: number,

	/** A list of available locales */
	locales: Array<string>,

	/** A locale with which the store will be initialized */
	initialLocale: string

	/**
	 * A function, that should request a translation.
	 * @param locale locale for which the translations should be requested
	 * @returns a Promise with the translation resolved or error catched
	 */
	fetch: (locale: string) => Promise<T>,

	/**
	 * A function that will be called once the `fetch()` will throw.  
	 * Does not being called during initialization.  
	 * For initialization fail use `init().catch()`.
	 */
	onFetchError?: (error?: any) => void,
}

/** A class that represents a Teast store */
export default class Teast<T> {
	/**  
	 * @private
	 * __observable__  
	 * Translations are being stored here  
	 */
	@observable 
	traslations: [string, T][] = []

	/**
	 * __observable__  
	 * Flag that shows if the store is ready.  
	 * Becomes `true` after successful initialization
	 */
	@observable ready: boolean = false

	/**
	 * __observable__  
	 * Current acitve locale.  
	 * Can reffer to both loaded and loading translations
	 */
	@observable locale: string

	/**
	 * __observable__  
	 * Previously loaded locale.  
	 * Only exists if some new locale is now loading.
	 */
	@observable prevLocale: string 

	/**
	 * @private 
	 * A function to fetch the translation.  
	 * Fetches a translation that is stored in `locale` property.  
	 * Only available after `init()`
	 * @returns A promise with the translation data
	 */
	fetch: () => Promise<T>

	/**
	 * A list of available locales.  
	 * Useful for rendering locale switch or something.
	 */
	locales: Array<string>

	/**
	 * Initializes the Teast store instance.
	 * @param props a bunch of Teast props 
	 * @returns a Promise that resolves when the Teast store is ready to go.
	 */
	init = (props: TeastProps<T>): Promise<T> => {
		this.locales = props.locales
		this.locale = props.initialLocale
		this.fetch = () => {
			return new Promise((rslv, rjct) => {
				Promise.all([
					new Promise(r => setTimeout(r, props.delay)),
					props.fetch(this.locale)
				]).then(([_, data]) => rslv(data)).catch(err => {
					if (this.ready)
						props.onFetchError(err)
					rjct(err)
				})
			})
		}

		return new Promise((resolve, reject) => {	
			this.fetch().then(data => {
				this.setTranslation(props.initialLocale, data)
				this.ready = true
				resolve()
			}).catch(error => {
				reject(error)
			})
		})
	}

	/**
	 * @private
	 * Check if translation for the specified locale is already loaded or not
	 * @param locale locale to check
	 * @returns `true` if the translation for this locale exist in store, otherwise `false`
	 */
	isLoaded = (locale: string): boolean => {
		return !!this.traslations.find(t => t[0] == locale)
	}

	/**
	 * @private
	 * Get translation from the store for the specified locale.  
	 * Throws an Error if there is no such translation loaded.  
	 * This prevents you from forgot the Teast store initialization.
	 */
	getTranslation = (locale: string): T => {
		var translation = this.traslations.find(t => t[0] == locale)
		if (!translation)
			throw new Error(`Locale is ${locale}, translation not found. Probabaly, you forgot to init the Teast store`)
		return this.traslations.find(t => t[0] == locale)[1]
	}

	/**
	 * __action__  
	 * Loads the translation for the specified locale.
	 * @param locale a locale for which the translation should be loaded
	 * @returns `false` if the translation is already exist. `true` if translation needs to be loaded.  
	 * When `true` is returned, then current locale is being moved to `prevLocale`.  
	 * This triggers the `isTranslating` to be changed from `false` to `true` 
	 */
	@action 
	loadTranslation = (locale: string): boolean => {
		if (this.isLoaded(locale)) {
			this.locale = locale
			return false
		}
		
		this.prevLocale = this.locale
		this.locale = locale

		this.fetch().then(data => {
			this.setTranslation(locale, data)
		}).catch(() => {
			this.locale = this.prevLocale
			this.prevLocale = undefined
		})
		return true
	}

	/**
	 * @private 
	 * __action__  
	 * Weak setting of the loaded translation to the store.
	 * @param locale a locale for which a translation data should be set
	 * @param data a translation data to set
	 */
	@action 
	setTranslation = (locale: string, data: T) => {
		if (!this.isLoaded(locale))
			this.traslations.push([locale, data])
		this.prevLocale = undefined
	}

	/**
	 * __computed__  
	 * Displays if there is loading of the translation is being performed.
	 */
	@computed 
	get isTranslating(): boolean {
		return !!this.prevLocale
	}

	/**
	 * __computed__  
	 * Returns the _safe_ locale.  
	 * It means that you should use this for any third-party locale-dependable parts of your application.  
	 * This is always reffers to exactly loaded locale.
	 */
	@computed
	get loadedLocale(): string {
		return this.prevLocale || this.locale
	}

	/**
	 * __computed__  
	 * A translation for the loaded locale.
	 */
	@computed 
	get $(): T {
		return this.getTranslation(this.loadedLocale)
	}
}