const siteFooterMarkup = `
  <div class="footer-grid">
    <div>
      <strong>Ali Senatore, Executive Chef and Registered Dietitian Nutritionist (RDN, CDN)</strong>
      <p>Serving Bergen County NJ, North Jersey, Rockland County NY, and New York City.</p>
      <a class="yelp-badge" href="https://www.yelp.com/biz/reimagined-nutrition-maywood" target="_blank" rel="noopener" aria-label="Find Reimagined Nutrition on Yelp">
        <img class="yelp-badge-mark" src="assets/yelp-burst.svg" alt="">
        <span class="yelp-badge-copy"><span>Find us on Yelp</span><span class="yelp-badge-note">Reviews and local details</span></span>
      </a>
    </div>
    <nav class="footer-links" aria-label="Footer navigation">
      <!-- Generated from navigation.json by scripts/sync-navigation.mjs. -->
      <a href="index.html">Home</a>
      <a href="specialized-recovery-meals.html">Meals</a>
      <a href="corporate-meals-office-lunches.html">Office</a>
      <a href="full-service-catering-events.html">Catering</a>
      <a href="nutrition-counseling.html">Counseling</a>
      <a href="about.html">About</a>
      <a href="contact-and-inquiry.html">Contact</a>
    </nav>
  </div>
  <p class="disclaimer">Reimagined Nutrition is not a substitute for medical advice. Always discuss changes to your nutrition, medication regimen, or medical care with your primary care provider or qualified healthcare professional.</p>
`;

document.querySelectorAll("[data-site-footer]").forEach((footer) => {
  footer.innerHTML = siteFooterMarkup;
});
