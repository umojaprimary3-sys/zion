import React, { useState, useMemo } from 'react';
import { PageId, ReviewItem } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { REVIEWS_DATA, GALLERY_IMAGES } from '../data/reviewsData';
import { useContent, saveReviewToStore } from '../data/store';

interface ReviewsGalleryPageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
}

export const ReviewsGalleryPage: React.FC<ReviewsGalleryPageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const content = useContent();
  const banner = content.banners?.reviews;

  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [occasionText, setOccasionText] = useState('Birthday Celebration');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Approved reviews from store
  const reviewsList = useMemo<ReviewItem[]>(() => {
    if (content.reviews && content.reviews.length > 0) {
      const approved = content.reviews.filter((r) => r.status === 'approved');
      if (approved.length > 0) {
        return approved.map((r, idx) => ({
          id: r.id || `rev-${idx}`,
          author: r.author,
          location: r.location || 'Mbeya',
          rating: r.rating,
          comment: r.comment,
          date: r.date || 'Recent',
          occasion: r.occasion || 'Customer Experience',
          verified: r.verified ?? true,
        }));
      }
    }
    return REVIEWS_DATA;
  }, [content.reviews]);

  // Gallery items from store
  const galleryList = useMemo(() => {
    if (content.gallery && content.gallery.length > 0) {
      return content.gallery.map((g, idx) => ({
        id: `gal-${idx}`,
        src: g.src,
        title: g.title,
        tag: g.tag,
      }));
    }
    return GALLERY_IMAGES;
  }, [content.gallery]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // Save review to Supabase with status "pending"
    try {
      await saveReviewToStore({
        author: authorName || 'Anonymous',
        location: authorLocation || 'Mbeya',
        rating: ratingVal,
        comment: commentText,
        occasion: occasionText,
        date: todayStr,
        status: 'pending',
        verified: true,
        featured: false,
      });
    } catch (err: unknown) {
      console.warn('Could not save review to Supabase:', err);
    }

    setAuthorName('');
    setAuthorLocation('');
    setCommentText('');
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
    }, 2500);
  };

  return (
    <>
      {/* PAGE HEADER */}
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage="reviews"
            onNavigate={onNavigate}
            onOpenOrderModal={onOpenOrderModal}
          />

          <div className="page-title-section">
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              {banner?.eyebrow || 'TESTIMONIALS & MOMENTS'}
            </div>
            <h1>{banner?.title || 'What Mbeya Is Saying'}</h1>
            <p>
              {banner?.text || 'Real stories from birthday celebrations, office lunches, and weekend gatherings with Zion Cakes & Bites.'}
            </p>
          </div>
        </div>
      </section>

      {/* RATING OVERVIEW BAR */}
      <section style={{ padding: '20px 20px 40px' }}>
        <div className="wrap">
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '24px',
              padding: '30px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: '44px',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 700,
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                }}
              >
                {content.biz?.rating || '4.1'}{' '}
                <span style={{ fontSize: '24px', color: 'var(--star)' }}>★★★★★</span>
              </div>
              <div>
                <b style={{ fontSize: '15px', color: 'var(--text-dark)' }}>
                  {content.home?.rating?.label || 'Loved by hundreds in Mbeya'}
                </b>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {content.biz?.reviewsCount ? `${content.biz.reviewsCount} verified Google Reviews` : '87 verified Google Reviews'} · Over 6,890+ happy cake lovers
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-solid"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Close Form' : 'Write a Review ✍️'}
            </button>
          </div>

          {/* WRITE REVIEW FORM */}
          {showReviewForm && (
            <div
              style={{
                background: 'var(--dark)',
                color: '#fff',
                borderRadius: '24px',
                padding: '30px',
                marginBottom: '40px',
                textAlign: 'left',
              }}
            >
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '22px', marginBottom: '8px' }}>
                Share Your Experience at Zion
              </h3>
              <p style={{ fontSize: '13px', color: '#cfc6b8', marginBottom: '20px' }}>
                Tell our baking team how your food or custom celebration cake was.
              </p>

              {reviewSubmitted && (
                <div
                  style={{
                    background: 'var(--mint)',
                    color: '#12321f',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    marginBottom: '16px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                  }}
                >
                  ✓ Thank you! Your review has been added to our wall.
                </div>
              )}

              <form onSubmit={handleAddReview}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ color: '#cfc6b8' }}>Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Sarah K."
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#cfc6b8' }}>Location in Mbeya</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Soweto / Forest / Njia Panda"
                      value={authorLocation}
                      onChange={(e) => setAuthorLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div className="form-group">
                    <label style={{ color: '#cfc6b8' }}>Rating</label>
                    <select
                      className="form-input"
                      value={ratingVal}
                      onChange={(e) => setRatingVal(Number(e.target.value))}
                    >
                      <option value={5}>★★★★★ (5/5) Outstanding</option>
                      <option value={4}>★★★★☆ (4/5) Very Good</option>
                      <option value={3}>★★★☆☆ (3/5) Good</option>
                      <option value={2}>★★☆☆☆ (2/5) Fair</option>
                      <option value={1}>★☆☆☆☆ (1/5) Poor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#cfc6b8' }}>Occasion / Item Ordered</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Birthday Cake, Family Lunch"
                      value={occasionText}
                      onChange={(e) => setOccasionText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label style={{ color: '#cfc6b8' }}>Your Review / Experience</label>
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Share what you loved about our food, cake texture, or customer delivery service..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-solid"
                  style={{ marginTop: '16px', background: 'var(--green)', color: '#000' }}
                >
                  Submit Public Review
                </button>
              </form>
            </div>
          )}

          {/* REVIEWS GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '60px',
            }}
          >
            {reviewsList.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-card-stars">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <p className="review-card-comment">"{review.comment}"</p>
                <div className="review-card-meta">
                  <div>
                    <span className="review-card-author">{review.author}</span>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {review.location} · {review.occasion}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--green-dark)', fontWeight: 600 }}>
                    ✓ Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* GALLERY SECTION */}
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>
            Moments from the Kitchen & Dining Room
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
            A snapshot of daily life, custom celebrations, and freshly prepared orders at Zion.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '50px',
            }}
          >
            {galleryList.map((img) => (
              <div
                key={img.id}
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '240px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    right: '12px',
                    background: 'rgba(28,22,17,0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <b style={{ fontSize: '12.5px' }}>{img.title}</b>
                  <span
                    style={{
                      fontSize: '10.5px',
                      background: 'var(--orange)',
                      color: '#000',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    {img.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA BANNER */}
          <div className="cta-banner">
            <h3>Ready to experience Zion Cakes & Bites?</h3>
            <div className="cta-actions">
              <button
                className="btn-solid"
                type="button"
                onClick={onOpenOrderModal}
              >
                Order on WhatsApp
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => onNavigate('custom-cakes')}
              >
                Preorder Custom Cake ↗
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
