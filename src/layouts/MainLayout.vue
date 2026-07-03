<template>
    <q-layout view="lHh Lpr lFf">
        <q-header>
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                    @click="leftDrawerOpen = !leftDrawerOpen"
                />

                <q-toolbar-title>
                    <img style="width: 360px;" alt="Logo INABIF"
                         src="https://srvapp02.inabif.gob.pe/intranet/Img/LOGO_INABIF_2020.png">
                </q-toolbar-title>

                <div class="row text-right">
                    <div class="col-10">
                        <strong>{{ this.$q.localStorage.getItem('sgs-nombreCompleto') }}</strong>
                        <br>
                        <span style="font-size: 85%;">{{ this.$q.localStorage.getItem('sgs-nombreUnidad') }}</span>
                        <br>
<!--                        <span style="font-size: 85%;">{{ this.$q.localStorage.getItem('sgs-idUsuario') }}</span>-->
<!--                        <br>-->
<!--                        <span style="font-size: 85%;">{{ this.$q.localStorage.getItem('sgs-numeroDocumento') }}</span>-->
                    </div>
                    <div class="col-2">
                        <q-btn icon="exit_to_app" @click="salir" flat round

                               style="font-size: 18px; transform: scaleX(-1);">
                            <q-tooltip>REGRESAR</q-tooltip>
                        </q-btn>
                    </div>
                </div>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            show-if-above
            bordered>
            <q-list>

<!--                <q-item clickable to="/inicio">-->
<!--                    <q-item-section avatar>-->
<!--                        <q-icon name="desktop_windows"/>-->
<!--                    </q-item-section>-->
<!--                    <q-item-section>-->
<!--                        <q-item-label>Inicio</q-item-label>-->
<!--                    </q-item-section>-->
<!--                </q-item>-->

                <!-- MÓDULOS -->
                <div v-for="modulo in menuOrdenado" :key="modulo.descripcion">

                    <!-- TÍTULO DEL MÓDULO -->
                    <q-item-label
                        v-if="!ocultarTituloModulo(modulo)"
                        header
                        class="text-bold">
                        {{ modulo.descripcion }}
                    </q-item-label>

                    <!-- MENÚS -->
                    <div v-for="menu in modulo.subitems" :key="menu.descripcion">

                        <!-- MENÚ CON HIJOS -->
                        <q-expansion-item
                            v-if="menu.subitems.length"
                            :label="menu.descripcion"
                            :icon="menu.icono"
                            class="drawer-menu-expansion"
                            dense
                            :disable="menu.flgDeshabilitado === 1"
                            :default-opened="menu.subitems.some(s => rutaActual === s.enlace)"
                        >


                            <q-item
                                v-for="item in menu.subitems"
                                :key="item.descripcion"
                                clickable
                                dense
                                class="submenu-gap"
                                :disable="item.flgDeshabilitado === 1"
                                :class="{ 'submenu-activo': rutaActual === item.enlace }"
                                @click="irA(item.enlace)"
                            >
                                <q-item-section avatar>
                                    <q-icon/>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ obtenerDescripcionVisible(item.descripcion) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-expansion-item>

                        <!-- MENÚ SIMPLE -->
                        <q-item
                            v-else
                            clickable
                            dense
                            :disable="menu.flgDeshabilitado === 1"
                            :class="[
                                'submenu-gap',
                                { 'submenu-activo': rutaActual === menu.enlace },
                                { 'drawer-root-item--spaced': menu.descripcion === 'INICIO' }
                            ]"
                            @click="irA(menu.enlace)"
                        >
                            <q-item-section avatar>
                                <q-icon :name="menu.icono"/>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ obtenerDescripcionVisible(menu.descripcion) }}</q-item-label>
                            </q-item-section>
                        </q-item>

                    </div>
                </div>

            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view/>
        </q-page-container>

        <q-footer class="app-footer">
            <div class="app-footer-texto">
                &copy; {{ currentYear }} {{ organizationName }} | Todos los derechos reservados
                <span v-if="showVersion" class="app-footer-version">(versión {{ appVersion }})</span>
            </div>
        </q-footer>
    </q-layout>
</template>

<script>

