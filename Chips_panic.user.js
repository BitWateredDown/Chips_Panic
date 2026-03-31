// ==UserScript==
// @name         Torn Panic Button
// @namespace    jim.panic.button
// @version      1.1
// @description  Panic deposit button for Torn
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/BitWateredDown/Chips_Panic/refs/heads/main/Chips_panic.user.js
// @downloadURL  https://raw.githubusercontent.com/BitWateredDown/Chips_Panic/refs/heads/main/Chips_panic.user.js

// ==/UserScript==

(function() {
    'use strict';

    const TARGET_URL = "https://www.torn.com/factions.php?step=your#/tab=armoury";
    const MIN_MONEY = 5000000;

    let stage = 0; // 0 = first click, 1 = second click

    GM_addStyle(`
        #panicBtn {
            position: fixed;
            bottom: 120px;
            right: 40px;
            z-index: 999999;
            background: #8b0000;
            color: #fff;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            border: 2px solid #550000;
            box-shadow: 0 0 10px rgba(255,0,0,0.6);
            font-family: Tahoma, sans-serif;
        }
        #panicBtn:hover {
            background: #b30000;
        }
    `);

    function getMoneyOnHand() {
        const el = document.querySelector("[data-money]");
        if (!el) return 0;
        return Number(el.getAttribute("data-money")) || 0;
    }

    function createButton() {
        if (document.getElementById("panicBtn")) return;

        const btn = document.createElement("div");
        btn.id = "panicBtn";
        btn.textContent = "PANIC";

        btn.addEventListener("click", handleClick);

        document.body.appendChild(btn);
    }

    function handleClick() {
        const onArmoury = location.href.includes("factions.php?step=your#/tab=armoury");

        if (!onArmoury) {
            stage = 0; // reset stage when navigating
            location.href = TARGET_URL;
            return;
        }

        // On the armoury page
        if (stage === 0) {
            populateAmount();
            stage = 1;
        } else {
            submitDeposit();
            stage = 0; // reset after deposit
        }
    }

    function populateAmount() {
        waitForElement("input.amount.input-money[data-money]", input => {
            const amount = input.getAttribute("data-money");
            input.value = amount;
        });
    }

    function submitDeposit() {
        waitForElement("button.torn-btn[i-data]", btn => {
            btn.click();
        });
    }

    function waitForElement(selector, callback) {
        const el = document.querySelector(selector);
        if (el) {
            callback(el);
            return;
        }

        const obs = new MutationObserver(() => {
            const el2 = document.querySelector(selector);
            if (el2) {
                obs.disconnect();
                callback(el2);
            }
        });

        obs.observe(document.body, { childList: true, subtree: true });
    }

    function maybeShowButton() {
        const money = getMoneyOnHand();
        if (money > MIN_MONEY) {
            createButton();
        }
    }

    maybeShowButton();

    const obs = new MutationObserver(maybeShowButton);
    obs.observe(document.body, { childList: true, subtree: true });

})();
