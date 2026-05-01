/**
 * CampaignClientContainer.tsx
 *
 * Client-side lazy-load wrapper for the Campaign Dashboard. Uses `next/dynamic`
 * with `ssr: false` to prevent the localStorage-dependent CampaignDashboard from
 * being server-rendered (which would cause a hydration mismatch since localStorage
 * is only available in the browser).
 *
 * Shows a loading placeholder while the CampaignDashboard chunk downloads.
 *
 * Used by:
 *   - `src/app/(website)/campaign/page.tsx`
 */
'use client';

import dynamic from 'next/dynamic';

const CampaignDashboard = dynamic(
	() => import('./CampaignDashboard'),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center py-16">
				<p className="text-stone-dark marcellus">Loading campaign dashboard...</p>
			</div>
		),
	}
);

const CampaignClientContainer = () => {
	return <CampaignDashboard />;
};

export default CampaignClientContainer;
