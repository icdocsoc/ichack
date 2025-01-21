import nishant from '/committee/nishant.png';
import hashir from '/committee/hashir.png';
import kishan from '/committee/kishan.png';
import charles from '/committee/charles.png';
import tanvi from '/committee/tanvi.png';
import jay from '/committee/jay.png';
import anna from '/committee/anna.png';
import callum from '/committee/callum.png';
import kevin from '/committee/kevin.png';
import royce from '/committee/royce.png';

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
  hiddenText?: string;
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
      github: 'https://github.com/cybercoder-naj'
    },
    hiddenText: `
-----BEGIN PGP MESSAGE-----

owG9VU1o1FAQjrYr+ECpl4UK4siilWwSLx62xUsXwaLQk4Ie02Q2iZvkrXkvbuPB
m7gIgqKiNy/qrSBV8C4oqEXBg1K9evUitNf6wv4k6WbXWMGBLGHm+773zexjcmff
hETKi19OT3Tu33iwa2XP6tK0SQ1GDdXWmaqrLAxagcNQ48vcun3yO6n8dYyigAit
OEWGJIpQ5mB7jKdoQ/gcVooyAt4LeYgyHt+NappShDAwuBNKpv9qvzanqiqIZzAP
rRt5U06pQZKQM5iMs4TS0+69ZLX+lSJ335I70y3JKc3/bEyOIzsxuftvJ8ihG5O5
N9pgyOkecof8x0hRRt36MZRKRS1KyPQiF8EPtT+qqTETy2VtB+RupQSet5hGLbJ4
hmp+aSfrksyDRV0TfbBc1D0FdGBoBMhBbOJrqJAFx4yrbXRdaATUE/nI8S3ACJlG
ztsI3DGayGcYNGjomwosRULEDY1mBIyGrkLqIQdu6zFEqHMaxAUPqY+ALkMQyx+4
MKERsugwW/c5GNTz0DcZRDQUugE0HN+Mj+WDA2NrTABd4dsKUUjYNLTs+CiR5zpr
QlsIXwkdjtCOKeKA2EoD9QB8yhUwqT/DgdloCmNcpBVyiYYBXBY/PkaiLmQFEoQV
sDFAjXTCSalMpEPlI5O/jj1+ea92/fjsautT/6NW2h1/tySyd6qfqT2Stsy3m1/X
v91qntGkc8v7b37efHP456uL1YWzd8v1jdKLdWlrvv76wMODP46+b01feLa2dmL2
+dOpU52rKxtPah/feR9KvwE=
=kKu+
-----END PGP MESSAGE-----
 
`
  },
  {
    name: 'Jay Abussaud',
    role: 'Technical Lead',
    image: jay,
    links: {
      linkedin: 'https://www.linkedin.com/in/ahmed-abussaud/',
      github: 'https://github.com/Dropheart',
      other: 'https://abussaud.dev/'
    }
  },
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
  {
    name: 'Kevin Wang',
    role: 'Design & Branding Lead',
    image: kevin,
    links: { linkedin: 'https://www.linkedin.com/in/kevin-wang-9bb186298/' }
  },
  {
    name: 'Royce Li Wei Chan',
    role: 'HackerEx Lead',
    image: royce,
    links: {
      linkedin: 'https://www.linkedin.com/in/roycelwc/'
    }
  }
];
