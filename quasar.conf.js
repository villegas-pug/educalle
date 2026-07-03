/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v1.quasar.dev/quasar-cli/quasar-conf-js


module.exports = function (ctx) {
    return {
        // https://v1.quasar.dev/quasar-cli/supporting-ts
        supportTS: false,

        // https://v1.quasar.dev/quasar-cli/prefetch-feature
        // preFetch: true,

        // app boot file (/src/boot)
        // --> boot files are part of "main.js"
        // https://v1.quasar.dev/quasar-cli/boot-files
        boot: [
            'i18n',
            'axios',
            'directives',
            'cryptojs'
        ],

        // https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
        css: [
            'app.css'
        ],

        // https://github.com/quasarframework/quasar/tree/dev/extras
        extras: [
            // 'ionicons-v4',
            // 'mdi-v5',
            // 'fontawesome-v6',
            // 'eva-icons',
            // 'themify',
            // 'line-awesome',
            // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

            'roboto-font', // optional, you are not bound to it
            'material-icons', // optional, you are not bound to it
        ],

        // Full list of options: https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
        build: {
            vueRouterMode: 'hash',
            publicPath: '/sisec/',

            env: {
                API_URL : ctx.dev
                ? 'https://srvapp03.inabif.gob.pe/api/ms-educalle'
                : 'https://srvapp03.inabif.gob.pe/api/ms-educalle',

                // PROD
                // API_URL_SIGESU: 'http://172.19.0.44:4000/api/ms-sigesu',
                // API_URL_SIGESU: 'https://srvapp03.inabif.gob.pe/api/ms-sigesu',
                API_URL_SIGESU: 'https://srvapp03.inabif.gob.pe/api/ms-educalle',
                
                // DEV
                // API_URL_SIGESU: 'http://10.101.0.36:4000/api/ms-sigesu',
                API_RUTA:'https://srvapp01.inabif.gob.pe:8443/SRH',

                TOKEN_EXPIRATION_MINUTES: 240,
                TOKEN_SECRET_KEY: 'e28dbddcb0a07a4b8dff3f1c414c49b3bcb61b06af8087a76b707c4fa1d47c3b63433597a71adc8842b720ae3f6b1bb6b1f1f68de64aae6e650786f6864e0a3e'
            }
        },


        // Full list of options: https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
        devServer: {
            https: false,
            port: 4100,
            open: true // opens browser window automatically
        },

        // https://v1.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
        framework: {
            iconSet: 'material-icons', // Quasar icon set
            lang: 'es', // Quasar language pack
            config: {},

            // Possible values for "importStrategy":
            // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
            // * 'all'  - Manually specify what to import
            importStrategy: 'auto',

            // For special cases outside of where "auto" importStrategy can have an impact
            // (like functional components as one of the examples),
            // you can manually specify Quasar components/directives to be available everywhere:
            //
            // components: [],
            // directives: [],

            // Quasar plugins
            plugins: ['Notify', 'LocalStorage', 'Loading', 'Dialog']
        },

        // animations: 'all', // --- includes all animations
        // https://v1.quasar.dev/options/animations
        animations: [],

        // https://v1.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
        ssr: {
            pwa: false
        },

        // https://v1.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
        pwa: {
            workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
            workboxOptions: {}, // only for GenerateSW
            manifest: {
                name: `Tickets`,
                short_name: `Tickets`,
                description: `-`,
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#ffffff',
                theme_color: '#027be3',
                icons: [
                    {
                        src: 'icons/icon-128x128.png',
                        sizes: '128x128',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-256x256.png',
                        sizes: '256x256',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-384x384.png',
                        sizes: '384x384',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        },

        // Full list of options: https://v1.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
        cordova: {
            // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
        },

        // Full list of options: https://v1.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
        capacitor: {
            hideSplashscreen: true
        },

        // Full list of options: https://v1.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
        electron: {
            bundler: 'packager', // 'packager' or 'builder'

            packager: {
                // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

                // OS X / Mac App Store
                // appBundleId: '',
                // appCategoryType: '',
                // osxSign: '',
                // protocol: 'myapp://path',

                // Windows only
                // win32metadata: { ... }
            },

            builder: {
                // https://www.electron.build/configuration/configuration

                appId: 'tickets'
            },

            // More info: https://v1.quasar.dev/quasar-cli/developing-electron-apps/node-integration
            nodeIntegration: true,

            extendWebpack(/* cfg */) {
                // do something with Electron main process Webpack cfg
                // chainWebpack also available besides this extendWebpack
            }
        }
    }
}
