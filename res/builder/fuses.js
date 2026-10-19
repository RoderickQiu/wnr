// Electron fuses flipped in every packaged build. wnr never runs as plain Node, never reads
// NODE_OPTIONS and needs no --inspect, so those are closed; its pages load from file://, so
// that protocol keeps its privileges. Asar integrity validation is left for a build that can
// be tested on macOS and Windows.
// Flipping fuses rewrites Electron Framework, which breaks its ad-hoc signature; macOS then
// kills the app at launch (SIGKILL, Code Signature Invalid). CI has no Developer ID, so the
// .app is re-signed ad-hoc right after the flip. Windows and Linux builds ignore this option.
module.exports = {
    runAsNode: false,
    enableNodeOptionsEnvironmentVariable: false,
    enableNodeCliInspectArguments: false,
    onlyLoadAppFromAsar: true,
    grantFileProtocolExtraPrivileges: true,
    resetAdHocDarwinSignature: true
};
