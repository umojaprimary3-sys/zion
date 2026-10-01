import React, { useState } from 'react';
import { StoreData, BannerData, PageContentData } from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  TagsField,
  ImageField,
} from '../components/FormFields';

interface PagesTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
  onNavigateTab: (tab: string) => void;
}

const PAGE_SECTIONS: Array<[string, string]> = [
  ['hf', '🧭 Header & Footer'],
  ['home', '🏠 Home'],
  ['menu', '🍽️ Menu'],
  ['cake', '🎂 Cakes'],
  ['about', '📍 About'],
  ['contact', '📞 Contact'],
  ['reviews', '⭐ Reviews'],
  ['order', '🛒 Order pop-up'],
];

export const PagesTab: React.FC<PagesTabProps> = ({
  store,
  onUpdateStore,
  onToast,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<string>('hf');
  const [openItemKeys, setOpenItemKeys] = useState<Set<string>>(new Set());

  const toggleKey = (key: string) => {
    setOpenItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateBanner = (pageKey: keyof StoreData['banners'], updates: Partial<BannerData>) => {
    onUpdateStore((prev) => ({
      ...prev,
      banners: {
        ...prev.banners,
        [pageKey]: { ...prev.banners[pageKey], ...updates },
      },
    }));
  };

  const updatePg = (updates: Partial<PageContentData>) => {
    onUpdateStore((prev) => ({
      ...prev,
      pg: { ...prev.pg, ...updates },
    }));
  };

  const renderBannerEditor = (
    key: keyof StoreData['banners'],
    name: string
  ) => {
    const banner = store.banners[key];
    return (
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>{name} banner</h2>
            <p>Small heading, title and text at the top of the page.</p>
          </div>
        </div>

        <div className="za-bp">
          <div className="za-eb">{banner.eyebrow}</div>
          <h3>{banner.title}</h3>
          <p>{banner.text}</p>
        </div>

        <div className="za-g2">
          <TextField
            label="Small heading"
            value={banner.eyebrow}
            onChange={(val) => updateBanner(key, { eyebrow: val })}
          />
          <TextField
            label="Title"
            value={banner.title}
            onChange={(val) => updateBanner(key, { title: val })}
          />
          <TextAreaField
            label="Text"
            fullWidth
            value={banner.text}
            onChange={(val) => updateBanner(key, { text: val })}
          />
        </div>
      </section>
    );
  };

  const renderRestOfPageButton = (tab: string, label: string) => (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <h2>Rest of this page</h2>
        </div>
      </div>
      <div className="za-acts" style={{ margin: 0 }}>
        <button
          type="button"
          className="za-btn za-b2"
          onClick={() => onNavigateTab(tab)}
        >
          {label} →
        </button>
        <button
          type="button"
          className="za-btn za-b3"
          onClick={() => onNavigateTab('media')}
        >
          🎞️ Edit images
        </button>
      </div>
    </section>
  );

  return (
    <div>
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Website</div>
            <h2>Pages</h2>
            <p>Pick a page to edit its headings, text and details.</p>
          </div>
        </div>

        <div className="za-chips">
          {PAGE_SECTIONS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`za-chip ${activeSection === key ? 'on' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* HEADER & FOOTER */}
      {activeSection === 'hf' && (
        <>
          <section className="za-sec">
            <div className="za-sh">
              <div>
                <h2>Navigation menu</h2>
                <p>Names and descriptions in the header and mobile menu.</p>
              </div>
            </div>

            {store.pg.nav.map((navItem, i) => (
              <ItemCard
                key={i}
                title={navItem.label}
                subtitle={navItem.desc}
                isOpen={openItemKeys.has(`nav-${i}`)}
                onToggle={() => toggleKey(`nav-${i}`)}
                fixed
              >
                <div className="za-g2">
                  <TextField
                    label="Menu name"
                    value={navItem.label}
                    onChange={(val) => {
                      const nextNav = [...store.pg.nav];
                      nextNav[i] = { ...nextNav[i], label: val };
                      updatePg({ nav: nextNav });
                    }}
                  />
                  <TextField
                    label="Short description"
                    value={navItem.desc}
                    onChange={(val) => {
                      const nextNav = [...store.pg.nav];
                      nextNav[i] = { ...nextNav[i], desc: val };
                      updatePg({ nav: nextNav });
                    }}
                  />
                </div>
              </ItemCard>
            ))}
          </section>

          <section className="za-sec">
            <div className="za-sh">
              <div>
                <h2>Header button &amp; footer</h2>
              </div>
            </div>
            <div className="za-g2">
              <TextField
                label="Order button text"
                value={store.pg.orderBtn}
                onChange={(val) => updatePg({ orderBtn: val })}
              />
              <TextField
                label="Business name"
                value={store.biz.name}
                onChange={(val) =>
                  onUpdateStore((prev) => ({
                    ...prev,
                    biz: { ...prev.biz, name: val },
                  }))
                }
              />
              <TextField
                label="Footer tagline"
                fullWidth
                value={store.pg.footer.tag}
                onChange={(val) =>
                  updatePg({
                    footer: { ...store.pg.footer, tag: val },
                  })
                }
              />
              <TextField
                label="Footer line"
                fullWidth
                value={store.pg.footer.line}
                onChange={(val) =>
                  updatePg({
                    footer: { ...store.pg.footer, line: val },
                  })
                }
              />
            </div>
          </section>
        </>
      )}

      {/* HOME */}
      {activeSection === 'home' && renderRestOfPageButton('home', 'Edit Home & Hero')}

      {/* MENU */}
      {activeSection === 'menu' && (
        <>
          {renderBannerEditor('menu', 'Menu')}
          {renderRestOfPageButton('menu', 'Edit menu items')}
        </>
      )}

      {/* CAKE */}
      {activeSection === 'cake' && (
        <>
          {renderBannerEditor('cake', 'Cakes')}
          {renderRestOfPageButton('cake', 'Edit Cake Studio')}
        </>
      )}

      {/* ABOUT */}
      {activeSection === 'about' && (
        <>
          {renderBannerEditor('about', 'About')}
          <section className="za-sec">
            <div className="za-sh">
              <div>
                <h2>Our story</h2>
                <p>Text and numbers beside the About photo.</p>
              </div>
            </div>

            <div className="za-g2">
              <TextField
                label="Small heading"
                value={store.pg.about.eyebrow}
                onChange={(val) =>
                  updatePg({
                    about: { ...store.pg.about, eyebrow: val },
                  })
                }
              />
              <TextAreaField
                label="Headline"
                value={store.pg.about.title}
                onChange={(val) =>
                  updatePg({
                    about: { ...store.pg.about, title: val },
                  })
                }
              />
              <TextAreaField
                label="First paragraph"
                fullWidth
                value={store.pg.about.lead}
                onChange={(val) =>
                  updatePg({
                    about: { ...store.pg.about, lead: val },
                  })
                }
              />
              <TextAreaField
                label="Second paragraph"
                fullWidth
                value={store.pg.about.body}
                onChange={(val) =>
                  updatePg({
                    about: { ...store.pg.about, body: val },
                  })
                }
              />
              <ImageField
                label="About photo"
                fullWidth
                value={store.home.aboutPhoto}
                onChange={(val) =>
                  onUpdateStore((prev) => ({
                    ...prev,
                    home: { ...prev.home, aboutPhoto: val },
                  }))
                }
              />
            </div>

            <div style={{ height: '14px' }}></div>

            {store.pg.about.metrics.map((metric, i) => (
              <ItemCard
                key={i}
                title={metric.n}
                subtitle={metric.l}
                isOpen={openItemKeys.has(`metric-${i}`)}
                onToggle={() => toggleKey(`metric-${i}`)}
                fixed
              >
                <div className="za-g2">
                  <TextField
                    label="Number"
                    value={metric.n}
                    onChange={(val) => {
                      const nextMetrics = [...store.pg.about.metrics];
                      nextMetrics[i] = { ...nextMetrics[i], n: val };
                      updatePg({
                        about: { ...store.pg.about, metrics: nextMetrics },
                      });
                    }}
                  />
                  <TextField
                    label="Label"
                    value={metric.l}
                    onChange={(val) => {
                      const nextMetrics = [...store.pg.about.metrics];
                      nextMetrics[i] = { ...nextMetrics[i], l: val };
                      updatePg({
                        about: { ...store.pg.about, metrics: nextMetrics },
                      });
                    }}
                  />
                </div>
              </ItemCard>
            ))}
          </section>
        </>
      )}

      {/* CONTACT */}
      {activeSection === 'contact' && (
        <>
          {renderBannerEditor('contact', 'Contact')}
          <section className="za-sec">
            <div className="za-sh">
              <div>
                <h2>Contact cards</h2>
                <p>The three cards: WhatsApp, phone, Instagram.</p>
              </div>
            </div>

            {store.pg.contact.cards.map((c, i) => (
              <ItemCard
                key={i}
                title={c.title}
                subtitle={c.text}
                emoji={c.icon}
                isOpen={openItemKeys.has(`contact-card-${i}`)}
                onToggle={() => toggleKey(`contact-card-${i}`)}
                fixed
              >
                <div className="za-g2">
                  <TextField
                    label="Icon (emoji)"
                    value={c.icon}
                    onChange={(val) => {
                      const nextCards = [...store.pg.contact.cards];
                      nextCards[i] = { ...nextCards[i], icon: val };
                      updatePg({
                        contact: { ...store.pg.contact, cards: nextCards },
                      });
                    }}
                  />
                  <TextField
                    label="Title"
                    value={c.title}
                    onChange={(val) => {
                      const nextCards = [...store.pg.contact.cards];
                      nextCards[i] = { ...nextCards[i], title: val };
                      updatePg({
                        contact: { ...store.pg.contact, cards: nextCards },
                      });
                    }}
                  />
                  <TextAreaField
                    label="Text"
                    fullWidth
                    value={c.text}
                    onChange={(val) => {
                      const nextCards = [...store.pg.contact.cards];
                      nextCards[i] = { ...nextCards[i], text: val };
                      updatePg({
                        contact: { ...store.pg.contact, cards: nextCards },
                      });
                    }}
                  />
                </div>
              </ItemCard>
            ))}
          </section>

          <section className="za-sec">
            <div className="za-sh">
              <div>
                <h2>Delivery &amp; inquiry form</h2>
              </div>
            </div>
            <div className="za-g2">
              <TextField
                label="Delivery section title"
                value={store.pg.contact.zonesTitle}
                onChange={(val) =>
                  updatePg({
                    contact: { ...store.pg.contact, zonesTitle: val },
                  })
                }
              />
              <TextField
                label="Form title"
                value={store.pg.contact.formTitle}
                onChange={(val) =>
                  updatePg({
                    contact: { ...store.pg.contact, formTitle: val },
                  })
                }
              />
              <TextAreaField
                label="Delivery text"
                value={store.pg.contact.zonesText}
                onChange={(val) =>
                  updatePg({
                    contact: { ...store.pg.contact, zonesText: val },
                  })
                }
              />
              <TextAreaField
                label="Form text"
                value={store.pg.contact.formText}
                onChange={(val) =>
                  updatePg({
                    contact: { ...store.pg.contact, formText: val },
                  })
                }
              />
              <TagsField
                label="Inquiry types in the dropdown"
                fullWidth
                tags={store.pg.contact.types}
                onChange={(tags) =>
                  updatePg({
                    contact: { ...store.pg.contact, types: tags },
                  })
                }
              />
            </div>
          </section>
        </>
      )}

      {/* REVIEWS */}
      {activeSection === 'reviews' && (
        <>
          {renderBannerEditor('reviews', 'Reviews')}
          <section className="za-sec">
            <div className="za-sh">
              <div>
                <h2>Review form</h2>
                <p>Shown to customers who want to leave a review.</p>
              </div>
            </div>
            <div className="za-g2">
              <TextField
                label="Form title"
                value={store.pg.rform.title}
                onChange={(val) =>
                  updatePg({
                    rform: { ...store.pg.rform, title: val },
                  })
                }
              />
              <TextField
                label="Button text"
                value={store.pg.rform.btn}
                onChange={(val) =>
                  updatePg({
                    rform: { ...store.pg.rform, btn: val },
                  })
                }
              />
              <TextAreaField
                label="Form text"
                fullWidth
                value={store.pg.rform.text}
                onChange={(val) =>
                  updatePg({
                    rform: { ...store.pg.rform, text: val },
                  })
                }
              />
            </div>
          </section>
          {renderRestOfPageButton('revs', 'Moderate reviews')}
        </>
      )}

      {/* ORDER MODAL */}
      {activeSection === 'order' && (
        <section className="za-sec">
          <div className="za-sh">
            <div>
              <h2>Order pop-up</h2>
              <p>The window that opens from “Order Now”.</p>
            </div>
          </div>
          <div className="za-g2">
            <TextField
              label="Title"
              value={store.pg.order.title}
              onChange={(val) =>
                updatePg({
                  order: { ...store.pg.order, title: val },
                })
              }
            />
            <TextField
              label="Send button text"
              value={store.pg.order.btn}
              onChange={(val) =>
                updatePg({
                  order: { ...store.pg.order, btn: val },
                })
              }
            />
            <TextAreaField
              label="Text"
              fullWidth
              value={store.pg.order.text}
              onChange={(val) =>
                updatePg({
                  order: { ...store.pg.order, text: val },
                })
              }
            />
          </div>
        </section>
      )}
    </div>
  );
};
