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
