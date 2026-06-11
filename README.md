# ARC FY Recommendations UI Recipe

Example PageBuilder bundle (recipe) showing how to add **personalized FY
recommendations** to Arc XP pages. It contains two blocks that work together,
following the arc-themes-blocks naming and structure conventions:

| Block | Type | Role |
| ----- | ---- | ---- |
| [`blocks/fy-recommendations-block`](blocks/fy-recommendations-block) | Feature | Renders the ranked recommendations as a horizontal carousel (forked from the Story Carousel block). Fetches client-side after mount. |
| [`blocks/fy-recommendations-content-source-block`](blocks/fy-recommendations-content-source-block) | Content source | Server-side proxy to the FY Recommender that injects the gateway identity headers and returns ANS-shaped `content_elements`. |

The feature block fetches **client-side after mount** (never during SSR —
recommendations are per-user and must not be baked into shared, edge-cached HTML)
by calling the content source through Fusion's content-fetch endpoint. The content
source proxies the recommender server-side, where the `arc-organization` /
`arc-service` headers are injected.

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

## Bundle environment variable reference

Operators configuring the engine bundle must set the following variables. They
are read server-side by the content source (`fusion:environment`):

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `FY_RECOMMENDER_BASE` | yes | Base URL of the FY Recommender service, e.g. `https://recommender.<env>.arcxp.com`. The content source calls `GET {FY_RECOMMENDER_BASE}/recommend/v1/recommendations`. |
| `ORGANIZATION` | yes | Arc tenant id, injected as the `arc-organization` request header to the recommender. |

If either variable (or the resolved `user_id`) is missing, the content source
degrades to an empty result and the feature block renders nothing.

## Acceptance criteria coverage

- Feature block under `blocks/`, forked from the Story Carousel block.
- `customFields`: `displayAmount` (number, default `5`) and `lazyLoad` (bool,
  default `true`), plus `subscriptionTier` and `openInNewTab`.
- SSR renders a content-less placeholder — no fetch on the server.
- After mount: reads `user_id` from the first-party `fy_user_id`
  cookie/localStorage, derives `device_type` from the user agent, uses
  `Fusion.globalContent._id` as `item_id` on article pages, and calls
  `GET /recommend/v1/recommendations?site_id={site}&user_id={user_id}`.
- Empty result or network error → renders nothing.
- `RecommendationCarousel` renders `content_elements` as a compact horizontal
  carousel; missing fields degrade gracefully.
- Recommender ranking order is preserved.
- Unit tests cover: empty-result short-circuit, client-side fetch trigger, and
  empty/error-state rendering (`npm test`).

## Out of scope

Elevating the block to arc-themes-blocks canon, and a View API fallback for items
with `card === null`.
