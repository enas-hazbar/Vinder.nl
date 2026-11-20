import { useState } from 'react';
import { BadgeCheck, Camera, ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';

export default function ProfileCard({ profile, onLike, onPass, onView, isLiked, score }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const gallery = profile.photos?.length ? profile.photos : [profile.image];
  const nextImage = direction => setPhotoIndex(i => (i + direction + gallery.length) % gallery.length);
  return (
    <article className="profile-card">
      <div className="profile-photo">
        <button type="button" className="photo-open" onClick={() => onView(profile)} aria-label={`View ${profile.name}'s full photo gallery`}>
          <img src={gallery[photoIndex]} alt={`Fictional  photo ${photoIndex + 1} of ${gallery.length} for ${profile.name}`} loading="lazy" />
        </button>
        {gallery.length > 1 && <>
          <span className="photo-count"><Camera size={12}/> {photoIndex + 1}/{gallery.length}</span>
          <button className="card-photo-prev" onClick={() => nextImage(-1)} aria-label={`Previous photo of ${profile.name}`} type="button"><ChevronLeft size={16}/></button>
          <button className="card-photo-next" onClick={() => nextImage(1)} aria-label={`Next photo of ${profile.name}`} type="button"><ChevronRight size={16}/></button>
        </>}
        <button type="button" className={`photo-heart ${isLiked ? 'is-liked' : ''}`} onClick={() => onLike(profile.id)} aria-label={`Like ${profile.name}`}>
          <Heart size={20} fill="currentColor" />
        </button>
      </div>
      <div className="profile-info">
        <div className="profile-name-row"><strong>{profile.name}, {profile.age}</strong>{profile.verified && <BadgeCheck className="verified" size={17} aria-label="Fictional verification badge"/>}</div>
        <div className="profile-subtitle">{profile.interests.join(' · ')}</div>
        <p className="profile-bio">{profile.bio}</p>
        <div className="tags">{profile.interests.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
        <div className="card-actions">
          <button type="button" className="outline-button" onClick={() => onPass(profile.id)}><X size={15}/> Pass</button>
          <button type="button" className={`pink-button ${isLiked ? 'liked-button' : ''}`} onClick={() => onLike(profile.id)}><Heart size={15} fill={isLiked?'currentColor':'none'}/> {isLiked ? 'Liked' : 'Like'}</button>
        </div>
        <button type="button" className="view-button" onClick={() => onView(profile)}>View Photos & Profile <span aria-hidden="true">→</span></button>
        {typeof score === 'number' && <small className="profile-score">{score}%  match for your interests</small>}
      </div>
    </article>
  );
}
