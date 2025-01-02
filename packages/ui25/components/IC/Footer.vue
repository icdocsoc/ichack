<template>
  <footer class="flex w-screen flex-col gap-y-12 px-5 lg:px-8">
    <div>
      <p class="text-center text-2xl text-white">Don’t miss a thing.</p>
      <div class="mt-4 flex justify-center">
        <a href="https://instagram.com/ichackuk" target="_blank">
          <img
            src="~/assets/svgs/instagram.svg"
            class="w-10"
            alt="@ICHackUK Instagram" />
        </a>
      </div>
    </div>

    <div>
      <p
        class="font-ichack translate-y-2 text-center text-4xl text-white md:translate-y-3 md:text-7xl lg:translate-y-4 lg:text-9xl">
        ICHACK
      </p>
      <div class="flex justify-between bg-white">
        <img
          class="max-h-12 lg:max-h-none"
          src="~/assets/svgs/pixel-attack-left.svg"
          alt="Pixel graphics to look cool" />
        <div
          class="flex flex-col items-center gap-y-1 self-center p-4 text-center text-xs font-semibold text-black md:text-lg md:font-extrabold">
          <p>
            IC Hack is organised by DoCSoc, Imperial College London Department
            of Computing Society
          </p>
          <p>© 2025 Imperial College DoCSoc</p>
          <img class="mt-1" src="@ui25/assets/icon_cube.svg" />
        </div>
        <img
          class="max-h-12 lg:max-h-none"
          src="~/assets/svgs/pixel-attack-right.svg"
          alt="Pixel graphics to look cool" />
      </div>
    </div>
  </footer>
</template>
