module.exports = {
  plugins: {
    "@tailwindcss/postcss": {
      // Disable Lightning CSS optimization to reduce memory on low-RAM servers
      optimize: false,
    },
  },
};
