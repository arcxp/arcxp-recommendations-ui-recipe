// Dummy recommendations used by the block's Preview Mode (editor-only + local dev)
// and by Storybook. ANS-shaped — the same subset scoredItemToAns produces from the
// recommender ASI response — so the carousel renders them like real recommendations.
//
// Intentionally NO promo_items / thumbnail_url: the carousel falls back to its
// built-in CSS placeholder (`__card-image-placeholder`, a 16/9 gradient) for the
// image area. This keeps the preview fully offline — it never depends on an
// external image host that could be blocked in a devcontainer or local network.
const previewItems = [
	{
		_id: "preview-1",
		headlines: { basic: "How AI is reshaping modern newsrooms" },
		websites: { "the-site": { website_url: "#1" } },
		credits: { by: [{ name: "Sarah Chen" }] },
		taxonomy: { sections: [{ name: "Technology" }] },
		label: { isPremium: { display: true } },
		additional_properties: { fy_position: 0, fy_attribution_id: "preview-attr-1" },
	},
	{
		_id: "preview-2",
		headlines: { basic: "The week in politics" },
		websites: { "the-site": { website_url: "#2" } },
		taxonomy: { sections: [{ name: "Politics" }] },
		additional_properties: { fy_position: 1, fy_attribution_id: "preview-attr-2" },
	},
	{
		_id: "preview-3",
		headlines: { basic: "Markets rally on rate news" },
		websites: { "the-site": { website_url: "#3" } },
		credits: { by: [{ name: "Jordan Lee" }] },
		additional_properties: { fy_position: 2, fy_attribution_id: "preview-attr-3" },
	},
	{
		_id: "preview-4",
		headlines: { basic: "Climate summit reaches landmark agreement" },
		websites: { "the-site": { website_url: "#4" } },
		credits: { by: [{ name: "Maria Reyes" }] },
		taxonomy: { sections: [{ name: "World" }] },
		additional_properties: { fy_position: 3, fy_attribution_id: "preview-attr-4" },
	},
	{
		_id: "preview-5",
		headlines: { basic: "Local schools embrace new curriculum" },
		websites: { "the-site": { website_url: "#5" } },
		credits: { by: [{ name: "Tom Nguyen" }] },
		taxonomy: { sections: [{ name: "Education" }] },
		label: { isPremium: { display: true } },
		additional_properties: { fy_position: 4, fy_attribution_id: "preview-attr-5" },
	},
	{
		_id: "preview-6",
		headlines: { basic: "Sports roundup: playoffs heat up" },
		websites: { "the-site": { website_url: "#6" } },
		credits: { by: [{ name: "Alex Kim" }] },
		taxonomy: { sections: [{ name: "Sports" }] },
		additional_properties: { fy_position: 5, fy_attribution_id: "preview-attr-6" },
	},
];

export default previewItems;
