import React, { useState } from 'react';
import { uploadImageToSupabase, isSupabaseConfigured } from '../../lib/supabase';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  placeholder?: string;
  fullWidth?: boolean;
  type?: 'text' | 'date' | 'tel' | 'email';
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  hint,
  placeholder,
  fullWidth,
  type = 'text',
}) => {
  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  placeholder?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  hint,
  placeholder,
  fullWidth,
  rows = 3,
}) => {
  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  hint?: string;
  step?: number;
  min?: number;
  fullWidth?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  hint,
  step = 500,
  min = 0,
  fullWidth,
}) => {
  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (val: string) => void;
  hint?: string;
  fullWidth?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  hint,
  fullWidth,
}) => {
  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([optVal, optLabel]) => (
          <option key={optVal} value={optVal}>
            {optLabel}
          </option>
        ))}
      </select>
    </div>
  );
};

interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  fullWidth?: boolean;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  checked,
  onChange,
  fullWidth,
}) => {
  return (
    <label className={`za-sw ${fullWidth ? 'za-fld w' : ''}`}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <s></s>
      {label}
    </label>
  );
};

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  fullWidth?: boolean;
}

export const ColorField: React.FC<ColorFieldProps> = ({
  label,
  value,
  onChange,
  hint,
  fullWidth,
}) => {
  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <input
        type="color"
        value={value || '#e8b374'}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  fullWidth?: boolean;
}

export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  onChange,
  hint,
  fullWidth,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    // If Supabase is configured, upload to Supabase Storage
    if (isSupabaseConfigured()) {
      try {
        const { url, error } = await uploadImageToSupabase(file, 'media');
        if (error || !url) {
          setUploadError(error || 'Failed to upload to Supabase Storage');
        } else {
          onChange(url);
          setUploading(false);
          return;
        }
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed');
      }
    }

    // Fallback: local compressed canvas data URL if Supabase storage is not yet available
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 900 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange(dataUrl);
        }
        setUploading(false);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isDataUrl = value && value.startsWith('data:');

  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
        {uploading && <span style={{ color: 'var(--za-acc, #c87d32)' }}> · ⏳ Uploading to Supabase...</span>}
      </label>
      <div className="za-pre">
        <div className="za-px">
          <span>🖼️</span>
          {value && (
            <img
              src={value}
              alt=""
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="za-col">
          <input
            type="text"
            placeholder="Paste image link or upload photo…"
            value={isDataUrl ? '(uploaded photo)' : value ?? ''}
            readOnly={!!isDataUrl}
            onChange={(e) => onChange(e.target.value)}
          />
          <label className="za-btn za-b3" style={{ whiteSpace: 'nowrap', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? '⏳ Uploading…' : '⬆ Upload'}
            <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleFileUpload} />
          </label>
          {value && (
            <button
              type="button"
              className="za-btn za-b3 za-bd"
              onClick={() => onChange('')}
              title="Clear photo"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {uploadError && (
        <div style={{ fontSize: '11px', color: '#e57373', marginTop: '4px' }}>
          ⚠️ {uploadError}
        </div>
      )}
    </div>
  );
};

interface StarRatingProps {
  label: string;
  rating: number;
  onChange: (val: number) => void;
  fullWidth?: boolean;
}

export const StarRatingField: React.FC<StarRatingProps> = ({
  label,
  rating,
  onChange,
  fullWidth,
}) => {
  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>{label}</label>
      <div className="za-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= rating ? 'on' : ''}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
};

interface TagsFieldProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  hint?: string;
  fullWidth?: boolean;
}

export const TagsField: React.FC<TagsFieldProps> = ({
  label,
  tags,
  onChange,
  hint,
  fullWidth,
}) => {
  const [inputVal, setInputVal] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
        setInputVal('');
      }
    }
  };

  const removeTag = (index: number) => {
    const next = [...tags];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className={`za-fld ${fullWidth ? 'w' : ''}`}>
      <label>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <div className="za-tags">
        {(tags || []).map((t, idx) => (
          <span key={idx} className="za-tg">
            {t}
            <button type="button" onClick={() => removeTag(idx)}>
              ×
            </button>
          </span>
        ))}
        <input
          value={inputVal}
          placeholder="Type & press Enter…"
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