export default {
    name: 'MainLayout',
    data() {
        return {
            host: process.env.API_RUTA,

            menuBackend: [],
            leftDrawerOpen: false,
            menuItems: [
                {
                    orden: 10, icono: 'support_agent', descripcion: 'Mesa de ayuda',
                    subitems: [
                        {orden: 10, enlace: 'tickets', descripcion: 'Gestión de tickets'},
                        {orden: 20, enlace: 'misTickets', descripcion: 'Tickets asignados'},
                    ]
                },
                {
                    orden: 20, icono: 'phone_android', descripcion: 'Equipos móviles',
                    subitems: [
                        {orden: 10, enlace: 'equipos', descripcion: 'Gestión de equipos'},
                    ]
                },
            ],
            organizationName: 'INABIF',
            showVersion: true,
            sessionInterval: null,
            sessionDialogOpen: false,
        }
    },
    async created() {
        if (this.$q.localStorage.has('sgs-session-dialog-open')) {
            this.clearSession()
            return
        }
        if (this.$q.localStorage.has('sgs-idUsuario') && this.$q.localStorage.has('sgs-session-token')) {
            this.startSessionCheck();
            await this.obtenerOpcionesMenu();
        } else {
            this.clearSession(false)
            await this.recibirParametros();
            await this.obtenerOpcionesMenu();
        }
    },

    methods: {
        salir: function () {
            let keys = Object.keys(this.$q.localStorage.getAll());
            let systemKeys = keys.filter(k => k.startsWith('sgs-') || k.startsWith('mda-'));
            for (let i = 0; i < systemKeys.length; i++) {
                this.$q.localStorage.remove(systemKeys[i]);
            }
            if (this.sessionInterval) clearInterval(this.sessionInterval);
            window.location.href = 'https://srvapp01.inabif.gob.pe:8443/seguridad/SPrincipal';
        },
        async obtenerOpcionesMenu() {


            // alert(this.$q.localStorage.getItem('sgs-idUsuario'));

            // https://srvapp01.inabif.gob.pe:8443/SRH/SPermiso?action=itemsMenu2&u=7496&s=126

            const host = "https://srvapp01.inabif.gob.pe:8443/SRH/";

            const request = await this.$axios.get(`${host}/SPermiso`, {
                params: {
                    action: "itemsMenu2",
                    u: this.$q.localStorage.getItem('sgs-idUsuario'),
                    s: 324
                }
            });

            this.menuBackend = this.normalizarArbolMenu(request.data);
        },
        normalizarArbolMenu(items = []) {
            return items.map(item => this.normalizarNodoMenu(item));
        },
        normalizarNodoMenu(item = {}) {
            const descripcion = String(item.descripcion || '').trim();
            const subitems = Array.isArray(item.subitems)
                ? item.subitems.map(subitem => this.normalizarNodoMenu(subitem))
                : [];

            return {
                ...item,
                descripcion,
                enlace: this.resolverEnlaceMenu(item, descripcion),
                subitems
            };
        },
        resolverEnlaceMenu(item, descripcion) {
            const enlace = String(item?.enlace || '').trim();
            if (descripcion === 'INICIO' && enlace === '#') {
                return 'inicio';
            }
            return enlace;
        },
        ocultarTituloModulo(modulo) {
            const descripcion = String(modulo?.descripcion || '').trim().toUpperCase();
            return descripcion === 'SIGESU' || descripcion === 'SISEC';
        },
        obtenerDescripcionVisible(descripcion) {
            return descripcion === 'INICIO' ? 'Inicio' : descripcion;
        },
        irA(ruta) {
            if (ruta && ruta !== '#') {
                this.$router.push('/' + ruta)
            }
        },

        getParamFromHash: function (name) {
            const hash = window.location.hash || ''
            const qIndex = hash.indexOf('?')
            if (qIndex === -1) return null

            const queryString = hash.slice(qIndex + 1)
            const params = new URLSearchParams(queryString)
            return params.get(name)
        },
        parseJwt: function (token) {
            if (!token || typeof token !== 'string') return null

            const parts = token.split('.')
            if (parts.length !== 3) return null

            try {
                const base64Url = parts[1]
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                )
                return JSON.parse(jsonPayload)
            } catch (e) {
                return null
            }
        },
        async recibirParametros() {

            // 0️⃣ Si ya hay sesión activa, redirigir
           if (this.$q.localStorage.has('sgs-idUsuario')) {
                this.$router.push({path: '/inicio'})
                return
            }

            // 1️⃣ Obtener token desde query o hash
            let token = this.$route?.query?.p
            if (!token) token = this.getParamFromHash('p')

            if (!token) {
                this.$q.notify({type: 'negative', message: 'No llegó el parámetro p'})
                return
            }

            // 2️⃣ Decodificar JWT
            const payload = this.parseJwt(token)
            if (!payload) {
                this.$q.notify({type: 'negative', message: 'Token inválido'})
                return
            }

            const {idUsuario, idSistema, exp} = payload

            // 3️⃣ Validar estructura mínima
            if (!idUsuario || !idSistema) {
                this.$q.notify({type: 'negative', message: 'Token incompleto'})
                return
            }

            // 4️⃣ Validar expiración (si viene en el token)
            if (exp) {
                const now = Math.floor(Date.now() / 1000)
                if (exp < now) {
                    this.$q.notify({type: 'negative', message: 'Token expirado'})
                    return
                }
            }

            // 5️⃣ Llamar al endpoint SPermiso
            try {
                const {data} = await this.$axios.get(
                    `${this.host}/SPermiso`,
                    {
                        params: {
                            action: 'login',
                            tipo: 'PERFIL_POR_USUARIO_Y_SISTEMA',
                            u: idUsuario,
                            s: idSistema
                        }
                    }
                )

                // 6️⃣ Si no está autorizado → limpiar y salir
                if (!data) {
                    const keys = Object.keys(this.$q.localStorage.getAll())
                    keys
                        .filter(k => k.startsWith('sgs-') || k.startsWith('mda-'))
                        .forEach(k => this.$q.localStorage.remove(k))

                    this.$q.notify({
                        type: 'negative',
                        message: 'NO ESTÁ AUTORIZADO A INGRESAR'
                    })

                    window.location.href = 'https://srvapp01.inabif.gob.pe:8443/intranet'
                    return
                }

                // 7️⃣ Guardar datos de sesión (equivalente al flujo antiguo)
                this.$q.localStorage.set('sgs-idUsuario', data.idUsuario)
                this.$q.localStorage.set('sgs-idPerfil', data.idPerfil)
                this.$q.localStorage.set('sgs-nombreUsuario', data.nombreUsuario)
                this.$q.localStorage.set('sgs-nombreCompleto', data.nombresApellidos)
                this.$q.localStorage.set('sgs-nombreUnidad', data.unidadOrganica)
                this.$q.localStorage.set('sgs-idPersonal', data.idPersonal)
                this.$q.localStorage.set('sgs-numeroDocumento', data.perNroDocumento)

                // 7b️⃣ Guardar tokens de sesión
                this.$q.localStorage.set('sgs-token', token)
                this.$q.localStorage.set('sgs-payload', JSON.stringify(payload))
                const sessionToken = this.createJwtToken(payload)
                if (!sessionToken) {
                    this.$q.notify({type: 'negative', message: 'Error al crear token de sesión. Verifica la consola.'})
                    return
                }
                this.$q.localStorage.set('sgs-session-token', sessionToken)
                this.startSessionCheck()

                // 8️⃣ Redirigir
                this.$router.push({path: '/inicio'})

            } catch (error) {
                this.$q.notify({
                    type: 'negative',
                    message: 'No se pudo validar el usuario'
                })
            }
        },

        base64Url(source) {
            let encoded = btoa(source)
            encoded = encoded.replace(/=+$/, '')
            encoded = encoded.replace(/\+/g, '-')
            encoded = encoded.replace(/\//g, '_')
            return encoded
        },

        createJwtToken(payload) {
            if (!this.$CryptoJS) {
                return null
            }
            const header = { alg: 'HS256', typ: 'JWT' }
            const now = Math.floor(Date.now() / 1000)
            const exp = now + (parseInt(process.env.TOKEN_EXPIRATION_MINUTES) * 60)
            const body = { ...payload, exp }

            const encodedHeader = this.base64Url(JSON.stringify(header))
            const encodedBody = this.base64Url(JSON.stringify(body))
            const signature = this.$CryptoJS.HmacSHA256(
                `${encodedHeader}.${encodedBody}`,
                process.env.TOKEN_SECRET_KEY
            ).toString(this.$CryptoJS.enc.Base64)
            const encodedSignature = signature.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')

            return `${encodedHeader}.${encodedBody}.${encodedSignature}`
        },

        verifyJwtToken(token) {
            if (!token || typeof token !== 'string') return null
            const parts = token.split('.')
            if (parts.length !== 3) return null

            const [headerB64, payloadB64, signatureB64] = parts

            const expectedSig = this.$CryptoJS.HmacSHA256(
                `${headerB64}.${payloadB64}`,
                process.env.TOKEN_SECRET_KEY
            ).toString(this.$CryptoJS.enc.Base64)
            const expectedSigUrl = expectedSig.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')

            if (signatureB64 !== expectedSigUrl) return null

            try {
                const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                )
                return JSON.parse(jsonPayload)
            } catch (e) {
                return null
            }
        },

        startSessionCheck() {
            if (this.sessionInterval) clearInterval(this.sessionInterval)
            this.checkSession() // chequeo inmediato
            this.sessionInterval = setInterval(() => {
                this.checkSession()
            }, 5000)
        },

        checkSession() {
            const sessionToken = this.$q.localStorage.getItem('sgs-session-token')
            if (!sessionToken) return

            const payload = this.verifyJwtToken(sessionToken)
            if (!payload) {
                this.showSessionExpiredDialog()
                return
            }

            const now = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp <= now) {
                this.showSessionExpiredDialog()
            }
        },

        showSessionExpiredDialog() {
            if (this.sessionDialogOpen) return
            this.sessionDialogOpen = true
            this.$q.localStorage.set('sgs-session-dialog-open', '1')
            if (this.sessionInterval) clearInterval(this.sessionInterval)

            this.$q.dialog({
                title: 'Sesión expirada',
                message: 'Su sesión ha vencido. ¿Desea continuar trabajando?',
                persistent: true,
                noBackdropDismiss: true,
                ok: {
                    label: 'Sí, continuar',
                    color: 'positive',
                    unelevated: true,
                    icon: 'check_circle'
                },
                cancel: {
                    label: 'No, salir',
                    color: 'grey-5',
                    textColor: 'dark',
                    unelevated: true,
                    icon: 'logout'
                },
                class: 'session-expired-dialog dialog-mensaje'
            }).onOk(() => {
                this.$q.localStorage.remove('sgs-session-dialog-open')
                const originalPayload = this.$q.localStorage.getItem('sgs-payload')
                if (originalPayload) {
                    const newToken = this.createJwtToken(JSON.parse(originalPayload))
                    this.$q.localStorage.set('sgs-session-token', newToken)
                }
                this.sessionDialogOpen = false
                this.startSessionCheck()
            }).onCancel(() => {
                this.sessionDialogOpen = false
                this.$q.localStorage.remove('sgs-session-dialog-open')
                this.clearSession()
            })
        },

        clearSession(redirect = true) {
            if (this.sessionInterval) clearInterval(this.sessionInterval)
            const keys = Object.keys(this.$q.localStorage.getAll())
            keys.filter(k => k.startsWith('sgs-') || k.startsWith('mda-'))
                .forEach(k => this.$q.localStorage.remove(k))
            if (redirect) {
                window.location.href = 'https://srvapp01.inabif.gob.pe:8443/intranet'
            }
        },

    },

    computed: {
        appVersion() {
            return process.env.APP_VERSION || '0.0.1'
        },
        currentYear() {
            return new Date().getFullYear()
        },
        rutaActual() {
            return this.$route.path.replace(/^\/+/, '')
        },
        menuOrdenado() {
            return [...this.menuBackend]
                .sort((a, b) => a.orden - b.orden)
                .map(modulo => ({
                    ...modulo,
                    subitems: modulo.subitems
                        .sort((a, b) => a.orden - b.orden)
                        .map(menu => ({
                            ...menu,
                            subitems: menu.subitems.sort((a, b) => a.orden - b.orden)
                        }))
                }))
        }
    },
}
</script>

<style scoped>
.app-footer {
    background-color: transparent;
    color: #000000;
    padding: 8px 16px;
}

.app-footer-texto {
    text-align: center;
    font-size: 0.85rem;
    line-height: 1.5;
}

.app-footer-version {
    color: #90caf9;
    margin-left: 6px;
}

.drawer-root-item--spaced {
    margin-bottom: 8px;
}
</style>
