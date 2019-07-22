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
    error: {
      title: 'Error',
      notes: 'This page is not found.'
    },
    home: {
      onlyRest: "Only rest",
      awayFromDevice: {
        1: 'Away from',
        2: 'Device'
      },
      starterTip: 'Start!',
      placeholder: {
        title: 'Title (optional)',
        workTime: 'Work Time (minute)',
        restTime: 'Rest Time (minute)',
        loop: 'Loops',
        notes: 'Notes (optional)'
      },
      allSum: {
        1: "all together",
        2: "minutes, to"
      },
      illegalInput: "Illegal Input. ",
      illegalReason: {
        badContent: "Please insert positive numbers in the form. ",
        tooBig: "The total time is too long. "
      }
    },
    timer: {
      h: "h ",
      min: "min ",
      s: "s ",
      ended: "End",
      working: "WORKING",
      resting: "RESTING"
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
    error: {
      title: '出错了',
      notes: 'wnr找不到这个页面了……返回首页吧。'
    },
    home: {
      onlyRest: "仅休息",
      awayFromDevice: {
        1: '专心模式',
        2: '不用设备'
      },
      starterTip: '开始',
      placeholder: {
        title: '请输入任务名称（选填）',
        workTime: '请输入工作时间（分钟）',
        restTime: '请输入休息时间（分钟）',
        loop: '请输入时间循环次数',
        notes: '还有什么想要记的吗（选填）'
      },
      allSum: {
        1: "共计",
        2: "分钟，到"
      },
      illegalInput: "wnr觉得有些项的内容不是很合理呢…",
      illegalReason: {
        badContent: "请在全部的必填项中输入一个正整数。",
        tooBig: "总时间太长了。"
      }
    },
    timer: {
      h: "时 ",
      min: "分 ",
      s: "秒 ",
      ended: "!!完成了!!",
      working: "工作",
      resting: "休息"
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