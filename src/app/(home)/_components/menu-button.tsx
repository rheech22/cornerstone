'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';

import { ScrambleText } from '@/shared/components/scramble-text';
import { cn } from '@/shared/lib/cn';

type MenuButtonProps = {
  shortcut: string;
  label: string;
  onFocus?: () => void;
  onPointerEnter?: () => void;
} & (
  | { href: Route }
  | { href?: undefined; onClick: () => void; expanded?: boolean; controls?: string }
);

const menuButtonClass = cn(
  'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-base text-vague-fg',
  'hover:bg-vague-surface hover:text-vague-fg-bright',
  'focus:bg-vague-surface focus:text-vague-fg-bright focus:outline-none',
);

export const MenuButton = (props: MenuButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const body = <MenuButtonBody shortcut={props.shortcut} label={props.label} active={hovered || focused} />;
  const onFocus = () => {
    setFocused(true);
    props.onFocus?.();
  };

  if (props.href) {
    return (
      <Link
        href={props.href}
        className={menuButtonClass}
        data-menu-item="true"
        onFocus={onFocus}
        onBlur={() => setFocused(false)}
        onPointerEnter={() => {
          setHovered(true);
          props.onPointerEnter?.();
        }}
        onPointerLeave={() => setHovered(false)}
      >
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
      onFocus={onFocus}
      onBlur={() => setFocused(false)}
      onPointerEnter={() => {
        setHovered(true);
        props.onPointerEnter?.();
      }}
      onPointerLeave={() => setHovered(false)}
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
}: Pick<MenuButtonProps, 'shortcut' | 'label'> & { active: boolean }) => (
  <>
    <span className={cn('flex-1')}>
      <MenuLabel label={label} shortcut={shortcut} active={active} />
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
}: Pick<MenuButtonProps, 'shortcut' | 'label'> & { active: boolean }) => {
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

  return <ScrambleText text={label} active={active} highlightIndex={index} playOnMount />;
};
