"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
/** A class that represents an Etty store */
var Etty = /** @class */ (function () {
    function Etty(template) {
        var _this = this;
        /**
         * @private
         * __observable__
         * Translations are being stored here
         */
        this.traslations = [];
        /**
         * __observable__
         * Flag that shows if the store is ready.
         * Becomes `true` after successful initialization
         */
        this.ready = false;
        /**
         * Initializes the Etty store instance.
         * @param props a bunch of Etty props
         * @returns a Promise that resolves when the Etty store is ready to go.
         */
        this.init = function (props) {
            _this.locales = props.locales;
            _this.locale = props.initialLocale;
            _this.fetch = function () {
                return new Promise(function (rslv, rjct) {
                    Promise.all([
                        new Promise(function (r) { return setTimeout(r, props.delay); }),
                        props.fetch(_this.locale)
                    ]).then(function (_a) {
                        var _ = _a[0], data = _a[1];
                        return rslv(data);
                    }).catch(function (err) {
                        if (_this.ready)
                            props.onFetchError(err);
                        rjct(err);
                    });
                });
            };
            return new Promise(function (resolve, reject) {
                _this.fetch().then(function (data) {
                    _this.setTranslation(props.initialLocale, data);
                    _this.ready = true;
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        };
        /**
         * @private
         * Check if translation for the specified locale is already loaded or not
         * @param locale locale to check
         * @returns `true` if the translation for this locale exist in store, otherwise `false`
         */
        this.isLoaded = function (locale) {
            return !!_this.traslations.find(function (t) { return t[0] == locale; });
        };
        /**
         * @private
         * Get translation from the store for the specified locale.
         * Throws an Error if there is no such translation loaded.
         * This prevents you from forgot the Etty store initialization.
         */
        this.getTranslation = function (locale) {
            var translation = _this.traslations.find(function (t) { return t[0] == locale; });
            if (!translation)
                throw new Error("Locale is " + locale + ", translation not found. Probabaly, you forgot to init the Etty store");
            return _this.traslations.find(function (t) { return t[0] == locale; })[1];
        };
        /**
         * __action__
         * Loads the translation for the specified locale.
         * @param locale a locale for which the translation should be loaded
         * @returns `false` if the translation is already exist. `true` if translation needs to be loaded.
         * When `true` is returned, then current locale is being moved to `prevLocale`.
         * This triggers the `isTranslating` to be changed from `false` to `true`
         */
        this.loadTranslation = function (locale) {
            if (_this.isLoaded(locale)) {
                _this.locale = locale;
                return false;
            }
            _this.prevLocale = _this.locale;
            _this.locale = locale;
            _this.fetch().then(function (data) {
                _this.setTranslation(locale, data);
            }).catch(function () {
                _this.locale = _this.prevLocale;
                _this.prevLocale = undefined;
            });
            return true;
        };
        /**
         * @private
         * __action__
         * Weak setting of the loaded translation to the store.
         * @param locale a locale for which a translation data should be set
         * @param data a translation data to set
         */
        this.setTranslation = function (locale, data) {
            if (!_this.isLoaded(locale))
                _this.traslations.push([locale, data]);
            _this.prevLocale = undefined;
        };
    }
    Object.defineProperty(Etty.prototype, "isTranslating", {
        /**
         * __computed__
         * Displays if there is loading of the translation is being performed.
         */
        get: function () {
            return !!this.prevLocale;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Etty.prototype, "loadedLocale", {
        /**
         * __computed__
         * Returns the _safe_ locale.
         * It means that you should use this for any third-party locale-dependable parts of your application.
         * This is always reffers to exactly loaded locale.
         */
        get: function () {
            return this.prevLocale || this.locale;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Etty.prototype, "$", {
        /**
         * __computed__
         * A translation for the loaded locale.
         */
        get: function () {
            return this.getTranslation(this.loadedLocale);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        mobx_1.observable
    ], Etty.prototype, "traslations", void 0);
    __decorate([
        mobx_1.observable
    ], Etty.prototype, "ready", void 0);
    __decorate([
        mobx_1.observable
    ], Etty.prototype, "locale", void 0);
    __decorate([
        mobx_1.observable
    ], Etty.prototype, "prevLocale", void 0);
    __decorate([
        mobx_1.action
    ], Etty.prototype, "loadTranslation", void 0);
    __decorate([
        mobx_1.action
    ], Etty.prototype, "setTranslation", void 0);
    __decorate([
        mobx_1.computed
    ], Etty.prototype, "isTranslating", null);
    __decorate([
        mobx_1.computed
    ], Etty.prototype, "loadedLocale", null);
    __decorate([
        mobx_1.computed
    ], Etty.prototype, "$", null);
    return Etty;
}());
exports.default = Etty;
