<template>
  <div class="settings-item">
    <div class="row w-100">
      <label class="col-10 text-left" v-html="title"></label>
      <s-input
        class="col-2 text-center"
        v-bind:placeholderMessage="this.placeholderMessage"
        v-bind:defaultValue="this.defaultValue"
        v-bind:classBind="this.classBind"
        v-bind:inputType="this.inputType"
        v-bind:itemBind="this.itemBind"
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
    placeholderMessage: {
      type: String,
      default: ""
    },
    defaultValue: {
      type: String,
      default: ""
    },
    inputType: {
      type: String,
      default: ""
    },
    classBind: {
      type: String,
      default: ""
    },
    itemBind: {
      type: String,
      default: ""
    }
  },
  components: {
    SInput
  },
  data: function() {
    return {
      title: this.$t("settings." + this.itemBind),
      notes: this.$t("settings." + this.itemBind + "Message")
    };
  }
};
</script>