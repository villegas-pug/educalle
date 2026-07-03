import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios

// export const apiPunche = axios.create({
//     baseURL: process.env.API_URL_PUNCHE,
//     timeout: 5000
// })
//
// export const apiCedif = axios.create({
//     baseURL: process.env.API_URL_CEDIF,
//     timeout: 5000
// })
