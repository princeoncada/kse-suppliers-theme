/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'x-',
    important: true,
    content: [
        "./**/*.{html,liquid}",
        "./assets/*.css",
        "./assets/*.js"
    ],
    theme: {
        extend: {},
        screens: {
            'custom-md': '750px',
            'md': '990px',
            'custom-lg': '1175px',
            'lg': '1280px'
        }
    },
    plugins: [],
}