# ARC FY Recommendations UI Recipe

Example PageBuilder bundle (recipe) showing how to add **personalized FY
recommendations** to Arc XP pages, following the arc-themes-blocks naming and
structure conventions.

| Block | Type | Role |
| ----- | ---- | ---- |
| [`blocks/fy-recommendations-block`](blocks/fy-recommendations-block) | Feature | Renders the ranked recommendations as a horizontal carousel (forked from the Story Carousel block). Fetches client-side after mount, browser-direct against the recommender ASI. |

The feature block fetches **client-side after mount** (never during SSR —
recommendations are per-user and must not be baked into shared, edge-cached HTML)
by calling the recommender **ASI** (Arc Service Integration) directly from the
browser. The `recommend` ASI is CORS-enabled and authenticated with an `X-Api-Key`
header, so no server-side content source is needed. See
[`fy/docs/ASI.md`](https://github.com/WPMedia/foryou-fy/blob/main/docs/ASI.md).

## Quickstart

```bash
npm install
npm test            # run the full block test suite
npm run test:coverage
```

The blocks import `@wpmedia/arc-themes-components`, `@arc-fusion/prop-types`, and
Fusion's virtual `fusion:*` modules. Those are provided by a real Arc engine
bundle / private registry and are **not** installed here; the jest suite resolves
them to local mocks under [`jest/mocks/`](jest/mocks) via `moduleNameMapper`, so
tests run without registry access.

## Configuration (site properties)

The ASI host + key are read from **site properties** (set per-deployment, e.g. in
PageBuilder admin), not custom fields. Because the block calls the ASI
browser-direct, these values are shipped to the client.

| Site property          | Required | Description                                                          |
| ---------------------- | -------- | -------------------------------------------------------------------- |
| `fyRecommenderApiKey`  | yes      | Headless API token sent as `X-Api-Key`. Use a low-privilege key.     |
| `fyRecommenderAsiBase` | no       | Full ASI base URL. If unset, derived from `fyRecommenderOrg`.        |
| `fyRecommenderOrg`     | no       | Arc org slug → host `https://<org>-config-prod.api.arc-cdn.net`.     |

If the host/key (or the resolved `user_id`) is missing, the block degrades to an
empty result and renders nothing.

> **CORS:** the browser calls the ASI directly, so the deployed origin must be in
> the ASI's provisioned `cors_allowed_origins` (exact origin, no path), and the ASI
> must allow the `X-Api-Key` header on preflight. See
> [`fy/docs/ClientOnboarding.md`](https://github.com/WPMedia/foryou-fy/blob/main/docs/ClientOnboarding.md).

## Acceptance criteria coverage

- Feature block under `blocks/`, forked from the Story Carousel block.
- `customFields`: `displayAmount` (number, default `5`), `lazyLoad` (bool, default
  `true`), and `openInNewTab` (bool, default `false`).
- SSR renders a content-less placeholder — no fetch on the server.
- After mount: reads `user_id` from the first-party `fy_user_id`
  cookie/localStorage, derives `device_type` from the user agent, uses
  `Fusion.globalContent._id` as `item_id` on article pages, and calls
  `GET <asiBase>/recommend/v1/recommendations?site_id={site}&user_id={user_id}`
  with the `X-Api-Key` header.
- Empty result or network/CORS error → renders nothing.
- `RecommendationCarousel` renders `content_elements` as a compact horizontal
  carousel; missing fields degrade gracefully.
- Recommender ranking order is preserved.
- Unit tests cover the client-side fetch trigger and placeholder rendering
  (`npm test`).

## Out of scope

Elevating the block to arc-themes-blocks canon, and a View API fallback for items
with `card === null`.
