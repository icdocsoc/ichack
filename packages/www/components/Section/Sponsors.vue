<template>
  <section
    id="sponsors"
    class="mx-auto flex max-w-[1080px] flex-col gap-4 px-5">
    <div class="flex justify-between gap-4 max-md:flex-col">
      <h2 class="font-ichack text-4xl font-bold lg:text-5xl xl:text-6xl">
        SPONSORS
      </h2>
      <SponsorWindow :sponsors="sponsors.title" type="title" />
    </div>
    <SponsorWindow
      v-if="sponsors.gold.length"
      :sponsors="sponsors.gold"
      type="gold"
      asideText="Gold sponsors" />
    <SponsorWindow
      v-if="sponsors.silver.length"
      :sponsors="sponsors.silver"
      type="silver"
      asideText="Silver sponsors"
      textPosition="right" />
    <SponsorWindow
      v-if="sponsors.bronze.length"
      :sponsors="sponsors.bronze"
      asideText="Bronze sponsors"
      type="bronze" />
    <div class="items-start gap-8 lg:flex">
      <SponsorWindow
        v-if="sponsors.partners.length"
        :sponsors="sponsors.partners"
        type="partners"
        asideText="Partners"
        textPosition="right" />
      <img
        src="@ui25/assets/handshake.svg"
        alt="IC Hack - Partners"
        class="self-center max-lg:hidden" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { filename } from 'pathe/utils';
import mwam from '@ui25/assets/sponsors/mwam-light.svg';

const sponsorLinks: Record<string, string> = {
  anthropic: 'https://www.anthropic.com/',
  helsing: 'https://helsing.ai/',
  jetbrains: 'https://www.jetbrains.com/',
  optiver: 'https://www.optiver.com/',
  cgcu: 'https://www.instagram.com/ic_cgcu/',
  chkn: 'https://www.chkn.media/',
  doc: 'https://www.imperial.ac.uk/computing/',
  docsoc: 'https://docsoc.co.uk/',
  icrs: 'https://icrs.io',
  icu: 'https://www.imperialcollegeunion.org/',
  imperial: 'https://www.imperial.ac.uk/',
  gresearch: 'https://www.gresearch.com/',
  imc: 'https://www.imc.com/',
  intersystems: 'https://www.intersystems.com/',
  qrt: 'https://www.qube-rt.com/',
  ttd: 'https://www.thetradedesk.com/',
  wintermute: 'https://wintermute.com/'
};

const goldSponsors = import.meta.glob('@ui25/assets/sponsors/gold/*.svg', {
  eager: true
});
const silverSponsors = import.meta.glob('@ui25/assets/sponsors/silver/*.svg', {
  eager: true
});
const bronzeSponsors = import.meta.glob('@ui25/assets/sponsors/bronze/*.svg', {
  eager: true
});
const partner = import.meta.glob('@ui25/assets/sponsors/partners/*.svg', {
  eager: true
});
function transformGlob(
  glob: Record<string, any>
): { img: string; desc: string }[] {
  return Object.entries(glob).map(([key, value]) => ({
    img: value.default,
    desc: filename(key),
    link: sponsorLinks[filename(key)]
  }));
}

const sponsors = {
  title: [{ img: mwam, desc: 'Marshall Wace', link: 'https://www.mwam.com/' }],
  gold: transformGlob(goldSponsors),
  silver: transformGlob(silverSponsors),
  bronze: transformGlob(bronzeSponsors),
  partners: transformGlob(partner)
};
</script>
