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
        class="small s-input text-muted s-input-border-bottom w-200 s-input-border-bottom"
        maxlength="13"
        v-bind:placeholder="$t('home.placeholder.title')"
      />
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
        class="work s-input s-input-number lead s-input-border-bottom"
        v-bind:class="{ 'w-165': notWeb, 'w-200': (!notWeb) }"
        autofocus
        required
        v-bind:placeholder="$t('home.placeholder.workTime')"
      />
      &nbsp;
      <input
        id="focus-work-set"
        type="checkbox"
        class="s-input s-input-check"
        v-on:click="focusWorkSet"
        v-model="isFocusWork"
        v-if="notWeb"
      />
      <span class="focuser extreme-small work" v-if="notWeb">
        {{ $t("home.awayFromDevice1") }}
        <br />
        {{ $t("home.awayFromDevice2") }}
      </span>
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
        class="rest lead s-input s-input-number s-input-border-bottom"
        v-bind:class="{ 'w-165': notWeb, 'w-200': (!notWeb) }"
        required
        v-bind:placeholder="$t('home.placeholder.restTime')"
      />
      &nbsp;
      <input
        id="focus-rest-set"
        type="checkbox"
        class="s-input s-input-check"
        v-on:click="focusRestSet"
        v-model="isFocusRest"
        v-if="notWeb"
      />
      <span class="focuser extreme-small rest" v-if="notWeb">
        {{ $t("home.awayFromDevice1") }}
        <br />
        {{ $t("home.awayFromDevice2") }}
      </span>
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
        class="small s-input s-input-number w-200 s-input-border-bottom"
        required
        v-bind:placeholder="$t('home.placeholder.loop')"
      />
      <br />
      <br />
      <!-- control that only numbers are OK -->
      <input
        name="note"
        id="note"
        type="text"
        v-model="notes"
        class="small text-muted s-input w-200 s-input-border-bottom"
        maxlength="39"
        v-bind:placeholder="$t('home.placeholder.notes')"
      />
      <br />
      <br />
      <div class="text-center">
        <b-button
          variant="outline-primary"
          pill
          class="s-input-button-primary w-165"
          v-on:click="submit"
        >{{ $t("home.starterTip") }}</b-button>
      </div>
      <br />
    </div>
    <div class="text-center align-items-center">
      <div id="all-sum" class="small font-weight-bold text-muted">
        <br />
        <br />
        {{ $t("home.allSum1") }}
        {{ allSumNum }}
        {{ $t("home.allSum2") }}
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
  </div>
</template>

<script>
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
      illegalReason: "",
      notWeb: false
    };
  },
  created: function() {
    if (process.env.VUE_APP_LINXF == "web") this.notWeb = false;
    else this.notWeb = true;
  },
  methods: {
    clearer: function() {
      this.allSumNum = "---";
      this.toNumH = "--";
      this.toNumMin = "--";
    },
    sumGet: function() {
      var timeCnt =
        Number(this.workTime) + Number(this.restTime) * Number(this.loop);
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
      if (isNaN(this.workTime) || isNaN(this.restTime) || isNaN(this.loop)) {
        if (mode == 1) {
          this.illegal = true;
          this.illegalReason = this.$t("home.illegalReason.badContent");
        }
        return false;
      }
      if (this.workTime == "" || this.restTime == "" || this.loop == "") {
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
      if (
        this.workTime >= 1440 ||
        this.restTime >= 1440 ||
        this.loop >= 1440 ||
        String(Number(this.workTime)).indexOf(".") != -1 ||
        String(Number(this.restTime)).indexOf(".") != -1 ||
        String(Number(this.loop)).indexOf(".") != -1
      ) {
        if (mode == 1) {
          this.illegal = true;
          this.illegalReason = this.$t("home.illegalReason.tooBig");
        }
        return false;
      }
      if ((this.workTime + this.restTime) * this.loop >= 1440) {
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
    focusWorkSet: function() {
      this.$store.commit("setIsFocusWork", this.isFocusWork);
    },
    focusRestSet: function() {
      this.$store.commit("setIsFocusRest", this.isFocusRest);
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
        this.$router.push("/wnr");
      }
    }
  }
};
</script>
