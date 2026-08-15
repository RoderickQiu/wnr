# Settings UX plan

Stabilized for later implementation. Covers only the three items chosen:

1. Split the App junk drawer
2. Surface coupling on the control, not only in `?`
3. Stop implying there is a Save

Do not implement the rest of the Settings audit (jump list, Unfold/Fold rename, notification cluster, soon-finish penalty copy, plan-editor overhaul) in this pass.

## Constraints

- UX only. No Settings layout rewrite, no new window size, no new settings store keys unless a row cannot work without one.
- Keep instant write-on-change. Do not add a Save button.
- Keep the existing four-ish heading style (`small text-grey settings-title`). Add headings; do not add a sidebar or search.
- Keep `?` tips for long explanations. Coupling that *changes another control* must also be visible on the row itself.
- Touch `preferences-items.js` (order), `preferences-renderer.js` (locker, coupling, close/restart), `style.css` (small row helpers only), and `locales/*.json`.
- Do not change timer/home behavior except where a disabled control already matches current runtime (infinity already ignores loops; percentage break already overwrites rest).
- Verify in the Settings window after each slice: Session, During, When a period ends, Look, Data & access; locked-mode Settings (locker only); macOS vs Windows (dock-hide / force-screen-lock visibility).

---

## 1. Split App

### Current

One heading `global-settings` ("App") contains, in order:

Language → zoom → week start → appearance → auto-launch → dock hide → always on top → default page → updates → hotkeys → data/WebDAV → locker → theme

### Target order

**Session** (`timing-setting`) — unchanged except insert **Default page** after Simple countdown:

- Predefined plans
- Auto start default task
- Simple countdown
- **Default page** (moved here)
- Task reservation
- Percentage break
- Long break

**During a session** — no order change.

**When a period ends** — no order change.

**Look** (new title `settings-section-look`)

- Language
- Appearance
- Zoom
- Theme colors
- Week starts on
- Hide Dock icon (macOS only, already gated)
- Always on top

**Data & access** (new title `settings-section-data`)

- Auto-launch
- Auto update check
- Hotkeys
- App data management (backup / import / WebDAV stays inside this collapse)
- Lock mode

Remove the `global-settings` heading from the page. Keep the i18n key so old strings are unused, not deleted in the first patch if that is easier.

### Copy (source English)

| Key | en | zh-CN |
|---|---|---|
| `settings-section-look` | Look | 外观 |
| `settings-section-data` | Data & access | 数据与访问 |

Add the same two keys to `en`, `zh-CN`, `zh-TW`, `fr`, `ko`, `ar`. Do not rename `default-page` in this pass.

### Locker form (same slice)

Today: two unlabeled password fields, placeholders only, Enter submits, no button. Collapse tip is the only “you will lock yourself out” warning.

Change, inside the existing locker collapse only:

- Visible labels on both fields (reuse `locker-settings-input` / `locker-settings-input-again`, or add `locker-label-password` / `locker-label-password-again` if the current strings are too placeholder-like).
- A submit button: **Turn on lock** / **Turn off lock** depending on `islocked`. Enter still submits.
- One always-visible line under the status: locking hides every other setting until the password is entered. Keep the existing on/off status line.
- Do not change hash/MD5 logic, maxlength 11, or the locked-mode Settings page (still locker only).
- Lock on/off still restarts the app (it has to). That restart may keep a confirm dialog; see §3.

### Out of this slice

- Do not redesign predefined-plan rows, reservation empty state, or WebDAV again.
- Do not add summaries on collapsed rows.

---

## 2. Surface coupling on the control

Show the effect on the dependent row. Do not only put it in `?`. Do not invent new runtime rules.

### Shared UI

Add a small muted line on the affected row (not a `?`, not a dialog), class e.g. `settings-coupling`. Hide it when the coupling is idle.

When a control is inert, disable it (`disabled` + existing switch opacity). Do not remove the row. Do not silently flip the stored value unless noted below.

### A. Percentage break → rest fields

**Runtime today:** `percentage-break-mode !== 0` computes rest from work on the home form and when applying a default plan.

**Settings:**

- When the dropdown is not `never`, under that dropdown show: rest is calculated from work (reuse `percentage-break-home-hint` or a slightly longer settings-only string).
- In each predefined plan, rest input becomes `readonly` (not empty). Keep the stored rest number so turning the mode off restores the old value.
- Next to that rest input, the same coupling line. Do not keep a still-editable rest field.

Home already has the read-only rest field + hint. Do not restyle home.

### B. Infinity → loops and Disable cancel

**Runtime today:** home loop is ignored (`infinityMode`, `loop=0` in the timer URL). `timer.html` will not fully honor “disable cancel” when `loop === 0`.

**Settings:**

- When Infinity is on:
  - Predefined-plan **loops** inputs become `readonly` + coupling line: loop count is ignored.
  - **Disable canceling** (`disable-back`) is disabled. If its current choice is `always` (index 0), do not rewrite the store; the timer already refuses to fully disable cancel. Show: cancel cannot be fully disabled while Infinity is on.
- When Infinity is turned off, re-enable those controls. Stored values stay as they were.

Keep the Infinity `?` tip. The row itself only needs the short coupling line if we also show it under the Infinity toggle. Prefer putting the text on the *dependent* rows (loops, disable-back) so the Infinity switch stays one line.

### C. Auto start default task

**Runtime today:** needs a default plan; reserved tasks turn it off.

**Settings:**

