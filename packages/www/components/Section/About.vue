<template>
  <section
    class="mx-auto flex max-w-[1080px] items-start justify-between gap-10 px-5 max-md:flex-col">
    <Gameboy />

    <div class="max-w-[512px]">
      <ICWindow name="about.txt">
        <div class="flex gap-4 text-black">
          <div
            class="[&_span]:text-blue-ic ml-16 self-start text-lg [&>*]:my-4 [&_span]:font-bold">
            <h2 class="max-w-fit text-3xl font-bold uppercase">
              What is IC Hack?
            </h2>
            <p>
              IC Hack is an annual hackathon held at Imperial's South Kensington
              campus. It is the
              <span>biggest student-run hackathon in Europe</span>.
            </p>
            <p>
              Running for the
              <span>13th year</span>, we're bringing <span>over 700</span> of
              the UK's most creative and talented students together for 24 hours
              of learning, building, fun, and networking.
            </p>
            <p>
              IC Hack covers food and swag for all hackers, not to mention the
              opportunity to win some <span>incredible prizes </span> from our
              sponsors!
            </p>
          </div>
        </div>
      </ICWindow>

      <img src="@ui25/assets/dividers/divider2.svg" class="mx-auto mt-10" />
    </div>
  </section>
</template>
