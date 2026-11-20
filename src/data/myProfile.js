// Fictional example profile. Local browser state only; this is not a user account.
export const MY_PROFILE_STORAGE = 'vinder_demo_my_profile_v2';
export const defaultMyProfile = {
  name: 'Jamie',
  age: 36,
  city: 'Eindhoven',
  work: 'Marketing specialist',
  bio: 'Coffee, weekend adventures and meeting interesting people. Always up for trying something new!',
  goal: 'Relationship',
  interests: ['Travel', 'Music', 'Coffee'],
  photos: [],
};

export function readMyProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(MY_PROFILE_STORAGE));
    if (!stored || typeof stored !== 'object') return { ...defaultMyProfile, interests: [...defaultMyProfile.interests], photos: [] };
    return {
      ...defaultMyProfile,
      ...stored,
      interests: Array.isArray(stored.interests) ? stored.interests.slice(0, 12).filter(x => typeof x === 'string') : [...defaultMyProfile.interests],
      photos: Array.isArray(stored.photos) ? stored.photos.slice(0, 6).filter(x => typeof x === 'string' && x.startsWith('data:image/')) : [],
    };
  } catch {
    return { ...defaultMyProfile, interests: [...defaultMyProfile.interests], photos: [] };
  }
}

export function saveMyProfile(value) {
  try {
    localStorage.setItem(MY_PROFILE_STORAGE, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
