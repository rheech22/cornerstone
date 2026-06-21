import { cn } from '@/shared/lib/cn';

export type CompletionItem = { insert: string; label: string; count: number };

type CompletionPopupProps = {
  items: CompletionItem[];
  activeIndex: number;
  onSelect: (item: CompletionItem) => void;
};

export const CompletionPopup = ({ items, activeIndex, onSelect }: CompletionPopupProps) => (
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
          aria-current={index === activeIndex}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-1 text-left text-sm transition-colors',
            index === activeIndex
              ? 'bg-vague-surface text-vague-sand'
              : 'text-vague-fg hover:bg-vague-surface/40',
          )}
        >
          <span className={cn('w-3 text-vague-amber')}>{index === activeIndex ? '▌' : ''}</span>
          <span className={cn('flex-1 truncate')}>{item.label}</span>
          <span className={cn('text-xs text-vague-muted')}>{item.count}</span>
        </button>
      </li>
    ))}
  </ul>
);
