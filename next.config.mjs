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
		root: import.meta.dirname,
	  },
};

export default nextConfig;
