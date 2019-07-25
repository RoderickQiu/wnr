<template>
  <div class="about text-center">
    <p
      class="title-2 rest font-weight-bolder w-200 mx-auto"
    >{{ $t("androidTips.backgroundRunning.title") }}</p>
    <p class="info w-250">{{ $t("androidTips.backgroundRunning.notes") }}</p>
    <div
      class="small text-muted w-250"
    >{{ $t("androidTips.backgroundRunning.osSpecifiedTips.huawei") }}</div>
    <br />
    <transition name="fade" mode="out-in">
      <router-link
        to="/"
        title="Home"
        id="finishedLink"
        class="w-165 mx-auto"
      >{{ $t("androidTips.finished") }}</router-link>
    </transition>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      finishedTimeOutCounter: 0,
      int: null
    };
  },
  mounted: function() {
    document.getElementById("finishedLink").style.display = "none";
    this.int = setTimeout(function() {
      document.getElementById("finishedLink").style.display = "block";
    }, 3000);
  },
  beforeDestroy: function() {
    window.clearTimeout(this.int);
  }
};
</script>