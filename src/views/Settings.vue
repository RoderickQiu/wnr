<template>
  <div class="settings text-center">
    <div id="settings-container" class="electron-no-drag user-select-text s-scroll">
      <settings-item v-bind:config="itemsList[0]"></settings-item>
      <settings-item v-bind:config="itemsList[1]"></settings-item>
      <settings-item v-bind:config="itemsList[2]"></settings-item>
      <settings-item v-bind:config="itemsList[3]"></settings-item>
    </div>
    <div class="all-sum">
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
        {
          name: "defaultWorkTime",
          val: "",
          checkMode: 1,
          type: "text",
          placeholderMessage: "--",
          classBind: "s-input-border-bottom"
        },
        {
          name: "defaultRestTime",
          val: "",
          checkMode: 1,
          type: "text",
          placeholderMessage: "--",
          classBind: "s-input-border-bottom"
        },
        {
          name: "defaultLoop",
          val: "",
          checkMode: 2,
          type: "text",
          placeholderMessage: "--",
          classBind: "s-input-border-bottom"
        },
        {
          name: "oneMinTip",
          val: "true",
          checkMode: 3,
          type: "text",
          placeholderMessage: "--",
          classBind: "s-input-border-bottom"
        }
      ],
      illegal: false
    };
  },
  mounted: function() {
    for (var i = 0; i < this.itemsList.length; i++) {
      let theItemName = this.itemsList[i].name;
      let theItemType = this.itemsList[i].type;
      Storage.get({ key: theItemName }).then(data => {
        if (data.value != null) {
          document.getElementById(theItemName).value = String(data.value);
        }
      });
    }
  },
  methods: {
    inputSafetyCheck: function(mode, val) {
      if (mode == 1) {
        let theVal = Number(val);
        if (
          isNaN(theVal) ||
          theVal < 0 ||
          String(theVal).indexOf(".") != -1 ||
          theVal >= 1440
        ) {
          return false;
        }
      } else if (mode == 2) {
        let theVal = Number(val);
        if (
          isNaN(theVal) ||
          theVal < 0 ||
          String(theVal).indexOf(".") != -1 ||
          theVal >= 20
        ) {
          return false;
        }
      } else if (mode == 3) {
        let theVal = String(val);
        if (theVal != "true" && theVal != "false" && theVal != "") return false;
      }
      return true;
    },
    submit: function() {
      let flag = true;
      for (var i = 0; i < this.itemsList.length; i++) {
        if (
          document.getElementById(this.itemsList[i].name).value == "0" ||
          document.getElementById(this.itemsList[i].name).value == ""
        )
          Storage.remove({
            key: this.itemsList[i].name
          });
        else if (
          this.inputSafetyCheck(
            this.itemsList[i].checkMode,
            document.getElementById(this.itemsList[i].name).value
          )
        )
          Storage.set({
            key: this.itemsList[i].name,
            value: String(document.getElementById(this.itemsList[i].name).value)
          });
        else flag = false;
      }
      if (flag) this.$router.push("/");
      else this.illegal = true;
    }
  }
};
</script>
