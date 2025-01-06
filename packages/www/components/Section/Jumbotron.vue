<template>
  <section class="bg-cream-ic relative z-30 w-screen px-5 text-black xl:px-16">
    <div
      class="lg:gap-128 flex justify-between gap-12 max-lg:flex-col lg:mx-auto lg:max-w-[1080px]">
      <div
        class="sm:vertical-border vb-before vb-after max-w-96 self-center before:h-4/5 after:h-1/2 lg:self-stretch">
        <div class="bg-red-ic flex flex-col items-center gap-2 px-10 pb-4 pt-6">
          <div class="bg-yellow-ic aspect-square w-12 self-start" />
          <img
            src="@ui25/assets/coloured_cube.svg"
            alt="IC Hack ‘25"
            class="mx-4" />
          <h1 class="font-expanded text-[32px] font-black text-white">
            IC HACK ‘25
          </h1>
        </div>

        <div class="mt-4 flex gap-10">
          <img src="@ui25/assets/candle.svg" />
          <div class="flex flex-1 flex-col items-end justify-between gap-3">
            <p class="text-end text-2xl">
              The largest student-run hackathon in Europe
            </p>
            <div>
              <p class="text-end text-2xl font-black uppercase">Powered By</p>
              <a href="https://www.mwam.com">
                <img
                  class="mt-2"
                  src="@ui25/assets/sponsors/mwam.svg"
                  alt="IC Hack - Marshall Wace" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        class="z-50 flex flex-col rounded-xl border-2 border-black p-4 lg:mt-10 lg:w-[500px]">
        <div
          class="flex items-center justify-between gap-4 rounded-xl border-2 border-black px-2 py-3">
          <div class="size-6 rounded-lg bg-black" />
          <p class="min-w-max flex-1 text-center">Feb 1 - 2</p>
          <p class="text-end">Imperial College London</p>
        </div>

        <div class="mt-8 flex flex-1 flex-col justify-between xl:flex-row">
          <p
            class="xl:text-horizontal font-expanded self-end text-6xl font-black tracking-wide xl:text-8xl">
            2025
          </p>
          <div class="mx-4 mb-2 min-h-[400px] flex-1" ref="physics" />
        </div>
      </div>
    </div>

    <ClientOnly>
      <DinoAnimation class="absolute bottom-0 left-0 right-0 max-lg:hidden" />
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

let urlPrefix = config.public.publicUrlPrefix + '/physics';
const letters = ['hollow_cube', 'i', 'c', 'h', 'a', 'yellow_c', 'k'].map(
  v => v + '.png'
);
const physics = useTemplateRef<HTMLDivElement>('physics');

let render: Render;
let physicsBox: HTMLDivElement | undefined;

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
  physicsBox = physics.value ?? undefined;

  // create an engine
  let engine = Engine.create();

  let height = Math.max(400, physicsBox?.clientHeight ?? 0);
  let width = physicsBox?.clientWidth ?? 0;

  // create a renderer
  render = Render.create({
    element: physicsBox,
    engine: engine,
    options: {
      width: width,
      height: height,
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
  let ground = Bodies.rectangle(400, height, 800, 10, boundry_style);
  let roof = Bodies.rectangle(0, 0, 800, 10, boundry_style);
  let left_wall = Bodies.rectangle(0, 0, 10, 1200, boundry_style);
  let right_wall = Bodies.rectangle(width, 0, 10, 1200, boundry_style);

  Composite.add(engine.world, [ground, left_wall, right_wall, roof]);

  // run the renderer
  Render.run(render);

  // create runner
  let runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  if ((physicsBox?.clientWidth ?? 0) < 300) {
    urlPrefix += '_small';
  }

  // add the letters
  let offs = 0;
  for (const letter of letters) {
    Composite.add(
      engine.world,
      Bodies.rectangle(Math.min(75 + offs, width - 75), 50, 100, 100, {
        render: {
          sprite: {
            texture: `${urlPrefix}/${letter}`,
            xScale: 1,
            yScale: 1
          }
        }
      })
    );
    offs += (width ?? 0) / 8;
    await new Promise(f => setTimeout(f, 500));
  }

  // add mouse control, only on desktop
  if (!isLessThanLg.value) {
    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    Composite.add(engine.world, mouseConstraint);
  }

  window.addEventListener('resize', onResize, true);
  onUnmounted(() => {
    window.removeEventListener('resize', onResize, true);
    Render.stop(render);
    Runner.stop(runner);
  });
});

function onResize() {
  render.canvas.hidden = true;
  const newWidth = physicsBox?.clientWidth ?? 0;

  render.bounds.max.x = newWidth;
  render.options.width = newWidth;
  render.canvas.width = newWidth;

  render.canvas.hidden = false;
}
</script>
