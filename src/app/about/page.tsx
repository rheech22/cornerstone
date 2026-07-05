import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

const AboutPage = async () => {
  const slug = 'about';
  const { default: AboutContent } = await import(`../_shared/content/blog/${slug}.mdx`);

  return (
    <main className={cn('min-h-0 flex-1 overflow-y-auto bg-vague-bg text-vague-fg tui-scroll')}>
      <div className={cn('mx-auto flex w-full max-w-3xl flex-col gap-16 px-6 py-16')}>
        <Section title="About">
          <article className={cn('markdown vague-markdown mx-0 text-base')}>
            <AboutContent />
          </article>
        </Section>
      </div>
    </main>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className={cn('flex flex-col gap-6')}>
    <h1 className={cn('text-2xl font-semibold text-vague-fg-bright')}>{title}</h1>
    {children}
  </section>
);

export default AboutPage;
