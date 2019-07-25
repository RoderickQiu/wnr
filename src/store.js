import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    timer: {
      isFocusWork: false,
      isFocusRest: false,
      isOnlyRest: false,
      workTime: 0,
      restTime: 0,
      loop: 0,
      title: "",
      notes: ""
    }
  },
  mutations: {
    setTimer(state, timer) {
      state.timer.workTime = timer.workTime;
      state.timer.restTime = timer.restTime;
      state.timer.loop = timer.loop;
      state.timer.title = timer.title;
      state.timer.notes = timer.notes;
    },
    setIsFocusWork(state, b) {
      state.timer.isFocusWork = b;
    },
    setIsFocusRest(state, b) {
      state.timer.isFocusRest = b;
    },
    setIsOnlyRest(state, b) {
      state.timer.isOnlyRest = b;
    }
  },
  actions: {

  }
})
