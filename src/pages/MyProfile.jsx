import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Camera, Check, Heart, ImagePlus, Pencil, RotateCcw, Save, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { availableInterests } from '../data/mockProfiles.js';
import { defaultMyProfile } from '../data/myProfile.js';

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        // Resize before persisting: six original camera photos would fill localStorage immediately.
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.73));
      } catch (err) { reject(err); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Invalid image')); };
    img.src = url;
  });
}

export default function MyProfile({ profile, onSave, onNotify }) {
  const [draft, setDraft] = useState(() => ({ ...profile, interests: [...profile.interests], photos: [...profile.photos] }));
  const [newHobby, setNewHobby] = useState('');
  const [error, setError] = useState('');
  const [savingImages, setSavingImages] = useState(false);
  const photoInput = useRef(null);

  useEffect(() => {
    setDraft({ ...profile, interests: [...profile.interests], photos: [...profile.photos] });
  }, [profile]);

  const update = (field, value) => setDraft(current => ({ ...current, [field]: value }));
  const addHobby = (value = newHobby) => {
    const hobby = value.trim().replace(/\s+/g, ' ').slice(0, 24);
    if (!hobby) return;
    if (draft.interests.length >= 12) return setError('You can add up to 12 interests.');
    if (draft.interests.some(x => x.toLowerCase() === hobby.toLowerCase())) return setError('That interest is already in your profile.');
    update('interests', [...draft.interests, hobby]);
    setNewHobby('');
    setError('');
  };

  const upload = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    if (files.some(f => !VALID_TYPES.has(f.type) || f.size > MAX_FILE_SIZE)) {
      setError('Please choose JPG, PNG or WebP images smaller than 5 MB each.');
      return;
    }
    const slots = MAX_PHOTOS - draft.photos.length;
    if (slots <= 0) return setError('Remove a picture before adding another.');
    setSavingImages(true);
    setError('');
    try {
      const compressed = await Promise.all(files.slice(0, slots).map(compressImage));
      setDraft(previous => ({ ...previous, photos: [...previous.photos, ...compressed].slice(0, MAX_PHOTOS) }));
      if (files.length > slots) setError(`Only ${slots} new photo${slots === 1 ? '' : 's'} could be added (maximum ${MAX_PHOTOS}).`);
    } catch {
      setError('One of the photos could not be read. Please choose another image.');
    } finally { setSavingImages(false); }
  };

  const removePhoto = index => setDraft(current => ({ ...current, photos: current.photos.filter((_, i) => i !== index) }));
  const movePhoto = (index, direction) => setDraft(current => {
    const photos = [...current.photos];
    const target = index + direction;
    if (target < 0 || target >= photos.length) return current;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    return { ...current, photos };
  });
  const submit = event => {
    event.preventDefault();
    const name = draft.name.trim();
    const age = Number(draft.age);
    if (!name || name.length > 40 || !Number.isInteger(age) || age < 18 || age > 90) {
      setError('Please enter a display name and an age between 18 and 90.');
      return;
    }
    const next = { ...draft, name, age, city: draft.city.trim().slice(0, 50), work: draft.work.trim().slice(0, 70), bio: draft.bio.trim().slice(0, 320) };
    if (!onSave(next)) return setError('Could not save the profile. Your browser storage may be full. Try fewer photos.');
    setError('');
    onNotify('Your demo profile has been saved!');
  };
  const reset = () => {
    if (!window.confirm('Reset your fictional profile and remove all its saved demo pictures?')) return;
    const blank = { ...defaultMyProfile, interests: [...defaultMyProfile.interests], photos: [] };
    if (onSave(blank)) { setDraft(blank); setError(''); onNotify('Demo profile reset.'); }
    else setError('Could not reset demo profile.');
  };

  const popularHobbies = availableInterests.filter(item => !draft.interests.some(h => h.toLowerCase() === item.toLowerCase())).slice(0, 10);
  return <main className="my-profile-page">
    <div className="my-profile-hero">
      <div><div className="eyebrow"><Pencil size={15}/> MY VINDER PROFILE</div><h1>Make your profile <em>you.</em></h1><p>Update your pictures, what you do, your hobbies and what you're looking for. This is a fictional demo — please don't enter sensitive personal information.</p></div>
      <div className="profile-hero-badge"><Heart size={31}/><span>Be yourself.<br/><strong>Find your people.</strong></span></div>
    </div>
    <form onSubmit={submit} className="profile-editor-layout">
      <section className="profile-editor-main">
        <div className="editor-panel"><div className="editor-section-title"><div className="editor-icon"><Camera size={23}/></div><div><h2>Your photos</h2><p>Add up to 6 fictional/demo photos. The first picture becomes your profile avatar.</p></div></div>
          <div className="photo-upload-grid">
            {draft.photos.map((photo, index) => <div className="your-photo" key={`${index}-${photo.slice(-16)}`}>
              <img src={photo} alt={`Your uploaded demo picture ${index + 1}`}/>
              {index === 0 && <span className="cover-label">Main photo</span>}
              <div className="photo-manage"><button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} title="Move earlier" aria-label="Move photo earlier"><ArrowUp size={15}/></button><button type="button" onClick={() => movePhoto(index, 1)} disabled={index === draft.photos.length - 1} title="Move later" aria-label="Move photo later"><ArrowDown size={15}/></button><button type="button" onClick={() => removePhoto(index)} title="Remove picture" aria-label="Remove picture"><Trash2 size={15}/></button></div>
            </div>)}
            {draft.photos.length < MAX_PHOTOS && <button type="button" className="add-photo-tile" onClick={() => photoInput.current?.click()} disabled={savingImages}><ImagePlus size={27}/><strong>{savingImages ? 'Loading…' : 'Add photos'}</strong><small>JPG, PNG or WebP</small></button>}
          </div>
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload} className="sr-only" aria-label="Choose demo profile images"/>
          <p className="helper-text">Photos are resized and stored only in this browser for your demo. They are not uploaded to Netlab, a server or other users.</p>
        </div>
        <div className="editor-panel"><div className="editor-section-title"><div className="editor-icon"><UserRound size={23}/></div><div><h2>About you</h2><p>The details someone would see when they visit your profile.</p></div></div>
          <div className="editor-form-grid">
            <label>Display name <input required maxLength={40} value={draft.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Jamie"/></label>
            <label>Age (18+) <input type="number" min="18" max="90" required value={draft.age} onChange={e => update('age', e.target.value)}/></label>
            <label>City <input maxLength={50} value={draft.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Eindhoven"/></label>
            <label>What do you do? <input maxLength={70} value={draft.work} onChange={e => update('work', e.target.value)} placeholder="Student, developer, nurse…"/></label>
            <label className="wide-field">About me <textarea rows={4} maxLength={320} value={draft.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell your fictional matches a little about yourself…"/><small>{draft.bio.length}/320 characters</small></label>
            <label className="wide-field">What are you looking for? <select value={draft.goal} onChange={e => update('goal', e.target.value)}><option value="Relationship">Long-term relationship</option><option value="Open to dating">Open to dating</option><option value="Friendship">Friendship and connections</option></select></label>
          </div>
        </div>
        <div className="editor-panel"><div className="editor-section-title"><div className="editor-icon"><Heart size={23}/></div><div><h2>Hobbies & interests</h2><p>Type any hobby you like, or choose from popular examples. These affect demo match scores.</p></div></div>
          <div className="interests-editor">{draft.interests.map(hobby => <button type="button" className="selected-hobby" key={hobby} onClick={() => update('interests', draft.interests.filter(x => x !== hobby))}>{hobby}<X size={14}/></button>)}</div>
          <div className="hobby-add-row"><input value={newHobby} maxLength={24} placeholder="Add a hobby, e.g. Horse riding" aria-label="New hobby or interest" onChange={e => setNewHobby(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHobby(); } }}/><button type="button" className="outline-button" onClick={() => addHobby()}>+ Add hobby</button></div>
          <div className="hobby-suggestions"><small>Try adding:</small>{popularHobbies.map(hobby => <button type="button" key={hobby} onClick={() => addHobby(hobby)}>{hobby} +</button>)}</div>
        </div>
        {error && <p className="editor-error" role="alert">{error}</p>}
        <div className="editor-save-row"><button type="submit" className="pink-button" disabled={savingImages}><Save size={19}/> Save profile changes</button><button type="button" className="editor-reset" onClick={reset}><RotateCcw size={16}/> Reset demo profile</button></div>
      </section>
      <aside className="profile-editor-side"><div className="your-profile-preview"><h3><Check size={18}/> Live preview</h3><div className="your-preview-image">{draft.photos.length ? <img src={draft.photos[0]} alt="Your cover picture preview"/> : <div className="your-placeholder"><UserRound size={55}/><span>Add a profile photo</span></div>}</div><div className="preview-content"><h2>{draft.name || 'Your name'}, {draft.age || '—'}</h2><p>{draft.city || 'Your city'} · {draft.work || 'Your occupation'}</p><p>{draft.bio || 'Your bio will appear here…'}</p><div className="tags">{draft.interests.map(hobby => <span className="tag" key={hobby}>{hobby}</span>)}</div></div></div>
        <div className="preview-privacy-note"><ShieldCheck size={23}/><div><strong>Fictional project only</strong><p>No real accounts, ID documents or verification. Demo photos and edits remain in this browser until cleared.</p></div></div>
      </aside>
    </form>
  </main>;
}
