import React, { useState } from 'react';
import { StoreData } from '../../data/store';
import { ImageField } from '../components/FormFields';

interface MediaTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

interface ImageEntry {
  path: string;
  label: string;
  section: string;
  value: string;
}

export function extractImages(store: StoreData): ImageEntry[] {
  const list: ImageEntry[] = [];

  // Home hero
  list.push({
    path: 'home.hero.image',
    label: 'Hero photo',
    section: 'Home',
    value: store.home.hero.image,
  });

  // Home serves cards
  store.home.serves.cards.forEach((card, idx) => {
    list.push({
      path: `home.serves.cards.${idx}.image`,
      label: card.title || `Serve card ${idx + 1}`,
      section: 'Home',
      value: card.image,
    });
  });

  // Home story photos
  list.push({
    path: 'home.test.p0i',
    label: store.home.test.p0l || 'Story photo 1',
    section: 'Home',
    value: store.home.test.p0i,
  });
  list.push({
    path: 'home.test.p1i',
    label: store.home.test.p1l || 'Story photo 2',
    section: 'Home',
    value: store.home.test.p1i,
  });

  // Home moment image
  list.push({
    path: 'home.moment.image',
    label: 'Moment photo',
    section: 'Home',
    value: store.home.moment.image,
  });

  // About photo
  list.push({
    path: 'home.aboutPhoto',
    label: 'About page photo',
    section: 'About',
    value: store.home.aboutPhoto,
  });

  // Menu items
  store.menu.forEach((item, idx) => {
    list.push({
      path: `menu.${idx}.image`,
      label: item.name || `Dish ${idx + 1}`,
      section: 'Menu',
      value: item.image,
    });
  });

  // Gallery items
  store.gallery.forEach((item, idx) => {
    list.push({
      path: `gallery.${idx}.src`,
      label: item.title || `Gallery photo ${idx + 1}`,
      section: 'Gallery',
      value: item.src,
    });
  });

  return list;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const images = extractImages(store);
  const sections = ['Home', 'About', 'Menu', 'Gallery'];
  const missingCount = images.filter((x) => !x.value).length;

  const handleUpdateImage = (path: string, newValue: string) => {
    onUpdateStore((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = newValue;
      return next;
    });
    onToast('Image updated ✓');
  };

  const filteredImages = images.filter((img) =>
    filter === 'all' ? true : img.section === filter
  );

  return (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <div className="za-eb">Media</div>
          <h2>All website images</h2>
          <p>
            {images.length} images
            {missingCount ? ` · ${missingCount} missing` : ''}. Upload a photo or
            paste a link and it replaces the old one wherever it is used.
          </p>
        </div>
      </div>

      <div className="za-chips">
        <button
          type="button"
          className={`za-chip ${filter === 'all' ? 'on' : ''}`}
          onClick={() => setFilter('all')}
        >
          All · {images.length}
        </button>
        {sections.map((sec) => {
          const count = images.filter((x) => x.section === sec).length;
          return (
            <button
              key={sec}
              type="button"
              className={`za-chip ${filter === sec ? 'on' : ''}`}
              onClick={() => setFilter(sec)}
            >
              {sec} · {count}
            </button>
          );
        })}
      </div>

      <div className="za-g2">
        {filteredImages.map((img) => (
          <div key={img.path} className="za-item" style={{ padding: '14px' }}>
            <ImageField
              label={img.label}
              hint={img.section}
              value={img.value}
              onChange={(val) => handleUpdateImage(img.path, val)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
