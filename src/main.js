import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCordova from 'vue-cordova'
import DropdownPlugin from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './../public/scrisui.min.css'
import './style.css'

Vue.config.productionTip = false
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error Handler:\n' + err + '\n' + vm + '\n' + info + '\n');
}

Vue.use(DropdownPlugin)
Vue.use(VueCordova)
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  var cordovaScript = document.createElement('script')
  cordovaScript.setAttribute('type', 'text/javascript')
  cordovaScript.setAttribute('src', 'cordova.js')
  document.body.appendChild(cordovaScript)
}//to use cordova
Vue.cordova.on('deviceready', () => {
  screen.orientation.lock('portrait');
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')