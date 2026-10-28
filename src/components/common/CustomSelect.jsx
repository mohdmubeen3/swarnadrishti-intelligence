import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Accessible Custom Dropdown Component
 * Designed specifically for SwarnaDrishti's midnight navy theme with gold/cyan accenting.
 * Supports full keyboard navigation (Arrows, Enter, Escape, Space, Tab) and ARIA combobox pattern.
 */
export function CustomSelect({
  value,
  onChange,
  options = [],
  label,
  icon: Icon,
  className = '',
  style = {},
  dropdownStyle = {},
  placeholder = 'Select...',
  ariaLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = useId();

  // Normalize options to objects: { value, label, subtext, disabled }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : opt.value,
        subtext: opt.subtext,
        disabled: Boolean(opt.disabled)
      };
    }
    return {
      value: opt,
      label: opt,
      disabled: false
    };
  });

  const selectedOption = normalizedOptions.find(o => o.value === value) || normalizedOptions[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Sync highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex(o => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const selectOption = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          while (next < normalizedOptions.length && normalizedOptions[next].disabled) {
            next++;
          }
          return next < normalizedOptions.length ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && normalizedOptions[next].disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && normalizedOptions[highlightedIndex]) {
          selectOption(normalizedOptions[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel || label || 'Select option'}
      >
        {Icon && <Icon size={14} className="custom-select-icon" />}
        {label && <span className="custom-select-label">{label}</span>}
        <span className="custom-select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`custom-select-arrow ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="custom-select-dropdown"
          style={dropdownStyle}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                className={`custom-select-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${opt.disabled ? 'disabled' : ''}`}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => !opt.disabled && setHighlightedIndex(idx)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="custom-select-option-text">{opt.label}</span>
                  {opt.subtext && <span className="custom-select-option-subtext">{opt.subtext}</span>}
                </div>
                {isSelected && <Check size={13} style={{ color: 'var(--gold-bright)', flexShrink: 0 }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
