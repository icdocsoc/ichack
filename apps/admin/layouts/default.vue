<template>
  <div>
    <header>
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/login">Login</NuxtLink>
    </header>
    <div class="content">
      <slot />
    </div>
  </div>
</template>
