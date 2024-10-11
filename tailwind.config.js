/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'x-',
	important: true,
	content: [
		"./**/*.liquid",
		"./**/*.css",
		"./**/*.html",
	],
	theme: {
		extend: {},
        screens: {
            'md': '990px',
            'lg': '1280px'
        }
	},
	plugins: [],
}