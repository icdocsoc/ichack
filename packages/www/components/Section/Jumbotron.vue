<template>
  <section
    class="bg-cream-ic relative z-50 flex w-screen justify-center gap-x-32 px-40 pb-4">
    <div
      class="vertical-border vb-before vb-after relative z-50 flex w-[26em] flex-col before:h-4/5 after:h-1/2">
      <div class="bg-red-ic flex flex-col items-center gap-2 px-8 py-6">
        <div class="bg-yellow-ic aspect-square w-[10%] self-start" />
        <img
          src="@ui25/assets/coloured_cube.svg"
          class="h-auto w-[70%] place-self-center" />
        <p
          class="font-expanded place-self-center text-[32px] font-black text-white">
          IC HACK ‘25
        </p>
      </div>

      <div class="flex h-auto pt-4">
        <img class="flex-shrink-0" src="@ui25/assets/candle.svg" />
        <div class="ml-auto self-end text-right">
          <p class="font-expanded text-3xl font-black">POWERED BY</p>
          <p>&lt;img src="@ui25/public/title_sponsor_DO_NOT_SHARE.png"&gt;</p>
        </div>
      </div>
    </div>

    <div class="relative z-50 pt-5">
      <div class="flex flex-col rounded-xl border-2 border-black p-5">
        <div
          class="flex items-center justify-between border-2 border-black px-2 py-3 text-xl">
          <div class="size-8 rounded-lg bg-black" />
          <p>Feb 1 - 2</p>
          <p>Imperial College London</p>
        </div>

        <p class="pl-4 pt-4 text-xl">
          The largest student-run
          <br />
          hackathon in Europe.
        </p>

        <div class="flex h-full justify-between">
          <p
            class="text-horizontal font-expanded flex-shrink-0 self-end font-black"
            style="font-size: 100px; line-height: 100px; letter-spacing: 5px">
            2025
          </p>
          <div
            class="flex-shrink-1 mb-2 mr-4"
            :class="`w-[${physWidth}px] h-[${physHeight}px]`"
            ref="physics" />
        </div>
      </div>
    </div>

    <ClientOnly v-if="!isLessThanLg">
      <DinoAnimation class="absolute bottom-0 left-0 right-0" />
    </ClientOnly>
  </section>
</template>

<script lang="ts" setup>
import {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint
} from 'matter-js';

const isLessThanLg = ref(false);

const config = useRuntimeConfig();

const urlPrefix = config.public.physicsUrlPrefix;
const letters = ['hollow_cube', 'i', 'c', 'h', 'a', 'yellow_c', 'k'].map(
  v => v + '.png'
);

const physWidth = ref(350);
const physHeight = ref(400);

onBeforeMount(() => {
  const onResize = () => {
    isLessThanLg.value = window.innerWidth < 1024;
  };
  onResize();
  window.addEventListener('resize', onResize);

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
  });
});

onMounted(async () => {
  // create an engine
  var engine = Engine.create();

  // create a renderer
  var render = Render.create({
    element: physics.value,
    engine: engine,
    options: {
      width: physWidth.value,
      height: physHeight.value,
      wireframes: false,
      background: 'transparent'
    }
  });

  // create create walls & ground, add to world
  const boundry_style = {
    isStatic: true,
    render: {
      fillStyle: 'transparent'
    }
  };
  var ground = Bodies.rectangle(400, 400, 800, 10, boundry_style);
  var roof = Bodies.rectangle(0, 0, 800, 10, boundry_style);
  var left_wall = Bodies.rectangle(0, 0, 10, 800, boundry_style);
  var right_wall = Bodies.rectangle(350, 0, 10, 800, boundry_style);

  Composite.add(engine.world, [ground, left_wall, right_wall, roof]);

  // run the renderer
  Render.run(render);

  // create runner
  var runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  // add the letters
  let offs = 0;
  for (const letter of letters) {
    Composite.add(
      engine.world,
      Bodies.rectangle(75 + offs, 50, 100, 100, {
        render: {
          sprite: {
            texture: urlPrefix + letter,
            xScale: 1,
            yScale: 1
          }
        }
      })
    );
    offs += 40;
    await new Promise(f => setTimeout(f, 500));
  }

  // add mouse control
  var mouse = Mouse.create(render.canvas);
  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });
  Composite.add(engine.world, mouseConstraint);
});
const physics = ref();
</script>
