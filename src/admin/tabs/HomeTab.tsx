import React, { useState } from 'react';
import { StoreData, HomeData, ServeCardData, SimpleCardData, StatItemData } from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  ImageField,
} from '../components/FormFields';

interface HomeTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
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

  const updateHome = (updates: Partial<HomeData>) => {
    onUpdateStore((prev) => ({
      ...prev,
      home: { ...prev.home, ...updates },
    }));
  };

  const home = store.home;

  // Serves cards helpers
  const handleUpdateServeCard = (index: number, updates: Partial<ServeCardData>) => {
    onUpdateStore((prev) => {
      const nextCards = [...prev.home.serves.cards];
      nextCards[index] = { ...nextCards[index], ...updates };
      return {
        ...prev,
        home: {
          ...prev.home,
          serves: { ...prev.home.serves, cards: nextCards },
        },
      };
    });
  };

  const handleAddServeCard = () => {
    const newCard: ServeCardData = {
      icon: '🍰',
      image: '',
      title: 'New card',
      text: '',
    };
    onUpdateStore((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        serves: {
          ...prev.home.serves,
          cards: [...prev.home.serves.cards, newCard],
        },
      },
    }));
    setOpenCardKeys(new Set([`serves-${home.serves.cards.length}`]));
    onToast('Added card');
  };

  const handleDeleteServeCard = (index: number) => {
    onUpdateStore((prev) => {
      const nextCards = [...prev.home.serves.cards];
      nextCards.splice(index, 1);
      return {
        ...prev,
        home: {
          ...prev.home,
          serves: { ...prev.home.serves, cards: nextCards },
        },
      };
    });
    onToast('Removed card', true);
  };

  const handleMoveServeCard = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= home.serves.cards.length) return;
    onUpdateStore((prev) => {
      const nextCards = [...prev.home.serves.cards];
      const temp = nextCards[index];
      nextCards[index] = nextCards[target];
      nextCards[target] = temp;
      return {
        ...prev,
        home: {
          ...prev.home,
          serves: { ...prev.home.serves, cards: nextCards },
        },
      };
    });
  };

  // Moment cards helpers
  const handleUpdateMomentCard = (index: number, updates: Partial<SimpleCardData>) => {
    onUpdateStore((prev) => {
      const nextCards = [...prev.home.moment.cards];
      nextCards[index] = { ...nextCards[index], ...updates };
      return {
        ...prev,
        home: {
          ...prev.home,
          moment: { ...prev.home.moment, cards: nextCards },
        },
      };
    });
  };

  // Reasons cards helpers
  const handleUpdateReasonCard = (index: number, updates: Partial<SimpleCardData>) => {
    onUpdateStore((prev) => {
      const nextCards = [...prev.home.reasons.cards];
      nextCards[index] = { ...nextCards[index], ...updates };
      return {
        ...prev,
        home: {
          ...prev.home,
          reasons: { ...prev.home.reasons, cards: nextCards },
        },
      };
    });
  };

  // Stats bar helpers
  const handleUpdateStat = (index: number, updates: Partial<StatItemData>) => {
    onUpdateStore((prev) => {
      const nextStats = [...prev.home.stats];
      nextStats[index] = { ...nextStats[index], ...updates };
      return {
        ...prev,
        home: {
          ...prev.home,
          stats: nextStats,
        },
      };
    });
  };

  return (
    <div>
      {/* HERO */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Home</div>
            <h2>Hero</h2>
            <p>The big dark card at the top of Home.</p>
          </div>
        </div>
        <div className="za-g2">
          <TextAreaField
            label="Headline"
            hint="new line = line break"
            value={home.hero.title}
            onChange={(val) =>
              updateHome({ hero: { ...home.hero, title: val } })
            }
          />
          <TextAreaField
            label="Supporting text"
            value={home.hero.text}
            onChange={(val) =>
              updateHome({ hero: { ...home.hero, text: val } })
            }
          />
          <ImageField
            label="Hero photo"
            fullWidth
            value={home.hero.image}
            onChange={(val) =>
              updateHome({ hero: { ...home.hero, image: val } })
            }
          />
        </div>
      </section>

      {/* RATING CARD */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Rating card</h2>
            <p>“Loved By Mbeya” card over the hero.</p>
          </div>
        </div>
        <div className="za-g2">
          <TextField
            label="Title"
            value={home.rating.title}
            onChange={(val) =>
              updateHome({ rating: { ...home.rating, title: val } })
            }
          />
          <TextField
            label="Text"
            value={home.rating.text}
            onChange={(val) =>
              updateHome({ rating: { ...home.rating, text: val } })
            }
          />
          <TextField
            label="Score"
            value={home.rating.score}
            onChange={(val) =>
              updateHome({ rating: { ...home.rating, score: val } })
            }
          />
          <TextField
            label="Label"
            value={home.rating.label}
            onChange={(val) =>
              updateHome({ rating: { ...home.rating, label: val } })
            }
          />
        </div>
      </section>

      {/* SIGNATURE CAKE CARD */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Signature cake card</h2>
            <p>The card linking to the cake studio.</p>
          </div>
        </div>
        <div className="za-g2">
          <TextField
            label="Title"
            value={home.sig.title}
            onChange={(val) =>
              updateHome({ sig: { ...home.sig, title: val } })
            }
          />
          <TextField
            label="Location line"
            value={home.sig.location}
            onChange={(val) =>
              updateHome({ sig: { ...home.sig, location: val } })
            }
          />
          <TextAreaField
            label="Description"
            fullWidth
            value={home.sig.text}
            onChange={(val) =>
              updateHome({ sig: { ...home.sig, text: val } })
            }
          />
          <TextField
            label="Fact 1"
            value={home.sig.m0}
            onChange={(val) => updateHome({ sig: { ...home.sig, m0: val } })}
          />
          <TextField
            label="Fact 2"
            value={home.sig.m1}
            onChange={(val) => updateHome({ sig: { ...home.sig, m1: val } })}
          />
          <TextField
            label="Fact 3"
            value={home.sig.m2}
            onChange={(val) => updateHome({ sig: { ...home.sig, m2: val } })}
          />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Stats bar</h2>
            <p>The row of numbers under the serve cards.</p>
          </div>
        </div>
        {home.stats.map((stat, i) => (
          <ItemCard
            key={i}
            title={stat.t}
            subtitle={stat.s}
            isOpen={openCardKeys.has(`stat-${i}`)}
            onToggle={() => toggleKey(`stat-${i}`)}
            fixed
          >
            <div className="za-g2">
              <TextField
                label="Big text"
                value={stat.t}
                onChange={(val) => handleUpdateStat(i, { t: val })}
              />
              <TextField
                label="Small text"
                value={stat.s}
                onChange={(val) => handleUpdateStat(i, { s: val })}
              />
            </div>
          </ItemCard>
        ))}
      </section>

      {/* EVERYTHING ZION SERVES */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Everything Zion Serves</h2>
            <p>Section titles + the 6 cards (icon, image, text).</p>
          </div>
        </div>
        <div className="za-g2" style={{ marginBottom: '14px' }}>
          <TextField
            label="Section title"
            value={home.serves.title}
            onChange={(val) =>
              updateHome({ serves: { ...home.serves, title: val } })
            }
          />
          <TextField
            label="Section text"
            value={home.serves.sub}
            onChange={(val) =>
              updateHome({ serves: { ...home.serves, sub: val } })
            }
          />
        </div>

        {home.serves.cards.map((card, i) => (
          <ItemCard
            key={i}
            title={card.title}
            subtitle={card.text}
            emoji={card.icon}
            image={card.image}
            isOpen={openCardKeys.has(`serves-${i}`)}
            onToggle={() => toggleKey(`serves-${i}`)}
            canMoveUp={i > 0}
            canMoveDown={i < home.serves.cards.length - 1}
            onMoveUp={() => handleMoveServeCard(i, 'up')}
            onMoveDown={() => handleMoveServeCard(i, 'down')}
            onDelete={() => handleDeleteServeCard(i)}
          >
            <div className="za-g2">
              <TextField
                label="Icon (emoji)"
                value={card.icon}
                onChange={(val) => handleUpdateServeCard(i, { icon: val })}
              />
              <ImageField
                label="Photo"
                value={card.image}
                onChange={(val) => handleUpdateServeCard(i, { image: val })}
              />
              <TextField
                label="Title"
                value={card.title}
                onChange={(val) => handleUpdateServeCard(i, { title: val })}
              />
              <TextAreaField
                label="Text"
                fullWidth
                value={card.text}
                onChange={(val) => handleUpdateServeCard(i, { text: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddServeCard}
        >
          ＋ Add card
        </button>
      </section>

      {/* WHAT MBEYA IS SAYING */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>What Mbeya Is Saying</h2>
            <p>Story photos and titles.</p>
          </div>
        </div>
        <div className="za-g2">
          <TextField
            label="Section title"
            value={home.test.title}
            onChange={(val) =>
              updateHome({ test: { ...home.test, title: val } })
            }
          />
          <TextField
            label="Section text"
            value={home.test.sub}
            onChange={(val) =>
              updateHome({ test: { ...home.test, sub: val } })
            }
          />
          <ImageField
            label="Story photo 1"
            value={home.test.p0i}
            onChange={(val) =>
              updateHome({ test: { ...home.test, p0i: val } })
            }
          />
          <TextField
            label="Photo 1 label"
            value={home.test.p0l}
            onChange={(val) =>
              updateHome({ test: { ...home.test, p0l: val } })
            }
          />
          <ImageField
            label="Story photo 2"
            value={home.test.p1i}
            onChange={(val) =>
              updateHome({ test: { ...home.test, p1i: val } })
            }
          />
          <TextField
            label="Photo 2 label"
            value={home.test.p1l}
            onChange={(val) =>
              updateHome({ test: { ...home.test, p1l: val } })
            }
          />
        </div>
      </section>

      {/* MOMENT */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>More Than A Meal, It's A Moment</h2>
            <p>Wide photo and 3 “Moment” cards.</p>
          </div>
        </div>
        <div className="za-g2" style={{ marginBottom: '14px' }}>
          <TextField
            label="Section title"
            value={home.moment.title}
            onChange={(val) =>
              updateHome({ moment: { ...home.moment, title: val } })
            }
          />
          <TextField
            label="Section text"
            value={home.moment.sub}
            onChange={(val) =>
              updateHome({ moment: { ...home.moment, sub: val } })
            }
          />
          <ImageField
            label="Wide photo"
            fullWidth
            value={home.moment.image}
            onChange={(val) =>
              updateHome({ moment: { ...home.moment, image: val } })
            }
          />
        </div>

        {home.moment.cards.map((card, i) => (
          <ItemCard
            key={i}
            title={card.title}
            subtitle={card.text}
            isOpen={openCardKeys.has(`moment-${i}`)}
            onToggle={() => toggleKey(`moment-${i}`)}
            fixed
          >
            <div className="za-g2">
              <TextField
                label="Title"
                value={card.title}
                onChange={(val) => handleUpdateMomentCard(i, { title: val })}
              />
              <TextAreaField
                label="Text"
                fullWidth
                value={card.text}
                onChange={(val) => handleUpdateMomentCard(i, { text: val })}
              />
            </div>
          </ItemCard>
        ))}
      </section>

      {/* REASONS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Little Reasons To Stop By</h2>
          </div>
        </div>
        <TextField
          label="Section title"
          value={home.reasons.title}
          onChange={(val) =>
            updateHome({ reasons: { ...home.reasons, title: val } })
          }
        />
        <div style={{ height: '14px' }}></div>
        {home.reasons.cards.map((card, i) => (
          <ItemCard
            key={i}
            title={card.title}
            subtitle={card.text}
            isOpen={openCardKeys.has(`reason-${i}`)}
            onToggle={() => toggleKey(`reason-${i}`)}
            fixed
          >
            <div className="za-g2">
              <TextField
                label="Title"
                value={card.title}
                onChange={(val) => handleUpdateReasonCard(i, { title: val })}
              />
              <TextAreaField
                label="Text"
                fullWidth
                value={card.text}
                onChange={(val) => handleUpdateReasonCard(i, { text: val })}
              />
            </div>
          </ItemCard>
        ))}
      </section>

      {/* ABOUT PHOTO */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">About</div>
            <h2>About page photo</h2>
            <p>Photo beside the story on About.</p>
          </div>
        </div>
        <ImageField
          label="About photo"
          fullWidth
          value={home.aboutPhoto}
          onChange={(val) => updateHome({ aboutPhoto: val })}
        />
      </section>
    </div>
  );
};
