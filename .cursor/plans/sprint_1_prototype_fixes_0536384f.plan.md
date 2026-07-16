---
name: Sprint 1 Prototype Fixes
overview: "Implement the Sprint 1 backlog from the product review: fix the two critical bugs (false cancel, locker inventory leak), gate the demo auto-login, and add the four highest-RICE UX improvements (timeout warning, fuzzy search, receipt code, help affordance)."
todos:
  - id: cancel-path
    content: Real cancel path on opening-locker screen
    status: completed
  - id: inventory
    content: Locker + mail inventory lifecycle (release/occupy/claim)
    status: completed
  - id: gate-autologin
    content: Gate tap-card auto-login behind ?demo flag
    status: completed
  - id: timeout-warning
    content: Idle timeout warning overlay at 50s
    status: completed
  - id: fuzzy-search
    content: Fuzzy recipient search + result count
    status: completed
  - id: receipt
    content: Deposit receipt code on courier done screen
    status: completed
  - id: help
    content: Help affordance in kiosk footer
    status: completed
  - id: verify
    content: Headless verification of flows and layout
    status: completed
isProject: false
---

# Sprint 1 Prototype Fixes

Implement the prioritized backlog from the UX audit ([canvas review](C:\Users\Narendra\.cursor\projects\c-Users-Narendra-Documents-GitHub-Smart-Locker-Claude\canvases\smart-locker-product-review.canvas.tsx)) directly in the prototype. Everything below needs no backend or hardware.

## 1. Real cancel path (Critical)

In [smart-locker/scripts/screens/opening-locker.js](smart-locker/scripts/screens/opening-locker.js), "Batal" currently calls the same `finish()` as "Selesai" — a cancel shows a success screen.

- Add a `cancel()` that navigates back to the origin screen (dashboard for `self`, mail list for `claim-mail`, courier-assign's parent for `deliver`) without showing the done screen
- On courier cancel, release the assigned locker (see item 2)

## 2. Locker inventory lifecycle (Critical)

In [smart-locker/scripts/screens/courier.js](smart-locker/scripts/screens/courier.js) line ~286, `assignedLocker.state = "delivering"` is never reverted, so free lockers leak all day.

- Release the locker (back to `available`) on: back-navigation from the assign screen, cancel, and idle-timeout reset ([smart-locker/scripts/app.js](smart-locker/scripts/app.js) already clears state there — add the locker release)
- On successful delivery, set the locker to `occupied` and attach the recipient
- On mail claim completion, remove the claimed item from `incomingMail` and clear the locker's `hasMail` flag in [smart-locker/scripts/data.js](smart-locker/scripts/data.js)

## 3. Gate the auto-login (Critical, one-liner)

In [smart-locker/scripts/screens/tap-card.js](smart-locker/scripts/screens/tap-card.js), the 3.5 s auto-sign-in fires for anyone standing nearby and contaminates usability-test timings. Keep the Enter shortcut, but only run the auto-timer when a `?demo` query param is present.

## 4. Idle timeout warning

In [smart-locker/scripts/app.js](smart-locker/scripts/app.js), the 60 s reset fires with no warning. At 50 s of inactivity show a "Masih di sana?" overlay with a 10 s countdown; any tap dismisses it and resets the timer; expiry does the existing reset.

## 5. Fuzzy recipient search + result count

In [smart-locker/scripts/data.js](smart-locker/scripts/data.js) `searchStaff()` is exact-substring — the label "Budi Santoso" fails against "Prof. Budi Santoso, Ph.D.".

- Normalize both sides: strip titles/degrees (Dr., Prof., S.Kom., etc.), punctuation, case
- Match all query tokens in any order; tolerate single-character typos on tokens of 4+ chars
- In [smart-locker/scripts/screens/courier.js](smart-locker/scripts/screens/courier.js), show "N hasil" and a "tampilkan lebih banyak" hint when results exceed the 12-row cap

## 6. Deposit receipt code

In [smart-locker/scripts/screens/done.js](smart-locker/scripts/screens/done.js), for `deliver` completions generate a 6-character code (e.g. `FST-4K7Q2`), display it prominently (readable from 1 m), and extend the auto-return for that case so couriers can photograph it.

## 7. Help affordance

Add a persistent "Butuh bantuan?" line to the kiosk footer in [smart-locker/index.html](smart-locker/index.html) that opens a simple overlay with contact info and a "Laporkan masalah" note (front-of-house copy only — no backend).

## Verification

Re-run the headless Puppeteer checks used earlier (screens fit 16:10, lists scroll) plus new flow assertions: cancel returns without success screen, locker counts stay stable across a cancelled delivery, search finds "Budi Santoso" without titles.