<template>
  <div class="home">
    <div class="justify-content-start align-content-center" id="home-input">
      <div id="empty-container">
        <br />
        <br />
        <br />
        <br />
      </div>
      <input
        name="title"
        id="title"
        type="text"
        v-model="title"
        class="small s-input text-muted s-input-border-bottom w-250 s-input-border-bottom"
        maxlength="13"
        v-bind:placeholder="$t('home.placeholder.title')"
      />
      <!-- title set -->
      <br />
      <br />
      <input
        name="work-time"
        id="work-time"
        type="number"
        v-on:keyup="allSet"
        v-model="workTime"
        oninput="if (value.length > 4) value = value.slice(0, 4)"
        style="ime-mode:Disabled"
        class="work work-rest-input s-input s-input-number s-input-border-bottom"
        v-bind:class="{ 'w-200': notWeb, 'w-250': (!notWeb) }"
        autofocus
        required
        v-bind:placeholder="$t('home.placeholder.workTime')"
      />
      <!-- work time set -->
      &nbsp;
      <input
        id="focus-work-set"
        type="checkbox"
        class="s-input s-input-check"
        v-model="isFocusWork"
        v-if="notWeb"
      />
      <span class="focuser extreme-small work" v-if="notWeb">
        {{ $t("home.awayFromDevice.1") }}
        <br />
        {{ $t("home.awayFromDevice.2") }}
      </span>
      <!-- focus mode for work time -->
      <br />
      <br />
      <input
        name="rest-time"
        id="rest-time"
        type="number"
        v-on:keyup="allSet"
        v-model="restTime"
        oninput="if (value.length > 4) value = value.slice(0, 4)"
        style="ime-mode:Disabled"
        class="rest work-rest-input s-input s-input-number s-input-border-bottom"
        v-bind:class="{ 'w-200': notWeb, 'w-250': (!notWeb) }"
        required
        v-bind:placeholder="$t('home.placeholder.restTime')"
      />
      <!-- rest time set -->
      &nbsp;
      <input
        id="focus-rest-set"
        type="checkbox"
        class="s-input s-input-check"
        v-model="isFocusRest"
        v-if="notWeb"
      />
      <span class="focuser extreme-small rest" v-if="notWeb">
        {{ $t("home.awayFromDevice.1") }}
        <br />
        {{ $t("home.awayFromDevice.2") }}
      </span>
      <!-- focus mode for rest time -->
      <br />
      <br />
      <input
        name="loop"
        id="loop"
        type="number"
        v-on:keyup="allSet"
        v-model="loop"
        oninput="if (value.length > 4) value = value.slice(0, 4)"
        style="ime-mode:Disabled"
        class="small s-input s-input-number w-250 s-input-border-bottom"
        required
        v-bind:placeholder="$t('home.placeholder.loop')"
      />
      <!-- loops set -->
      <br />
      <br />
      <!-- control that only numbers are OK -->
      <input
        name="note"
        id="note"
        type="text"
        v-model="notes"
        class="small text-muted s-input w-250 s-input-border-bottom"
        maxlength="39"
        v-bind:placeholder="$t('home.placeholder.notes')"
      />
      <!-- notes set -->
      <br />
      <br />
      <div class="text-center">
        <b-button
          variant="outline-primary"
          pill
          class="s-input-button-primary w-165"
          v-on:click="submit()"
        >{{ $t("home.starterTip") }}</b-button>
        <!-- submit button -->
        <b-dropdown variant="link" toggle-class="text-decoration-none" no-caret right>
          <template slot="button-content" class="rest">
            <i class="fa fa-sort-desc"></i>
          </template>
          <b-dropdown-text>{{ $t("home.onlyRest") }}</b-dropdown-text>
          <b-dropdown-form>
            <b-form-group @submit.stop.prevent>
              <input
                id="only-rest"
                type="number"
                v-bind:placeholder="$t('home.placeholder.restTime')"
                v-model="onlyRestTime"
                v-on:keyup="inputSafetyCheckOnlyRest(0)"
                class="small s-input w-250 s-input-border-bottom"
                oninput="if (value.length > 4) value = value.slice(0, 4)"
                style="ime-mode:Disabled"
              />
            </b-form-group>
            <b-button
              variant="outline-primary"
              size="sm"
              v-on:click="onlyRest"
              pill
              block
            >{{ $t("home.starterTip") }}</b-button>
            <b-dropdown-text class="text-center">
              <strong class="work extreme-small" v-if="illegalOnlyRest">
                {{ $t("home.illegalInput") }}
                {{ illegalReason }}
              </strong>
            </b-dropdown-text>
          </b-dropdown-form>
        </b-dropdown>
        <!-- more sections -->
      </div>
      <br />
    </div>
    <div class="text-center align-items-center">
      <div id="all-sum" class="small font-weight-bold text-muted">
        <br />
        <br />
        {{ $t("home.allSum.1") }}
        {{ allSumNum }}
        {{ $t("home.allSum.2") }}
        {{ toNumH }} : {{ toNumMin }}
        <br />
        <span class="work" v-if="illegal">
          {{ $t("home.illegalInput") }}
          <br />
          {{ illegalReason }}
        </span>
      </div>
      <br />
      <br />
    </div>
    <!-- time sum show -->
  </div>
</template>

