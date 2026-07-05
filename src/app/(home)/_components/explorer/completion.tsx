import { cn } from '@/shared/lib/cn';

export type CompletionItem = { insert: string; label: string; count: number };

type CompletionPopupProps = {
  items: CompletionItem[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
  onSelect: (item: CompletionItem) => void;
};

export const CompletionPopup = ({ items, activeIndex, onActiveChange, onSelect }: CompletionPopupProps) => (
  <ul
    className={cn(
      'tui-scroll absolute left-7 top-full z-30 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-vague-border bg-vague-surface py-1 shadow-xl',
    )}
  >
    {items.map((item, index) => (
      <li key={item.insert}>
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(item);
          }}
          onMouseMove={() => onActiveChange(index)}
          onFocus={() => onActiveChange(index)}
          aria-current={index === activeIndex}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-1 text-left text-sm focus:outline-none',
            index === activeIndex ? 'bg-vague-bg' : 'text-vague-muted/35',
          )}
        >
          <span className={cn('flex-1 truncate', index === activeIndex && 'text-vague-fg-bright')}>{item.label}</span>
          <span className={cn('text-xs', index === activeIndex ? 'text-vague-muted/70' : 'text-vague-muted/30')}>
            {item.count}
          </span>
        </button>
      </li>
    ))}
  </ul>
);
