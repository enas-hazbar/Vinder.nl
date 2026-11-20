import { useMemo, useState } from 'react';
import { ArrowRight, Grid2X2, Heart, List, RotateCcw, ShieldCheck } from 'lucide-react';
import ProfileCard from '../components/ProfileCard.jsx';
import FilterSidebar, { emptyFilters, initialFilters } from '../components/FilterSidebar.jsx';
import InsightsPanel from '../components/InsightsPanel.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import { getMatchScore } from '../utils/matching.js';

export default function Discover({ likedIds, passedIds, onLike, onPass, onUndo, conversations, onNavigate, onChat, myProfile, profiles }) {
  const [search,setSearch]=useState('');
  const [draft,setDraft]=useState(initialFilters);
  const [filters,setFilters]=useState(initialFilters);
  const [sort,setSort]=useState('compatibility');
  const [mode,setMode]=useState('grid');
  const [viewing,setViewing]=useState(null);
  const results = useMemo(()=>{
    const needle=search.trim().toLowerCase();
    return profiles.filter(p=>{
      if(passedIds.includes(p.id))return false;
      if(needle && ![p.name,p.city,p.work,...p.interests].join(' ').toLowerCase().includes(needle))return false;
      if(p.age<filters.minAge||p.age>filters.maxAge||p.distance>filters.radius)return false;
      if(filters.verified && !p.verified)return false;
      if(filters.city && p.city!==filters.city)return false;
      if(filters.goal!=='any' && p.goal!==filters.goal)return false;
      if(filters.interests.length && !p.interests.some(x=>filters.interests.some(y=>y.toLowerCase()===x.toLowerCase())))return false;
      return true;
    }).sort((a,b)=>sort==='compatibility'?getMatchScore(b,myProfile)-getMatchScore(a,myProfile):sort==='age-asc'?a.age-b.age:sort==='age-desc'?b.age-a.age:a.distance-b.distance);
  },[search,filters,sort,passedIds,myProfile,profiles]);
  const clear = () => {const blank={...emptyFilters};setDraft(blank);setFilters(blank);setSearch('');};
  return <>
    <section className="discover-hero"><div className="hero-inner"><div className="hero-text">
      <h1>Discover your <em>matches</em></h1>
      <p>Meet compatible people based on your preferences, interests, and dating goals. Like the people you're into, and see where it leads.</p>
    </div><div className="hero-portraits">{profiles.slice(0,2).map((p,i)=><img key={p.id} className={i===0?'hero-first':'hero-second'} src={p.image} alt={`Demo member ${p.name}`}/>)}{profiles.length===0&&<span className="hero-no-profiles">Create and publish fictional members to fill Discover</span>}<Heart className="floating-heart" size={31}/></div>
    <button type="button" className="hero-safety" onClick={()=>onNavigate('safety')}><ShieldCheck size={42}/><span><strong>Your privacy & safety come first</strong><u>Learn about our safety  <ArrowRight size={13}/></u></span></button></div></section>
    <div className="discover-layout"><FilterSidebar search={search} setSearch={setSearch} draft={draft} setDraft={setDraft} onApply={()=>setFilters({...draft})} onClear={clear} resultCount={results.length} cities={[...new Set(profiles.map(p=>p.city))].sort()}/>
      <main className="results-column" aria-label="Discover fictional profiles"><div className="results-toolbar"><div><strong>Showing <em>{results.length}</em> matches</strong><span className="toolbar-separator">·</span><label>Sorted by <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort matches"><option value="compatibility">Compatibility</option><option value="distance">Distance</option><option value="age-asc">Age (youngest)</option><option value="age-desc">Age (oldest)</option></select></label></div><div className="view-switch"><button className={mode==='grid'?'selected':''} onClick={()=>setMode('grid')} aria-label="Grid layout" title="Grid layout"><Grid2X2 size={18}/></button><button className={mode==='list'?'selected':''} onClick={()=>setMode('list')} aria-label="List layout" title="List layout"><List size={18}/></button></div></div>
        {results.length>0?<div className={`profiles-grid ${mode==='list'?'list-mode':''}`}>{results.map(profile=><ProfileCard key={profile.id} profile={profile} onLike={onLike} onPass={onPass} onView={setViewing} isLiked={likedIds.includes(profile.id)} score={getMatchScore(profile,myProfile)}/>)}</div> : <div className="no-results"><Heart size={38}/><h3>{profiles.length?'No profiles match those filters':'No published members yet'}</h3><p>{profiles.length?'Try a wider age range, larger distance, or fewer interests.':'Create another fictional account, add a picture and details, then publish it in My Profile.'}</p><button className="pink-button" onClick={clear}>Reset Filters</button></div>}
        <div className="under-results"><span>All people, ages, matches and photos on this site are fictional examples.</span>{passedIds.length>0&&<button onClick={onUndo}><RotateCcw size={15}/> Undo last Pass</button>}</div>
      </main>
      <InsightsPanel likedIds={likedIds} conversations={conversations} onViewMatches={()=>onNavigate('matches')} onOpenChat={onChat} onOpenSafety={()=>onNavigate('safety')} myProfile={myProfile} profiles={profiles}/>
    </div>
    <ProfileModal profile={viewing} liked={viewing?likedIds.includes(viewing.id):false} onClose={()=>setViewing(null)} onLike={onLike} score={viewing?getMatchScore(viewing,myProfile):null}/>
  </>;
}
