/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui'],

  turbopack: {
    resolveAlias: {
      // The package's source entry pulls in es5-ext shims that break under the
      // bundler ("contains.call is not a function"); its prebuilt ESM bundle
      // works. The exports map doesn't list it, hence the file path.
      pagedjs: './node_modules/pagedjs/dist/paged.esm.js',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  compress: true,
};

export default nextConfig;
