<template>
  <div class="overflow-x-hidden pt-24">
    <div
      class="transform-values inline-block cursor-help"
      @click="showAlert = true">
      <img
        src="~/assets/svgs/dino_1.svg"
        alt="IC Hack '25 Dino"
        ref="dino1Ref" />
      <img
        src="~/assets/svgs/dino_2.svg"
        alt="IC Hack '25 Dino"
        ref="dino2Ref" />
      <img
        src="~/assets/svgs/dino_4.svg"
        alt="IC Hack '25 Dino"
        ref="dino4Ref" />
    </div>

    <ICAlert v-model="showAlert">
      Didn't expect to see a dinosaur here, did you? Use
      <kbd>&#8629;</kbd>
      to stop the dino;
      <kbd>Space</kbd>
      to jump; and
      <kbd>&#8592;</kbd>
      ,
      <kbd>&#8594;</kbd>
      to move.
    </ICAlert>
  </div>
</template>

<script lang="ts" setup>
import { onKeyPressed, onKeyStroke } from '@vueuse/core';

const FRAME_RATE = 10;
const DURATION = 15; // seconds;
const JUMP_HEIGHT = 50;
const JUMP_DURATION = 1; // seconds

type Direction = 'left' | 'right';

/**
 * The walkingDinoBit is a number that goes from 0 to 3.
 * It is used to alternate between the two walking dino svgs.
 * 0,1 -> dino2
 * 2,3 -> dino4
 *
 * The bits are incremented every frame in the cycle 0,1,2,3,0,1,2,3...
 * The 2nd LSB is examined to determine which dino to display.
 *
 * You could ask why not just use a boolean (or 1 bit) to determine which dino to display.
 * This was the case previously, but the dino was not jumping smoothly. This triggered doubling
 * the frame rate from 5 to 10 FPS.
 * This change caused the dino to walk too fast, so the dino was split into 4 parts.
 * Therefore, although the system is running at 10 FPS (i.e. all walkingDinoBits are changed 10 times every second),
 * the dino only walks at 5 FPS. This makes the walking and jumping animations smoother without increasing the svg
 * alternation rate.
 */
const walkingDinoBit = ref(0);

const isJumping = ref(false);
const isWalking = ref(true);
const xTranslate = ref(0);
const yTranslate = ref(0);
const direction = ref<Direction>('right');

const dino1Ref = useTemplateRef<HTMLImageElement>('dino1Ref');
const dino2Ref = useTemplateRef<HTMLImageElement>('dino2Ref');
const dino4Ref = useTemplateRef<HTMLImageElement>('dino4Ref');

