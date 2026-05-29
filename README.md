# ECFS 2026 Conference Data Archive

Static GitHub Pages interface for `ecfs_2026_conference_presentations.json`, with a plain-text Markdown export at `assets/data/ecfs_2026_conference_presentations.md`.

The site follows the same static archive pattern as `conference-data`, adapted for the ECFS Lisbon 2026 programme and color system.

## Local preview

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Rebuild the browser index and Markdown export

```powershell
python scripts/build_site_data.py
```
