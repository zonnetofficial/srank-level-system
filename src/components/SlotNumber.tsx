import { useEffect, useRef, useState } from 'react';

interface SlotNumberProps {
  value: string | number;
  className?: string;
  /** Delay before animation starts in ms */
  delay?: number;
}

/**
 * Casino slot-machine style rolling number display.
 * Each character rolls independently with staggered timing.
 */
const SlotNumber = ({ value, className = '', delay = 0 }: SlotNumberProps) => {
  const displayValue = String(value);
  const prevValue = useRef(displayValue);
  const [chars, setChars] = useState(displayValue.split(''));
  const [rolling, setRolling] = useState<boolean[]>(displayValue.split('').map(() => false));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initial mount: roll all digits in
    const timeout = setTimeout(() => {
      setMounted(true);
      setRolling(displayValue.split('').map(() => true));
      const stopTimeout = setTimeout(() => {
        setRolling(displayValue.split('').map(() => false));
      }, 800);
      return () => clearTimeout(stopTimeout);
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const newValue = String(value);
    if (newValue === prevValue.current) return;

    const newChars = newValue.split('');
    const oldChars = prevValue.current.split('');

    // Only roll digits that changed
    const rollMap = newChars.map((ch, i) => ch !== (oldChars[i] ?? ''));
    
    setRolling(rollMap);
    setChars(newChars);
    prevValue.current = newValue;

    const timeout = setTimeout(() => {
      setRolling(newChars.map(() => false));
    }, 700);

    return () => clearTimeout(timeout);
  }, [value]);

  // Generate random "ghost" characters for the rolling effect
  const getGhostChars = (target: string, count: number) => {
    const isDigit = /\d/.test(target);
    const chars: string[] = [];
    for (let i = 0; i < count; i++) {
      if (isDigit) {
        chars.push(String(Math.floor(Math.random() * 10)));
      } else {
        chars.push(target); // non-digit chars don't randomize
      }
    }
    chars.push(target); // final is the real value
    return chars;
  };

  return (
    <span className={`slot-roll-container ${className}`}>
      {chars.map((char, i) => {
        const isRolling = rolling[i] && /\d/.test(char);
        const ghostCount = 6 + Math.floor(Math.random() * 3); // 6-8 ghost chars
        const ghosts = getGhostChars(char, ghostCount);
        const staggerDelay = i * 80; // stagger each digit

        return (
          <span key={`${i}-${char}`} className="slot-roll-digit">
            {isRolling ? (
              <span
                className="slot-roll-inner"
                style={{
                  animationDelay: `${staggerDelay}ms`,
                  animationDuration: `${500 + i * 60}ms`,
                }}
              >
                {ghosts.map((g, gi) => (
                  <span key={gi} className="block" style={{ height: '1em', lineHeight: '1' }}>
                    {g}
                  </span>
                ))}
              </span>
            ) : (
              <span className="block" style={{ height: '1em', lineHeight: '1' }}>
                {char}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default SlotNumber;
