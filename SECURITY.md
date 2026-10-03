# Security and data boundaries

DraftWeft is local-only after its static assets load. No analytics, fetch/XHR, WebSocket, authentication, cookies, localStorage, IndexedDB, service worker, external fonts, or hardware integration is used. The only external links are explicit documentation links; clicking them leaves the app and makes the usual browser request. The local dev server binds to 127.0.0.1.

The page has a restrictive Content Security Policy with `connect-src 'none'`, local scripts/workers/styles, no plugins, no forms, and no inline scripts. No user content is rendered as HTML. SVG is built from validated values and XML-escaped text. Download filenames are fixed. No archive or arbitrary WIF imports are accepted.

JSON input is limited to 64 KiB, a strict four-field schema, 32×32 Boolean cells, and bounded metadata. Newline/control/invalid XML characters in titles are rejected. Unknown keys are escaped in CLI diagnostics to prevent terminal control injection. Objects are reconstructed field by field; prototype-pollution fields are rejected.

Compilation is bounded by model size and isolated in a worker. Cancellation terminates it; stale messages are ignored; a 5-second watchdog stops unresponsive processing. An in-flight file read cannot overwrite a newer edit. Edits invalidate prior draft exports.

The CLI never modifies the input and only creates a new output directory. An existing or symlink output destination is refused. I/O failures may leave a partial newly created directory; no rollback deletes user files.

Browser sandbox restrictions are respected. The local launch failed on socket/security restrictions, and no `--no-sandbox` workaround was used. CI uses sandbox-enabled Chromium. Ubuntu 22.04 is a temporary browser baseline scheduled to retire on 2027-04-17; migrate the runner with a sandbox-enabled proof run before that date.

No remote security policy or production deployment has been audited. Do not submit credentials, personal records, sensitive designs, or confidential material to an untrusted hosted copy. The app's privacy claim applies to the supplied code, not arbitrary hosting infrastructure or browser extensions.
