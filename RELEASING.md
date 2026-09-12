# Release checklist

This file is for maintainers; users should start with [README.md](README.md).

## Before the first public release

- [x] Adopt MIT with copyright holder shaoxinheng; add LICENSE and synchronize package metadata and both READMEs.
- [ ] Confirm rights to contributed code and approved demo media before publication. Dependency terms are summarized in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md); a source scan cannot prove ownership.
- [ ] Set the real repository/support links after a repository exists. Do not publish example links that point to a nonexistent owner or repository.
- [ ] Verify the distributable contains only skill code, documentation, synthetic assets and the approved public demo (`assets/demo-4k.mp4` and `assets/demo-poster.jpg`). Exclude original photos, production metadata and the separate web app.
- [ ] Run setup, check and demo from a fresh copy of the distributable.
- [ ] Keep platform claims accurate: macOS tested; Windows/Linux unverified until tested.

## Every release

- [ ] Keep package.json and package-lock.json synchronized and Remotion versions matched.
- [ ] Run `npm test`, `npm run setup`, `npm run check` and `npm run demo`.
- [ ] Inspect stills, the complete turn, landing and final hold; test any changed ratios or timing.
- [ ] Review dependency advisories and licenses; record the versions tested.
- [ ] Check relative documentation links, example commands and defaults against code.
- [ ] Exclude node_modules, outputs, environment files, caches, private originals and production metadata. A gitignore does not sanitize previously tracked files or a manually zipped folder.
- [ ] Note limitations honestly. Brief page-turn clipping is accepted; do not report it as fixed.

Suggested release contents: README.md, README_CN.md, LICENSE, THIRD_PARTY_NOTICES.md, SKILL.md, CONTRIBUTING.md, RELEASING.md, package.json, package-lock.json, .gitignore, agents/, references/, scripts/, examples/ and assets/ (the shared renderer, synthetic reference/GIF and approved public demo only). Review the actual archive contents before uploading.
