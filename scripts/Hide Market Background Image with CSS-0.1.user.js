// ==UserScript==
// @name         Hide Market Background Image with CSS
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hide Market Background Image
// @author       Rabbit House
// @match        https://www.simcompanies.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add a style tag to the document head to hide the images with the specified class
    const style = document.createElement('style');
    style.innerHTML = 'img.css-1io2n3s { display: none !important; }';
    document.head.appendChild(style);
})();
