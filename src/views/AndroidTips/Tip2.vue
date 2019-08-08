<template>
  <div class="about text-center">
    <p class="title-2 rest font-weight-bolder w-200 mx-auto">{{ $t("androidTips.need") }}2/2</p>
    <p
      class="title-3 rest font-weight-bolder w-200 mx-auto"
    >{{ $t("androidTips.lockNotification.title") }}</p>
    <p class="w-250">{{ $t("androidTips.lockNotification.notes") }}</p>
    <p class="small text-muted w-250">
      <strong>{{ $t("androidTips.lockNotification.tip") }}</strong>
    </p>
    <div
      class="small text-muted w-250"
    >{{ $t("androidTips.lockNotification.osSpecifiedTips.huawei") }}</div>
    <br />
    <transition name="fade" mode="out-in">
      <b-button
        variant="outline-primary"
        pill
        class="s-input-button-primary w-165"
        v-on:click="nowDo()"
      >{{ $t("androidTips.nowDo") }}</b-button>
    </transition>
    <br />
    <br />
    <transition name="fade" mode="out-in">
      <router-link
        to="/"
        title="Home"
        id="finishedLink"
        class="w-165 mx-auto rest small"
      >{{ $t("androidTips.finished") }}</router-link>
    </transition>
  </div>
</template>

<script>
import { Plugins } from "@capacitor/core";
const { Opener } = Plugins;
export default {
  mounted: function() {
    this.$store.commit("setAndroidTips", true);
  },
  methods: {
    nowDo: function() {
      Opener.enterNotificationSetting();
    }
  }
};
</script>