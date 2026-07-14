/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chat: {
          bg: '#0b141a',
          sidebar: '#111b21',
          header: '#202c33',
          incoming: '#202c33',
          outgoing: '#005c4b',
          accent: '#00a884',
          active: '#2a3942',
        }
      },
      backgroundImage: {
        'chat-pattern': "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
      }
    },
  },
  plugins: [],
}
