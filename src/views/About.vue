<template>
  <div class="about">
    <img src="../assets/wnrIcon.png" width="60px" />
    <br />
    <br />
    <p class="title-2 rest font-weight-bolder">wnr</p>
    <p class="text-muted">v{{ version }}</p>
    <p class="info">
      <a class="rest" :href="Homepage()" target="_blank">
        <i class="fa fa-home" id="homepage"></i>
      </a>&nbsp;&nbsp;
      <a class="rest" :href="OnGithub()" target="_blank">
        <i class="fa fa-github" id="onGithub"></i>
      </a>&nbsp;&nbsp;
      <a class="rest" :href="Issues()" target="_blank">
        <i class="fa fa-exclamation-circle" id="issues"></i>
      </a>
    </p>
    <p class="small">
      <a class="rest" :href="Acknoledgements()" target="_blank">Acknoledgements</a>
    </p>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      version: require("../../package.json").version
    };
  },
  methods: {
    Homepage: function() {
      return process.env.VUE_APP_LINXF == "electron"
        ? 'javascript:require("electron").shell.openExternal("https://wnr.scris.top/")'
        : "https://wnr.scris.top/";
    },
    OnGithub: function() {
      return process.env.VUE_APP_LINXF == "electron"
        ? 'javascript:require("electron").shell.openExternal("https://github.com/RoderickQiu/wnr/")'
        : "https://github.com/RoderickQiu/wnr/";
    },
    Issues: function() {
      return process.env.VUE_APP_LINXF == "electron"
        ? 'javascript:require("electron").shell.openExternal("https://github.com/RoderickQiu/wnr/issues/")'
        : "https://github.com/RoderickQiu/wnr/issues/";
    },
    Acknoledgements: function() {
      return process.env.VUE_APP_LINXF == "electron"
        ? 'javascript:require("electron").shell.openExternal("https://wnr.scris.top/acknoledgements.html")'
        : "https://wnr.scris.top/acknoledgements.html";
    }
  }
};
</script>