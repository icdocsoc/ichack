import nishant from '/committee/nishant.jpg';
import hashir from '/committee/hashir.png';
import kishan from '/committee/kishan.jpg';
import charles from '/committee/charles.jpg';
import tanvi from '/committee/tanvi.jpeg';
import jay from '/committee/jay.jpg';
import anna from '/committee/anna.jpeg';
import callum from '/committee/callum.jpg';
import kevin from '/committee/kevin.jpg';
import royce from '/committee/royce.jpeg';

type Committee = {
  name: string;
  role: string;
  image?: string;
  description?: string;
  links?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    x?: string;
    facebook?: string;
    other?: string;
  };
};

export const teamMembers: Committee[] = [
  {
    name: 'Hashir Majeed',
    role: 'Director',
    image: hashir,
    links: {
      linkedin: 'https://www.linkedin.com/in/hashir-majeed-imp-pltr/'
    }
  },
  {
    name: 'Kishan Sambhi',
    role: 'Director',
    image: kishan,
    links: {
      linkedin: 'https://www.linkedin.com/in/kishan-sambhi/',
      github: 'https://github.com/Gum-Joe/'
    }
  },
  {
    name: 'Tanvi Rana',
    role: 'Director',
    image: tanvi,
    links: {
      linkedin: 'https://www.linkedin.com/in/t-rana'
    }
  },
  {
    name: 'Nishant A Jalan',
    role: 'Technical Lead',
    image: nishant,
    links: {
      linkedin: 'https://www.linkedin.com/in/nishant-a-jalan/',
      github: 'https://gihub.com/cybercoder-naj'
    }
  },
  { name: 'Jay Abussaud', role: 'Technical Lead', image: jay },
  { name: 'Aidan Madge', role: 'Logistics Lead' },
  {
    name: 'Anna Votin',
    role: 'Design & Branding Lead',
    image: anna,
    links: {
      linkedin: 'https://www.linkedin.com/in/anna-votin/',
      github: 'https://github.com/annavotin',
      instagram: 'https://www.instagram.com/anna.votin'
    }
  },
  { name: 'Callum Firth', role: 'HackerEx Lead', image: callum },
  {
    name: 'Charles Calzia',
    role: 'Logistics Lead',
    image: charles,
    links: {
      linkedin: 'https://linkedin.com/in/CharlesCalzia',
      other: 'https://charlescalzia.com/'
    }
  },
  { name: 'Kevin Wang', role: 'Design & Branding Lead', image: kevin },
  {
    name: 'Royce Li Wei Chan',
    role: 'HackerEx Lead',
    image: royce,
    links: {
      linkedin: 'https://www.linkedin.com/in/roycelwc/'
    }
  }
];
