<template>
  <section
    id="faq"
    class="mx-auto flex max-w-[1080px] justify-center px-5 lg:justify-between">
    <div class="m-32 flex-grow max-lg:hidden">
      <img src="@ui25/assets/thinking_face.svg" />
    </div>
    <div class="w-full max-w-[500px]">
      <ICWindow name="FAQs.html">
        <div class="mt-4 flex gap-4 text-black">
          <div class="flex flex-col items-center gap-2">
            <img
              src="@ui25/assets/cursor-default.svg"
              alt="IC Hack - FAQs"
              class="w-full px-2" />
            <h2 class="text-horizontal text-5xl font-bold">FAQs</h2>
          </div>

          <div class="w-full border-2 border-black p-2">
            <div
              v-for="(faq, i) in faqs"
              :key="i"
              class="flex flex-col gap-1 p-2 hover:bg-gray-300">
              <div
                class="flex cursor-pointer items-center justify-between gap-4 py-1"
                @click="toggle(i)">
                <p class="font-bold">{{ faq.question }}</p>
                <img
                  src="@ui25/assets/caret-right.svg"
                  alt="Toggle answer"
                  class="transition-transform duration-300 ease-in-out"
                  :class="
                    !isLessThanLg && activeIndex == i ? 'rotate-90' : 'rotate-0'
                  " />
              </div>

              <p
                v-if="!isLessThanLg && activeIndex == i"
                class="overflow-hidden text-wrap break-words px-2"
                v-html="faq.answer" />
            </div>
          </div>
        </div>
      </ICWindow>
    </div>

    <div
      v-if="activeIndex != null && isLessThanLg"
      class="fixed top-0 z-10 grid h-screen w-screen place-items-center bg-black bg-opacity-50 px-5"
      @click="activeIndex = null">
      <ICWindow
        :name="`${faqs[activeIndex!]?.question}.html`"
        class="text-black">
        <p v-html="faqs[activeIndex!]?.answer" />
      </ICWindow>
    </div>
  </section>
</template>

<script lang="ts" setup>
const faqs = [
  {
    question: 'How do I get a ticket?',
    answer: 'Keep an eye on our website for ticket release dates!'
  },
  {
    question: 'How much does it cost to enter?',
    answer:
      'Absolutely nothing! Thanks to our wonderful sponsors, IC Hack is completely free for participants. That includes food to keep you going throughout the weekend.'
  },
  {
    question: "What if I don't have a team?",
    answer:
      "Don't worry, we'll have a Discord channel for participants to form teams before the event. You can also form a team when you arrive on the Saturday morning."
  },
  {
    question: 'Who can attend?',
    answer:
      'To be eligible for a ticket, you only have to be a current student from any university, or have graduated within a year! We encourage anyone from any degree discipline, technical or not, to enjoy IC Hack and show off your skills throughout the weekend. Unfortunately, due to logistical and legal constraints, we are unable to host under 18s.'
  },
  {
    question: 'Do I need loads of experience to participate?',
    answer:
      'Not at all. Whether you are a first year student, study a subject unrelated to computing, or this is your first Hackathon, you are still welcome to enter IC Hack. This is a great opportunity to learn and gain new experience!'
  },
  {
    question: 'Can I help run IC Hack?',
    answer:
      "Of course, we're always looking for volunteers to help us! Want to enjoy the weekend without stressing about your project? Or didn't get a ticket but still want to join? Help us out on the day! Keep an eye on our socials for more information."
  },
  {
    question: 'What is the code of conduct?',
    answer:
      'You can view our code of conduct <a href="/code-of-conduct" class="text-blue-ic underline" target="_blank">here</a>'
  }
];
const activeIndex = ref<number | null>(null);
const toggle = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const isLessThanLg = ref(false);
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
</script>
