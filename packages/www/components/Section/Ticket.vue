<template>
  <section class="px-5">
    <div class="flex flex-col items-center gap-10">
      <ICWindow
        name="tickets.txt"
        color="bg-gold"
        border="bg-white"
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
              <span>15:00 on 10 Jan</span> with the second round at
              <span>13:30 on 18th Jan</span>.
            </p>
            <img src="@ui25/assets/checkbox.svg" />
          </div>
        </div>
      </ICWindow>

      <img src="@ui25/assets/caret-down.svg" />

      <img
        src="@ui25/assets/ticket.svg"
        alt="IC Hack Tickets"
        class="w-full max-w-[920px]" />
    </div>
  </section>
</template>
