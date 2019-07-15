<template>
  <div
    id="app"
    class="d-flex mx-auto justify-content-center align-items-center text-dark electronUserSelectText"
  >
    <div id="controllerLeft" class="electronUserSelectNone electronNoDrag lead rest">
      <router-link to="/" title="Home" v-if="this.$route.path!='/'">
        <b-button class="rest" variant="link" size="lg" toggle-class="text-decoration-none">
          <i class="fa fa-chevron-left" id="Home"></i>
        </b-button>
      </router-link>
    </div>
    <div id="controllerRight" class="electronUserSelectNone electronNoDrag lead rest">
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
          <router-link class="dropdown-item electronUserSelectText electronNoDrag" to="/about">About</router-link>
        </b-dropdown-item>
      </b-dropdown>
      <span v-if="platform=='electron'">&nbsp;&nbsp;</span>
      <a href="javascript:window.close()" v-if="platform=='electron'">
        <b-button class="rest" variant="link" size="lg" toggle-class="text-decoration-none">
          <i class="fa fa-times" id="Exit"></i>
        </b-button>
      </a>
    </div>
    <div class="justify-content-center align-content-center text-center electronNoDrag">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      platform: process.env.VUE_APP_LINXF
    };
  }
};
</script>
