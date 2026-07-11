'use client';

import type { Route } from 'next';
import Link from 'next/link';

import { ScrambleText } from '@/shared/components/scramble-text';
import { cn } from '@/shared/lib/cn';

type MenuButtonProps = {
  shortcut: string;
  label: string;
  active: boolean;
  browsing: boolean;
  onActivate: () => void;
  onFocus?: () => void;
  onPointerEnter?: () => void;
} & (
  | { href: Route }
  | { href?: undefined; onClick: () => void; expanded?: boolean; controls?: string }
);

const menuButtonClass = (active: boolean, browsing: boolean) =>
  cn(
    'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-base transition-colors duration-200 focus:outline-none',
    active ? 'text-vague-fg-bright' : browsing ? 'text-vague-muted/35' : 'text-vague-fg',
  );

export const MenuButton = (props: MenuButtonProps) => {
  const body = <MenuButtonBody shortcut={props.shortcut} label={props.label} active={props.active} browsing={props.browsing} />;
  const onFocus = () => {
    props.onActivate();
    props.onFocus?.();
  };

  if (props.href) {
    return (
      <Link
        href={props.href}
        className={menuButtonClass(props.active, props.browsing)}
        data-menu-item="true"
        onFocus={onFocus}
        onMouseEnter={() => {
          props.onActivate();
          props.onPointerEnter?.();
        }}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={menuButtonClass(props.active, props.browsing)}
      data-menu-item="true"
      onClick={props.onClick}
      onFocus={onFocus}
      onMouseEnter={() => {
        props.onActivate();
        props.onPointerEnter?.();
      }}
      aria-expanded={props.expanded}
      aria-controls={props.controls}
    >
      {body}
    </button>
  );
};

const MenuButtonBody = ({
  shortcut,
  label,
  active,
  browsing,
}: Pick<MenuButtonProps, 'shortcut' | 'label'> & { active: boolean; browsing: boolean }) => (
  <>
    <span className={cn('flex-1')}>
      <MenuLabel label={label} shortcut={shortcut} active={active} browsing={browsing} />
    </span>
    <span
      className={cn(
        'text-vague-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100',
      )}
    >
    </span>
  </>
);

const MenuLabel = ({
  label,
  shortcut,
  active,
  browsing,
}: Pick<MenuButtonProps, 'shortcut' | 'label'> & { active: boolean; browsing: boolean }) => {
  const hint = cn(active || !browsing ? 'text-vague-amber' : 'text-vague-amber/60');
  const index = label.toLowerCase().indexOf(shortcut.toLowerCase());

  if (index === -1) {
    return (
      <span>
        {label}
        <span className={hint}>{`(${shortcut})`}</span>
      </span>
    );
  }

  return <ScrambleText text={label} active={active} highlightIndex={index} highlightClassName={hint} playOnMount />;
};
