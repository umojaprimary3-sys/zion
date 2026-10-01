import React, { useState } from 'react';
import {
  StoreData,
  MenuItemData,
  MenuCat,
  formatMoney,
} from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  SwitchField,
  ImageField,
} from '../components/FormFields';

interface MenuTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

export const MenuTab: React.FC<MenuTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItemKeys, setOpenItemKeys] = useState<Set<string>>(new Set());

  const toggleKey = (key: string) => {
    setOpenItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Category handlers
  const handleUpdateCat = (index: number, updates: Partial<MenuCat>) => {
    onUpdateStore((prev) => {
      const nextCats = [...prev.cats];
      nextCats[index] = { ...nextCats[index], ...updates };
      return { ...prev, cats: nextCats };
    });
  };

  const handleAddCat = () => {
    const newCat: MenuCat = {
      id: 'c' + Date.now(),
      label: 'New category',
      icon: '🍽️',
    };
    onUpdateStore((prev) => ({
      ...prev,
      cats: [...prev.cats, newCat],
    }));
    setOpenItemKeys(new Set([`cat-${newCat.id}`]));
    onToast('Added category');
  };

  const handleDeleteCat = (index: number) => {
    const gone = store.cats[index];
    onUpdateStore((prev) => {
      const nextCats = [...prev.cats];
      nextCats.splice(index, 1);
      // Reassign dishes that were in this category to first category
      const fallbackCatId = nextCats[0]?.id || '';
      const nextMenu = prev.menu.map((m) =>
        m.category === gone.id ? { ...m, category: fallbackCatId } : m
      );
      return { ...prev, cats: nextCats, menu: nextMenu };
    });
    onToast(`Removed category “${gone.label}”`, true);
  };

  const handleMoveCat = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= store.cats.length) return;
    onUpdateStore((prev) => {
      const nextCats = [...prev.cats];
      const temp = nextCats[index];
      nextCats[index] = nextCats[target];
      nextCats[target] = temp;
      return { ...prev, cats: nextCats };
    });
  };

  // Dish handlers
  const handleUpdateDish = (index: number, updates: Partial<MenuItemData>) => {
    onUpdateStore((prev) => {
      const nextMenu = [...prev.menu];
      nextMenu[index] = { ...nextMenu[index], ...updates };
      return { ...prev, menu: nextMenu };
    });
  };

  const handleAddDish = () => {
    const defaultCat = selectedCat !== 'all' ? selectedCat : store.cats[0]?.id || 'cakes';
    const newDish: MenuItemData = {
      id: 'm' + Date.now(),
      name: 'New dish',
      category: defaultCat,
      description: '',
      price: 5000,
      image: '',
      popular: false,
      serves: '1 person',
      prepTime: '15 mins',
    };
    onUpdateStore((prev) => ({
      ...prev,
      menu: [...prev.menu, newDish],
    }));
    setOpenItemKeys(new Set([`dish-${newDish.id}`]));
    onToast('Added dish, fill in details');
  };

  const handleDeleteDish = (index: number) => {
    const gone = store.menu[index];
    onUpdateStore((prev) => {
      const nextMenu = [...prev.menu];
      nextMenu.splice(index, 1);
      return { ...prev, menu: nextMenu };
    });
    onToast(`Removed “${gone.name}”`, true);
  };

  const handleDuplicateDish = (index: number) => {
    const orig = store.menu[index];
    const copy: MenuItemData = {
      ...JSON.parse(JSON.stringify(orig)),
      id: 'm' + Date.now(),
      name: `${orig.name} (Copy)`,
    };
    onUpdateStore((prev) => {
      const nextMenu = [...prev.menu];
      nextMenu.splice(index + 1, 0, copy);
      return { ...prev, menu: nextMenu };
    });
    setOpenItemKeys(new Set([`dish-${copy.id}`]));
    onToast('Duplicated dish');
  };

  const handleMoveDish = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= store.menu.length) return;
    onUpdateStore((prev) => {
      const nextMenu = [...prev.menu];
      const temp = nextMenu[index];
      nextMenu[index] = nextMenu[target];
      nextMenu[target] = temp;
      return { ...prev, menu: nextMenu };
    });
  };

  const categoryOptions: Array<[string, string]> = store.cats.map((c) => [
    c.id,
    `${c.icon} ${c.label}`,
  ]);

  const catMap = Object.fromEntries(store.cats.map((c) => [c.id, c.label]));

  const q = searchQuery.toLowerCase().trim();
  const filteredDishes = store.menu.filter((m) => {
    const matchesCat = selectedCat === 'all' || m.category === selectedCat;
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* CATEGORIES */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Menu</div>
            <h2>Categories</h2>
            <p>
              These become the tabs on the Menu page. “All Items” is always added
              automatically.
            </p>
          </div>
        </div>

        {store.cats.map((c, idx) => (
          <ItemCard
            key={c.id}
            title={c.label}
            emoji={c.icon}
            subtitle={`${store.menu.filter((m) => m.category === c.id).length} items`}
            isOpen={openItemKeys.has(`cat-${c.id}`)}
            onToggle={() => toggleKey(`cat-${c.id}`)}
            canMoveUp={idx > 0}
            canMoveDown={idx < store.cats.length - 1}
            onMoveUp={() => handleMoveCat(idx, 'up')}
            onMoveDown={() => handleMoveCat(idx, 'down')}
            onDelete={() => handleDeleteCat(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Icon (emoji)"
                value={c.icon}
                onChange={(val) => handleUpdateCat(idx, { icon: val })}
              />
              <TextField
                label="Tab name"
                value={c.label}
                onChange={(val) => handleUpdateCat(idx, { label: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddCat}
        >
          ＋ Add category
        </button>
      </section>

      {/* FOOD BOXES */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Food boxes</h2>
            <p>
              {store.menu.length} dishes. The price label updates itself from the
              number.
            </p>
          </div>
        </div>

        <div className="za-chips">
          <button
            type="button"
            className={`za-chip ${selectedCat === 'all' ? 'on' : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            All
          </button>
          {store.cats.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`za-chip ${selectedCat === c.id ? 'on' : ''}`}
              onClick={() => setSelectedCat(c.id)}
            >
              {c.icon} {c.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="🔍 Search dishes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredDishes.map((m) => {
          const actualIndex = store.menu.findIndex((item) => item.id === m.id);
          const isOpen = openItemKeys.has(`dish-${m.id}`);

          return (
            <ItemCard
              key={m.id}
              title={m.name}
              subtitle={`${catMap[m.category] || 'No category'}${
                m.popular ? ' · ★ Favorite' : ''
              }`}
              pill={formatMoney(m.price)}
              pillClass={m.popular ? '' : 'o'}
              image={m.image}
              isOpen={isOpen}
              onToggle={() => toggleKey(`dish-${m.id}`)}
              canMoveUp={actualIndex > 0}
              canMoveDown={actualIndex < store.menu.length - 1}
              onMoveUp={() => handleMoveDish(actualIndex, 'up')}
              onMoveDown={() => handleMoveDish(actualIndex, 'down')}
              onDuplicate={() => handleDuplicateDish(actualIndex)}
              onDelete={() => handleDeleteDish(actualIndex)}
            >
              <div className="za-g2">
                <TextField
                  label="Dish name"
                  value={m.name}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { name: val })
                  }
                />
                <SelectField
                  label="Category"
                  value={m.category}
                  options={categoryOptions}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { category: val })
                  }
                />
                <NumberField
                  label="Price (TZS)"
                  hint={formatMoney(m.price)}
                  value={m.price}
                  step={500}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { price: val })
                  }
                />
                <SwitchField
                  label="Favorite badge"
                  checked={!!m.popular}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { popular: val })
                  }
                />
                <ImageField
                  label="Photo"
                  fullWidth
                  value={m.image}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { image: val })
                  }
                />
                <TextAreaField
                  label="Description"
                  fullWidth
                  value={m.description}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { description: val })
                  }
                />
                <TextField
                  label="Serves"
                  value={m.serves || ''}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { serves: val })
                  }
                />
                <TextField
                  label="Prep time"
                  value={m.prepTime || ''}
                  onChange={(val) =>
                    handleUpdateDish(actualIndex, { prepTime: val })
                  }
                />
              </div>
            </ItemCard>
          );
        })}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddDish}
        >
          ＋ Add a dish{selectedCat !== 'all' ? ` to this category` : ''}
        </button>
      </section>
    </div>
  );
};
