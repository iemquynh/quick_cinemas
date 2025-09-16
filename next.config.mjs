import pwa from 'next-pwa'
/** @type {import('next').NextConfig} */

const withPWA = pwa({
    dest: 'public',
    buildExcludes: [/app-build-manifest\.json$/, /middleware-manifest\.json$/],
    register: true,
})
const nextConfig = {
    output: 'standalone',
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
};

export default withPWA(nextConfig)