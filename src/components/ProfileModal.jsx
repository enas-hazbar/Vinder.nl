import { useEffect, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, Camera, ChevronLeft, ChevronRight, Heart, MapPin, X } from 'lucide-react';

export default function ProfileModal({ profile, liked, onClose, onLike, score }) {
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [profile?.id]);
  useEffect(() => {
    if (!profile) return;
    const listener = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [profile, onClose]);
  if (!profile) return null;
  const gallery = profile.photos?.length ? profile.photos : [profile.image];
  const move = step => setActive(index => (index + step + gallery.length) % gallery.length);
  return (
    <div className="modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget) onClose()}}>
      <section className="modal-card gallery-modal" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close profile"><X size={21}/></button>
        <div className="profile-gallery-stage">
          <img className="modal-photo" src={gallery[active]} alt={`Fictional ${profile.name} photo ${active+1} of ${gallery.length}`} />
          {gallery.length > 1 && <><button type="button" className="gallery-prev" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft size={21}/></button><button type="button" className="gallery-next" onClick={() => move(1)} aria-label="Next photo"><ChevronRight size={21}/></button></>}
          <span className="gallery-counter"><Camera size={14}/> {active + 1} / {gallery.length}</span>
        </div>
        {gallery.length > 1 && <div className="gallery-thumbnails">{gallery.map((photo, i) => <button type="button" key={photo + i} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Show ${profile.name} photo ${i + 1}`}><img src={photo} alt="" /></button>)}</div>}
        <div className="modal-inner"><h2 id="profile-dialog-title">{profile.name}, {profile.age} {profile.verified && <BadgeCheck size={20} className="verified" aria-label="Demo badge"/>}</h2>
          <p className="modal-sub"><MapPin size={17}/>{profile.city} · {profile.distance} km away</p>
          <p className="modal-sub"><BriefcaseBusiness size={17}/>{profile.work}</p>
          <div className="compatibility-pill">{score ?? profile.compatibility}% demo compatibility</div>
          <h3>About me</h3><p>{profile.bio}</p><h3>My hobbies & interests</h3><div className="tags">{profile.interests.map(i=><span className="tag" key={i}>{i}</span>)}</div>
          <p className="gallery-demo-disclaimer">This is a fictional profile. The photo gallery contains demo placeholders and does not represent a real user account.</p>
          <button type="button" className="pink-button modal-like" onClick={()=>onLike(profile.id)}><Heart size={17} fill={liked?'currentColor':'none'}/>{liked?'Liked — undo like':'Like '+profile.name}</button>
        </div>
      </section>
    </div>
  );
}
