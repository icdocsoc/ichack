<template>
  <div class="flex flex-col gap-3 border-[1px] border-white p-5">
    <h2 v-if="team != null" class="text-2xl font-bold">{{ team.teamName }}</h2>
    <ICTeamMember
      v-if="team != null"
      v-for="(member, i) in team.members"
      :name="member.name"
      :leader="member.leader"
      :color="colors[i % 3]!" />
    <NuxtLink
      class="bg-white py-2 text-center text-xl font-semibold text-black"
      to="/team">
      {{ team == null ? 'Create' : 'View' }} Team
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
import type { ReturnedTeam } from '~~/shared/types';

type Props = {
  team: ReturnedTeam | null;
};

const { team } = defineProps<Props>();
const colors = ['bg-red-ic', 'bg-blue-ic', 'bg-yellow-ic'];
</script>

<style></style>
