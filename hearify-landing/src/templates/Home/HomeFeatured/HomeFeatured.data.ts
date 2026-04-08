import feature1Image from '@/assets/images/featured-by/featured-1.png';
import feature2Image from '@/assets/images/featured-by/featured-2.png';
import feature3Image from '@/assets/images/featured-by/featured-3.png';
import feature4Image from '@/assets/images/featured-by/featured-4.png';
import feature5Image from '@/assets/images/featured-by/featured-5.png';
import feature6Image from '@/assets/images/featured-by/featured-6.png';
import feature7Image from '@/assets/images/featured-by/featured-7.png';
import feature8Image from '@/assets/images/featured-by/featured-8.png';
import feature9Image from '@/assets/images/featured-by/featured-9.png';
import feature10Image from '@/assets/images/featured-by/featured-10.png';
import feature11Image from '@/assets/images/featured-by/featured-11.png';
import feature12Image from '@/assets/images/featured-by/featured-12.png';
import feature13Image from '@/assets/images/featured-by/featured-13.png';
import feature14Image from '@/assets/images/featured-by/featured-14.png';
import feature15Image from '@/assets/images/featured-by/featured-15.png';
import feature16Image from '@/assets/images/featured-by/featured-16.png';
import feature17Image from '@/assets/images/featured-by/featured-17.png';
import feature18Image from '@/assets/images/featured-by/featured-18.png';

import type { StaticImageData } from 'next/image';

export type FeaturedBlock = {
  title: string;
  imageUrl: StaticImageData;
  href: string;
};

// eslint-disable-next-line import/prefer-default-export
export const featuredByBlocks: FeaturedBlock[] = [
  {
    title: 'dev.ua logo',
    imageUrl: feature1Image,
    href: 'https://dev.ua/news/ukrainskyi-ed-tech-startap-hearify-1698847356',
  },
  {
    title: 'mission impossible logo',
    imageUrl: feature2Image,
    href: 'https://www.missionpossible.ventures/alumni',
  },
  {
    title: 'CfE Accelerator logo',
    imageUrl: feature3Image,
    href: 'https://vacu2m.com/techstars-startup-weekend-kyiv-hybrid-event-rezultati/',
  },
  {
    title: 'Tech Ukraine logo',
    imageUrl: feature4Image,
    href: 'https://techukraine.org/2023/10/10/bits-pretzels-2023-recap/',
  },
  {
    title: 'Bits & Pretzels logo',
    imageUrl: feature5Image,
    href: 'https://www.bitsandpretzels.com/',
  },
  {
    title: 'Kyiv School of Economics logo',
    imageUrl: feature6Image,
    href: 'https://www.linkedin.com/posts/sofiia-shaposhnikova_took-part-in-the-kse-startup-hackathon-this-activity-7122229905479647232-3KIW?utm_source=share&utm_medium=member_desktop',
  },
  {
    title: 'Medium logo',
    imageUrl: feature7Image,
    href: 'https://medium.com/@xtartupbar/hearify-revolutionizing-education-with-ai-driven-personalization-6b83c580b2ca',
  },
  {
    title: 'Google Developer Student Clubs logo',
    imageUrl: feature8Image,
    href: 'https://gdsc.community.dev/events/details/developer-student-clubs-taras-shevchenko-national-university-of-kyiv-presents-rozvitok-shi-generatsiyi-video-pro-sora-i-ne-tilki/',
  },
  {
    title: 'Lift99 logo',
    imageUrl: feature9Image,
    href: 'https://www.lift99.co/',
  },
  {
    title: 'Sikorsky Challenge Ukraine logo',
    imageUrl: feature10Image,
    href: 'https://blog.sikorskychallenge.com/2023/09/Spilnyi-proiekt-universytetu-Sheffilda-ta-KPI-im-Ihoria-Sikorskoho-zaversheno.html',
  },
  {
    title: 'Deep Tech Acceleration logo',
    imageUrl: feature11Image,
    href: 'https://blog.sikorskychallenge.com/2023/09/Spilnyi-proiekt-universytetu-Sheffilda-ta-KPI-im-Ihoria-Sikorskoho-zaversheno.html',
  },
  {
    title: 'University of Sheffield logo',
    imageUrl: feature12Image,
    href: 'https://www.sheffield.ac.uk/',
  },
  {
    title: 'SSA logo',
    imageUrl: feature13Image,
    href: 'https://dnvr.kpi.ua/2024/01/03/%F0%9F%93%AF-%D0%BB%D0%B5%D0%BA%D1%86%D1%96%D1%8F-intro-to-ai/',
  },
  {
    title: 'University logo',
    imageUrl: feature14Image,
    href: 'https://lnu.edu.ua/vidbuvsia-final-konkursu-startapiv-vid-naukovoho-parku-universytetu/',
  },
  {
    title: 'Xtartup Bar logo',
    imageUrl: feature15Image,
    href: 'https://xtartupbar.com/2023/11/09/hearify-unveils-the-future-of-ai-powered-personalized-education/',
  },
  {
    title: 'techstart_ Startup Weekend logo',
    imageUrl: feature16Image,
    href: 'https://vacu2m.com/techstars-startup-weekend-kyiv-hybrid-event-rezultati/',
  },
  {
    title: 'AI house logo',
    imageUrl: feature17Image,
    href: 'https://www.linkedin.com/posts/aihouse-ukraine_ai-aihousecamp2023-aicommunity-activity-7125096014247534592-ZRP_?utm_source=share&utm_medium=member_desktop',
  },
  {
    title: 'Venture cup  logo',
    imageUrl: feature18Image,
    href: 'https://venturecup.dk/university-startup-world-cup/',
  },
];
