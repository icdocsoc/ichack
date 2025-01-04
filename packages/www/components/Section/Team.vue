<template>
  <section class="mx-auto max-w-[1080px] px-5">
    <div class="flex gap-2 md:flex-col">
      <div class="items-center gap-4 md:flex">
        <h2
          class="max-md:text-horizontal min-w-max text-3xl font-bold uppercase">
          Our Team
        </h2>
        <div>
          <img
            src="@ui25/assets/dividers/divider3-vertical.svg"
            alt="IC Hack Team"
            class="mx-auto mt-4 md:hidden" />
          <img
            src="@ui25/assets/dividers/divider3.svg"
            alt="IC Hack Team"
            class="max-md:hidden" />
        </div>
      </div>
      <div class="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        <ICWindow
          name="member.html"
          v-for="committee in teamMembers"
          border="border-white"
          :key="committee.name">
          <div class="text-black">
            <img
              v-if="committee.image"
              :src="committee.image"
              :alt="committee.name"
              class="aspect-square object-contain" />
            <div
              v-else
              class="bg-blue-ic grid aspect-square place-items-center bg-[#66A5D9]">
              <img
                src="@ui25/assets/ducks.svg"
                :alt="committee.name"
                class="w-1/2" />
            </div>

            <p
              class="mt-4 overflow-x-hidden text-ellipsis whitespace-nowrap font-bold">
              {{ committee.name }}
            </p>
            <p class="font-gohu text-sm">
              {{ committee.role }}
            </p>
            <p>{{ committee.description }}</p>
            <div class="mt-2 flex space-x-1" v-if="committee.links">
              <a
                v-if="committee.links.github"
                :href="committee.github"
                target="_blank">
                <img
                  src="@ui25/assets/socials/github.svg"
                  alt="GitHub"
                  class="h-6 w-6" />
              </a>
              <a
                v-if="committee.links.linkedin"
                :href="committee.linkedin"
                target="_blank">
                <img
                  src="@ui25/assets/socials/linkedin.svg"
                  alt="LinkedIn"
                  class="h-6 w-6" />
              </a>
            </div>
          </div>
        </ICWindow>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup></script>
