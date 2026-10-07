import type { ExploreViewModel } from "../pages/ExplorePage";

/**
 * Explore has nothing to load up front: its data is the Metabase question, which only the live app renders
 * (the preview shows a stand-in). Seed a start or a save with --state '{"start":"revenue","saved":{"id":300,"name":"Revenue by country"}}'.
 */
export const fixture: ExploreViewModel = {};
