import React from "react";
import { render, waitFor } from "@testing-library/react";
import Recommendations from "./default";
import fetchRecommendations from "./_children/fetchRecommendations";

jest.mock("fusion:context", () => ({
	useFusionContext: () => ({ globalContent: null, arcSite: "the-site", isAdmin: true }),
}));

jest.mock("fusion:properties", () => ({
	__esModule: true,
	default: () => ({ fyRecommenderOrg: "the-org", fyRecommenderApiKey: "test-key" }),
}));

jest.mock("./_children/fetchRecommendations", () => ({
	__esModule: true,
	default: jest.fn(() => Promise.resolve({ content_elements: [], attribution: null })),
	buildAsiBase: (org) => `https://${org}-config-prod.api.arc-cdn.net`,
}));

jest.mock("./_children/RecommendationCarousel", () => ({
	__esModule: true,
	default: ({ items }) => <div data-testid="carousel">{items.length} items</div>,
}));

describe("Recommendations", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders a placeholder sentinel before fetch completes", () => {
		const { container } = render(<Recommendations />);
		const placeholder = container.querySelector(".b-recommendations__placeholder");
		expect(placeholder).toBeTruthy();
		expect(placeholder.getAttribute("aria-hidden")).toBe("true");
	});

	it("fetches real recommendations when preview mode is off", async () => {
		render(<Recommendations customFields={{ previewMode: false }} />);
		await waitFor(() => expect(fetchRecommendations).toHaveBeenCalled());
	});

	it("renders mock data in preview mode without calling the API", async () => {
		const { findByTestId } = render(<Recommendations customFields={{ previewMode: true }} />);
		const carousel = await findByTestId("carousel");
		expect(carousel).toHaveTextContent("6 items");
		expect(fetchRecommendations).not.toHaveBeenCalled();
	});

	it("requests recommendations for the preview user id when one is provided", async () => {
		render(
			<Recommendations customFields={{ previewMode: true, previewUserId: "preview-user-9" }} />,
		);
		await waitFor(() => expect(fetchRecommendations).toHaveBeenCalled());
		expect(fetchRecommendations).toHaveBeenCalledWith(
			expect.objectContaining({
				query: expect.objectContaining({ user_id: "preview-user-9" }),
			}),
		);
	});
});
