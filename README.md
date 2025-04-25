<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/10660468/54499151-062f8900-48e5-11e9-82c9-767d39c9cbbe.png">
  <h3 align="center">github-activity-box</h3>
  <p align="center">⚡️📌 Update a pinned gist to contain the latest activity of a user</p>
</p>

---

Fork of [activity-box](https://github.com/JasonEtco/activity-box) with some customizations:
- Published to `npm`, Added binary for use with npx or pnpx
- Add allowed events in Toolkit.run.
- Update deps, remove unused deps

## Setup

**activity-box** is a GitHub Action that is designed to work using the [`schedule`](https://developer.github.com/actions/managing-workflows/creating-and-cancelling-a-workflow/#scheduling-a-workflow) event.

### Prep work

1. Create a new public GitHub Gist (https://gist.github.com/)
2. [Create a token](https://github.com/settings/tokens/new) with the `gist` scope and copy it. The `GITHUB_TOKEN` that comes with GitHub Actions cannot currently use the Gist API.

### Project setup

1. Create a `.github/workflows/activity-box.yml` file with a workflow like this:
   ```yml
   name: Activity Box
   on:
     workflow_dispatch:
     schedule:
       - cron: '*/10 * * * *'
   jobs:
     language-box:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - uses: pnpm/action-setup@v4
           name: Install pnpm
           id: pnpm-install
           with:
             version: 9
             run_install: true

         - name: Setup node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: pnpm

         - name: Update
           run: pnpm dlx github-activity-box
           env:
             GH_PAT: ${{ secrets.GH_PAT }}
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             GH_USERNAME: maxchang3
             GIST_ID: 123abc
   ```
2. [Create a secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) 🔑 by going to **GitHub repo > Settings > Secrets > New secret** with the following:
- Name: `GH_PAT`.
- Value: The token with the `gist` scope generated previously.

### Environment variables & secrets

- **GIST_ID:** The ID portion from your gist url `https://gist.github.com/matchai/`**`6d5f84419863089a167387da62dd7081`**.
- **GH_PAT:** The GitHub token generated above.
- **GH_USERNAME:** The username handle of the GitHub account.

---

_Inspired by [matchai/bird-box](https://github.com/matchai/bird-box) and [JasonEtco/activity-box](https://github.com/JasonEtco/activity-box)_
