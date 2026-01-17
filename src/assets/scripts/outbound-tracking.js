/**
 * Outbound Link Tracking for Fathom Analytics
 * Tracks clicks on company website links
 */
(function() {
  'use strict';

  // Only run if Fathom is available
  if (typeof fathom === 'undefined') {
    return;
  }

  // Track clicks on elements with data-track-outbound attribute
  document.addEventListener('click', function(event) {
    var link = event.target.closest('[data-track-outbound]');

    if (!link) {
      return;
    }

    var companyName = link.getAttribute('data-track-outbound');

    if (companyName) {
      fathom.trackEvent('Visit: ' + companyName);
    }
  });
})();
