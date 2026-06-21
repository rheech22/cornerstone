import type { Route } from 'next';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

type MenuButtonProps = {
  shortcut: string;
  label: string;
  onFocus?: () => void;
} & (
  | { href: Route }
  | { href?: undefined; onClick: () => void; expanded?: boolean; controls?: string }
);

const menuButtonClass = cn(
  'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-base text-vague-fg',
  'transition-colors hover:bg-vague-surface hover:text-vague-fg-bright',
  'focus:bg-vague-surface focus:text-vague-fg-bright focus:outline-none',
);

export const MenuButton = (props: MenuButtonProps) => {
  const body = <MenuButtonBody shortcut={props.shortcut} label={props.label} />;

  if (props.href) {
    return (
      <Link href={props.href} className={menuButtonClass} data-menu-item="true" onFocus={props.onFocus}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={menuButtonClass}
      data-menu-item="true"
      onClick={props.onClick}
      onFocus={props.onFocus}
      aria-expanded={props.expanded}
      aria-controls={props.controls}
    >
      {body}
    </button>
  );
};

const MenuButtonBody = ({ shortcut, label }: Pick<MenuButtonProps, 'shortcut' | 'label'>) => (
  <>
    <span className={cn('flex-1')}>
      <MenuLabel label={label} shortcut={shortcut} />
    </span>
    <span
      className={cn(
        'text-vague-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100',
      )}
    >
      ↵
    </span>
  </>
);

const MenuLabel = ({ label, shortcut }: Pick<MenuButtonProps, 'shortcut' | 'label'>) => {
  const hint = cn('text-vague-amber');
  const index = label.toLowerCase().indexOf(shortcut.toLowerCase());

  if (index === -1) {
    return (
      <span>
        {label}
        <span className={hint}>{`(${shortcut})`}</span>
      </span>
    );
  }

  return (
    <span>
      {label.slice(0, index)}
      <span className={hint}>{label[index]}</span>
      {label.slice(index + 1)}
    </span>
  );
};
