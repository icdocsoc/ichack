<template>
  <section id="tickets" class="px-5">
    <div class="flex flex-col items-center gap-10">
      <ICWindow
        name="tickets.txt"
        color="bg-gold-ic"
        border="border-white"
        class="max-w-[720px]">
        <div class="flex gap-10 text-black">
          <div
            class="text-horizontal mt-4 rotate-180 text-3xl font-black uppercase">
            Getting a<br />
            Ticket
          </div>
          <div class="[&_span]:text-gold text-lg [&>p]:my-4 [&_span]:font-bold">
            <p>
              Click the huge ticket below to view our event page and reserve
              your ticket when registration opens.
            </p>
            <p>
              The first round of tickets will be released at
              <span>17:00 on 9th Jan</span> with the second round at
              <span>16:30 on 13th Jan</span>.
            </p>
            <img src="@ui25/assets/checkbox.svg" />
          </div>
        </div>
      </ICWindow>

      <div
        class="font-lores my-10 space-y-2 text-center text-2xl font-bold uppercase [&>*]:mx-auto">
        <p>Get Your Ticket</p>
        <p class="text-[#626060]">Tickets are sold out now!</p>
        <img src="@ui25/assets/caret-down.svg" />
      </div>

      <div>
        <img
          src="@ui25/assets/xs-ticket.svg"
          alt="IC Hack Tickets"
          class="w-full md:hidden" />
        <img
          src="@ui25/assets/gticket.jpg"
          title="Ic..Hacc..Ticquets.. I'm sorry I am feeling some bits off."
          alt="IC Hack Tickets"
          class="border-gold-ic w-full max-w-[920px] border-2 max-md:hidden" />
      </div>
    </div>
  </section>
</template>
