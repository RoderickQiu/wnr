<template>
  <div class="home">
    <div class="justify-content-start align-content-center" id="home-input">
      <div id="emptyContainer">
        <br />
        <br />
        <br />
        <br />
      </div>
      <input
        name="title"
        id="title"
        type="text"
        class="small s-input text-muted s-input-border-bottom w200 s-input-border-bottom"
        maxlength="13"
        v-bind:placeholder="$t('home.placeholder.title')"
      />
      <br />
      <br />
      <input
        name="work-time"
        id="work-time"
        type="number"
        onkeyup="allSet()"
        oninput="if (value.length > 4) value = value.slice(0, 4)"
        style="ime-mode:Disabled"
        class="work s-input s-input-number lead w165 s-input-border-bottom"
        autofocus
        required
        v-bind:placeholder="$t('home.placeholder.workTime')"
      />
      &nbsp;
      <input
        id="focus-work-set"
        type="checkbox"
        class="s-input s-input-check"
        onchange="focusworkset()"
      />
      <span class="focuser extreme-small work">
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
        onkeyup="allSet()"
        oninput="if (value.length > 4) value = value.slice(0, 4)"
        style="ime-mode:Disabled"
        class="rest lead s-input s-input-number w165 s-input-border-bottom"
        required
        v-bind:placeholder="$t('home.placeholder.restTime')"
      />
      &nbsp;
      <input
        id="focus-rest-set"
        type="checkbox"
        class="s-input s-input-check"
        onchange="fullscreenset()"
      />
      <span class="focuser extreme-small rest">
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
        onkeyup="allSet()"
        oninput="if (value.length > 4) value = value.slice(0, 4)"
        style="ime-mode:Disabled"
        class="small s-input s-input-number w200 s-input-border-bottom"
        required
        v-bind:placeholder="$t('home.placeholder.loops')"
      />
      <br />
      <br />
      <!-- control that only numbers are OK -->
      <input
        name="note"
        id="note"
        type="text"
        class="small text-muted s-input w200 s-input-border-bottom"
        maxlength="39"
        v-bind:placeholder="$t('home.placeholder.notes')"
      />
      <br />
      <br />
      <div class="text-center">
        <b-button
          variant="outline-primary"
          pill
          class="s-input-button-primary w165"
        >{{ $t("home.starterTip") }}</b-button>
      </div>
      <br />
    </div>
    <div class="text-center align-items-center">
      <div id="all-sum" class="small font-weight-bold text-muted">
        <br />
        <br />
        {{ $t("home.allSum1") }}
        <span id="allsum-num">---</span>
        {{ $t("home.allSum2") }}
        <span id="to-num-h">--</span>:
        <span id="to-num-min">--</span>
      </div>
      <br />
      <br />
    </div>
  </div>
</template>
