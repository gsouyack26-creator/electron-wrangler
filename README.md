# Electron Wrangler

An offline, single-file electrical-panel and circuit **troubleshooting trainer** for
Amazon RME (Reliability Maintenance Engineering) technicians.

Practise diagnosing real ACY1 material-handling and building/residential electrical
panels: trace circuits with a virtual meter, work timed trouble calls across power,
motor-control, open-circuit, voltage-drop, safety, controls, network, and multi-fault
categories, then check your reveal/fix walkthrough. Progress, best times, flashcards,
and a printable report card all save locally in your browser.

## Run it

Open **`index.html`** in any modern browser. No install, no internet, no login.
Everything (the full panel library, solver, and 66 trouble calls) is embedded in
that one file. It also installs as a PWA.

## Build

The distributable file is generated from source:

```
python3 build.py
```

This bundles `ElectronWrangler.html` (template) + `electron_wrangler.js` (engine) +
every `*.panel.json` (37 panels) into both `ElectronWrangler_dist.html` and
`index.html` (identical; `index.html` is what GitHub Pages serves).

## Edit

- **Trainer logic / trouble calls / component library:** `electron_wrangler.js`
- **Panels:** the `*.panel.json` files
- **Styles / shell:** `ElectronWrangler.html`

After any change, rerun `python3 build.py` and reload.
