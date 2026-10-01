import React, { useState } from 'react';
import { StoreData, ReviewRecord } from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  SelectField,
  SwitchField,
  StarRatingField,
} from '../components/FormFields';

interface ReviewsTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const reviews = store.reviews;
  const filteredReviews = reviews.filter((r) =>
    filter === 'all' ? true : r.status === filter
  );

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddReview = () => {
    const newRev: ReviewRecord = {
      author: 'Customer name',
      location: 'Mbeya',
      rating: 5,
      comment: '',
      date: 'Just now',
      occasion: '',
      verified: true,
      status: 'approved',
      reply: '',
      featured: false,
    };

    onUpdateStore((prev) => ({
      ...prev,
      reviews: [newRev, ...prev.reviews],
    }));
    setFilter('all');
    setOpenIndices(new Set([0]));
    onToast('Added, fill in the details below');
  };

  const handleUpdate = (index: number, updates: Partial<ReviewRecord>) => {
    onUpdateStore((prev) => {
      const nextReviews = [...prev.reviews];
      nextReviews[index] = { ...nextReviews[index], ...updates };
      return { ...prev, reviews: nextReviews };
    });
  };

  const handleDelete = (index: number) => {
    const gone = reviews[index];
    onUpdateStore((prev) => {
      const nextReviews = [...prev.reviews];
      nextReviews.splice(index, 1);
      return { ...prev, reviews: nextReviews };
    });
    onToast(`Removed review by “${gone.author}”`, true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reviews.length) return;
    onUpdateStore((prev) => {
      const nextReviews = [...prev.reviews];
      const temp = nextReviews[index];
      nextReviews[index] = nextReviews[targetIndex];
      nextReviews[targetIndex] = temp;
      return { ...prev, reviews: nextReviews };
    });
  };

  const handleDuplicate = (index: number) => {
    const copy = JSON.parse(JSON.stringify(reviews[index]));
    onUpdateStore((prev) => {
      const nextReviews = [...prev.reviews];
      nextReviews.splice(index + 1, 0, copy);
      return { ...prev, reviews: nextReviews };
    });
    setOpenIndices(new Set([index + 1]));
    onToast('Duplicated review');
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const hiddenCount = reviews.filter((r) => r.status === 'hidden').length;

  return (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <div className="za-eb">Reviews</div>
          <h2>Customer reviews</h2>
          <p>
            Reviews sent from the website arrive as Pending. Only Approved reviews
            show on the site.
          </p>
        </div>
      </div>

      <div className="za-chips">
        <button
          type="button"
          className={`za-chip ${filter === 'all' ? 'on' : ''}`}
          onClick={() => setFilter('all')}
        >
          All · {reviews.length}
        </button>
        <button
          type="button"
          className={`za-chip ${filter === 'pending' ? 'on' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending · {pendingCount}
        </button>
        <button
          type="button"
          className={`za-chip ${filter === 'approved' ? 'on' : ''}`}
          onClick={() => setFilter('approved')}
        >
          ✓ Approved · {approvedCount}
        </button>
        <button
          type="button"
          className={`za-chip ${filter === 'hidden' ? 'on' : ''}`}
          onClick={() => setFilter('hidden')}
        >
          🙈 Hidden · {hiddenCount}
        </button>
      </div>

      {filteredReviews.map((r) => {
        const actualIndex = reviews.indexOf(r);
        const isOpen = openIndices.has(actualIndex);
        const pillCls =
          r.status === 'pending' ? 'o' : r.status === 'hidden' ? 'x' : '';

        return (
          <ItemCard
            key={actualIndex}
            title={r.author || 'Anonymous Customer'}
            subtitle={`${'★'.repeat(r.rating)} · ${r.comment}`}
            pill={r.status}
            pillClass={pillCls}
            emoji="⭐"
            isOpen={isOpen}
            onToggle={() => toggleIndex(actualIndex)}
            canMoveUp={actualIndex > 0}
            canMoveDown={actualIndex < reviews.length - 1}
            onMoveUp={() => handleMove(actualIndex, 'up')}
            onMoveDown={() => handleMove(actualIndex, 'down')}
            onDuplicate={() => handleDuplicate(actualIndex)}
            onDelete={() => handleDelete(actualIndex)}
            extraActions={
              r.status !== 'approved' ? (
                <button
                  type="button"
                  className="za-btn za-b1"
                  onClick={() => {
                    handleUpdate(actualIndex, { status: 'approved' });
                    onToast('Approved ✓');
                  }}
                >
                  ✓ Approve
                </button>
              ) : (
                <button
                  type="button"
                  className="za-btn za-b3"
                  onClick={() => {
                    handleUpdate(actualIndex, { status: 'hidden' });
                    onToast('Hidden ✓');
                  }}
                >
                  🙈 Hide
                </button>
              )
            }
          >
            <div className="za-g2">
              <TextField
                label="Name"
                value={r.author}
                onChange={(val) => handleUpdate(actualIndex, { author: val })}
              />
              <TextField
                label="Area"
                value={r.location}
                onChange={(val) => handleUpdate(actualIndex, { location: val })}
              />
              <StarRatingField
                label="Stars"
                rating={r.rating}
                onChange={(val) => handleUpdate(actualIndex, { rating: val })}
              />
              <TextField
                label="Occasion"
                value={r.occasion || ''}
                onChange={(val) => handleUpdate(actualIndex, { occasion: val })}
              />
              <TextField
                label="When"
                value={r.date}
                onChange={(val) => handleUpdate(actualIndex, { date: val })}
              />
              <SelectField
                label="Status"
                value={r.status}
                options={[
                  ['pending', '⏳ Pending'],
                  ['approved', '✓ Approved'],
                  ['hidden', '🙈 Hidden'],
                ]}
                onChange={(val) =>
                  handleUpdate(actualIndex, {
                    status: val as ReviewRecord['status'],
                  })
                }
              />
              <SwitchField
                label="Verified customer"
                checked={r.verified}
                onChange={(val) => handleUpdate(actualIndex, { verified: val })}
              />
              <SwitchField
                label="Show on Home page"
                checked={!!r.featured}
                onChange={(val) => handleUpdate(actualIndex, { featured: val })}
              />
              <TextAreaField
                label="Review"
                value={r.comment}
                fullWidth
                onChange={(val) => handleUpdate(actualIndex, { comment: val })}
              />
              <TextAreaField
                label="Public reply from Zion"
                value={r.reply || ''}
                fullWidth
                onChange={(val) => handleUpdate(actualIndex, { reply: val })}
              />
            </div>
          </ItemCard>
        );
      })}

      <button
        type="button"
        className="za-add"
        style={{ marginTop: '14px' }}
        onClick={handleAddReview}
      >
        ＋ Add a review
      </button>
    </section>
  );
};