onMounted(() => {
  const width = Math.max(
    ...[dino1Ref, dino2Ref, dino4Ref].map(ref => ref.value?.clientWidth ?? 0)
  );

  // The dino will move from the left to the right and back
  // From 0 to max
  let max = window.innerWidth - width;
  function onResize() {
    max = window.innerWidth - width;
  }
  window.addEventListener('resize', onResize);

  // The dino will move in a cosine wave
  // This is an accelerator-decelerator function
  // Information: https://www.desmos.com/calculator/wvt1gkjdw1
  const interpolater = (t: number): number => {
    return (-max / 2) * (Math.cos((Math.PI * t) / DURATION) - 1);
  };

  // t0 is a time variable that goes from 0 to DURATION in steps of dt
  let t0 = 0;
  // with this value of dt, the diff applied to all time variables t0 will go from 0 to DURATION in DURATION * FRAME_RATE steps
  const dt = 1 / FRAME_RATE;
  // tJump is a time variable that goes from 0 to JUMP_DURATION in steps of dt
  // It is null when the dino is not jumping
  let tJump: number | null = null;

  const frameInterval = setInterval(() => {
    if (!isWalking.value) return;

    // Flip svgs every frame
    if (isWalking.value) walkingDinoBit.value = (walkingDinoBit.value + 1) % 4;

    // t0 goes from 0 to DURATION in 'right' direction
    // and reverses when it reaches the end

    // the interpolater function will return a value between 0 and max
    // which is the translateX value of the dino
    if (direction.value === 'right') {
      if (xTranslate.value >= max) {
        direction.value = 'left';
      }
      t0 += dt;
      xTranslate.value = Math.min(max, interpolater(t0));
    } else {
      if (xTranslate.value <= 0) {
        direction.value = 'right';
      }
      t0 -= dt;
      xTranslate.value = Math.max(0, interpolater(t0));
    }

    if (isJumping.value) {
      // tJump is the time reference for the jump animation. Previously null, it is now set to 0.
      // tJump is incremented by dt every frame.
      if (!tJump) tJump = 0;

      // This is a simple sine wave that goes from 0 to JUMP_HEIGHT and back in JUMP_DURATION seconds.
      const jumpInterpolator = (t: number): number => {
        return JUMP_HEIGHT * Math.sin((Math.PI * t) / JUMP_DURATION);
      };

      yTranslate.value = jumpInterpolator(Math.abs(tJump));
      tJump += dt;

      // Stop jumping when the jump is complete. i.e. when tJump is greater than JUMP_DURATION
      if (Math.abs(tJump) >= JUMP_DURATION) {
        isJumping.value = false;
        tJump = null;
        yTranslate.value = 0;
      }
    }
  }, 1000 / FRAME_RATE);

  onUnmounted(() => {
    clearInterval(frameInterval);
    window.removeEventListener('resize', onResize);
  });
});

// Style variables
const transformStyle = computed<string>(
  () =>
    `translateX(${xTranslate.value}px) translateY(${3 - yTranslate.value}px) ${direction.value == 'left' ? 'scaleX(-1)' : ''}`
);
const dino1Display = computed<string>(() =>
  !isWalking.value || isJumping.value ? 'inline' : 'none'
);
const dino2Display = computed<string>(() =>
  /* examines the 2nd LSB to determine which svg to display */
  isWalking.value && !isJumping.value && (walkingDinoBit.value & 2) === 2
    ? 'inline'
    : 'none'
);
const dino4Display = computed<string>(() =>
  isWalking.value && !isJumping.value && (walkingDinoBit.value & 2) !== 2
    ? 'inline'
    : 'none'
);

onKeyPressed('Enter', e => {
  e.preventDefault();
  handleDinoStop();
});
onKeyPressed(' ', e => {
  e.preventDefault();
  handleDinoJump();
});
onKeyStroke('ArrowRight', e => {
  e.preventDefault();
  handleDinoMove('right');
});
onKeyStroke('ArrowLeft', e => {
  e.preventDefault();
  handleDinoMove('left');
});
function handleDinoStop() {
  isWalking.value = !isWalking.value;
  checkAndUpdateShowAlert();
}
function handleDinoJump() {
  if (isWalking.value) isJumping.value = true;
  checkAndUpdateShowAlert();
}
function handleDinoMove(dir: Direction) {
  direction.value = dir;
  checkAndUpdateShowAlert();
}

const showAlert = ref(false);
const usedBefore = useUsedBefore('dino');
const checkAndUpdateShowAlert = () => {
  if (usedBefore.value) return;

  showAlert.value = true;
  usedBefore.value = true;
};
</script>

<style scoped>
img {
  @apply aspect-square w-24;
}

div.transform-values {
  transform: v-bind(transformStyle) translateY(3px);
}

img:nth-of-type(1) {
  display: v-bind(dino1Display);
}

img:nth-of-type(2) {
  display: v-bind(dino2Display);
}

img:nth-of-type(3) {
  display: v-bind(dino4Display);
}

kbd {
  @apply inline-flex min-h-[30px] items-center justify-center rounded-md border border-gray-200 bg-gray-400 px-1.5 text-sm text-slate-900 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)];
}
</style>
