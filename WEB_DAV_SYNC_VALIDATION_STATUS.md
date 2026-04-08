# WebDAV Sync Validation Status

## Current Validation Conclusions

### Confirmed Passed

- [x] `Test connection` works with the current WebDAV endpoint
- [x] Manual upload succeeds
- [x] Remote files are created as separated files:
  - [x] `config.json`
  - [x] `statistics.json`
  - [x] `recap.json`
- [x] Manual download can overwrite local core data
- [x] Download + relaunch path is effective

### Confirmed Behavior From Manual Test

Test performed:

1. Upload a cloud snapshot where today's statistics value was `0`
2. Start a local timer afterward so local statistics become non-zero
3. Trigger `Download from WebDAV`
4. Relaunch the app

Observed result:

- [x] After relaunch, today's statistics became `0` again

Interpretation:

- [x] Remote `statistics.json` successfully overwrote local `statistics` store
- [x] The current v1 sync model is behaving as designed:
  - upload = local overwrites remote
  - download = remote overwrites local

## Remaining Items To Verify

### Core Data Coverage

- [x] `config.json` download correctly overwrites local settings
- [x] `config.json` upload correctly reflects current local settings remotely
- [x] `recap.json` upload works correctly
- [x] `recap.json` download restores local recap correctly

### Local-Only WebDAV Config Safety

- [x] After `Download from WebDAV`, local WebDAV URL remains intact
- [x] After `Download from WebDAV`, local WebDAV username remains intact
- [x] After `Download from WebDAV`, local WebDAV password remains intact
- [x] After `Download from WebDAV`, local WebDAV remote path remains intact

### Error Handling

- [x] Wrong password causes `Test connection` to fail clearly
- [x] Wrong password causes upload to fail clearly
- [x] Wrong password causes download to fail clearly
- [x] Download safely fails if remote `config.json` is missing
- [x] Download safely fails if remote `statistics.json` is missing
- [x] Download safely fails if remote `recap.json` is missing
- [ ] Download safely fails if a remote JSON file is malformed
- [x] Failed download does not partially corrupt local stores

### UX / Flow Checks

- [x] Upload overwrite confirmation appears when remote files already exist
- [x] Download overwrite confirmation appears before replacing local state
- [x] Success message for upload is clear enough
- [x] Success message for download is clear enough
- [x] Failure message for WebDAV errors is clear enough

### Scope Guardrails

- [x] `style-cache` is not affected by sync
- [x] `timing-data` is not affected by sync
- [x] WebDAV sync entry remains inside `App data management`

## Current Assessment

At this point, the feature has passed the most important end-to-end path:

- [x] connect
- [x] upload
- [x] download
- [x] overwrite local statistics after relaunch

This means the implementation is already beyond a mock or partial integration.

However, it is **not fully ready to declare complete** until the remaining checks above are covered, especially:

- [ ] config overwrite verification
- [ ] recap overwrite verification
- [ ] local credential preservation after pull
- [ ] malformed/missing remote file handling

## Suggested Next Test Order

1. Verify `config.json` overwrite
2. Verify `recap.json` overwrite
3. Verify local WebDAV credentials survive download
4. Verify wrong-password failure path
5. Verify malformed/missing remote-file failure path
