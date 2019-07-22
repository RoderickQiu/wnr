<template>
  <div
    id="app"
    class="d-flex mx-auto justify-content-center align-items-center text-dark user-select-text"
  >
    <div id="controller-left" class="user-select-none electron-no-drag lead rest">
      <transition name="fade" mode="out-in">
        <router-link to="/" title="Home" v-if="this.$route.path!='/'">
          <b-button class="rest" variant="link" size="lg" toggle-class="text-decoration-none">
            <i class="fa fa-chevron-left" id="Home"></i>
          </b-button>
        </router-link>
      </transition>
    </div>
    <div id="controller-right" class="user-select-none electron-no-drag lead rest">
      <transition name="fade" mode="out-in">
        <b-dropdown
          size="lg"
          variant="link"
          toggle-class="text-decoration-none"
          no-caret
          dropleft
          v-if="this.$route.path=='/'"
        >
          <template slot="button-content" class="rest">
            <i class="fa fa-bars"></i>
          </template>
          <b-dropdown-item>
            <router-link
              class="dropdown-item user-select-text electron-no-drag"
              to="/about"
            >{{ $t("app.about") }}</router-link>
          </b-dropdown-item>
        </b-dropdown>
      </transition>
      <span v-if="platform=='electron'">&nbsp;&nbsp;</span>
      <a href="javascript:window.close()" v-if="platform=='electron'">
        <b-button class="rest" variant="link" size="lg" toggle-class="text-decoration-none">
          <i class="fa fa-times" id="Exit"></i>
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
export default {
  data: function() {
    return {
      platform: process.env.VUE_APP_LINXF
    };
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
