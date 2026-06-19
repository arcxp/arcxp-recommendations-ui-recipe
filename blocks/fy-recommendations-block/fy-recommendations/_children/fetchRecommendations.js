/* global globalThis */
// Client-side data fetch for the FY Recommendations block.
//
// Browser-direct against the recommender ASI (Arc Service Integration). The
// `recommend` ASI is CORS-enabled and browser-facing, authenticated with an
// `X-Api-Key` header (see fy/docs/ASI.md and ClientOnboarding.md). This replaces
// the previous content-source proxy — no server-side hop is needed.
//
// ⚠️ Host convention (the gotcha): `<org>-config-prod.api.arc-cdn.net`. The middle
// segment `config` is the ASI's literal siteId, NOT the content `site_id` query
// param — that one is the Arc website id (e.g. arcSite). `prod` is fixed (FY only
// provisions prod) and the edge host carries no region segment (platform-global).

import scoredItemToAns from "./scoredItemToAns";

export const buildAsiBase = (org) => `https://${org}-config-prod.api.arc-cdn.net`;

export const buildRecommendationsUrl = ({ asiBase, siteId, query = {} }) => {
	const params = new URLSearchParams({
		site_id: siteId,
		num_results: String(query.num_results ?? 5),
	});
	if (query.user_id) params.set("user_id", query.user_id);
	if (query.item_id) params.set("item_id", query.item_id);
	if (query.device_type) params.set("device_type", query.device_type);
	return `${asiBase}/recommend/v1/recommendations?${params.toString()}`;
};

const EMPTY = { content_elements: [], attribution: null };

const fetchRecommendations = async ({ asiBase, apiKey, site, query = {}, signal } = {}) => {
	// Missing config (no host/key/site) → render nothing rather than throw.
	if (!asiBase || !apiKey || !site) return EMPTY;

	const url = buildRecommendationsUrl({ asiBase, siteId: site, query });

	try {
		const res = await globalThis.fetch(url, {
			method: "GET",
			headers: { "X-Api-Key": apiKey },
			signal,
		});
		if (!res.ok) return EMPTY;

		const data = await res.json();
		const recs = Array.isArray(data?.recommendations) ? data.recommendations : [];
		return {
			content_elements: recs.map((s) => scoredItemToAns(s, site)),
			attribution: data?.attribution ?? null,
		};
	} catch {
		// Network/HTTP/parse/CORS error: degrade to empty.
		return EMPTY;
	}
};

export default fetchRecommendations;
