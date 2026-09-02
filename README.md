# NICA

A fun, rewards-driven app for tracking school assignments and marks. Kids log
their own assignments; a parent approves each one. A mark above the family's
threshold (95 by default) earns **+1 point**; at or below it costs **-1 point**.
Points carry a real dollar value the parent sets, and can be cashed out or
spent on gifts the parent configures. There's a running points counter on the
kid's home screen at all times.

It's one codebase (Expo/React Native) that runs as a real iOS app, a real
Android app, and in a web browser.

## Project layout

```
server/   Node/Express + SQLite backend (auth, assignments, points, rewards)
app/      Expo (React Native + TypeScript) app — iOS, Android, and web
```

## How it works

- A **parent** signs up and creates a family, getting an **invite code**.
- A **kid** signs up using that invite code and joins the family.
- The kid logs an assignment (subject, title, mark out of 100). It sits
  **pending** until the parent approves or rejects it.
- On approval: mark > threshold → **+1 point**, mark ≤ threshold → **-1 point**.
- The parent sets the dollar value per point and can add gift options (e.g.
  "Movie night — 5 points"). The kid can request a cash-out or redeem a gift;
  the parent fulfills or declines the request.
- Everything is scoped to one family — a parent's invite code is how their
  kid(s) join.

## Running it locally

### 1. Backend

```
cd server
npm install
npm start
```

Starts on `http://localhost:4000` and creates a local SQLite file (`nica.db`)
on first run — no external database needed.

### 2. App

```
cd app
npm install
npm run web      # runs in a browser at http://localhost:8081
npm run ios      # requires macOS + Xcode (or use Expo Go on your phone)
npm run android  # requires Android Studio (or use Expo Go on your phone)
```

By default the app talks to `http://localhost:4000` (or `http://10.0.2.2:4000`
on the Android emulator, which is how the emulator reaches your host machine).

**Testing on a physical phone with Expo Go:** `localhost` on your phone means
the phone itself, not your computer. Find your computer's LAN IP (e.g.
`192.168.1.23`) and start the app with:

```
EXPO_PUBLIC_API_URL=http://192.168.1.23:4000 npm start
```

Then scan the QR code with Expo Go. Make sure your phone and computer are on
the same Wi-Fi network, and that your firewall allows connections to port 4000.

## Deploying for real use

To actually use this day-to-day (parent and kid on separate phones, away from
your home network), deploy the `server` folder to any Node host (Render,
Railway, Fly.io, etc.), then set `EXPO_PUBLIC_API_URL` to that server's public
URL when building/starting the app. For an installable app (not just Expo Go),
build with [EAS Build](https://docs.expo.dev/build/introduction/).

## Notes

- Passwords are hashed with scrypt; sessions use JWTs (30-day expiry).
- The mark threshold, dollar-per-point value, and gift list are all editable
  from the parent's Reward Settings screen at any time.
