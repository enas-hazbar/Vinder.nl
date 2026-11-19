# Vinder — Discover / Find Your Match (fictional demo)

This is the **Discover page** of the fictional Vinder dating-platform website. It was developed to match the selected design reference for a university cybersecurity demonstration.

All displayed names, profiles, photos, message conversations, match scores, and badges are fictional. The application does **not** connect to any real users, store real login credentials, verify identity, or implement a real dating service.

## Open in VS Code

1. Extract this ZIP and open the `vinder-discover-starter` folder in Visual Studio Code.
2. Open **Terminal → New Terminal**.
3. Check Node.js is installed with `node -v`. Use a compatible Node.js LTS release (see https://vite.dev/guide/).
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Visit the local address printed by Vite (usually `http://127.0.0.1:5173/`).

## Your file structure

```
vinder-discover-starter/
├── public/images/           Profile-photo crops from your selected design image
├── src/
│   ├── components/
│   │   ├── FilterSidebar.jsx   Search, age, location, interests and goals
│   │   ├── ProfileCard.jsx     Individual card with Like / Pass / View Profile
│   │   ├── ProfileModal.jsx    Expanded profile information popup
│   │   └── InsightsPanel.jsx   Match insights, recent matches, messages
│   ├── data/
│   │   └── mockProfiles.js     Fictional profile and conversation data
│   ├── pages/
│   │   └── Discover.jsx       Main Discover page + filtering/sorting logic
│   ├── App.jsx                Temporary shell for demo navigation/pages
│   ├── main.jsx               React application entry point
│   └── styles.css             All Vinder styles
├── index.html
├── package.json
└── vite.config.js
```

## What works now

- Search by name, city, occupation and interest
- Age, distance, interest, relationship-goal and demo-verification filters
- Sort by compatibility, age or distance
- Grid and list layout
- Like, Pass and undo last Pass
- View full fictional profiles
- Recent match previews and a separate Matches screen
- Simulated Messages screen where sent demo texts stay in this browser
- Responsive desktop and mobile styles
- Likes, passes and demo messages saved to **browser localStorage**

This is a frontend prototype, not a secure login system. Do not store real passwords or identity documents in localStorage.

## Integrating with your teammate's site

When your teammate builds Login, Create Account, Home, About and Safety:

1. Keep `src/pages/Discover.jsx` and its components/data.
2. Replace this starter's `App.jsx` with the team's shared routing setup.
3. Import `Discover` into the shared app. **Note:** the page expects `likedIds`, `passedIds`, event handlers and `conversations` props; keep the state handlers from this starter's `App.jsx` or refactor them into shared context.
4. Keep the team branding colours or adjust the CSS variables in `src/styles.css`.

Use one Git repository and separate feature branches. Suggested branch: `feature/discover-page`.

## Building for Netlab

Run `npm run build`. Vite creates a `dist/` directory with the production website, which can be copied to your Ubuntu DMZ server and served using Nginx. Your Ubuntu VM does **not** need VS Code or a desktop environment. The team still needs to set up the restricted file transfer, Nginx, firewall permissions, HTTPS and Wazuh integration separately.

## Security notes

Do not publish vulnerable honeypots, accept real ID uploads, claim real user verification, or collect real login credentials on the public demo. Use fictional data only.

## New in this version: editable My Profile + photo galleries

**Click your profile avatar / “Hi, Jamie” in the top-right corner** to open **My Profile**. You can:

- Change your display name, adult age (18–90), city, occupation, relationship goal and biography.
- Add hobbies such as *Gaming*, *Swimming*, *Photography* or type your own hobby and press **Add hobby** (or Enter). Remove a hobby by clicking its pink tag.
- Upload up to **six demo pictures** (JPG/PNG/WebP, max 5 MB each), remove pictures and reorder them with the up/down arrows.
- Preview your profile as you edit it. The **first photo** becomes your top-right header avatar after you save.
- Click **Save profile changes** to persist details to **this browser's localStorage**. A refresh keeps them on the same browser/origin; another laptop/browser won't see them.
- Click **Reset demo profile** to restore the fictional Jamie example.
- Find demo compatibility scores that change based on your selected hobbies and relationship goal.

**Other fictional profiles** have a three-image demo gallery: use the arrows on each card or click **View Photos & Profile** to browse thumbnails in a larger popup. The `-2` and `-3` photos are **derived visual placeholders** from the existing original demo portrait, not genuine extra pictures taken by different users. Replace them later with distinct fictional/generated imagery as your team creates it.

To change a fictional profile gallery manually:

1. Put approved sample images in `public/images/`, e.g. `maya-day-out.jpg` and `maya-cafe.jpg`.
2. Open `src/data/mockProfiles.js` and update the relevant `photos` array:

   ```js
   photos: ['/images/maya.jpg', '/images/maya-day-out.jpg', '/images/maya-cafe.jpg']
   ```

3. Save and refresh. The first entry is the default card photo.

### Where is each feature coded?

- `src/pages/MyProfile.jsx`: editor, image upload, edit form, interests, preview
- `src/data/myProfile.js`: default demo identity and browser persistence
- `src/components/ProfileCard.jsx`: carousel arrows on discovery cards
- `src/components/ProfileModal.jsx`: full profile with gallery thumbnails
- `src/data/mockProfiles.js`: placeholder galleries for six fictional users
- `src/utils/matching.js`: illustrative interest-based matching scores
- `src/App.jsx`: clickable top-right avatar and My Profile routing
- `src/styles.css`: keeps your navy/pink Vinder design and adds responsive styles

### Important limitations and security

This is a **frontend-only simulation**, not a real user system. No other visitors can see an uploaded profile image; there is no shared database or account server. The photo upload resizes and saves images only inside the browser, subject to browser storage limits. Clearing site data or switching devices will clear or hide those changes. **Do not enter real personal information, real ID documents, private photos or passwords.**

When your team later adds proper authentication, photos and profiles must be validated and stored securely on a backend with access controls, HTTPS, server-side file validation and privacy safeguards. A locally saved profile is not evidence that those security features exist.

### Basic tests

Run the original app with `npm install` and `npm run dev`. Then try:

1. Click top-right profile icon; edit name to `Taylor`, add the hobby `Swimming`, upload a demo picture, and save.
2. Confirm header now reads `Hi, Taylor` and shows your first image.
3. Refresh. Confirm the profile is still there in the same browser.
4. Return to Discover, click next photo on Maya, open her full profile, and click gallery thumbnails.
5. Change your interests and check how demo compatibility scores change.

`npm test` runs a small logic/data test using Node.js. A full UI production build still requires `npm install` and `npm run build` on a computer with package-registry access.
