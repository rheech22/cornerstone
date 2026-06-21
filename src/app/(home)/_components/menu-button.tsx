import type { Route } from 'next';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

type MenuButtonProps = {
  shortcut: string;
  label: string;
} & (
  | { href: Route }
  | { href?: undefined; onClick: () => void; expanded?: boolean; controls?: string }
);

const menuButtonClass = cn(
  'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-base text-vague-fg',
  'transition-colors hover:bg-vague-surface hover:text-vague-fg-bright',
  'focus-visible:bg-vague-surface focus-visible:text-vague-fg-bright focus-visible:outline-none',
);

export const MenuButton = (props: MenuButtonProps) => {
  const body = <MenuButtonBody shortcut={props.shortcut} label={props.label} />;

  if (props.href) {
    return (
      <Link href={props.href} className={menuButtonClass}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={menuButtonClass}
      onClick={props.onClick}
      aria-expanded={props.expanded}
      aria-controls={props.controls}
    >
      {body}
    </button>
  );
};

const MenuButtonBody = ({ shortcut, label }: Pick<MenuButtonProps, 'shortcut' | 'label'>) => (
  <>
    <span className={cn('w-8 text-vague-muted group-hover:text-vague-accent')}>{`[${shortcut}]`}</span>
    <span className={cn('flex-1')}>{label}</span>
    <span className={cn('text-vague-muted opacity-0 transition-opacity group-hover:opacity-100')}>↵</span>
  </>
);
