/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Lets a verification build run beside `next dev` without sharing its .next folder:
  //   NEXT_DIST_DIR=.next-verify yarn build
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
