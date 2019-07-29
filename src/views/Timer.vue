<template>
  <div class="timer text-center">
    <div id="title" class="text-center h4">{{ title }}</div>
    <div id="timer-note" class="text-center small text-muted w-200">{{ notes }}</div>
    <div id="work-n-rest" class="text-center work">{{ $t("timer.working") }}</div>
    <div id="now-timing" class="text-center h1 work">
      {{ h }}
      {{ $t("timer.h") }}
      {{ min }}
      {{ $t("timer.min") }}
      {{ s }}
      {{ $t("timer.s") }}
    </div>
    <div id="backer" class="small text-muted" v-if="backer">{{ $t("timer.backer") }}</div>
    <div class="text-center h3">
      <b-button
        variant="link"
        size="lg"
        toggle-class="text-decoration-none"
        v-on:click="stopper()"
        id="stopper"
        class="text-muted"
      >
        <i class="fa fa-pause"></i>
      </b-button>
    </div>
    <div class="text-center" id="more-options">
      <b-button
        class="text-muted"
        variant="link"
        size="lg"
        toggle-class="text-decoration-none"
        v-on:click="skipper()"
      >
        <i class="fa fa-angle-double-right" id="skipper"></i>
      </b-button>
    </div>
  </div>
</template>

<script>
import { Plugins } from "@capacitor/core";
const { LocalNotifications, Haptics } = Plugins;
var ipc = null;
if (process.env.VUE_APP_LINXF == "electron") {
  ipc = window.require("electron").ipcRenderer; //use window.require instead of require
}
export default {
  data: function() {
    return {
      method: 1, //method1: workTime; method2: restTime
      timer: this.$store.state.timer,
      workTime: this.$store.state.timer.workTime,
      restTime: this.$store.state.timer.restTime,
      loop: this.$store.state.timer.loop,
      title: this.$store.state.timer.title,
      notes: this.$store.state.timer.notes,
      isFocusWork: this.$store.state.timer.isFocusWork,
      isFocusRest: this.$store.state.timer.isFocusRest,
      isOnlyRest: this.$store.state.timer.isOnlyRest, // all the timer things
      isFirstPeriod: true,
      isClockWorking: null,
      startTime: null,
      int: null, //int: interval variable
      nowTime: null,
      allTime: 0,
      h: null,
      min: null,
      s: null,
      times: 0, //times: how many loops have been here
      backer: false, //back link
      intTime: 250
    };
  },
  mounted: function() {
    if (process.env.VUE_APP_LINXF == "electron") {
      if (this.isFocusWork) {
        ipc.send("fullScreen");
      }
    }
    this.startTime = new Date().getTime();
    this.s = parseInt(this.workTime / 1000);
    this.h = parseInt(this.s / 3600);
    this.min = parseInt((this.s - this.h * 3600) / 60);
    this.s -= this.h * 3600 + this.min * 60;
    this.method = 1;
    if (!this.isOnlyRest) this.$store.commit("setIsWorking", true);
    this.isClockWorking = 1;
    this.int = self.setInterval(this.clock, this.intTime);
  },
  beforeDestroy: function() {
    window.clearInterval(this.int); //prevent still counting down in homepage
    if (process.env.VUE_APP_LINXF == "electron") {
      ipc.send("normalScreen"); //prevent still fullscreen
    }
  },
  methods: {
    localNotificationMessenger: function(title, body) {
      LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: 1,
            sound: null,
            attachments: null,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    },
    classModifier: function(queryClass, toClass) {
      var ops = document.querySelectorAll("." + queryClass);
      for (let p of ops) {
        p.classList.add(toClass);
        p.classList.remove(queryClass);
      }
    }, //to modify style by changing class
    stopper: function() {
      if (this.isClockWorking) {
        window.clearInterval(this.int);
        document.getElementById("stopper").innerHTML =
          "<i class='fa fa-play'></i>";
        this.isClockWorking = 0; //to stop
      } else {
        if (this.method == 1)
          this.startTime =
            new Date().getTime() -
            (this.workTime -
              this.h * 3600000 -
              this.min * 60000 -
              this.s * 1000);
        else
          this.startTime =
            new Date().getTime() -
            (this.restTime -
              this.h * 3600000 -
              this.min * 60000 -
              this.s * 1000);
        this.int = self.setInterval(this.clock, this.intTime);
        document.getElementById("stopper").innerHTML =
          "<i class='fa fa-pause'></i>";
        this.isClockWorking = 1; //to restart
      }
    },
    warningGiver: function(flag) {
      if (process.env.VUE_APP_LINXF == "android") {
        if (!this.isOnlyRest || (this.isOnlyRest && !this.isFirstPeriod))
          Haptics.vibrate();
      }
      if (flag == 1 && !this.isOnlyRest) {
        this.localNotificationMessenger(
          this.$t("timer.workTimeEnd.title"),
          this.$t("timer.workTimeEnd.body")
        );
        this.$store.commit("setIsWorking", false);
      } else if (flag == 2) {
        this.localNotificationMessenger(
          this.$t("timer.restTimeEnd.title"),
          this.$t("timer.restTimeEnd.body")
        );
        this.$store.commit("setIsWorking", true);
      } else if (flag == 0) {
        this.localNotificationMessenger(
          this.$t("timer.allTimeEnd.title"),
          this.$t("timer.allTimeEnd.body")
        );
        this.$store.commit("setIsWorking", false);
      }
      if (this.isFirstPeriod) this.isFirstPeriod = false;
      /*if (store.get("sound") == true || store.get("sound") == undefined) {
        var player = document.createElement("audio");
        if (isend != 0) {
          player.src = path.join(__dirname, "\\res\\sound\\timeend.wav");
        } else {
          player.src = path.join(__dirname, "\\res\\sound\\allend.wav");
        }
        player.play();
      } //different sound for different circumstances
      if (isend == 0) ipc.send("warninggiver-allend");
      else {
        if (isend == 1) ipc.send("warninggiver-workend");
        else ipc.send("warninggiver-restend");
        var t = setTimeout(stopper, 500);
        ipc.once("warning-closed", function() {
          stopper();
        });
      }*/
    },
    themeChanger: function() {
      if (this.method == 1) {
        this.classModifier("work", "rest");
        document.getElementById("work-n-rest").innerHTML = this.$t(
          "timer.resting"
        );
        this.method = 2;
        /*if (store.get("fullscreen") == true) {
          $("#controller").css("display", "none");
          $("#more-options").css("display", "none");
        } else if (store.get("fullscreen-work") == true) {
          if (process.platform != "darwin")
            $("#controller").css("display", "block");
          $("#more-options").css("display", "block");
        }*/
        this.warningGiver(1);
        if (process.env.VUE_APP_LINXF == "electron") {
          if (this.isFocusRest && !this.isFocusWork) {
            ipc.send("fullScreen");
          } else if (!this.isFocusRest && this.isFocusWork) {
            ipc.send("normalScreen");
          }
        }
      } else {
        this.classModifier("rest", "work");
        document.getElementById("work-n-rest").innerHTML = this.$t(
          "timer.working"
        );
        this.method = 1;
        /*if (process.platform != "darwin")
          $("#controller").css("display", "block");
        if (store.get("fullscreen-work") == true) {
          $("#controller").css("display", "none");
          $("#more-options").css("display", "none");
        } else if (store.get("fullscreen") == true) {
          $("#more-options").css("display", "block");
        }*/
        this.warningGiver(2);
        if (process.env.VUE_APP_LINXF == "electron") {
          if (this.isFocusWork && !this.isFocusRest) {
            ipc.send("fullScreen");
          } else if (!this.isFocusWork && this.isFocusRest) {
            ipc.send("normalScreen");
          }
        }
      }
    },
    ender: function() {
      this.isClockWorking = 0;
      this.backer = true;
      window.clearInterval(this.int);
      document.getElementById("work-n-rest").innerHTML =
        this.$t("timer.allTime.title") +
        "<strong>" +
        (parseInt(this.allTime / 60000) + 1) +
        this.$t("timer.min") +
        "</strong>";
      document.getElementById("work-n-rest").classList.add("text-muted");
      document.getElementById("now-timing").innerHTML = this.$t("timer.ended");
      this.isClockWorking = 0;
      //ipc.send("progress-bar-set", 2); //设置的是(1-message)，因而使用2才能得到-1
      /*if (process.platform != "darwin")
        $("#controller").css("display", "block");*/
      //$("#backer").css("display", "block");
      document.getElementById("stopper").style.display = "none";
      document.getElementById("more-options").style.display = "none";
      this.warningGiver(0);
      if (process.env.VUE_APP_LINXF == "electron") {
        if (this.isFocusRest) {
          ipc.send("normalScreen");
        }
      }
    },
    skipper: function() {
      if (!this.isClockWorking) this.stopper();
      this.times++;
      this.allTime += this.nowTime - this.startTime;
      this.startTime = new Date().getTime();
      if (this.times < this.loop * 2) {
        this.themeChanger();
      } else if (this.times == this.loop * 2) {
        this.ender();
      }
    },
    clock: function() {
      this.nowTime = new Date().getTime();
      if (this.method == 1)
        this.s = parseInt(
          (this.workTime + this.startTime - this.nowTime) / 1000
        );
      else
        this.s = parseInt(
          (this.restTime + this.startTime - this.nowTime) / 1000
        );
      this.h = parseInt(this.s / 3600);
      this.min = parseInt((this.s - this.h * 3600) / 60);
      this.s -= this.h * 3600 + this.min * 60;
      if (this.s == 0 && this.min == 0 && this.h == 0) this.skipper();
      /*if (min == 0 && morethan1 && h == 0) {
          if (store.get("onemintip") != false) ipc.send("1min");
          morethan1 = 0;
        }*/
    } //the countdown for wnr
  }
};
</script>