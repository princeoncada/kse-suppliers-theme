/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'x-',
	important: true,
	content: [
		"./**/*.liquid",
		"./**/*.css",
		"./**/*.html",
		"./**/*.js"
	],
	theme: {
		extend: {
		},
	  },
	plugins: [],
}