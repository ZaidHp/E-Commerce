// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

//h-screen w-[60%] max-w-xs lg:min-w-full rounded-l-xl lg:w-[100%] bg-slate-300 fixed top-0 z-50 flex lg:items-center justify-center flex-col gap-4 p-4 px-5 rounded-r-full relative absolute lg:left-1/4 lg:-translate-x-full

//absolute lg:right-8 -translate-y-[50%] lg:w-[21%] h-[85%] flex flex-col  justify-center

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        varela: ["Varela Round", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
};