// All profiles, messages and compatibility scores are FICTIONAL demo content.
// Three local images per person are visual placeholders; the -2/-3 files are variations of the original demo image, not additional real photos.
export const profiles = [
  { id: 'ethan', name: 'Ethan', age: 37, city: 'Amsterdam', distance: 18, work: 'Architect', verified: true, compatibility: 92,
    image: '/images/ethan.jpg', photos: ['/images/ethan.jpg', '/images/ethan-2.jpg', '/images/ethan-3.jpg'], interests: ['Hiking', 'Coffee', 'Travel'], goal: 'Relationship',
    bio: 'Outdoors lover, coffee enthusiast, and always planning my next trip. Looking for a genuine connection.' },
  { id: 'maya', name: 'Maya', age: 45, city: 'Utrecht', distance: 23, work: 'Graphic designer', verified: true, compatibility: 94,
    image: '/images/maya.jpg', photos: ['/images/maya.jpg', '/images/maya-2.jpg', '/images/maya-3.jpg'], interests: ['Books', 'Food', 'Music'], goal: 'Relationship',
    bio: 'Book lover, foodie, and live-music fan. I am all about good conversations and new experiences.' },
  { id: 'noah', name: 'Noah', age: 36, city: 'Rotterdam', distance: 20, work: 'Fitness trainer', verified: true, compatibility: 88,
    image: '/images/noah.jpg', photos: ['/images/noah.jpg', '/images/noah-2.jpg', '/images/noah-3.jpg'], interests: ['Gym', 'Music', 'Cooking'], goal: 'Open to dating',
    bio: 'Fitness, great food, and weekend cooking experiments. Looking for someone to share it with.' },
  { id: 'sophie', name: 'Sophie', age: 34, city: 'Eindhoven', distance: 12, work: 'UX designer', verified: true, compatibility: 90,
    image: '/images/sophie.jpg', photos: ['/images/sophie.jpg', '/images/sophie-2.jpg', '/images/sophie-3.jpg'], interests: ['Art', 'Cafés', 'Travel'], goal: 'Open to dating',
    bio: 'Creative, curious, and happiest exploring new places or a cozy café. Let’s make some great memories.' },
  { id: 'liam', name: 'Liam', age: 39, city: 'Haarlem', distance: 25, work: 'Photographer', verified: true, compatibility: 87,
    image: '/images/liam.jpg', photos: ['/images/liam.jpg', '/images/liam-2.jpg', '/images/liam-3.jpg'], interests: ['Photography', 'Hiking', 'Film'], goal: 'Relationship',
    bio: 'Photographer, movie buff, and weekend hiker. I am into good stories, beautiful places, and real connections.' },
  { id: 'ella', name: 'Ella', age: 32, city: 'Leiden', distance: 16, work: 'Writer', verified: true, compatibility: 85,
    image: '/images/ella.jpg', photos: ['/images/ella.jpg', '/images/ella-2.jpg', '/images/ella-3.jpg'], interests: ['Reading', 'Pilates', 'Nature'], goal: 'Relationship',
    bio: 'Reader, movement lover, and always up for a nature escape. Looking for someone kind and curious.' },
];

export const availableInterests = ['Travel', 'Food', 'Music', 'Hiking', 'Coffee', 'Books', 'Art', 'Cafés', 'Gym', 'Cooking', 'Photography', 'Film', 'Reading', 'Pilates', 'Nature'];

export const seededChats = {
  maya: [
    { from: 'them', text: 'That café you mentioned looks amazing! ☕' },
    { from: 'me', text: 'It really is! I loved their pastries.' }
  ],
  liam: [{ from: 'them', text: 'Are you free for a hike this weekend?' }],
  ella: [{ from: 'them', text: 'I just finished that book — we need to talk about the ending!' }]
};
