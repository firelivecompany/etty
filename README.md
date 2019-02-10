# Easy Typed Translations? Yes!

This lightweight package allows you to create MobX-based store for translations and easily manage it. Etty is developed using TypeScript and created for using mainly in React projects. But because of there is no any dependence of React, it can be suitable with any frontend-framework (but this is not verified).

---

## Usage

1. Install package
```
npm install etty
```

2. Create a translation template (e.g. `src/config/template.json`)
```json
{
	"myAwesomeTranslation": {
		"field_1": "",
		"field_2": ""
	},
	"myTranslationArray": ["", "", ""]
}
```

2. Create a store based on it
```typescript
import Etty from "etty"
import * as template from "config/template.json"

export type Translation = typeof template
export default new Etty<Translation>()
```

3. Enjoy your **observable** translations with full autocomplete!
![Etty Screenshot 1](/images/screenshot1.png)

---

## Properties

### `EttyStore.init()`
Initializes the Etty store. Without this initialization any attempt to acces to `EttyStore.$` will throw and error. Suggested to be called in `componentDidMount()` of your React application's `App` component. For example:

```tsx
import * as React from "react"
import { observer } from "mobx-react"
import EttyStore, { Translation } from "stores/EttyStore"
import Superagent from "superagent"

@observer
export default class Application extends React.Component {
    state = {
        initialError: false
    }

    componentDidMount() {
        var userLocale = navigator.userAgent.language
        var locales = ["en-US", "en-GB", "ru"]
        EttyStore.init({
            locales,
            initialLocale: locales.includes(userLocale)
                ? userLocale
                : locales[0],
            fetch: (locale: string) => {
                return new Promise<Translation>((resolve, reject) => {
                    Superagent.get(`/api/translate/${locale}`).then(resp => {
                        resolve(resp.body) 
                    }).catch(reject)
                })
            }
        }).catch(() => {
            this.setState({ initialError: true })
        })
    }

    render() {
        if (this.state.initialError)
            return "Whoops! Sorry, we are failed to initialize the application"

        return !EttyStore.ready
            ? // Etty is fetching initial locale translations yet
            "Prepairing application..."
            : // Etty is ready now and available anywhere it imported! Do your stuff here
            EttyStore.$.helloWorld
    }
}
```

#### @params
`props: EttyProps`

name | type | required | default value | description
---- | ---- | -------- | ------------- | -----------
`EttyProps.delay` | `number` | no | 0 |  A minimal delay in _milliseconds_ before the translation request will be considered as successful. For example, if you wil specify `600`, then any translation request within `EttyStore` will take _at least_ 600 millisections unless it fails.
`EttyProps.locales` | `string[]` | yes | - | A list of available locales, e.g. `["ru", "en", "uk"]`
`EttyProps.initialLocale` | `string` | yes | - | An initial locale. `EttyStore.init` will load a translation for this locale.
`EttyProps.fetch` | `(locale: string) => Promise<T>` | yes | - | A function, where you can make request for the translation for locale that is passed as parameter. Should return `Promise` that contains data of type `T` (this type you are passing when creating an instance: `new Etty<SomeTranslationType>()`, so `T` is `SomeTranslationType` here)
`EttyProps.onFetchError` | `(error?: any) => void` | no | () => {} | A function that is being called each time when the `EttyProps.fetch()` will throw `Promise.catch`. Does not being called, if `EttyStore.init()` throws `Promise.catch` (use it's catch to handle initialization fail manually).

#### @returns 
A Promise.


### `EttyStore.ready: boolean`
`@observable`  
Used as flag that shows, does the `EttyStore` ready for usage or not. Consider not to render your application (at least, do not use `EttyStore.$`) until this field became `true`.


### `EttyStore.locale: string`
`@observable`  
Current locale of the store. Can reffer both loaded locale and loading locale.


### `EttyStore.locales: string[]`
A plain JS array of locales that was passed to `EttyStore.init`.


### `EttyStore.isTranslating: boolean`
`@computed`  
Returns `true` if translation for `EttyStore.locale` is now loading and `false` if it's ok and translation for `EttyStore.locale` is already loaded.


### `EttyStore.loadedLocale: string`
`@computed`  
Returns _safe_ locale, i.e. the last used locale for which the translation already exist. During `EttyStore.isTranslating` is `true`, this property does not equals `EttyStore.locale`. Use it everywhere you need to use current locale of the language (e.g. some translatable fields in your API response, etc). The translation that is returned in `EttyStore.$` uses locale that specified in `EttyStore.loadedLocale`.


### `EttyStore.loadTranslation()`
Use this function when you want to change locale. For example:
```tsx
import * as React from "react"
import { observer } from "mobx-react"
import EttyStore from "stores/EttyStore"

@observer
export default class LocaleSwitch extends React.Component {
    handleClick = (locale: string) => {
        if (!EttyStore.isTranslating)
            EttyStore.loadTranslation(locale)
    }

    render() {
        return (
            <div className="c-locale-switch">
                {EttyStore.locales.map(locale => (
                    <button
                        key={locale}
                        onClick={() => this.handleClick(locale)}
                        className={`locale ${locale == EttyStore.loadedLocale ? "active" : ""}`}
                    >{locale}</button>
                ))}
            </div>
        )
    }
}
```

#### @params
`locale: string` - a locale for which the translation should be loaded and shown.
#### @returns
`boolean`. If the translation for specified locale has already been loaded, then this method just changes the `EttyStore.locale` and returns `false` (means: "No, I'm not loading anything!"). Otherwise changes the `EttyStore.locale`, starts to load the translation (the flag `EttyStore.isTranslating` became `true`) and returns `true` (means: "Yes, sir, I'm loading the translation!")


### `EttyStore.$: T`
`@computed`  
Returns the translation object of type that was specified during construction (e.g. if you used `new Etty<MyTranslationType>()`, then `EttyStore.$` will return object of type `MyTranslationType`). Uses translation for locale specified in `EttyStore.loadedLocale`, so once `EttyStore` initialized, you can consider that this field is safe for work. Throws an error if `EttyStore` is not initialized

---

### Other fields
Fields that are not described in the section above should be considered as `private` and should not be used.