import React from 'react';

interface ItemCardProps {
  title: string;
  subtitle?: string;
  pill?: string;
  pillClass?: string;
  image?: string;
  emoji?: string;
  color?: string;
  isOpen: boolean;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  fixed?: boolean;
  extraActions?: React.ReactNode;
  children: React.ReactNode;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  subtitle,
  pill,
  pillClass,
  image,
  emoji,
  color,
  isOpen,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
  fixed = false,
  extraActions,
  children,
}) => {
  return (
    <details
      className="za-item"
      open={isOpen}
      onToggle={(e) => {
        // Prevent default native toggle loop if controlled
        e.preventDefault();
      }}
    >
      <summary
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <div
          className="za-px"
          style={color && !image ? { background: color } : undefined}
        >
          {emoji || (color ? '' : '🖼️')}
          {image && (
            <img
              src={image}
              alt=""
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="za-t">
          <b>{title || 'Untitled'}</b>
          {subtitle && <span>{subtitle}</span>}
        </div>
        {pill && <span className={`za-pill ${pillClass || ''}`}>{pill}</span>}
        <span className="za-chev">▾</span>
      </summary>

      {isOpen && (
        <div className="za-body">
          {children}

          <div className="za-acts">
            {onMoveUp && (
              <button
                type="button"
                className="za-btn za-b3"
                disabled={!canMoveUp}
                onClick={onMoveUp}
                title="Move up"
              >
                ↑
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                className="za-btn za-b3"
                disabled={!canMoveDown}
                onClick={onMoveDown}
                title="Move down"
              >
                ↓
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                className="za-btn za-b3"
                onClick={onDuplicate}
                title="Duplicate"
              >
                ⎘ Duplicate
              </button>
            )}
            {extraActions}
            {!fixed && onDelete && (
              <button
                type="button"
                className="za-btn za-b3 za-bd"
                style={{ marginLeft: 'auto' }}
                onClick={onDelete}
              >
                🗑 Remove
              </button>
            )}
          </div>
        </div>
      )}
    </details>
  );
};
