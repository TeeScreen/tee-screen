import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },

    typescript: {
        ignoreBuildErrors: false,
        tsconfigPath: 'tsconfig.json',
    },
};



export default nextConfig;
