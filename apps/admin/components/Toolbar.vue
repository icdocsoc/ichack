<script setup lang="ts">
const { authRepo } = useRepositories();

const menu = [
  [
    { label: 'Dashboard', to: '/', icon: 'heroicons:user-circle' },
    { label: 'Users', to: '/users', icon: 'heroicons:user-plus' },
    {
      label: 'Announcements',
      to: '/announcements',
      icon: 'heroicons:megaphone'
    },
    { label: 'Events', to: '/events', icon: 'heroicons:calendar' },
    { label: 'Team', to: '/team', icon: 'heroicons:users' }
  ],
  [
    {
      label: 'Logout',
      icon: 'websymbol:logout',
      async click() {
        const result = await authRepo.logout();
        result.onSuccess(() => navigateTo('/login'));
      }
    }
  ]
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1>IC Hack '25 Admin Page</h1>
    <UVerticalNavigation :links="menu" />
  </div>
</template>
