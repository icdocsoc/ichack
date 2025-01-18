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
      github: 'https://gihub.com/cybercoder-naj'
    },
    hiddenText: `
-----BEGIN PGP MESSAGE-----

owG9VU1oE0EUTm1FuiiIYG/i00Jb0t0tiNA2ItgioodWkHoRD053X7LTTHbCzmzj
Kv5chIoIgooVD156VVAUBFHw6EkPtQd7EBS8FnoSQXBmN2mS5sdYwQcDw7z3vfe9
7w0zd3Z1p4y+6ZXj3Qv3btzverLj4+welzuCO9Yhq8gI9W15UeZufVsy+v/aWkFA
md05JA1V6wSSgc3WHmI3xDdB1UBahJct3QBpH5/YcC2kE8AGwS1DyjZccWUsywK1
NuSwE2smck0yqB6k62LqiFUh5dzlTX2uf4Wkk131yiSudE3O/0wsra1esXQy7Gpk
w4Wpuzb2hsi1PTQV+Y9WA2l16dtA+vutTgF1vaQ7iW9ov1VTbRRritoc0PRRqoY3
e5davWNaQ6u5ayuvpTEBOc5c9CHHkBRMICDQCVBCMaCX0DROUld7S8gYZANeUOcR
9XOAEQrbOO0jsNDJRyB4yEyQHoKkTh7loIAsD33XNCZDCYIy9B2EPGJRAFUHJItA
fFfjfNc2jGkOs5wIaYLPocQDN95kGaLU5RwWKjIzOn2ARIQBQolQKUyYC4WEAhJf
qoIBRDy0jROcMV6K2RSJ9OJNyaOiiIFQrZB5lWtCFXfUZ1OIva7KWtBgcIj/9fpD
CbPIKM6jojZTSaPd2SS1EssVyQEJTENyJZz6uhxdBzU57ru6GAlUhkn0qKrmSVkU
mZGR5K+zHW6H+ZFEfSsRLU4oPKK1plo7Wduw9Eg5AjEP1Ic8jaWbUJL7EegaAdEq
K5f0IiVQZBpTNOepYYYxMtB90HgSirFLRYFEdjygElX9EWBUSobgISsm0y7oK6Aa
UuPUXBzuIhw+ZInRMRx3E0YlquiKMvlsgKrhhbAn1Wek9vUd6FkfePzi7tjVofHn
xQ+VL3/7Nv25p4ze3ZWT4GxX6tXiYt/b9dXLP7Pmu8Hbe5fXjg7Mj557c3O198Ly
lZVr0JV6+ZT1ZI78eL30fuXX3NSZoQdw7NOX8/vXnh18dOozfN/5Gw==
=AaRs
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