- Disable the switch when `default-task` is unset **or** `reserved` is a non-empty list.
- Coupling line, one of:
  - no default plan: set a default plan first
  - reserved tasks exist: reserved sessions turn this off
- If the switch was on and a reservation is added later, current runtime already ignores it. Leave the stored boolean; the disabled switch + line is enough. Do not auto-uncheck unless we already do that today.

### D. Force screen lock

**Runtime today:** hidden on macOS. Tip says it only works with Loose = off and “Continue timing after computer locked” = on.

**Settings:**

- Enable the switch only when `loose-mode-dropdown === 0` (off) **and** `timing-after-locked` is on.
- When disabled, keep the stored boolean; show why: needs Loose fullscreen off and Continue after lock on.
- Changing Loose or Continue after lock must refresh this row immediately (`after` callbacks).
- Still omit the row on darwin.

### Not in this pass

- Soon-finish → cannot pause (copy-only, not a disabled control).
- Long break + infinity (already works; no inert control).
- Auto-launch OS permission (tip only).

### Copy

Add short keys, all six locales. Suggested English:

| Key | en |
|---|---|
| `settings-coupling-percentage-rest` | Rest is calculated from work. |
| `settings-coupling-infinity-loops` | Loop count is ignored while Infinity is on. |
| `settings-coupling-infinity-cancel` | Cancel cannot be fully disabled while Infinity is on. |
| `settings-coupling-autostart-no-default` | Set a default plan first. |
| `settings-coupling-autostart-reserved` | Reserved sessions turn this off. |
| `settings-coupling-force-lock` | Needs Loose fullscreen off and Continue after lock on. |
| `locker-lock-out-hint` | Locking hides other settings until you enter this password. |
| `locker-turn-on` | Turn on lock |
| `locker-turn-off` | Turn off lock |

Keep existing long `*-tip` strings behind `?`.

---

## 3. Stop implying there is a Save

### Close control

- Tooltip / title on the Settings close icon: use existing `close` (“Close” / “关闭”), not `exit-and-save` (“Close & Save” / “关闭窗口并且保存”).
- macOS still hides that icon (traffic lights). No change.
- Behavior stays “close the window”. Values are already stored.

### Which changes need a restart today

| Control | What happens now |
|---|---|
| Language | `relaunch-dialog` immediately |
| Appearance | `relaunch: true` → dialog |
| Hide Dock | `relaunch: true` → dialog |
| Always on top | `relaunch: true` → dialog |
| Lock on/off | dialog after a successful password |
| Import settings / WebDAV download | dialog after success |
| Zoom | `location.reload()` of Settings (scroll lost). Not a full app relaunch |

### Target

- Every row that needs an **app** restart shows a permanent muted line: **Applies after restart** (`settings-applies-after-restart`).
- Do **not** pop `relaunch-dialog` on each of those preference clicks.
- Set a pending flag (in-memory on the Settings renderer is enough). When the Settings window **closes**, if the flag is set, relaunch once.
- Language still writes `previous-language` + `i18n` as today, so the eventual relaunch dialog (if we keep one at close) can stay bilingual. Prefer: no dialog at close either — just relaunch. The row already said it would restart.
- **Zoom** is not a restart. Keep immediate Settings reload. Save `#settings-container` scroll (and which collapses are open) in `sessionStorage` and restore after reload.
- **Lock on/off** and **import / WebDAV download** keep an explicit confirm + restart. Those are mode/data changes, not a preference flicker.

### Copy

| Key | en | zh-CN |
|---|---|---|
| `settings-applies-after-restart` | Applies after restart | 重启后生效 |

Use `close` for the window control. Leave `exit-and-save` in locale files unused.

---

## Implementation order

Do these as three sequential PRs or three commits on one branch. Each should be shippable alone.

1. **Split App + locker labels/button**  
   Reorder `preferences-items.js`, add two headings, move `default-page`, locker form chrome. No behavior change except locker has a button.

2. **Coupling**  
   Enable/disable + `settings-coupling` lines for percentage break, infinity, autostart task, force screen lock. Wire `after` handlers so sibling rows update live.

3. **Close / restart**  
   Rename close tooltip, on-row restart hint, defer relaunch to Settings close, preserve zoom scroll.

If time is short, ship 1 and 3 first. Coupling is the one that can regress timer/settings interaction and needs the most click-through.

## Verification

- Default page sits under Session, not under updates. Theme sits under Look. WebDAV/locker/hotkeys sit under Data & access.
- Percentage break on: plan rest not editable; off: editable again, old number still there.
- Infinity on: plan loops not editable; Disable cancel greyed; timer still cannot fully block cancel (existing).
- No default plan: Auto start default task greyed. Add a reservation: same switch greyed with the reserved line.
- Loose = Loose or Continue after lock = off: Force screen lock greyed (Windows/Linux). Both prerequisites on: switch works. Hidden on macOS.
- Change appearance, close Settings: one relaunch, no “save” wording, no dialog on the click.
- Change zoom: Settings reloads at the same scroll position; app does not relaunch.
- Close tooltip is Close, not Close & Save.
- Locked: Settings still shows only locker; labels + button present; Enter still works.

## Explicitly out of scope

- Home form layout, window height, placeholders vs units
- Unfold/Fold wording, jump nav, collapsed-row summaries
- Soon-finish / 1-minute / inactivity notify merge
- Predefined plan sentence-fragment rewrite
- WebDAV beyond what already shipped
- New settings, new store schema, code cleanup of `console.log` in dropdowns
