// Illustrative compatibility only: not an AI matching service.
export function getMatchScore(profile, me) {
  const interests = new Set((me.interests || []).map(x => x.toLowerCase()));
  const shared = (profile.interests || []).filter(x => interests.has(x.toLowerCase())).length;
  const sharedGoal = profile.goal === me.goal ? 6 : 0;
  return Math.max(63, Math.min(98, 67 + shared * 8 + sharedGoal + Math.round((profile.compatibility - 80) / 3)));
}