<script>
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;
export default {
  data: function() {
    return {
      title: "",
      notes: "",
      loop: "",
      restTime: "",
      workTime: "",
      allSumNum: "---",
      toNumH: "--",
      toNumMin: "--",
      isFocusWork: false,
      isFocusRest: false,
      illegal: false,
      illegalOnlyRest: false,
      illegalReason: "",
      notWeb: false,
      onlyRestTime: ""
    };
  },
  mounted: function() {
    if (process.env.VUE_APP_LINXF == "web") this.notWeb = false;
    else this.notWeb = true;
    if (process.env.VUE_APP_LINXF == "android") {
      Storage.get({ key: "isAndroidTipsShown" }).then(data => {
        if (data.value == null) {
          Storage.set({ key: "isAndroidTipsShown", value: "true" }); //value only string ok
          this.$router.push("/androidTips1");
        }
      }); //android first time tip
    }
    Storage.get({ key: "defaultWorkTime" }).then(data => {
      if (data.value != null && data.value != "") {
        this.workTime = data.value;
      }
    });
    Storage.get({ key: "defaultRestTime" }).then(data => {
      if (data.value != null && data.value != "") {
        this.restTime = data.value;
        this.onlyRestTime = data.value;
      }
    });
    Storage.get({ key: "defaultLoop" }).then(data => {
      if (data.value != null && data.value != "") {
        this.loop = data.value;
      }
    });
  },
  methods: {
    clearer: function() {
      this.allSumNum = "---";
      this.toNumH = "--";
      this.toNumMin = "--";
    },
    sumGet: function() {
      var timeCnt =
        (Number(this.workTime) + Number(this.restTime)) * Number(this.loop);
      this.allSumNum = parseInt(timeCnt);
      var myDate = new Date();
      var h = myDate.getHours() + Number(timeCnt / 60);
      var min = myDate.getMinutes() + Number(timeCnt % 60);
      if (min >= 60) (min -= 60), h++;
      while (h >= 24) h -= 24;
      this.toNumH = parseInt(h);
      if (min >= 10) this.toNumMin = parseInt(min);
      else this.toNumMin = "0" + parseInt(min);
    },
    inputSafetyCheck: function(mode) {
      if (
        isNaN(this.workTime) ||
        isNaN(this.restTime) ||
        isNaN(this.loop) ||
        this.workTime == "" ||
        this.restTime == "" ||
        this.loop == ""
      ) {
        if (mode == 1) {
          this.illegal = true;
          this.illegalReason = this.$t("home.illegalReason.badContent");
        }
        return false;
      }
      if (this.workTime) this.workTime = Number(this.workTime);
      if (this.restTime) this.restTime = Number(this.restTime);
      if (this.loop) this.loop = Number(this.loop);
      if (
        this.workTime <= 0 ||
        this.restTime <= 0 ||
        this.loop <= 0 ||
        String(Number(this.workTime)).indexOf(".") != -1 ||
        String(Number(this.restTime)).indexOf(".") != -1 ||
        String(Number(this.loop)).indexOf(".") != -1
      ) {
        if (mode == 1) {
          this.illegal = true;
          this.illegalReason = this.$t("home.illegalReason.badContent");
        }
        return false;
      }
      if (this.workTime >= 1440 || this.restTime >= 1440 || this.loop >= 20) {
        if (mode == 1) {
          this.illegal = true;
          this.illegalReason = this.$t("home.illegalReason.tooBig");
        }
        return false;
      }
      this.illegal = false;
      return true;
    },
    allSet: function() {
      if (this.inputSafetyCheck(0)) this.sumGet();
      else this.clearer();
    },
    submit: function() {
      if (this.inputSafetyCheck(1)) {
        this.$store.commit("setTimer", {
          workTime: this.workTime * 60000,
          restTime: this.restTime * 60000,
          loop: this.loop,
          title: this.title,
          notes: this.notes
        });
        this.$store.commit("setIsOnlyRest", false);
        this.$store.commit("setIsFocusWork", this.isFocusWork);
        this.$store.commit("setIsFocusRest", this.isFocusRest);
        this.$router.push("/wnr");
      }
    },
    inputSafetyCheckOnlyRest: function(mode) {
      if (isNaN(this.onlyRestTime || this.onlyRestTime == "")) {
        if (mode == 1) {
          this.illegalOnlyRest = true;
          this.illegalReason = this.$t("home.illegalReason.badContent");
        }
        return false;
      }
      if (this.onlyRestTime) this.onlyRestTime = Number(this.onlyRestTime);
      if (
        this.onlyRestTime <= 0 ||
        String(Number(this.onlyRestTime)).indexOf(".") != -1
      ) {
        if (mode == 1) {
          this.illegalOnlyRest = true;
          this.illegalReason = this.$t("home.illegalReason.badContent");
        }
        return false;
      }
      if (this.onlyRestTime >= 1440) {
        if (mode == 1) {
          this.illegalOnlyRest = true;
          this.illegalReason = this.$t("home.illegalReason.tooBig");
        }
        return false;
      }
      this.illegalOnlyRest = false;
      return true;
    },
    onlyRest: function() {
      if (this.inputSafetyCheckOnlyRest(1)) {
        this.$store.commit("setTimer", {
          workTime: 0,
          restTime: this.onlyRestTime * 60000,
          loop: 1,
          title: "",
          notes: ""
        });
        this.$store.commit("setIsOnlyRest", true);
        this.$router.push("/wnr");
      }
    }
  }
};
</script>
