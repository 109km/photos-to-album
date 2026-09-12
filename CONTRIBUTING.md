# Contributing

Thanks for helping make photo albums easier to create. Useful contributions include clearer onboarding, reproducible bug reports, portability fixes and new album styles.

Contributions to this skill are provided under the [MIT License](LICENSE). Only submit work you have the right to contribute, and retain any applicable third-party notices.

## Start here

1. Read [README.md](README.md) and run `npm run setup`.
2. Run `npm run demo` to create a reproducible album without personal photos.
3. Make one focused change. Preserve the default look and existing settings unless the change explicitly addresses them.
4. Run `npm test`, `npm run check` and the relevant example again.

For a renderer change, inspect a resting spread, the full page turn and its landing. Compare a delivered still with the corresponding video spread. Metadata checks cannot catch visual regressions.

## Where things live

| Path | Responsibility |
|---|---|
| `SKILL.md` | Agent workflow, routing, defaults and preservation rules |
| `references/` | Photo treatments, renderer contract and troubleshooting |
| `scripts/setup.mjs` | Dependency/browser setup and smoke check |
| `scripts/render.mjs` | Job validation, shared still/video export |
| `assets/travel-album/` | Canonical book geometry, lighting and animation |
| `examples/demo.mjs` | Synthetic reproducible input and export |
| `agents/openai.yaml` | Codex display metadata and starting prompt |

## Add a photo treatment

`photo_style` accepts a description; a new artistic medium usually needs no renderer changes. Change only the non-human scenery treatment. Preserve the defaults when the parameter is omitted.

Use a dedicated reference document only when the mode needs special behavior. `origin` is one example: it skips generation and uses contain fitting. Link the document from SKILL.md and add a short README example. Keep the parameter name consistent.

## Add an album animation style

Add `references/<style-id>.md` describing the appearance, defaults and renderer entrypoint. Add `assets/<style-id>/` only when a different implementation is needed. Follow the [composition contract](references/render.md#alternate-renderers).

The same component must export the book PNGs and video. Do not introduce a second framing implementation. Keep `travel-album` as the default, and use the renderer's template-path argument for alternate templates; there is no public `video_style` CLI parameter yet.

Keep README.md and README_CN.md aligned when changing user-facing behavior. Add English/Chinese aliases in scripts/options.mjs and tests in scripts/options.test.mjs; reject conflicting settings rather than silently overriding them.

## Dependencies and tests

Keep all Remotion packages on the same exact version. Update package.json and package-lock.json together, then test `npm run setup` from a clean checkout. Browser downloads and rendering require network/disk resources. Never use personal photos in automated tests.

The smoke check is small by design. It checks installation and export, not subjective styling or every possible ratio. Report which platforms and settings you actually tested.

## Sharing changes

Explain the user-visible problem, the resulting behavior and the tests performed. Include a synthetic before/after example for visual changes. Do not commit node_modules, generated production media, API keys, private paths or photos without redistribution permission.
