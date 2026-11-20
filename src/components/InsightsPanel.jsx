import { ArrowRight, BarChart3, Heart, MessageCircle, ShieldCheck } from 'lucide-react';
import { getMatchScore } from '../utils/matching.js';

export default function InsightsPanel({ likedIds, conversations, onViewMatches, onOpenChat, onOpenSafety, myProfile, profiles }) {
  const topScore = profiles.length ? Math.max(...profiles.map(p => getMatchScore(p, myProfile))) : null;
  const recent = likedIds.map(id => profiles.find(p=>p.id===id)).filter(Boolean).slice(0,4);
  const shown = recent.length ? recent : profiles.slice(0,4);
  const chats = profiles.filter(p=>(conversations[p.id]||[]).length>0).slice(0,3).map(profile=>({profile, messages:conversations[profile.id]}));
  return (
    <aside className="right-sidebar">
      <section className="panel insight-panel">
        <h3><BarChart3 size={22}/> Your match insights</h3>
        <div className="insight-content"><div className="donut"><span>{topScore===null?'—':`${topScore}%`}</span></div><div><strong>{topScore===null?'Waiting for members':'Your compatibility preview'}</strong><p>Match scores change with interests after other test accounts publish their profiles.</p></div></div>
      </section>
      <section className="panel mini-panel">
        <div className="section-heading"><h3><Heart size={22}/> Recent Matches</h3><button type="button" onClick={onViewMatches}>See All <ArrowRight size={15}/></button></div>
        <div className="recent-photos">{shown.map(profile=><button type="button" onClick={onViewMatches} key={profile.id}><img src={profile.image} alt={profile.name}/><span>{profile.name}, {profile.age}</span></button>)}</div>{!shown.length&&<p className="helper-text">No published profiles yet.</p>}
        {!recent.length && <small>Suggested members — like someone to create your list.</small>}
      </section>
      <section className="panel mini-panel messages-panel">
        <div className="section-heading"><h3><MessageCircle size={22}/> Messages</h3><button type="button" onClick={()=>onOpenChat(null)}>See All <ArrowRight size={15}/></button></div>
        {chats.map(({profile,messages},i)=><button type="button" className="chat-preview" onClick={()=>onOpenChat(profile.id)} key={profile.id}>
          <img src={profile.image} alt=""/>
          <span className="chat-preview-text"><strong>{profile.name}, {profile.age} <i/></strong><small>{messages.at(-1)?.text || 'Say hello!'}</small></span>
          <span className="chat-time">{i===0 ? '10:24 AM' : i===1 ? 'Yesterday' : 'Mon'}</span>
        </button>)}
        {!chats.length&&<p className="helper-text">No conversations yet.</p>}
        <button type="button" className="outline-button new-message" onClick={()=>onOpenChat(profiles[0]?.id||null)} disabled={!profiles.length}><MessageCircle size={17}/> New Message</button>
      </section>
      <section className="demo-note"><ShieldCheck size={18}/><button type="button" onClick={onOpenSafety}>Learn more</button></section>
    </aside>
  );
}
