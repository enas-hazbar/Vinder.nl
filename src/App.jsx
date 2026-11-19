import { useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, MessageCircle, ShieldCheck, X } from 'lucide-react';
import Discover from './pages/Discover.jsx';
import MyProfile from './pages/MyProfile.jsx';
import { readMyProfile, saveMyProfile } from './data/myProfile.js';
import { getMatchScore } from './utils/matching.js';
import { profiles, seededChats } from './data/mockProfiles.js';

const defaultChats = seededChats;
function fromStorage(key, fallback) { try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }

export default function App() {
  const [page,setPage]=useState('discover');
  const [myProfile,setMyProfile]=useState(readMyProfile);
  const saveProfile = next => { if (!saveMyProfile(next)) return false; setMyProfile(next); return true; };
  const [likedIds,setLikedIds] = useState(()=>fromStorage('vinder_demo_likes',[]));
  const [passedIds,setPassedIds] = useState(()=>fromStorage('vinder_demo_passes',[]));
  const [chats,setChats] = useState(()=>fromStorage('vinder_demo_chats', defaultChats));
  const [activeChat,setActiveChat]=useState('maya');
  const [newMessage,setNewMessage]=useState('');
  const [toast,setToast]=useState('');
  const notify = message => { setToast(message); };
  const saveLikes = next => {setLikedIds(next);localStorage.setItem('vinder_demo_likes',JSON.stringify(next));};
  const savePasses = next => {setPassedIds(next);localStorage.setItem('vinder_demo_passes',JSON.stringify(next));};
  const like = id => { const wasLiked = likedIds.includes(id);saveLikes(wasLiked?likedIds.filter(item=>item!==id):[id,...likedIds]); notify(wasLiked?'Like removed':`${profiles.find(p=>p.id===id)?.name} added to your demo matches!`); };
  const pass = id => {if(!passedIds.includes(id)) savePasses([...passedIds,id]);notify('Profile passed. Use Undo to restore it.');};
  const undoPass = () => {savePasses(passedIds.slice(0,-1));notify('Last passed profile restored');};
  const openChat = id => {setActiveChat(id);setPage('messages');};
  const send = event => {event.preventDefault();const text = newMessage.trim();if(!text)return;const updated={...chats,[activeChat]:[...(chats[activeChat]||[]),{from:'me',text}]};setChats(updated);localStorage.setItem('vinder_demo_chats',JSON.stringify(updated));setNewMessage('');};
  const nav = (next) => {setPage(next);setToast('');};
  const matchProfiles = likedIds.map(id=>profiles.find(p=>p.id===id)).filter(Boolean);
  const currentProfile = profiles.find(p=>p.id===activeChat);
  return <>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={()=>nav('discover')}><Heart size={34}/><strong>Vinder</strong></button>
      <nav className="primary-nav" aria-label="Main navigation">
        <button className={page==='discover'?'active':''} onClick={()=>nav('discover')}>Discover</button>
        <button className={page==='matches'?'active':''} onClick={()=>nav('matches')}>Matches {likedIds.length>0&&<span className="counter">{likedIds.length}</span>}</button>
        <button className={page==='messages'?'active':''} onClick={()=>nav('messages')}>Messages <span className="counter">3</span></button>
        <button className={page==='safety'?'active':''} onClick={()=>nav('safety')}>Safety</button>
      </nav>
      <button type="button" className={`header-user ${page==='profile' ? 'active' : ''}`} onClick={()=>nav('profile')} aria-label="Open My Profile to edit your name, hobbies and photos" title="Edit my profile"><span className="user-avatar">{myProfile.photos.length?<img src={myProfile.photos[0]} alt=""/>:myProfile.name.charAt(0).toUpperCase()}</span><strong>Hi, {myProfile.name}</strong><span>⌄</span></button>
    </div></header>
    {page==='discover' && <Discover likedIds={likedIds} passedIds={passedIds} onLike={like} onPass={pass} onUndo={undoPass} conversations={chats} onNavigate={nav} onChat={openChat} myProfile={myProfile}/>}
    {page==='profile' && <MyProfile profile={myProfile} onSave={saveProfile} onNotify={notify}/>}
    {page!=='discover' && page!=='profile' && <main className="subpage"><button className="back" onClick={()=>nav('discover')}><ArrowLeft size={18}/> Back to Discover</button>
      {page==='matches' && <><h1>Your <em>matches</em></h1><p className="lead">These are simulated likes from your fictional Vinder demo.</p>{matchProfiles.length===0 ? <div className="empty-state">No demo matches yet. Head back to Discover and press Like on a profile.</div> : <div className="match-list">{matchProfiles.map(p=><article className="match-row" key={p.id}><img src={p.image} alt=""/><div><h3>{p.name}, {p.age}</h3><p>{p.city} · {getMatchScore(p,myProfile)}% demo compatibility</p></div><button className="outline-button" onClick={()=>openChat(p.id)}><MessageCircle size={16}/> Message</button><button className="remove-match" onClick={()=>like(p.id)} aria-label={`Remove match with ${p.name}`}><X size={17}/></button></article>)}</div>}</>}
      {page==='messages' && <><h1>Your <em>messages</em></h1><p className="lead">Simulated conversations: nothing is sent to a real person or server.</p><div className="message-layout"><aside className="message-contacts">{profiles.filter(p=>chats[p.id]?.length || likedIds.includes(p.id)).map(p=><button key={p.id} className={activeChat===p.id?'active':''} onClick={()=>setActiveChat(p.id)}><img src={p.image} alt=""/><span>{p.name}<small>{p.city}</small></span></button>)}</aside><section className="conversation"><div className="conversation-header"><img src={currentProfile.image} alt=""/><strong>{currentProfile.name}</strong><small>Fictional demo chat</small></div><div className="chat-bubbles">{(chats[activeChat]||[]).map((m,i)=><div key={i} className={'bubble '+(m.from==='me'?'mine':'theirs')}>{m.text}</div>)}</div><form onSubmit={send} className="chat-composer"><input maxLength="300" placeholder="Write a demo message…" value={newMessage} onChange={e=>setNewMessage(e.target.value)}/><button type="submit" className="pink-button">Send <ArrowRight size={16}/></button></form></section></div></>}
      {page==='safety' && <><h1>Privacy & <em>safety</em></h1><div className="safety-content"><ShieldCheck size={48}/><div><h2>This is a fictional university demonstration</h2><p>All profiles, conversations, match scores, names, and badges in this app are fictional. The demo does not verify identities, create real accounts, or communicate with actual users.</p><p>Please do not enter real personal details or passwords. Real security controls such as TLS, authentication, and Wazuh monitoring must be configured separately on the server.</p></div></div></>}
    </main>}
    <footer className="footer"><div><div className="footer-brand"><Heart size={28}/> Vinder</div><small>Fictional educational dating-platform demo.</small></div><div><strong>Discover</strong><span>Browse profiles</span><span>Matches</span><span>Messages</span></div><div><strong>Your Account</strong><button type="button" className="footer-link" onClick={()=>nav('profile')}>Edit demo profile</button><span>Preferences</span></div><div><strong>Help & Safety</strong><span>Safety Center</span><span>Privacy</span></div><div className="footer-end"><strong>University project</strong><small>Not a real dating service</small></div></footer>
    {toast && <div className="toast" role="status">{toast}<button onClick={()=>setToast('')} aria-label="Dismiss notification"><X size={16}/></button></div>}
  </>;
}
