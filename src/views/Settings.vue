<template>
  <div class="settings text-center">
    <div id="settings-container" class="electron-no-drag user-select-text s-scroll">
      <settings-item
        inputType="text"
        classBind="s-input-border-bottom"
        placeholderMessage="--"
        v-bind:defaultValue="itemsList[0].val"
        itemBind="defaultWorkTime"
      ></settings-item>
      <settings-item
        inputType="text"
        classBind="s-input-border-bottom"
        placeholderMessage="--"
        v-bind:defaultValue="itemsList[1].val"
        itemBind="defaultRestTime"
      ></settings-item>
      <settings-item
        inputType="text"
        classBind="s-input-border-bottom"
        placeholderMessage="--"
        v-bind:defaultValue="itemsList[2].val"
        itemBind="defaultLoop"
      ></settings-item>
    </div>
    <b-button
      variant="outline-primary"
      class="w-165"
      pill
      v-on:click="submit()"
    >{{ $t("settings.submit") }}</b-button>
    <br />
    <br />
    <span class="work" v-if="illegal">{{ $t("home.illegalInput") }}</span>
  </div>
</template>
<script>
import SettingsItem from "../components/SettingsItem";
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;
export default {
  components: {
    SettingsItem
  },
  data: function() {
    return {
      itemsList: [
        { name: "defaultWorkTime", val: "", checkMode: 1 },
        { name: "defaultRestTime", val: "", checkMode: 1 },
        { name: "defaultLoop", val: "", checkMode: 1 }
      ],
      illegal: false
    };
  },
  mounted: function() {
    for (var i = 0; i < this.itemsList.length; i++) {
      let theItemName = this.itemsList[i].name;
      Storage.get({ key: theItemName }).then(data => {
        document.getElementById(theItemName).value = data.value;
      });
    }
  },
  methods: {
    inputSafetyCheck: function(mode, val) {
      if (mode == 1) {
        let theVal = Number(val);
        if (
          isNaN(theVal) ||
          theVal <= 0 ||
          String(theVal).indexOf(".") != -1 ||
          theVal >= 1440
        ) {
          return false;
        }
      }
      return true;
    },
    submit: function() {
      let flag = true;
      for (var i = 0; i < this.itemsList.length; i++) {
        if (
          this.inputSafetyCheck(
            this.itemsList[i].checkMode,
            document.getElementById(this.itemsList[i].name).value
          )
        )
          Storage.set({
            key: this.itemsList[i].name,
            value: document.getElementById(this.itemsList[i].name).value
          });
        else flag = false;
      }
      if (flag) this.$router.push("/");
      else this.illegal = true;
    }
  }
};
</script>
