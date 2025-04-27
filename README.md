<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/10660468/54499151-062f8900-48e5-11e9-82c9-767d39c9cbbe.png">
  <p align="center">⚡️📌 Update a pinned gist to show your latest GitHub activity</p>
</p>

<p align="right"><i>
  Fork of <a href="https://github.com/JasonEtco/activity-box">JasonEtco/activity-box</a> with enhancements.
</i></p>

# GitHub Activity Box

[![npm](https://img.shields.io/npm/v/github-activity-box.svg?style=flat-square)](https://www.npmjs.com/package/github-activity-box)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/maxchang3/github-activity-box/ci.yml?style=flat-square&label=CI)](https://github.com/maxchang3/github-activity-box/actions)
[![License](https://img.shields.io/github/license/maxchang3/github-activity-box?style=flat-square)](LICENSE)

## ✨ Enhancements

- 🔍 Improved PR filtering:
  - Excludes closed but unmerged PRs
  - Deduplicates PR events, showing only the latest status for each PR.
- ✅ Updated dependencies, refactored code and tests.
- 📦 Published to npm with binary support for easy use via `npx` or `pnpx`

## 🚀 Usage

### Use as a CLI

```bash
# Run directly with npx/pnpx
npx github-activity-box [options]

# Or install globally
npm install -g github-activity-box
github-activity-box [options]
```

**Options:**
- `--dry` - Preview output without updating the gist

**Required Environment Variables:**
| Variable      | Description                                                                |
| ------------- | -------------------------------------------------------------------------- |
| `GIST_ID`     | ID portion from your gist URL (`https://gist.github.com/username/GIST_ID`) |
| `GH_PAT`      | GitHub personal access token with `gist` scope                             |
| `GH_USERNAME` | Your GitHub username                                                       |

### GitHub Action Setup

#### Prerequisites

1. Create a new public [GitHub Gist](https://gist.github.com/)
2. Generate a [personal access token](https://github.com/settings/personal-access-tokens) with `gist` scope

#### Workflow Configuration

Create `.github/workflows/activity-box.yml`:

```yml
name: Activity Box
on:
  workflow_dispatch:
  schedule:
    - cron: '*/30 * * * *'  # Updates every 30 minutes

jobs:
  update-activity:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Update activity
        run: npx github-activity-box@0
        env:
          GH_PAT: ${{ secrets.GH_PAT }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GH_USERNAME: your-username
          GIST_ID: your-gist-id
```

#### Add Repository Secret

1. Navigate to **GitHub repo > Settings > Secrets > New repository secret**
2. Add `GH_PAT` with your personal access token value


---

_Inspired by [matchai/bird-box](https://github.com/matchai/bird-box) and forked from [JasonEtco/activity-box](https://github.com/JasonEtco/activity-box)_
