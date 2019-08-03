<template>
  <div
    id="app"
    class="d-flex mx-auto justify-content-center align-items-center text-dark user-select-text"
  >
    <div id="controller-left" class="user-select-none electron-no-drag lead rest">
      <transition name="fade" mode="out-in">
        <router-link
          to="/"
          id="back-home"
          v-if="(this.$route.path != '/' && this.$store.state.timer.isFocused == false)"
        >
          <b-button
            v-bind:class="{'work': ($store.state.timer.isWorking && $route.path == '/wnr'), 'rest': (!$store.state.timer.isWorking || $route.path != '/wnr')}"
            variant="link"
            size="lg"
            toggle-class="text-decoration-none"
          >
            <i class="fa fa-chevron-left" id="Home"></i>
          </b-button>
        </router-link>
      </transition>
    </div>
    <transition name="fade" mode="out-in">
      <div
        id="controller-center"
        class="user-select-none electron-no-drag rest"
      >{{ $store.state.app.controllerCenterText }}</div>
    </transition>
    <div id="controller-right" class="user-select-none electron-no-drag lead rest">
      <a
        v-on:click="minimize()"
        v-if="(platform == 'electron' && this.$store.state.timer.isFocused == false && platform != 'darwin' && (this.$route.path == '/' || this.$route.path == '/wnr'))"
      >
        <b-button
          v-bind:class="{'work': ($store.state.timer.isWorking && $route.path == '/wnr'), 'rest': (!$store.state.timer.isWorking || $route.path != '/wnr')}"
          variant="link"
          size="lg"
          toggle-class="text-decoration-none"
        >
          <i class="fa fa-minus"></i>
        </b-button>
      </a>
      <a
        v-on:click="hide()"
        v-if="(platform == 'electron' && this.$store.state.timer.isFocused == false && platform != 'darwin' && (this.$route.path == '/' || this.$route.path == '/wnr'))"
      >
        <b-button
          v-bind:class="{'work': ($store.state.timer.isWorking && $route.path == '/wnr'), 'rest': (!$store.state.timer.isWorking || $route.path != '/wnr')}"
          variant="link"
          size="lg"
          toggle-class="text-decoration-none"
        >
          <i class="fa fa-caret-down"></i>
        </b-button>
      </a>
      <transition name="fade" mode="out-in">
        <b-dropdown
          size="lg"
          variant="link"
          toggle-class="text-decoration-none"
          no-caret
          dropleft
          v-if="this.$route.path=='/'"
          id="select"
        >
          <template slot="button-content">
            <i class="rest fa fa-bars"></i>
          </template>
          <b-dropdown-item>
            <router-link
              class="dropdown-item user-select-text electron-no-drag"
              to="/about"
            >{{ $t("app.about") }}</router-link>
          </b-dropdown-item>
          <b-dropdown-item>
            <router-link
              class="dropdown-item user-select-text electron-no-drag"
              to="/settings"
            >{{ $t("app.settings") }}</router-link>
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item>
            <a
              class="dropdown-item user-select-text electron-no-drag"
              v-on:click="onlyRestOptionsOpen()"
            >{{ $t("home.onlyRest") }}</a>
          </b-dropdown-item>
        </b-dropdown>
      </transition>
      <a
        href="javascript:window.close()"
        v-if="(platform == 'electron' && this.$store.state.timer.isFocused == false && platform != 'darwin')"
      >
        <b-button
          v-bind:class="{'work': ($store.state.timer.isWorking && $route.path == '/wnr'), 'rest': (!$store.state.timer.isWorking || $route.path != '/wnr')}"
          variant="link"
          size="lg"
          toggle-class="text-decoration-none"
        >
          <i class="fa fa-times"></i>
        </b-button>
      </a>
    </div>
    <div class="justify-content-center align-content-center electron-no-drag">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import { Plugins } from "@capacitor/core";
const { StatusBar, Device } = Plugins;
var ipc = null;
if (process.env.VUE_APP_LINXF == "electron") {
  ipc = window.require("electron").ipcRenderer; //use window.require instead of require
}
export default {
  data: function() {
    return {
      platform: process.env.VUE_APP_LINXF
    };
  },
  watch: {
    $route: function() {
      switch (this.$route.path) {
        case "/settings":
          this.$store.commit("setNowPage", this.$t("app.settings"));
          break;
        case "/about":
          this.$store.commit("setNowPage", this.$t("app.about"));
          break;
        default:
          this.$store.commit("setNowPage", "");
          break;
      }
    }
  },
  methods: {
    onlyRestOptionsOpen: function() {
      document.getElementById("only-rest-modal").style.visibility = "visible";
      document.getElementById("only-rest-modal").style.opacity = 1;
      document.getElementById("select").style.visibility = "hidden";
    },
    minimize: function() {
      if (process.env.VUE_APP_LINXF == "electron") {
        ipc.send("minimize");
      }
    },
    hide: function() {
      if (process.env.VUE_APP_LINXF == "electron") {
        ipc.send("hide");
      }
    }
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>