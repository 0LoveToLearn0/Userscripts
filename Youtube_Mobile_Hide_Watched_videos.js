// ==UserScript==
// @name         Youtube Mobile - Hide Watched videos
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://m.youtube.com/*
// ==/UserScript==

(function(_undefined) {

    const threshold = 90;
    const log = console.log;

    function run(){
        log('TEST');
        for(let p of document.querySelectorAll('.thumbnail-overlay-resume-playback-progress')){
            const w = parseInt(p.style.width);
            if(w > threshold){
                log(w);
                p.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
            }
        }
    }


    // ===========================================================

	// Hijack all XHR calls
	const send = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function (data) {
		this.addEventListener('readystatechange', function () {
			if (
			// Anytime more videos are fetched -- re-run script
				this.responseURL.indexOf('browse_ajax?action_continuation') > 0
			) {
				setTimeout(() => {
					run();
				}, 0);
			}
		}, false);
		send.call(this, data);
	};

	// ===========================================================

	const observeDOM = (function () {
		const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		const eventListenerSupported = window.addEventListener;

		return function (obj, callback) {
			log('[YTM-HWV] Attaching DOM listener');

			// Invalid `obj` given
			if (!obj) return;

			if (MutationObserver) {
				const obs = new MutationObserver(((mutations, _observer) => {
					if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
						// eslint-disable-next-line callback-return
						callback(mutations);
					}
				}));

				obs.observe(obj, {childList: true, subtree: true});
			} else if (eventListenerSupported) {
				obj.addEventListener('DOMNodeInserted', callback, false);
				obj.addEventListener('DOMNodeRemoved', callback, false);
			}
		};
	}());

	// ===========================================================

	log('[YTM-HWV] Starting Script');

	// YouTube does navigation via history and also does a bunch
	// of AJAX video loading. In order to ensure we're always up
	// to date, we have to listen for ANY DOM change event, and
	// re-run our script.
	observeDOM(document.body, run);

	run();
})();
