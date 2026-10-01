/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { navy: { 50:'#f1f5fb',100:'#dde6f3',200:'#b9c9e3',300:'#8aa3cc',400:'#5a79ad',500:'#3b5a90',600:'#2b4574',700:'#1f3459',800:'#162646',900:'#0f1c36',950:'#0a1428' }, teal: { 50:'#effaf9',100:'#d3f2ef',200:'#a8e4df',300:'#73d0ca',400:'#3fb5b0',500:'#239a97',600:'#1a7c7c',700:'#186264',800:'#174e50',900:'#164143' } },
    fontFamily: { sans: ['Inter','system-ui','Segoe UI','Roboto','Noto Sans Bengali','Kalpurush','Nirmala UI','Siyam Rupali','sans-serif'] }
  } },
  plugins: []
}
