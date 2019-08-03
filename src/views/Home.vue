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
      <div class="text-center justify-content-center">
        <b-button
          variant="outline-primary"
          pill
          class="s-input-button-primary w-165"
          v-on:click="submit()"
        >{{ $t("home.starterTip") }}</b-button>
        <!-- submit button -->
        &nbsp;
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
    <!-- time sum show + illegal input tip -->
    <div id="only-rest-modal">
      <div
        id="controller-center"
        class="user-select-none electron-no-drag rest"
      >{{ $t("home.onlyRest") }}</div>
      <div id="controller-right" class="user-select-none electron-no-drag lead rest">
        <a v-on:click="onlyRestOptionsClose()">
          <b-button class="rest" variant="link" size="lg" toggle-class="text-decoration-none">
            <i class="fa fa-times"></i>
          </b-button>
        </a>
      </div>
      <div id="only-rest-container" class="justify-content-center align-items-center">
        <input
          id="only-rest"
          type="number"
          v-bind:placeholder="$t('home.placeholder.restTime')"
          v-model="onlyRestTime"
          v-on:keyup="inputSafetyCheckOnlyRest(0)"
          class="small s-input w-250 s-input-border-bottom s-input-number"
          oninput="if (value.length > 4) value = value.slice(0, 4)"
          style="ime-mode:Disabled"
        />
        <br />
        <br />
        <div class="align-items-center">
          <p>
            <b-button
              variant="outline-primary"
              v-on:click="onlyRest"
              size="sm"
              pill
              class="s-input-button-primary w-144"
            >{{ $t("home.starterTip") }}</b-button>&nbsp;&nbsp;
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
          </p>
        </div>
        <div class="w-250 text-center m-auto font-weight-bold work small" v-if="illegalOnlyRest">
          {{ $t("home.illegalInput") }}
          <br />
          {{ illegalReason }}
        </div>
      </div>
    </div>
    <!-- more sections -->
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
    this.$store.commit("setIsFocused", false);
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
    Storage.get({ key: "is1MinTip" }).then(data => {
      if (data.value == null) {
        this.is1MinTip = "true";
      }
    }); // 1 min left tip
    Storage.get({ key: "defaultWorkTime" }).then(data => {
      if (data.value != null && data.value != "") {
        this.workTime = Number(data.value);
      }
    });
    Storage.get({ key: "defaultRestTime" }).then(data => {
      if (data.value != null && data.value != "") {
        this.restTime = Number(data.value);
        this.onlyRestTime = Number(data.value);
      }
    });
    Storage.get({ key: "defaultLoop" }).then(data => {
      if (data.value != null && data.value != "") {
        this.loop = Number(data.value);
      }
    });
  },
  methods: {
    onlyRestOptionsClose: function() {
      document.getElementById("only-rest-modal").style.visibility = "hidden";
      document.getElementById("only-rest-modal").style.opacity = 0;
      document.getElementById("select").style.visibility = "visible";
    },
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
        this.$store.commit("setIsFocusRest", this.isFocusRest);
        this.$router.push("/wnr");
      }
    }
  }
};
</script>
