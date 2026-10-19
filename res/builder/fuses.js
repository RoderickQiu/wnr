// Electron fuses flipped in every packaged build. wnr never runs as plain Node, never reads
// NODE_OPTIONS and needs no --inspect, so those are closed; its pages load from file://, so
// that protocol keeps its privileges. Asar integrity validation is left for a build that can
// be tested on macOS and Windows.
module.exports = {
    runAsNode: false,
    enableNodeOptionsEnvironmentVariable: false,
    enableNodeCliInspectArguments: false,
    onlyLoadAppFromAsar: true,
    grantFileProtocolExtraPrivileges: true
};
