/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
		  {
			protocol: "https",
			hostname: "cdn.sanity.io",
		  },
		],
	  },
	turbopack: {
		// options
	  },
};

export default nextConfig;
