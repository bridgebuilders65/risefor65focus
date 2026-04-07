# #RiseFor65 — Focus Wall

A live shared wall where participants share what they'll give their full, undivided attention to — with +1 voting.

## Folder structure

```
focus-wall/
├── index.html                        ← the page
├── netlify.toml                      ← build config
├── package.json                      ← dependencies
├── README.md
└── netlify/
    └── functions/
        └── focus-wall.mjs            ← serverless API (Netlify Blobs)
```

## Deploy in 3 steps

### 1. Push to GitHub
- Create a new repo on github.com (e.g. `risefor65-focus-wall`)
- Drag and drop this entire `focus-wall` folder's contents into the repo root, or use:
  ```
  git init
  git add .
  git commit -m "initial"
  git remote add origin https://github.com/YOUR_USERNAME/risefor65-focus-wall.git
  git push -u origin main
  ```

### 2. Connect to Netlify
- Go to app.netlify.com → "Add new site" → "Import an existing project"
- Choose GitHub and select your repo
- Build settings are auto-detected from `netlify.toml`:
  - Publish directory: `.`
  - Functions directory: `netlify/functions`
- Click **Deploy site**

### 3. Enable Netlify Blobs (automatic)
Netlify Blobs is enabled automatically when the function runs for the first time.
No extra configuration needed.

## How it works

- Participants type what they'll unitask on and press Post
- All responses are stored in Netlify Blobs (serverless key-value store)
- The wall polls every 10 seconds so everyone sees new entries live
- Duplicate entries are merged and their count increases
- Anyone can +1 an existing entry (one +1 per browser, tracked in localStorage)
- Entries are sorted by most +1s, then most recent

## Customisation

To change the poll/wall ID (clears all existing responses), edit this line in `index.html`:
```js
const POLL_ID = 'risefor65-focus-wall-v1';
```
Change it to any unique string (e.g. `risefor65-focus-wall-v2`).
