import React from 'react';

type IconComponentType = React.ElementType<{ className?: string }>;

interface BotanicalKeyButtonProps {
  label?: string;
  icon?: IconComponentType;
  checked?: boolean;
  active?: boolean;
  onClick?: () => void;
  ledColor?: string; // e.g. '#34d399' (green), '#f59e0b' (gold/amber), '#f87171' (terracotta)
  symbolColor?: string;
  id?: string;
  title?: string;
  type?: 'button' | 'submit';
}

export const BotanicalKeyButton: React.FC<BotanicalKeyButtonProps> = ({
  label,
  icon: IconComponent,
  checked = false,
  active = false,
  onClick,
  ledColor = '#34d399',
  symbolColor = '#a7f3d0',
  id,
  title,
  type = 'button',
}) => {
  const isPressed = checked || active;

  return (
    <div 
      className="flex flex-col items-center justify-center space-y-2 mt-1" 
      id={id ? `${id}-container` : undefined}
      title={title}
    >
      <div className="key-wrap">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={() => {}} // Controlled or clicked via the button
          className="key-checkbox"
          id={id ? `checkbox-${id}` : undefined}
          aria-hidden="true"
        />
        
        <button
          type={type}
          onClick={onClick}
          className={`key-button ${isPressed ? 'active' : ''}`}

          id={id}
          style={{
            '--led-glow-color': ledColor,
            '--symbol-active-color': symbolColor,
            '--symbol-glow-color': `${symbolColor}66`,
          } as React.CSSProperties}
        >
          {/* Subtle 3D reflective highlight bevel lines */}
          <div className="key-corner" />

          {/* Textured Double-Shot Plastic surface */}
          <div className="key-noise" />

          {/* Glowing Status LED indicator */}
          <div 
            className="key-led"
            style={{
              backgroundColor: isPressed ? ledColor : '#324136',
              boxShadow: isPressed 
                ? `0 0 8px ${ledColor}, 0 0 14px ${ledColor}, inset 0 1px 1px rgba(255, 255, 255, 0.8)`
                : 'inset 0 1px 1px rgba(0,0,0,0.6)'
            }}
          />

          {/* Recessed cylinder socket */}
          <div className="key-inner">
            {IconComponent ? (
              <IconComponent 
                className="key-symbol"
                style={{
                  color: isPressed ? symbolColor : 'var(--color-brand-cream)',
                  opacity: isPressed ? 1 : 0.55,
                }}
              />
            ) : (
              /* Fallback default Bluetooth logo matching user requested icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 390 430"
                className="key-symbol"
                style={{
                  color: isPressed ? symbolColor : 'var(--color-brand-cream)',
                  opacity: isPressed ? 1 : 0.55,
                }}
              >
                <path
                  d="M202.884 13.3026C196.814 7.84601 188.099 6.46854 180.642 9.78694C173.182 13.1055 168.377 20.4983 168.377 28.6551V164.683L78.6175 75.0327C70.5431 66.9664 57.4523 66.9664 49.3779 75.0327C41.3037 83.0988 41.3037 96.1768 49.3779 104.243L159.813 214.548L49.3787 324.853C41.3045 332.919 41.3045 345.997 49.3787 354.063C57.453 362.129 70.5439 362.129 78.6182 354.063L168.377 264.413V400.441C168.377 408.598 173.182 415.99 180.642 419.309C188.099 422.629 196.814 421.251 202.884 415.794L306.262 322.847C310.618 318.931 313.105 313.35 313.105 307.495C313.105 301.639 310.618 296.06 306.262 292.142L219.958 214.548L306.262 136.954C310.618 133.037 313.105 127.457 313.105 121.602C313.105 115.746 310.618 110.166 306.262 106.249L202.884 13.3026ZM261.524 307.495L209.728 260.926V354.063L261.524 307.495ZM261.524 121.602L209.728 168.171V75.0327L261.524 121.602Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>

          {/* Under-bezel gloss details */}
          <div className="key-bg" />
        </button>
      </div>

      {label && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-cream/65 text-center leading-none">
          {label}
        </span>
      )}
    </div>
  );
};
