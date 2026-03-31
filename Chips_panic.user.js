// ==UserScript==
// @name         Torn Panic Button
// @namespace    jim.panic.button
// @version      1.0
// @description  Panic deposit button for Torn
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const TARGET_URL = "https://www.torn.com/factions.php?step=your#/tab=armoury";
    const MIN_MONEY = 5000000; // 5m threshold

    // --- STYLE ---
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

    // --- SOUND ---
    const alertSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

    // --- API CHECK FOR ATTACKS ---
    async function checkAttack() {
        try {
            const key = ""; // <-- Insert your API key if you want attack detection
            if (!key) return;

            const res = await fetch(`https://api.torn.com/user/?selections=notifications&key=${key}`);
            const data = await res.json();

            if (data.notifications?.attacked) {
                alertSound.play();
            }
        } catch (e) {}
    }
    setInterval(checkAttack, 15000); // check every 15s

    // --- GET MONEY ON HAND ---
    function getMoneyOnHand() {
        const el = document.querySelector("[data-money]");
        if (!el) return 0;
        return Number(el.getAttribute("data-money")) || 0;
    }

    // --- CREATE BUTTON ---
    function createButton() {
        if (document.getElementById("panicBtn")) return;

        const btn = document.createElement("div");
        btn.id = "panicBtn";
        btn.textContent = "PANIC";

        btn.addEventListener("click", () => {
            if (!location.href.includes("factions.php?step=your#/tab=armoury")) {
                location.href = TARGET_URL;
                return;
            }
            handleDeposit();
        });

        document.body.appendChild(btn);
    }

    // --- DEPOSIT HANDLER ---
    function handleDeposit() {
        const input = document.querySelector("input.amount.input-money[data-money]");
        const depositBtn = document.querySelector("button.torn-btn[i-data]");

        if (!input || !depositBtn) return;

        const amount = input.getAttribute("data-money");
        input.value = amount;

        depositBtn.click();
    }

    // --- SHOW BUTTON ONLY IF MONEY > 5M ---
    function maybeShowButton() {
        const money = getMoneyOnHand();
        if (money > MIN_MONEY) {
            createButton();
        }
    }

    // Run on load + observe DOM changes
    maybeShowButton();

    const obs = new MutationObserver(maybeShowButton);
    obs.observe(document.body, { childList: true, subtree: true });

})();
