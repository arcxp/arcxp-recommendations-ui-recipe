import React from "react";
import RecommendationCarousel from "../_children/RecommendationCarousel";
import previewItems from "../_children/previewData";

// The full feature (features/fy-recommendations/default.jsx) fetches client-side,
// so stories drive the presentational carousel directly with ANS-shaped sample
// data — the same shape scoredItemToAns produces from the recommender ASI response.
// This is the same data the block's Preview Mode renders in the PageBuilder editor.
export default {
	title: "Blocks/Recommendations",
	parameters: {
		chromatic: { viewports: [320, 1200] },
	},
};

export const withRecommendations = () => <RecommendationCarousel items={previewItems} />;
