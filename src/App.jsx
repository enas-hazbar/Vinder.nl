import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, LogOut, MessageCircle, ShieldCheck, X } from 'lucide-react';
import Discover from './pages/Discover.jsx';
import MyProfile from './pages/MyProfile.jsx';
import { defaultMyProfile } from './data/myProfile.js';
import { getMatchScore } from './utils/matching.js';
import { api } from './api.js';

export default function App(){
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [account,setAccount]=useState(null);
 const [page,setPage]=useState('discover');
 const [profiles,setProfiles]=useState([]);
 const [myProfile,setMyProfile]=useState(defaultMyProfile);
 const [likedIds,setLikedIds]=useState([]);
 const [passedIds,setPassedIds]=useState([]);
 const [chats,setChats]=useState({});
 const [activeChat,setActiveChat]=useState('');
 const [newMessage,setNewMessage]=useState('');
 const [toast,setToast]=useState('');
 const notify=message=>setToast(message);
 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const [session,members]=await Promise.all([api('/session'),api('/profiles')]);
    if(!active)return;
    setAccount(session.user);
    setProfiles(members.profiles);
    setActiveChat(members.profiles[0]?.id||'');
    setMyProfile(session.user.profile);
    setLikedIds(session.user.state.likes||[]);
    setPassedIds(session.user.state.passes||[]);
    setChats(session.user.state.chats||{});
   }catch(e){
    if(!active)return;
    if(/sign in|signed in|401|unauthorized/i.test(e.message)) window.location.replace('/login.html');
    else setError(e.message+' — Check that the Vinder API is running.');
   }finally{if(active)setLoading(false);}
  })();
  return()=>{active=false};
 },[]);
 const persistState=async(likes=likedIds,passes=passedIds,messages=chats)=>{
  try {await api('/me/state',{method:'PUT',body:{likes,passes,chats:messages}});}
  catch(e){notify('Could not save: '+e.message);}
 };
 const saveProfile=async next=>{
  const result=await api('/me/profile',{method:'PUT',body:next});
  setMyProfile(result.profile);
  const members=await api('/profiles');
  setProfiles(members.profiles);
  return true;
 };
 const like=id=>{
  const was=likedIds.includes(id);
  const next=was?likedIds.filter(x=>x!==id):[id,...likedIds];
  setLikedIds(next);
  void persistState(next,passedIds,chats);
  notify(was?'Like removed':`${profiles.find(p=>p.id===id)?.name} added to your  matches!`);
 };
 const pass=id=>{
  if(passedIds.includes(id))return;
  const next=[...passedIds,id];setPassedIds(next);void persistState(likedIds,next,chats);
  notify('Profile passed. You can undo this.');
 };
 const undoPass=()=>{
  const next=passedIds.slice(0,-1);setPassedIds(next);void persistState(likedIds,next,chats);notify('Last passed profile restored');
 };
 const nav=next=>{setPage(next);setToast('')};
 const openChat=id=>{if(id)setActiveChat(id);setPage('messages')};
 const send=event=>{
  event.preventDefault();const text=newMessage.trim();if(!text)return;
  const updated={...chats,[activeChat]:[...(chats[activeChat]||[]),{from:'me',text}]};
  setChats(updated);setNewMessage('');void persistState(likedIds,passedIds,updated);
 };
 const logout=async()=>{try{await api('/logout',{method:'POST',body:{}});}finally{window.location.assign('/index.html');}};
 const matches=likedIds.map(id=>profiles.find(p=>p.id===id)).filter(Boolean);
 const currentProfile=profiles.find(p=>p.id===activeChat)||profiles[0];
 if(loading)return <main className="loading-state">Loading your Vinder account…</main>;
 if(error)return <main className="loading-state"><h1>Could not connect</h1><p>{error}</p><a href="/index.html">Back to homepage</a></main>;
 if(!account)return null;
 return <>
  <header className="site-header"><div className="header-inner">
    <button className="brand" onClick={()=>nav('discover')}><Heart size={34}/><strong>Vinder</strong></button>
    <nav className="primary-nav" aria-label="Main navigation">
      <button className={page==='discover'?'active':''} onClick={()=>nav('discover')}>Discover</button>
      <button className={page==='matches'?'active':''} onClick={()=>nav('matches')}>Matches {likedIds.length>0&&<span className="counter">{likedIds.length}</span>}</button>
      <button className={page==='messages'?'active':''} onClick={()=>nav('messages')}>Messages</button>
      <button className={page==='safety'?'active':''} onClick={()=>nav('safety')}>Safety</button>
    </nav>
    <button type="button" className={`header-user ${page==='profile'?'active':''}`} onClick={()=>nav('profile')} title="Edit your profile"><span className="user-avatar">{myProfile.photos?.length?<img src={myProfile.photos[0]} alt=""/>:myProfile.name.charAt(0).toUpperCase()}</span><strong>Hi, {myProfile.name}</strong><span>⌄</span></button>
    <button type="button" className="logout-button" onClick={logout}><LogOut size={16}/> Log out</button>
  </div></header>
  {page==='discover'&&<Discover likedIds={likedIds} passedIds={passedIds} onLike={like} onPass={pass} onUndo={undoPass} conversations={chats} onNavigate={nav} onChat={openChat} myProfile={myProfile} profiles={profiles}/>}
  {page==='profile'&&<MyProfile profile={myProfile} onSave={saveProfile} onNotify={notify}/>}
  {page!=='discover'&&page!=='profile'&&<main className="subpage"><button className="back" onClick={()=>nav('discover')}><ArrowLeft size={18}/> Back to Discover</button>
   {page==='matches'&&<><h1>Your <em>matches</em></h1><p className="lead">Your fictional likes are saved to the lab database.</p>{matches.length===0?<div className="empty-state">No  matches yet. Head to Discover and Like a profile.</div>:<div className="match-list">{matches.map(p=><article className="match-row" key={p.id}><img src={p.image} alt=""/><div><h3>{p.name}, {p.age}</h3><p>{p.city} · {getMatchScore(p,myProfile)}% compatibility</p></div><button className="outline-button" onClick={()=>openChat(p.id)}><MessageCircle size={16}/> Message</button><button className="remove-match" onClick={()=>like(p.id)} aria-label={`Remove ${p.name}`}><X size={17}/></button></article>)}</div>}</>}
   {page==='messages'&&currentProfile&&<><h1>Your <em>messages</em></h1><p className="lead">Messages are saved to your own test account. They are not delivered to another user's inbox.</p><div className="message-layout"><aside className="message-contacts">{profiles.filter(p=>chats[p.id]?.length||likedIds.includes(p.id)).map(p=><button key={p.id} className={activeChat===p.id?'active':''} onClick={()=>setActiveChat(p.id)}><img src={p.image} alt=""/><span>{p.name}<small>{p.city}</small></span></button>)}</aside><section className="conversation"><div className="conversation-header"><img src={currentProfile.image} alt=""/><strong>{currentProfile.name}</strong><small>Fictional chat</small></div><div className="chat-bubbles">{(chats[activeChat]||[]).map((m,i)=><div key={i} className={'bubble '+(m.from==='me'?'mine':'theirs')}>{m.text}</div>)}</div><form onSubmit={send} className="chat-composer"><input maxLength="300" placeholder="Write a message…" value={newMessage} onChange={e=>setNewMessage(e.target.value)}/><button type="submit" className="pink-button">Send <ArrowRight size={16}/></button></form></section></div></>}
   {page==='safety'&&<><h1>Privacy & <em>safety</em></h1><div className="safety-content"><ShieldCheck size={48}/><div><h2></h2><p>Only manually published fictional accounts appear in Discover</p></div></div></>}
  </main>}
  <footer className="footer"><div><div className="footer-brand"><Heart size={28}/> Vinder</div><small>Fictional educational platform, lab only.</small></div><div><strong>Discover</strong><span>Browse profiles</span><span>Matches</span><span>Messages</span></div><div><strong>Your Account</strong><button type="button" className="footer-link" onClick={()=>nav('profile')}>Edit profile</button><span>Preferences</span></div><div><strong>Help & Safety</strong><span>Safety Center</span><span>Privacy</span></div><div className="footer-end"><strong>University project</strong><small>Not a real dating service</small></div></footer>
  {toast&&<div className="toast" role="status">{toast}<button onClick={()=>setToast('')} aria-label="Dismiss notification"><X size={16}/></button></div>}
 </>;
}
