import { axiosInstance } from 'boot/axios'
import { Cookies } from 'quasar'

import prompts from 'app/quasar.extensions.json'

const REGISTER_ROUTE = prompts['auth-token-based'].registerRoute
const VERIFICATION_ROUTE = prompts['auth-token-based'].verificationRoute
const LOGIN_ROUTE = prompts['auth-token-based'].loginRoute
const FETCH_USER_ROUTE = prompts['auth-token-based'].fetchUserRoute
const PASSWORD_FORGOT_ROUTE = prompts['auth-token-based'].passwordForgotRoute
const PASSWORD_RESET_ROUTE = prompts['auth-token-based'].passwordResetRoute

export function register (state, data) {
  return axiosInstance.post(REGISTER_ROUTE, data)
}

export function login (state, data) {
  const p = new Promise(function (resolve, reject) {
    return axiosInstance
      .post(LOGIN_ROUTE, data.body)
      .then(response => {
        state.commit('setUser', response.data.user.data)
        const token = response.data.token
        axiosInstance.defaults.headers.common.Authorization =
          'Bearer ' + token
        state.dispatch('setToken', {
          token: token,
          rememberMe: data.rememberMe
        })
        resolve()
      })
      .catch(error => {
        reject(error)
      })
  })
  return p
}

export function setToken (state, data) {
  axiosInstance.defaults.headers.common.Authorization =
    'Bearer ' + data.token
  if (data.rememberMe) {
    Cookies.set('authorization_token', data.token, {
      expires: 365
    })
  } else {
    Cookies.set('authorization_token', data.token)
  }
}

export async function fetch (state) {
  var token = Cookies.get('authorization_token')
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token
    return axiosInstance.get(FETCH_USER_ROUTE).then(response => {
      state.commit('setUser', response.data.data)
    }).then(() => {
      state.dispatch('loginCallback')
    })
  } else {
    return new Promise((resolve, reject) => {
      reject('No authorization token found')
    })
  }
}

export function logout (state) {
  Cookies.remove('authorization_token')
  state.commit('setUser', null)
}

export function verify (state, token) {
  return axiosInstance.get(VERIFICATION_ROUTE + '?token=' + token)
}
export function passwordForgot (state, data) {
  return axiosInstance.post(PASSWORD_FORGOT_ROUTE, data)
}

export function passwordReset (state, { token, data }) {
  return axiosInstance.post(PASSWORD_RESET_ROUTE + '?token=' + token, data)
}

export function loginCallback (state, data = {}) {
  for (const loginCallback of state.state.loginCallbacks) {
    loginCallback({ router: data.router })
  }
}
