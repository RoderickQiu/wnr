<template>
  <input
    v-bind:placeholder="this.placeholderMessage"
    v-bind:value="this.defaultValue"
    class="s-input"
    v-bind:class="this.classBindList"
    v-bind:type="this.inputType"
    v-bind:id="this.itemBind"
  />
</template>

<script>
export default {
  name: "SInput",
  props: {
    placeholderMessage: String,
    defaultValue: String,
    inputType: String,
    classBind: {
      type: String,
      default: ""
    },
    itemBind: {
      type: String,
      default: ""
    }
  },
  computed: {
    classBindList: function() {
      return {
        "s-input-number": this.inputType == "number",
        "s-input-check": this.inputType == "checkbox",
        "s-input-range": this.inputType == "range",
        "s-input-other": this.classBind.indexOf("s-input-other") != -1,
        "s-input-button-primary btn":
          this.classBind.indexOf("s-input-button-primary") != -1,
        "s-input-border-bottom":
          this.classBind.indexOf("s-input-border-bottom") != -1
      };
    }
  }
};
</script>