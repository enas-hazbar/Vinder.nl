import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { profiles } from '../src/data/mockProfiles.js';
import { defaultMyProfile } from '../src/data/myProfile.js';
import { getMatchScore } from '../src/utils/matching.js';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('all fictional demo profiles have three existing local gallery pictures', () => {
  assert.equal(profiles.length, 6);
  for (const profile of profiles) {
    assert.equal(profile.photos.length, 3);
    for (const image of profile.photos) assert.ok(existsSync(join(root, 'public', image.slice(1))), `Missing ${image}`);
  }
});

test('hobbies affect match scores', () => {
  const hobby = profiles[0].interests[0];
  const withHobby = { ...defaultMyProfile, interests: [hobby] };
  const withoutHobby = { ...defaultMyProfile, interests: ['Chess'] };
  assert.ok(getMatchScore(profiles[0], withHobby) > getMatchScore(profiles[0], withoutHobby));
});

test('all scores remain within demo range', () => {
  for (const profile of profiles) {
    const score = getMatchScore(profile, defaultMyProfile);
    assert.ok(score >= 63 && score <= 98);
  }
});
