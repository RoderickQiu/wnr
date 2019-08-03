import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import DropdownPlugin from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../public/scrisui-0.3.2.min.css'
import './style.css'
import { Plugins } from '@capacitor/core'
import VueI18n from 'vue-i18n'
const { StatusBar, Device } = Plugins
import '../public/i18nMessages'
import { messages } from '../public/i18nMessages';

if (process.env.VUE_APP_LINXF == 'android') {
  StatusBar.setStyle({ style: "LIGHT" });
  StatusBar.setBackgroundColor({ color: '#F9F9F9' });
}

Vue.config.productionTip = false;
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error Handler:\n' + err + '\n' + vm + '\n' + info + '\n');
}

Vue.use(DropdownPlugin);
Vue.use(VueI18n);

Device.getLanguageCode().then(lang => {
  let langCode;
  if (lang.value[0] == 'z' && lang.value[1] == 'h') langCode = 'zh-CN';
  else langCode = 'en';
  const i18n = new VueI18n({
    locale: langCode,
    messages
  })
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
  }).$mount('#app')
});
