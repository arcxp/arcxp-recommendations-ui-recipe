User story

As an editor, when I want to enhance a page, I want to drop a fy-recommendations custom feature block onto a layout so that I can display personalized recommendations to users.

As a developer, when I integrate the fy-recommendations, I want it to fetch and rank-preserve recommendations correctly so that the content displayed is relevant and ordered as the recommender intended.

Context

This ticket implements the PageBuilder primitives that allow editors to add recommendation-driven content to pages. The implementation follows ADR-002 (PageBuilder primitives) and ADR-004 (content inflation strategy). It includes the following:

A feature block that renders (forks) a Story Carousel Block, using the response from the Recommendation API

An implementation guide in dev.arcxp.com & example code in a GitHub repository in the https://github.com/arcxp org

The Recommender response now includes embedded card rendering metadata, allowing the content source to make a single call to the Recommender.

Acceptance criteria

Feature block

fy-recommendations feature block is added under blocks/ in an example pagebuilder bundle, forked from the Story Carousel Block

customFields includes recommendationContentConfig: PropTypes.displayAmount (number, default 5), and lazyLoad (bool, default true).

SSR renders a skeleton or nothing — no content fetch on the server.

After mount, the component reads user_id from the agreed first-party cookie/localStorage key and fires GET /recommend/v1/recommendations?site_id={site}&user_id={user_id}

num_resultsdefaults to 5, but can be configured by the PB editor

item_idshould be null by default. If the recommendations are being rendered on an article, item_id should be the ID of the content that is currently being read. item_id is always read from Fusion.globalContent._id.

subscription_tier (how do we determine this without input from a client developer?)

device_typeis derived from browser APIs (useragent)

On empty result or network error, renders nothing.

RecommendationCarousel component

RecommendationCarousel renders content_elements as a compact horizontal carousel.

Consumes _id, headlines.basic, promo_items, websites, thumbnail_url, url, and display_date from each element. Missing fields degrade gracefully.

Verification

Unit tests cover: empty-result short-circuit, feature block client-side fetch trigger, and empty/error-state rendering.

FY_RECOMMENDER_BASE and ORGANIZATION are documented in the bundle environment variable reference for operators configuring the engine bundle.

Block bundles and renders successfully on a test PageBuilder site with a real FY tenant configured.

Other information

This ticket is blocked by Part 1 (contract PR) of the new Recommender enrichment ticket.

Suggested approach includes maintaining the naming convention for the block to align with arc-themes-blocks.

Out of scope includes elevating the block to arc-themes-blocks canon and implementing a View API fallback for items with card === null.

