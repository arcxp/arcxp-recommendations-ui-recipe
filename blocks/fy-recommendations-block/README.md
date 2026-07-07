# @wpmedia/fy-recommendations-block

A personalized recommendations carousel, forked from the Story Carousel block. It
renders the ranked items returned by the Recommender as a compact horizontal
carousel.

The block fetches **client-side after mount** (nothing is fetched during SSR —
recommendations are per-user and must not be baked into shared, edge-cached HTML)
by calling the recommender **ASI** (Arc Service Integration) directly from the
browser. The `recommend` ASI is CORS-enabled and authenticated with an `X-Api-Key`
header, so no content-source proxy is needed. See
[`fy/docs/ASI.md`](https://github.com/WPMedia/foryou-fy/blob/main/docs/ASI.md).

Host + key come from **site properties** (set per-deployment, e.g. in PageBuilder
admin), not custom fields:

| Site property          | Required | Description                                                            |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| `fyRecommenderApiKey`  | yes      | Headless API token sent as `X-Api-Key`. Set in admin; never in repo.   |
| `fyRecommenderAsiBase` | no       | Full ASI base URL. If unset, derived from `fyRecommenderOrg`.          |
| `fyRecommenderOrg`     | no       | Arc org slug → host `https://<org>-config-prod.api.arc-cdn.net`.       |

## Props

| **Prop**     | **Required** | **Type**        | **Description**           |
| ------------ | ------------ | --------------- | ------------------------- |
| customFields | yes          | PropTypes.shape | Pagebuilder Custom Fields |

### customFields

All custom fields live in the **Configure Content** group in the PageBuilder editor.

| **Prop**      | **Required** | **Type**         | **Description**                                         |
| ------------- | ------------ | ---------------- | ------------------------------------------------------- |
| displayAmount | no           | PropTypes.number | Max items to display. Default `5`.                      |
| lazyLoad      | no           | PropTypes.bool   | Fetch when the block scrolls into view. Default `true`. |
| openInNewTab  | no           | PropTypes.bool   | Open recommendation links in a new tab. Default `false`.|

> `subscriptionTier` was intentionally removed: as a custom field it is editor-set and
> static (same value for every visitor), which contradicts per-user personalization. If a
> tier is ever needed it must be derived from the user at runtime, not pinned in the admin.

## How it works

End-to-end flow, from PageBuilder render to the rendered carousel:

1. **Config resolution.** Custom fields (`displayAmount`, `lazyLoad`, `openInNewTab`) come
   per-placement from the editor. The ASI host + key come per-deployment from site
   properties: `asiBase` is `fyRecommenderAsiBase`, or derived from `fyRecommenderOrg`;
   the key is `fyRecommenderApiKey`.
2. **SSR — no fetch.** Recommendations are per-user, so nothing is fetched on the server.
   The server emits only a content-less placeholder `<div>` (the lazy-load sentinel).
3. **After mount — when to load.** If `lazyLoad` is off, it loads immediately. If on, an
   `IntersectionObserver` watches the sentinel and loads only when the block scrolls into
   view (falling back to an immediate load if the observer is unavailable).
4. **Gather user signals.** Builds the query: `num_results` (= `displayAmount`),
   `device_type` (from the user agent), `user_id` (from the `fy_user_id` cookie, falling
   back to `localStorage`), and `item_id` (from `Fusion.globalContent._id` when on a
   content page — a "more like this" anchor). Missing signals are omitted.
5. **Call the ASI.** `GET <asiBase>/recommend/v1/recommendations?site_id=<arcSite>&…` with
   the `X-Api-Key` header, browser-direct (CORS-enabled). Note `site_id` is the Arc website
   id (`arcSite`), **not** the `config` segment in the ASI host.
6. **Map to ANS.** Each `ScoredItem` is mapped to the ANS subset the carousel consumes (see
   *ANS Fields* below), carrying `position` / `attribution_id` into `additional_properties`.
7. **Render decision.** With items → render the carousel. After a completed fetch with no
   usable results (empty list, HTTP error, or network/CORS error) → render nothing. Before
   the fetch resolves → keep the placeholder.
8. **Carousel.** Renders a horizontal carousel (forked from Story Carousel) of cards:
   image, category, headline, author, and a premium ribbon. Each card links to the item's
   `website_url`; items without a URL are skipped. Missing fields degrade gracefully.

## ANS Fields

Consumed from each `content_elements[x]` (missing fields degrade gracefully):

- `headlines.basic`
- `promo_items.basic.url` (cover image)
- `websites[arcSite].website_url` (link)
- `taxonomy.sections[0].name` (category)
- `credits.by[0].name` (author)
- `label.isPremium.display` (premium ribbon)
- `additional_properties.fy_position` / `fy_attribution_id` (analytics round-trip)

## Internationalization fields

| Phrase key                             | Default (English)                |
| -------------------------------------- | -------------------------------- |
| `fy-recommendations.aria-label`        | `Recommended for you`            |
| `fy-recommendations.right-arrow-label` | `Next`                           |
| `fy-recommendations.left-arrow-label`  | `Previous`                       |
| `fy-recommendations.slide-indicator`   | `Slide %{current} of %{maximum}` |
| `fy-recommendations.premium-label`     | `Premium`                        |

## Events

N/A today. The block captures the response `attribution` (`exposure_id`) and per-item
`fy_attribution_id` so exposure/click events can be round-tripped to the collector
in a follow-up.
