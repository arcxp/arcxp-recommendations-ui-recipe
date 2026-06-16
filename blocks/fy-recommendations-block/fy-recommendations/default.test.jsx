import React from "react";
import { render } from "@testing-library/react";
import FYRecommendations from "./default";

jest.mock("fusion:context", () => ({
	useFusionContext: () => ({ globalContent: null, arcSite: "the-site" }),
}));

jest.mock("./_children/fetchRecommendations", () => ({
	__esModule: true,
	default: jest.fn(() => Promise.resolve({ content_elements: [], attribution: null })),
}));

jest.mock("./_children/RecommendationCarousel", () => ({
	__esModule: true,
	default: ({ items }) => <div data-testid="carousel">{items.length} items</div>,
}));

describe("FYRecommendations", () => {
	it("renders a placeholder sentinel before fetch completes", () => {
		const { container } = render(<FYRecommendations />);
		const placeholder = container.querySelector(".b-fy-recommendations__placeholder");
		expect(placeholder).toBeTruthy();
		expect(placeholder.getAttribute("aria-hidden")).toBe("true");
	});
});
