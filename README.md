# Weekly Duty Ledger — GitHub Pages setup

This turns your duty ledger into a small website with two pages:

- **`edit.html`** — the full editable version, for you.
- **`index.html`** — a read-only version anyone with the link can view, for your boss. No GitHub account needed on their end.

Edits you make in `edit.html` save straight to this GitHub repo. GitHub Pages then rebuilds the site (usually within a minute or two), and `index.html` automatically shows the update — it re-checks the data every 45 seconds while it's open, and always shows the latest on load.

## 1. Create the repository

1. Go to [github.com/new](https://github.com/new).
2. Name it anything, e.g. `duty-ledger`.
3. Set it to **Public**. (GitHub Pages on a free account requires a public repo. See "About the public repo" below for what that actually exposes.)
4. Click **Create repository**.

## 2. Upload these files

Upload all five files from this folder to the repository, keeping them at the top level (not in a subfolder):

- `index.html`
- `edit.html`
- `ledger.js`
- `style.css`
- `data.json`

Easiest way: on the repo's GitHub page, click **Add file → Upload files**, drag all five in, and commit.

## 3. Turn on GitHub Pages

1. In the repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to "Deploy from a branch".
3. Set **Branch** to `main` (or whichever branch you uploaded to) and folder to `/ (root)`.
4. Click **Save**.
5. GitHub will show you the site's URL after a minute or two — something like:
   `https://YOUR-USERNAME.github.io/duty-ledger/`

That URL, on its own, opens `index.html` — your boss's read-only page. Bookmark it or send it to them directly.

Your own editable page is the same URL with `edit.html` on the end:
`https://YOUR-USERNAME.github.io/duty-ledger/edit.html`

## 4. Create a personal access token (so edits can save)

This is what lets `edit.html` commit your changes back to the repo.

1. Go to [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) (this creates a **fine-grained** token, which is the safer kind).
2. Give it a name like "Duty ledger sync".
3. Under **Repository access**, choose **"Only select repositories"** and pick the one repo you just created. Don't grant it access to anything else.
4. Under **Permissions → Repository permissions**, find **Contents** and set it to **Read and write**. Leave everything else as "No access".
5. Set an expiration if you want (you can always generate a new one later).
6. Click **Generate token**, then **copy it immediately** — GitHub only shows it once.

## 5. Connect the editor to your repo

1. Open your `edit.html` page (the URL from step 3).
2. Click **⚙ Sync settings** in the top right.
3. Fill in:
   - **Owner** — your GitHub username
   - **Repository** — the repo name, e.g. `duty-ledger`
   - **Branch** — `main` (or whatever you used)
   - **Data file path** — leave as `data.json`
   - **Personal access token** — paste the token from step 4
4. Click **Test connection** to confirm it's working, then **Save**.

From then on, every change you make (changing a period's category, editing a detail label, marking a day off) saves automatically to GitHub a moment after you make it. The status pill next to the button shows "Saving to GitHub…" then "Synced to GitHub".

## About the security of the token

The token lives only in your own browser's local storage on whichever device you open `edit.html` from — it's never sent anywhere except directly to `api.github.com` over HTTPS when saving. It isn't visible to anyone viewing `index.html`, and it isn't stored in the repository itself. Because it's a fine-grained token scoped to just this one repo with only "Contents: read and write" permission, even in the worst case (e.g. your browser or device were compromised) the blast radius is limited to this one repo's file contents — it can't touch your other repositories, your account settings, or anything else on GitHub.

If you ever want to revoke it, go to [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens) and delete it, then generate a new one and re-enter it in the settings panel.

## About the public repo

Making the repo public only affects who can **view** the page and the raw `data.json` file — anyone with the link can see it, the same as any public GitHub Pages site. It does **not** affect who can **edit** it; only someone with your personal access token can push changes. Nothing in the data is sensitive: it's your teaching timetable, room numbers, class group names, and your own name and duty assignments. There's no student names, grades, or financial information in it.

If you'd rather the underlying `data.json` not be publicly downloadable (even though the rendered page would be public either way via `index.html`), that requires a paid GitHub plan (private repo + Pages), which is a bigger step — worth doing only if this bothers you in practice.

## Editing on multiple devices

Since the token is stored per-browser, if you want to edit from more than one device (e.g. a laptop and a school desktop), repeat step 5 on each — paste the same token into each browser's settings panel. Each device saves directly to the same repo, so as long as you're not editing the exact same moment on two devices at once, changes from any of them show up everywhere.

## If something looks wrong

- **"Sync not set up"** — you haven't filled in the settings panel yet, or a field is missing. Edits still work locally in your browser, they just won't save to GitHub (and will be lost on refresh) until this is fixed.
- **"Sync error"** — hover over the pill to see the message. Usually this means the token is wrong, expired, or doesn't have "Contents: read and write" access to the right repo. Re-check step 4 and re-save the settings.
- The boss's page not updating — GitHub Pages rebuilds take up to a couple of minutes after a save; also check the Actions tab in the repo (or Settings → Pages) to confirm the deployment succeeded.
