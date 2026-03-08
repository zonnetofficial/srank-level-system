import { useEffect, useRef, useState } from 'react';

interface SlotNumberProps {
  value: string | number;
  className?: string;
  /** Delay before initial animation in ms */
  delay?: number;
}

/**
 * Animated number/text display.
 * - Small changes (1-2 digit diff): quick horizontal slide
 * - Large changes (3+ digit diff or initial mount): casino slot roll
 */
const SlotNumber = ({ value, className = '', delay = 0 }: SlotNumberProps) => {
  const displayValue = String(value);
  const prevValue = useRef<string | null>(null);
  const [rendered, setRendered] = useState(displayValue);
  const [animClass, setAnimClass] = useState('');
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Initial mount — simple slide in
      setAnimClass('animate-slide-nudge');
      setKey(k => k + 1);
      prevValue.current = displayValue;
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (prevValue.current === null) return; // not yet mounted
    const newVal = String(value);
    if (newVal === prevValue.current) return;

    // Determine change magnitude
    const oldNum = parseInt(prevValue.current.replace(/\D/g, ''), 10) || 0;
    const newNum = parseInt(newVal.replace(/\D/g, ''), 10) || 0;
    const diff = Math.abs(newNum - oldNum);

    if (diff >= 3) {
      // Big change — slot roll effect
      setAnimClass('slot-roll-up');
    } else {
      // Small change — quick horizontal slide
      setAnimClass('animate-slide-nudge');
    }

    setRendered(newVal);
    setKey(k => k + 1);
    prevValue.current = newVal;
  }, [value]);

  return (
    <span
      key={key}
      className={`inline-block ${animClass} ${className}`}
    >
      {rendered}
    </span>
  );
};

export default SlotNumber;
