import React, { useState } from 'react';
import { StoreData, GalleryItemData } from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import { TextField, ImageField } from '../components/FormFields';

interface GalleryTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

export const GalleryTab: React.FC<GalleryTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [openCardKeys, setOpenCardKeys] = useState<Set<number>>(new Set());

  const toggleKey = (idx: number) => {
    setOpenCardKeys((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleUpdate = (index: number, updates: Partial<GalleryItemData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.gallery];
      next[index] = { ...next[index], ...updates };
      return { ...prev, gallery: next };
    });
  };

  const handleAdd = () => {
    const newPhoto: GalleryItemData = {
      src: '',
      title: 'New photo',
      tag: 'Gallery',
    };
    onUpdateStore((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newPhoto],
    }));
    setOpenCardKeys(new Set([store.gallery.length]));
    onToast('Added photo');
  };

  const handleDelete = (index: number) => {
    const gone = store.gallery[index];
    onUpdateStore((prev) => {
      const next = [...prev.gallery];
      next.splice(index, 1);
      return { ...prev, gallery: next };
    });
    onToast(`Removed “${gone.title}”`, true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= store.gallery.length) return;
    onUpdateStore((prev) => {
      const next = [...prev.gallery];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return { ...prev, gallery: next };
    });
  };

  return (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <div className="za-eb">Reviews</div>
          <h2>Gallery photos</h2>
          <p>Shown on Reviews and Home.</p>
        </div>
      </div>

      {store.gallery.map((g, idx) => (
        <ItemCard
          key={idx}
          title={g.title}
          subtitle={g.tag}
          image={g.src}
          isOpen={openCardKeys.has(idx)}
          onToggle={() => toggleKey(idx)}
          canMoveUp={idx > 0}
          canMoveDown={idx < store.gallery.length - 1}
          onMoveUp={() => handleMove(idx, 'up')}
          onMoveDown={() => handleMove(idx, 'down')}
          onDelete={() => handleDelete(idx)}
        >
          <div className="za-g2">
            <TextField
              label="Caption"
              value={g.title}
              onChange={(val) => handleUpdate(idx, { title: val })}
            />
            <TextField
              label="Tag"
              value={g.tag}
              onChange={(val) => handleUpdate(idx, { tag: val })}
            />
            <ImageField
              label="Photo"
              fullWidth
              value={g.src}
              onChange={(val) => handleUpdate(idx, { src: val })}
            />
          </div>
        </ItemCard>
      ))}

      <button
        type="button"
        className="za-add"
        style={{ marginTop: '14px' }}
        onClick={handleAdd}
      >
        ＋ Add photo
      </button>
    </section>
  );
};
