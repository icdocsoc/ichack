<script setup lang="ts">
const hackspacePoints = ref({
  jcr: 0,
  scr: 0,
  qtr: 0
});

const hackerspaceChallengeWinners = ref<
  {
    winner: 'jcr' | 'scr' | 'qtr';
    challenge: string;
  }[]
>();

const scaledNormalisation = computed(() => {
  const average =
    (hackspacePoints.value.jcr +
      hackspacePoints.value.scr +
      hackspacePoints.value.qtr) /
    3;

  if (average === 0) {
    return {
      jcr: 0.5,
      scr: 0.5,
      qtr: 0.5
    };
  }

  const normalised = {
    jcr: 0.5 + (hackspacePoints.value.jcr - average) / average,
    scr: 0.5 + (hackspacePoints.value.scr - average) / average,
    qtr: 0.5 + (hackspacePoints.value.qtr - average) / average
  };

  const adjusted = {
    jcr: Math.max(0.1, Math.min(0.9, normalised.jcr)),
    scr: Math.max(0.1, Math.min(0.9, normalised.scr)),
    qtr: Math.max(0.1, Math.min(0.9, normalised.qtr))
  };
  return adjusted;
});

const { getHackspaceScores, getHackspaceChallenges } = useHackspace();

function getChallengeWinner(challenge: {
  jcr: number;
  scr: number;
  qtr: number;
  name: string;
}): { winner: 'jcr' | 'scr' | 'qtr'; challenge: string } {
  const max = Math.max(challenge.jcr, challenge.scr, challenge.qtr);
  if (max === challenge.jcr) {
    return { winner: 'jcr', challenge: challenge.name };
  } else if (max === challenge.scr) {
    return { winner: 'scr', challenge: challenge.name };
  } else {
    return { winner: 'qtr', challenge: challenge.name };
  }
}

onMounted(async () => {
  const hscores = getHackspaceScores();
  const hchallenges = await getHackspaceChallenges().getOrNull();
  hackspacePoints.value = await hscores.getOrDefault({
    jcr: 0,
    scr: 0,
    qtr: 0
  });

  hackerspaceChallengeWinners.value =
    hchallenges?.map(getChallengeWinner) ?? [];
});
</script>

<template>
  <div class="flex gap-x-10 max-lg:flex-col lg:max-h-[512px]">
    <div
      class="flex gap-12 max-lg:aspect-[3/4] max-lg:max-h-[256px] lg:min-h-[256px] lg:w-2/3">
      <div
        class="bar bg-red-ic"
        :style="`transform: scaleY(${scaledNormalisation.jcr});`">
        <img
          src="@ui25/assets/jcr_white.svg"
          :style="`transform: scaleY(${1 / scaledNormalisation.jcr}) translateX(-50%)`" />

        <div class="relative flex h-full w-full flex-col overflow-hidden">
          <p
            class="z-10 self-center font-semibold"
            :style="`transform: scaleY(${1 / scaledNormalisation.jcr})`">
            {{ hackspacePoints.jcr }} Pts
          </p>
        </div>
      </div>
      <div
        class="bar bg-yellow-ic"
        :style="`transform: scaleY(${scaledNormalisation.scr});`">
        <img
          src="@ui25/assets/scr_white.svg"
          :style="`transform: scaleY(${1 / scaledNormalisation.scr}) translateX(-50%)`" />

        <div class="relative flex h-full w-full flex-col overflow-hidden">
          <p
            class="z-10 self-center font-semibold"
            :style="`transform: scaleY(${1 / scaledNormalisation.scr})`">
            {{ hackspacePoints.scr }} Pts
          </p>
        </div>
      </div>
      <div
        class="bar bg-blue-ic"
        :style="`transform: scaleY(${scaledNormalisation.qtr});`">
        <img
          src="@ui25/assets/qtr_white.svg"
          :style="`transform: scaleY(${1 / scaledNormalisation.qtr}) translateX(-50%)`" />

        <div class="relative flex h-full w-full flex-col overflow-hidden">
          <p
            class="z-10 self-center font-semibold"
            :style="`transform: scaleY(${1 / scaledNormalisation.qtr})`">
            {{ hackspacePoints.qtr }} Pts
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 w-full border border-white px-4 py-3 lg:max-w-[25vw]">
      <div class="flex justify-between">
        <h3 class="text-2xl font-bold">Challenges</h3>
        <img src="@ui25/assets/crown.svg" alt="Hackspace Scores" />
      </div>

      <div class="mt-5 flex flex-col gap-2">
        <!-- Make v-for from challenges!! -->
        <div
          class="flex items-center justify-between border border-white px-3 py-2"
          v-if="hackerspaceChallengeWinners?.length === 0">
          <p class="text-xl font-semibold">
            Stay tuned to find out the winners!
          </p>
        </div>
        <div
          v-for="challenge in hackerspaceChallengeWinners"
          v-else
          :key="challenge.challenge"
          class="flex items-center justify-between border border-white px-3 py-2">
          <p class="text-xl font-semibold">
            {{ challenge.challenge }}
          </p>
          <img
            src="@ui25/assets/qtr_blue.svg"
            alt=""
            class="size-10"
            v-if="challenge.winner === 'qtr'" />
          <img
            src="@ui25/assets/jcr_yellow.svg"
            alt=""
            class="size-10"
            v-else-if="challenge.winner === 'jcr'" />
          <img src="@ui25/assets/scr_red.svg" alt="" class="size-10" v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar {
  @apply relative w-full origin-bottom transition-transform duration-500;
}

.bar img {
  @apply absolute -top-12 left-1/2 size-8 origin-bottom transition-transform duration-500;
}

.bar p {
  @apply origin-top transition-transform duration-500;
}
</style>
