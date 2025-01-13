<script setup lang="ts">
const { logout } = useAuth();

const menu = [
  [
    { label: 'Dashboard', to: '/admin', icon: 'heroicons:user-circle' },
    { label: 'Users', to: '/admin/users', icon: 'heroicons:user-plus' },
    {
      label: 'Announcements',
      to: '/admin/announcements',
      icon: 'heroicons:megaphone'
    },
    { label: 'Events', to: '/admin/events', icon: 'heroicons:calendar' },
    { label: 'Team', to: '/admin/team', icon: 'heroicons:users' }
  ],
  [
    {
      label: 'Logout',
      icon: 'websymbol:logout',
      async click() {
        const result = await logout();
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
