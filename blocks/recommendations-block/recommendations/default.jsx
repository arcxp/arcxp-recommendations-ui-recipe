import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "@arc-fusion/prop-types";
import { useFusionContext } from "fusion:context";
import getProperties from "fusion:properties";
import RecommendationCarousel from "./_children/RecommendationCarousel";
import fetchRecommendations, { buildAsiBase } from "./_children/fetchRecommendations";
import previewItems from "./_children/previewData";

const BLOCK_CLASS_NAME = "b-recommendations";

const getUserId = () => {
	try {
		const match = document.cookie.match(/(?:^|;\s*)fy_user_id=([^;]+)/);
		if (match) return decodeURIComponent(match[1]);
		return localStorage.getItem("fy_user_id") || null;
	} catch {
		return null;
	}
};

const getDeviceType = () => {
	const ua = navigator.userAgent;
	if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
	if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return "mobile";
	return "desktop";
};

function Recommendations({ customFields = {} }) {
	const {
		displayAmount = 5,
		lazyLoad = true,
		openInNewTab = false,
		previewMode = false,
		previewUserId = "",
	} = customFields;
	const { globalContent, arcSite, isAdmin } = useFusionContext();
	const trimmedPreviewUserId = typeof previewUserId === "string" ? previewUserId.trim() : "";
	// Preview Mode only takes effect in a preview context: the PageBuilder Admin
	// Preview (`isAdmin`, true only inside the editor) OR local development on
	// localhost (so `fusion start` can exercise the mock data). On a published
	// page neither is true, so previewMode is inert regardless of the saved value.
	// Evaluated inside effects/callbacks (client-side) where `window` exists.
	const isPreviewContext = useCallback(() => {
		if (isAdmin) return true;
		if (typeof window === "undefined") return false;
		return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
	}, [isAdmin]);
	// ASI host + key come from site properties (set per-deployment, e.g. in
	// PageBuilder admin), not customFields — they are deployment-wide, not
	// per-placement. `fyRecommenderAsiBase` is the explicit base; if only
	// `fyRecommenderOrg` is set we derive the host from the ASI convention.
	const siteProps = getProperties(arcSite) || {};
	const asiBase =
		siteProps.fyRecommenderAsiBase ||
		(siteProps.fyRecommenderOrg ? buildAsiBase(siteProps.fyRecommenderOrg) : undefined);
	const apiKey = siteProps.fyRecommenderApiKey;
	const [items, setItems] = useState(null);
	const [fetched, setFetched] = useState(false);
	const sentinelRef = useRef(null);
	// Response-level attribution (exposure_id, …) is captured here so it can be
	// round-tripped to the collector on exposure/click events later. Not wired yet.
	const attributionRef = useRef(null);

	const loadRecommendations = useCallback(() => {
		const previewActive = previewMode && isPreviewContext();

		// Preview Mode with no user id: render mock data and skip the network call
		// entirely (this is why no ASI request is made in preview).
		if (previewActive && !trimmedPreviewUserId) {
			attributionRef.current = null;
			setItems(previewItems);
			setFetched(true);
			return;
		}

		// Preview + a user id → recommend for that user; otherwise the visitor's own id.
		const userId = previewActive && trimmedPreviewUserId ? trimmedPreviewUserId : getUserId();
		const query = {
			num_results: displayAmount,
			device_type: getDeviceType(),
		};
		if (userId) query.user_id = userId;
		if (globalContent?._id) query.item_id = globalContent._id;

		fetchRecommendations({ asiBase, apiKey, site: arcSite, query })
			.then(({ content_elements: elements, attribution }) => {
				attributionRef.current = attribution;
				if (Array.isArray(elements) && elements.length > 0) {
					setItems(elements);
				}
			})
			.finally(() => setFetched(true));
	}, [arcSite, asiBase, apiKey, displayAmount, globalContent, previewMode, isPreviewContext, trimmedPreviewUserId]);

	useEffect(() => {
		// In a preview context (or when lazy-load is off) load immediately so the
		// mock/preview renders without scrolling; otherwise wait for the block to
		// scroll into view. Never fetches on the server.
		if (!lazyLoad || (previewMode && isPreviewContext())) {
			loadRecommendations();
			return undefined;
		}

		const el = sentinelRef.current;
		if (!el || typeof IntersectionObserver === "undefined") {
			loadRecommendations();
			return undefined;
		}

		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				observer.disconnect();
				loadRecommendations();
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [lazyLoad, previewMode, isPreviewContext, loadRecommendations]);

	if (items) {
		return (
			<div className={BLOCK_CLASS_NAME}>
				<RecommendationCarousel items={items} openInNewTab={openInNewTab} />
			</div>
		);
	}

	// After a completed fetch with no usable results (empty/error): render nothing.
	if (fetched) return null;

	// Before the fetch fires: a lightweight, content-less placeholder so lazy-load
	// has an element to observe. SSR emits this (no content), not a finished grid.
	return (
		<div ref={sentinelRef} className={`${BLOCK_CLASS_NAME}__placeholder`} aria-hidden="true" />
	);
}

Recommendations.label = "Recommendations – Arc Block";

// find matching icon in https://redirector.arcpublishing.com/pagebuilder/block-icon-library
Recommendations.icon = "ui-browser-slider";

Recommendations.propTypes = {
	customFields: PropTypes.shape({
		displayAmount: PropTypes.number.tag({
			label: "Number of recommendations",
			description: "Max items to display (default: 5)",
			defaultValue: 5,
			group: "Configure Content",
		}),
		lazyLoad: PropTypes.bool.tag({
			label: "Lazy load",
			description: "Fetch recommendations when the block scrolls into view",
			defaultValue: true,
			group: "Configure Content",
		}),
		openInNewTab: PropTypes.bool.tag({
			label: "Open links in new tab",
			description: "When enabled, recommendation links open in a new browser tab",
			defaultValue: false,
			group: "Configure Content",
		}),
		previewMode: PropTypes.bool.tag({
			label: "Preview Mode",
			description:
				"Editor-only. When on, the carousel shows dummy data (or recommendations for the Preview User ID below). Never affects the published page.",
			defaultValue: false,
			group: "Preview",
		}),
		previewUserId: PropTypes.string.tag({
			label: "Preview User ID",
			description:
				"Editor-only. With Preview Mode on, show recommendations for this user id. Leave empty to preview dummy data. Only used when Preview Mode is on.",
			group: "Preview",
		}),
	}),
};

export default Recommendations;
