import { Search, Heart, MapPin, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { availableInterests } from '../data/mockProfiles.js';

export const emptyFilters = { minAge: 24, maxAge: 34, radius: 25, interests: [], goal: 'any', verified: false };
export const initialFilters = { ...emptyFilters, interests: ['Travel', 'Food', 'Music'], verified: true };

export default function FilterSidebar({ search, setSearch, draft, setDraft, onApply, onClear, resultCount }) {
  const toggleInterest = (tag) => setDraft(previous => ({ ...previous, interests: previous.interests.includes(tag) ? previous.interests.filter(v=>v!==tag) : [...previous.interests, tag] }));
  return (
    <aside className="filter-panel panel">
      <h2>Find Your Match</h2>
      <label className="search-field"><Search size={18}/><input aria-label="Search profiles by name or interest" placeholder="Search by name or interest" value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <div className="separator"/>
      <h3>Preferences</h3>
      <div className="filter-group">
        <div className="filter-heading"><span><SlidersHorizontal size={17}/> Age Range</span><strong>{draft.minAge} – {draft.maxAge}</strong></div>
        <div className="dual-range">
          <label>Minimum age <input type="range" min="18" max="55" value={draft.minAge} onChange={e => setDraft(p=>({...p, minAge: Math.min(Number(e.target.value),p.maxAge)}))}/></label>
          <label>Maximum age <input type="range" min="18" max="55" value={draft.maxAge} onChange={e => setDraft(p=>({...p,maxAge: Math.max(Number(e.target.value),p.minAge)}))}/></label>
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-heading" htmlFor="distance"><span><MapPin size={17}/> Location</span></label>
        <select id="distance" value={draft.radius} onChange={e=>setDraft(p=>({...p, radius:Number(e.target.value)}))}>
          <option value="10">Within 10 km</option><option value="25">Within 25 km</option><option value="50">Within 50 km</option><option value="100">Within 100 km</option>
        </select>
      </div>
      <div className="filter-group">
        <div className="filter-heading"><span><Heart size={17}/> Interests</span></div>
        <div className="selected-interests">{draft.interests.map(tag=><button type="button" key={tag} onClick={()=>toggleInterest(tag)}>{tag} ×</button>)}</div>
        <label className="sr-only" htmlFor="interest-selector">Add an interest</label>
        <select id="interest-selector" value="" onChange={e=>{if(e.target.value) toggleInterest(e.target.value)}}><option value="">Add interests…</option>{availableInterests.filter(i=>!draft.interests.includes(i)).map(i=><option key={i} value={i}>{i}</option>)}</select>
      </div>
      <div className="filter-group">
        <label className="filter-heading" htmlFor="relationship-goal"><span><Heart size={17}/> Relationship Goals</span></label>
        <select id="relationship-goal" value={draft.goal} onChange={e=>setDraft(p=>({...p, goal:e.target.value}))}><option value="any">Dating (open to a relationship)</option><option value="Relationship">Long-term relationship</option><option value="Open to dating">Open to dating</option></select>
      </div>
      <div className="separator"/>
      <label className="toggle-row"><span><ShieldCheck size={21}/><span><strong>Demo verified profiles</strong><small>Shows mock verification badges only</small></span></span><input type="checkbox" checked={draft.verified} onChange={e=>setDraft(p=>({...p,verified:e.target.checked}))}/><span className="switch"/></label>
      <div className="filter-bottom"><button type="button" className="pink-button apply-button" onClick={onApply}><Search size={17}/> Apply Filters</button><button type="button" className="outline-button clear-button" onClick={onClear}>Clear All</button><small>{resultCount} fictional profiles available</small></div>
    </aside>
  );
}
