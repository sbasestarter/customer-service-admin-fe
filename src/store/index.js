import { createStore } from 'vuex'

function getServicerToken() {
  const token = localStorage.getItem("servicer_token")
  if (token === undefined || token === null) {
    return ''
  }

  return token
}

export default createStore({
  state: {
    servicerToken: getServicerToken()
  },
  getters: {
    servicerToken(state) {
      return state.servicerToken
    }
  },
  mutations: {
    servicerToken(state, val) {
      state.servicerToken = val
      localStorage.setItem("servicer_token", val)
    },
  },
  actions: {
  },
  modules: {
  }
})
