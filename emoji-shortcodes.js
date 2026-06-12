// ==UserScript==
// @name         Emoji Shortcode Replacer + Copy Preservation
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Display Gitmoji shortcodes as emojis while preserving shortcode text when copied
// @match        https://dashboard.pantheon.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Restrict processing to these selectors.
    const SELECTORS = [
        '.comment-body',
        '.markdown-body',
        '.issue-title',
        '.commit-message',
        '.commit-markdown-container',
        '.deploy-markdown-container'
    ];

    const EMOJIS = {
        ':art:': '🎨',
        ':zap:': '⚡️',
        ':fire:': '🔥',
        ':bug:': '🐛',
        ':ambulance:': '🚑️',
        ':sparkles:': '✨',
        ':memo:': '📝',
        ':rocket:': '🚀',
        ':lipstick:': '💄',
        ':tada:': '🎉',
        ':white_check_mark:': '✅',
        ':lock:': '🔒️',
        ':closed_lock_with_key:': '🔐',
        ':bookmark:': '🔖',
        ':rotating_light:': '🚨',
        ':construction:': '🚧',
        ':green_heart:': '💚',
        ':arrow_down:': '⬇️',
        ':arrow_up:': '⬆️',
        ':pushpin:': '📌',
        ':construction_worker:': '👷',
        ':chart_with_upwards_trend:': '📈',
        ':recycle:': '♻️',
        ':heavy_plus_sign:': '➕',
        ':heavy_minus_sign:': '➖',
        ':wrench:': '🔧',
        ':hammer:': '🔨',
        ':globe_with_meridians:': '🌐',
        ':pencil2:': '✏️',
        ':poop:': '💩',
        ':rewind:': '⏪️',
        ':twisted_rightwards_arrows:': '🔀',
        ':package:': '📦️',
        ':alien:': '👽️',
        ':truck:': '🚚',
        ':page_facing_up:': '📄',
        ':boom:': '💥',
        ':bento:': '🍱',
        ':wheelchair:': '♿️',
        ':bulb:': '💡',
        ':beers:': '🍻',
        ':speech_balloon:': '💬',
        ':card_file_box:': '🗃️',
        ':loud_sound:': '🔊',
        ':mute:': '🔇',
        ':busts_in_silhouette:': '👥',
        ':children_crossing:': '🚸',
        ':building_construction:': '🏗️',
        ':iphone:': '📱',
        ':clown_face:': '🤡',
        ':egg:': '🥚',
        ':see_no_evil:': '🙈',
        ':camera_flash:': '📸',
        ':alembic:': '⚗️',
        ':mag:': '🔍️',
        ':label:': '🏷️',
        ':seedling:': '🌱',
        ':triangular_flag_on_post:': '🚩',
        ':goal_net:': '🥅',
        ':dizzy:': '💫',
        ':wastebasket:': '🗑️',
        ':passport_control:': '🛂',
        ':adhesive_bandage:': '🩹',
        ':monocle_face:': '🧐',
        ':coffin:': '⚰️',
        ':test_tube:': '🧪',
        ':necktie:': '👔',
        ':stethoscope:': '🩺',
        ':bricks:': '🧱',
        ':technologist:': '🧑‍💻',
        ':money_with_wings:': '💸',
        ':thread:': '🧵',
        ':safety_vest:': '🦺'
    };

    const REVERSE_EMOJIS = Object.fromEntries(
        Object.entries(EMOJIS).map(([shortcode, emoji]) => [
            emoji,
            shortcode
        ])
    );

    const regex = new RegExp(
        Object.keys(EMOJIS)
            .map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|'),
        'g'
    );

    const reverseRegex = new RegExp(
        Object.keys(REVERSE_EMOJIS)
            .map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|'),
        'g'
    );

    function replaceText(node) {
        if (
            node.nodeType !== Node.TEXT_NODE ||
            !node.nodeValue ||
            !regex.test(node.nodeValue)
        ) {
            return;
        }

        node.nodeValue = node.nodeValue.replace(
            regex,
            match => EMOJIS[match]
        );
    }

    function walk(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT
        );

        let node;

        while ((node = walker.nextNode())) {
            replaceText(node);
        }
    }

    function process() {
        document
            .querySelectorAll(SELECTORS.join(','))
            .forEach(el => {
                if (el.dataset.emojiProcessed) {
                    return;
                }

                el.dataset.emojiProcessed = 'true';
                walk(el);
            });
    }

    process();

    new MutationObserver(() => {
        process();
    }).observe(document.body, {
        childList: true,
        subtree: true
    });

    document.addEventListener('copy', (event) => {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed) {
            return;
        }

        const range = selection.getRangeAt(0);

        const container =
            range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
                ? range.commonAncestorContainer
                : range.commonAncestorContainer.parentElement;


        let text = selection.toString();

        text = text.replace(
            reverseRegex,
            match => REVERSE_EMOJIS[match]
        );

        event.clipboardData.setData('text/plain', text);
        event.preventDefault();
    });
})();