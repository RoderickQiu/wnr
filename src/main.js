import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import DropdownPlugin from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './../public/scrisui-0.3.0.min.css'
import './style.css'
import { Plugins } from '@capacitor/core';
import VueI18n from 'vue-i18n'

const { StatusBar, Device } = Plugins;

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

const messages = {
  'en': {
    app: {
      about: 'About'
    },
    about: {
      acknoledgements: 'Acknoledgements of Packages',
      versionShort: 'v'
    },
    home: {
      awayFromDevice1: 'Away from',
      awayFromDevice2: 'Device',
      starterTip: 'Start!',
      placeholder: {
        title: 'Title (optional)',
        workTime: 'Work Time',
        restTime: 'Rest Time',
        loops: 'loops',
        notes: 'notes (optional)'
      },
      allSum1: "all together",
      allSum2: "minutes, to",
    }
  },
  'zh-CN': {
    app: {
      about: '关于'
    },
    about: {
      acknoledgements: '致谢：使用的类库名单',
      versionShort: '版本'
    },
    home: {
      awayFromDevice1: '专心模式',
      awayFromDevice2: '不用设备',
      starterTip: '开始',
      placeholder: {
        title: '请输入任务名称（选填）',
        workTime: '请输入工作时间',
        restTime: '请输入休息时间',
        loops: '请输入时间循环次数',
        notes: '还有什么想要记的吗（选填）'
      },
      allSum1: "共计",
      allSum2: "分钟，到",
    }
  }
};

Device.getLanguageCode().then(lang => {
  let langCode = 'en';
  if (lang.value[0] == 'z' && lang.value[1] == 'h') langCode = 'zh-CN';
  const i18n = new VueI18n({
    locale: langCode,
    messages
  })
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app')
});