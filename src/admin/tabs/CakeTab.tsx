import React, { useState } from 'react';
import {
  StoreData,
  CakeSizeData,
  CakeFlavorData,
  CakeOccasionData,
  CakeDecorationData,
  CakeAddonData,
  formatMoney,
} from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  NumberField,
  ColorField,
  TagsField,
} from '../components/FormFields';

interface CakeTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

export const CakeTab: React.FC<CakeTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [openCardKeys, setOpenCardKeys] = useState<Set<string>>(new Set());

  const toggleKey = (key: string) => {
    setOpenCardKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Sizes
  const handleUpdateSize = (index: number, updates: Partial<CakeSizeData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.sizes];
      next[index] = { ...next[index], ...updates };
      return { ...prev, sizes: next };
    });
  };

  const handleAddSize = () => {
    const newSize: CakeSizeData = {
      name: 'New size',
      weight: '1 Kg',
      servings: '6 – 8 slices',
      price: 45000,
      description: '',
    };
    onUpdateStore((prev) => ({
      ...prev,
      sizes: [...prev.sizes, newSize],
    }));
    setOpenCardKeys(new Set([`size-${store.sizes.length}`]));
    onToast('Added size');
  };

  const handleDeleteSize = (index: number) => {
    const gone = store.sizes[index];
    onUpdateStore((prev) => {
      const next = [...prev.sizes];
      next.splice(index, 1);
      return { ...prev, sizes: next };
    });
    onToast(`Removed “${gone.name}”`, true);
  };

  const handleMoveSize = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= store.sizes.length) return;
    onUpdateStore((prev) => {
      const next = [...prev.sizes];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return { ...prev, sizes: next };
    });
  };

  // Flavors
  const handleUpdateFlavor = (index: number, updates: Partial<CakeFlavorData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.flavors];
      next[index] = { ...next[index], ...updates };
      return { ...prev, flavors: next };
    });
  };

  const handleAddFlavor = () => {
    const newFlavor: CakeFlavorData = {
      name: 'New flavor',
      description: '',
      color: '#e8b374',
      badge: '',
      ingredients: [],
    };
    onUpdateStore((prev) => ({
      ...prev,
      flavors: [...prev.flavors, newFlavor],
    }));
    setOpenCardKeys(new Set([`flavor-${store.flavors.length}`]));
    onToast('Added flavor');
  };

  const handleDeleteFlavor = (index: number) => {
    const gone = store.flavors[index];
    onUpdateStore((prev) => {
      const next = [...prev.flavors];
      next.splice(index, 1);
      return { ...prev, flavors: next };
    });
    onToast(`Removed “${gone.name}”`, true);
  };

  const handleMoveFlavor = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= store.flavors.length) return;
    onUpdateStore((prev) => {
      const next = [...prev.flavors];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return { ...prev, flavors: next };
    });
  };

  // Occasions
  const handleUpdateOccasion = (index: number, updates: Partial<CakeOccasionData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.occ];
      next[index] = { ...next[index], ...updates };
      return { ...prev, occ: next };
    });
  };

  const handleAddOccasion = () => {
    const newOcc: CakeOccasionData = {
      label: 'New occasion',
      icon: '🎉',
    };
    onUpdateStore((prev) => ({
      ...prev,
      occ: [...prev.occ, newOcc],
    }));
    setOpenCardKeys(new Set([`occ-${store.occ.length}`]));
    onToast('Added occasion');
  };

  const handleDeleteOccasion = (index: number) => {
    const gone = store.occ[index];
    onUpdateStore((prev) => {
      const next = [...prev.occ];
      next.splice(index, 1);
      return { ...prev, occ: next };
    });
    onToast(`Removed “${gone.label}”`, true);
  };

  // Decorations
  const handleUpdateDeco = (index: number, updates: Partial<CakeDecorationData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.decos];
      next[index] = { ...next[index], ...updates };
      return { ...prev, decos: next };
    });
  };

  const handleAddDeco = () => {
    const newDeco: CakeDecorationData = {
      label: 'New decoration',
      extra: 0,
    };
    onUpdateStore((prev) => ({
      ...prev,
      decos: [...prev.decos, newDeco],
    }));
    setOpenCardKeys(new Set([`deco-${store.decos.length}`]));
    onToast('Added decoration');
  };

  const handleDeleteDeco = (index: number) => {
    const gone = store.decos[index];
    onUpdateStore((prev) => {
      const next = [...prev.decos];
      next.splice(index, 1);
      return { ...prev, decos: next };
    });
    onToast(`Removed “${gone.label}”`, true);
  };

  // Add-ons
  const handleUpdateAddon = (index: number, updates: Partial<CakeAddonData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.addons];
      next[index] = { ...next[index], ...updates };
      return { ...prev, addons: next };
    });
  };

  const handleAddAddon = () => {
    const newAddon: CakeAddonData = {
      label: 'New add-on',
      extra: 2000,
    };
    onUpdateStore((prev) => ({
      ...prev,
      addons: [...prev.addons, newAddon],
    }));
    setOpenCardKeys(new Set([`addon-${store.addons.length}`]));
    onToast('Added add-on');
  };

  const handleDeleteAddon = (index: number) => {
    const gone = store.addons[index];
    onUpdateStore((prev) => {
      const next = [...prev.addons];
      next.splice(index, 1);
      return { ...prev, addons: next };
    });
    onToast(`Removed “${gone.label}”`, true);
  };

  return (
    <div>
      {/* SIZES */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Cake Studio</div>
            <h2>Sizes &amp; prices</h2>
            <p>Step 2 of the cake builder.</p>
          </div>
        </div>

        {store.sizes.map((s, idx) => (
          <ItemCard
            key={idx}
            title={s.name}
            subtitle={`${s.weight} · ${s.servings}`}
            pill={formatMoney(s.price)}
            pillClass="x"
            emoji="🎂"
            isOpen={openCardKeys.has(`size-${idx}`)}
            onToggle={() => toggleKey(`size-${idx}`)}
            canMoveUp={idx > 0}
            canMoveDown={idx < store.sizes.length - 1}
            onMoveUp={() => handleMoveSize(idx, 'up')}
            onMoveDown={() => handleMoveSize(idx, 'down')}
            onDelete={() => handleDeleteSize(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Name"
                value={s.name}
                onChange={(val) => handleUpdateSize(idx, { name: val })}
              />
              <TextField
                label="Weight"
                value={s.weight}
                onChange={(val) => handleUpdateSize(idx, { weight: val })}
              />
              <TextField
                label="Servings"
                value={s.servings}
                onChange={(val) => handleUpdateSize(idx, { servings: val })}
              />
              <NumberField
                label="Base price (TZS)"
                step={1000}
                value={s.price}
                onChange={(val) => handleUpdateSize(idx, { price: val })}
              />
              <TextAreaField
                label="Description"
                fullWidth
                value={s.description}
                onChange={(val) => handleUpdateSize(idx, { description: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddSize}
        >
          ＋ Add size
        </button>
      </section>

      {/* FLAVORS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Flavors</h2>
            <p>Each flavor has its own ingredients, colour and badge.</p>
          </div>
        </div>

        {store.flavors.map((f, idx) => (
          <ItemCard
            key={idx}
            title={f.name}
            subtitle={(f.ingredients || []).join(', ') || f.description}
            color={f.color}
            pill={f.badge || undefined}
            pillClass="x"
            isOpen={openCardKeys.has(`flavor-${idx}`)}
            onToggle={() => toggleKey(`flavor-${idx}`)}
            canMoveUp={idx > 0}
            canMoveDown={idx < store.flavors.length - 1}
            onMoveUp={() => handleMoveFlavor(idx, 'up')}
            onMoveDown={() => handleMoveFlavor(idx, 'down')}
            onDelete={() => handleDeleteFlavor(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Flavor name"
                value={f.name}
                onChange={(val) => handleUpdateFlavor(idx, { name: val })}
              />
              <TextField
                label="Badge"
                placeholder="Best Seller"
                hint="optional"
                value={f.badge || ''}
                onChange={(val) => handleUpdateFlavor(idx, { badge: val })}
              />
              <ColorField
                label="Accent colour"
                value={f.color}
                onChange={(val) => handleUpdateFlavor(idx, { color: val })}
              />
              <TextAreaField
                label="Description"
                value={f.description}
                onChange={(val) => handleUpdateFlavor(idx, { description: val })}
              />
              <TagsField
                label="Ingredients"
                hint="add or remove"
                fullWidth
                tags={f.ingredients || []}
                onChange={(tags) => handleUpdateFlavor(idx, { ingredients: tags })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddFlavor}
        >
          ＋ Add flavor
        </button>
      </section>

      {/* OCCASIONS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Occasions</h2>
            <p>Chips like Birthday, Wedding…</p>
          </div>
        </div>

        {store.occ.map((o, idx) => (
          <ItemCard
            key={idx}
            title={o.label}
            emoji={o.icon}
            isOpen={openCardKeys.has(`occ-${idx}`)}
            onToggle={() => toggleKey(`occ-${idx}`)}
            onDelete={() => handleDeleteOccasion(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Icon (emoji)"
                value={o.icon}
                onChange={(val) => handleUpdateOccasion(idx, { icon: val })}
              />
              <TextField
                label="Name"
                value={o.label}
                onChange={(val) => handleUpdateOccasion(idx, { label: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddOccasion}
        >
          ＋ Add occasion
        </button>
      </section>

      {/* DECORATIONS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Decorations</h2>
            <p>Set extra price to 0 for “Free”.</p>
          </div>
        </div>

        {store.decos.map((d, idx) => (
          <ItemCard
            key={idx}
            title={d.label}
            pill={d.extra ? `+${formatMoney(d.extra)}` : 'Free'}
            pillClass="x"
            emoji="✨"
            isOpen={openCardKeys.has(`deco-${idx}`)}
            onToggle={() => toggleKey(`deco-${idx}`)}
            onDelete={() => handleDeleteDeco(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Name"
                value={d.label}
                onChange={(val) => handleUpdateDeco(idx, { label: val })}
              />
              <NumberField
                label="Extra price (TZS)"
                value={d.extra}
                onChange={(val) => handleUpdateDeco(idx, { extra: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddDeco}
        >
          ＋ Add decoration
        </button>
      </section>

      {/* ADDONS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Extra add-ons</h2>
            <p>Candles, sparklers, gift boxes… optional extras.</p>
          </div>
        </div>

        {store.addons.map((a, idx) => (
          <ItemCard
            key={idx}
            title={a.label}
            pill={`+${formatMoney(a.extra)}`}
            pillClass="x"
            emoji="🎁"
            isOpen={openCardKeys.has(`addon-${idx}`)}
            onToggle={() => toggleKey(`addon-${idx}`)}
            onDelete={() => handleDeleteAddon(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Name"
                value={a.label}
                onChange={(val) => handleUpdateAddon(idx, { label: val })}
              />
              <NumberField
                label="Price (TZS)"
                value={a.extra}
                onChange={(val) => handleUpdateAddon(idx, { extra: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddAddon}
        >
          ＋ Add extra
        </button>
      </section>
    </div>
  );
};
