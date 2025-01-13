<template>
  <div class="bottom-shadow">
    <ICNavBar />
  </div>

  <div class="mx-5">
    <slot />
  </div>
</template>

<style scoped>
.bottom-shadow {
  box-shadow: 0 0 16px 2px rgba(255, 255, 255, 0.5);
  /* box-shadow: 0 0 5px 10px #242424;  <<-- TODO decide which one looks more accurate */
}
</style>
