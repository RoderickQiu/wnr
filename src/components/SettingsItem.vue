<template>
  <div class="settings-item">
    <div class="row w-100">
      <label class="col-10 text-left" v-html="title"></label>
      <s-input
        class="col-2 text-center"
        v-bind:placeholderMessage="this.config.placeholderMessage"
        v-bind:defaultValue="this.config.val"
        v-bind:classBind="this.config.classBind"
        v-bind:inputType="this.config.type"
        v-bind:itemBind="this.config.name"
      ></s-input>
      <div class="w-100"></div>
      <div class="settings-note small text-muted text-left col-12" v-html="notes"></div>
    </div>
    <br />
  </div>
</template>

<script>
import SInput from "./SInput";
export default {
  name: "SettingsItem",
  props: {
    config: {
      type: Object,
      default: {
        name: "",
        val: "",
        checkMode: "",
        type: "",
        placeholderMessage: "",
        classBind: ""
      }
    }
  },
  components: {
    SInput
  },
  data: function() {
    return {
      title: this.$t("settings." + this.config.name),
      notes: this.$t("settings." + this.config.name + "Message")
    };
  }
};
</script>