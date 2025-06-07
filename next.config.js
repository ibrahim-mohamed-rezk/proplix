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
      {
        hostname: "fantasticegypt.com",
      },
      {
        hostname: "darkgrey-chough-759221.hostingersite.com",
      },
      // (https://thumbs.dreamstime.com/b/residential-real-estate-buying-selling-renting-homes-apartments-condos-townhouses-investment-shelter-expert-guidance-318813833.jpg?w=768) on `ne
      {
        hostname: "thumbs.dreamstime.com",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
