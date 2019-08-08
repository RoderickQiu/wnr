<template>
  <div class="about text-center">
    <p class="title-2 rest font-weight-bolder w-200 mx-auto">{{ $t("androidTips.need") }}1/2</p>
    <p
      class="title-3 rest font-weight-bolder w-200 mx-auto"
    >{{ $t("androidTips.backgroundRunning.title") }}</p>
    <p class="w-250">{{ $t("androidTips.backgroundRunning.notes") }}</p>
    <p class="small text-muted w-250">
      <strong>{{ $t("androidTips.backgroundRunning.tip") }}</strong>
    </p>
    <div
      class="small text-muted w-250"
    >{{ $t("androidTips.backgroundRunning.osSpecifiedTips.huawei") }}</div>
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
        to="/androidTips2"
        title="Next Tip"
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
      Opener.enterWhiteListSetting();
    }
  }
};
</script>