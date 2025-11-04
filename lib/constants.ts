export type EventItem = {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    image: '/images/event1.png',
    title: 'React Conf 2025',
    slug: 'react-conf-2025',
    location: 'San Francisco, CA',
    date: '2025-03-15',
    time: '09:00',
  },
  {
    image: '/images/event2.png',
    title: 'Next.js Summit',
    slug: 'nextjs-summit',
    location: 'Austin, TX',
    date: '2025-04-20',
    time: '10:00',
  },
  {
    image: '/images/event3.png',
    title: 'Web3 Hackathon',
    slug: 'web3-hackathon',
    location: 'New York, NY',
    date: '2025-05-10',
    time: '08:00',
  },
  {
    image: '/images/event4.png',
    title: 'AI & ML Conference',
    slug: 'ai-ml-conference',
    location: 'Seattle, WA',
    date: '2025-06-05',
    time: '09:30',
  },
  {
    image: '/images/event5.png',
    title: 'DevOps Meetup',
    slug: 'devops-meetup',
    location: 'Boston, MA',
    date: '2025-07-12',
    time: '18:00',
  },
  {
    image: '/images/event6.png',
    title: 'Full Stack Challenge',
    slug: 'full-stack-challenge',
    location: 'Chicago, IL',
    date: '2025-08-18',
    time: '11:00',
  },
];

