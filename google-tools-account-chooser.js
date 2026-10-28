// ==UserScript==
// @name         Google Tools Account Chooser
// @namespace    google-tools-account-chooser
// @version      1.2.0
// @description  Requests Google account selection on supported page loads, removing account hints while preserving the destination.
// @author       Your Name
// @match        https://analytics.google.com/*
// @match        https://lookerstudio.google.com/*
// @match        https://datastudio.google.com/*
// @match        https://tagmanager.google.com/*
// @run-at       document-start
// @noframes
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const MARKER_PARAM = 'chooser_redirect';
    const MARKER_VALUE = 'true';
    const ACCOUNT_CHOOSER_URL =
        'https://accounts.google.com/AccountChooser';

    const LOOKER_HOSTS = new Set([
        'lookerstudio.google.com',
        'datastudio.google.com',
    ]);

    // Do not redirect embedded reports or other framed pages.
    if (window.self !== window.top) {
        return;
    }

    const destination = new URL(window.location.href);

    // Keep this marker on the return URL to prevent repeated redirects.
    if (
        destination.searchParams.getAll(MARKER_PARAM)
            .includes(MARKER_VALUE)
    ) {
        return;
    }

    // Remove a leading Looker Studio account path:
    // /u/3/navigation -> /navigation
    if (LOOKER_HOSTS.has(destination.hostname)) {
        destination.pathname = destination.pathname.replace(
            /^\/u\/\d+(?=\/|$)/,
            ''
        ) || '/';
    }

    // Remove all query-string account hints, regardless of their value.
    destination.searchParams.delete('authuser');
    destination.searchParams.set(MARKER_PARAM, MARKER_VALUE);

    const chooser = new URL(ACCOUNT_CHOOSER_URL);
    chooser.searchParams.set('continue', destination.href);

    // Replace this navigation so Back does not revisit the redirecting URL.
    window.location.replace(chooser.href);
})();
