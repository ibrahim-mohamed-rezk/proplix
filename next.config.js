const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
/** @type {import('next').NextConfig} */
// https://fantasticegypt.com/images/mapofcairoegypt.jpg
// "https://darkgrey-chough-759221.hostingersite.com/",
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "fantasticegypt.com",
            },
            {
                hostname: "darkgrey-chough-759221.hostingersite.com",
            },
        ],
    },
};

module.exports = withNextIntl(nextConfig);
