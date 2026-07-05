import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

const AboutPage = async () => {
  const slug = 'about';
  const { default: AboutContent } = await import(`../_shared/content/blog/${slug}.mdx`);

  return (
    <main className={cn('min-h-0 flex-1 overflow-y-auto bg-vague-bg text-vague-fg tui-scroll')}>
      <div className={cn('mx-auto flex w-full max-w-3xl flex-col gap-16 px-6 py-16')}>
        <Section title="안녕하세요">
          <article className={cn('markdown vague-markdown mx-0 text-base')}>
            2022년부터 개발자로 일하고 있습니다. 소프트웨어를 저를 표현하는 하나의 수단으로 여기고 있어요. 하나의
            기술이나 분야에 갇히지 않고 관심이 가는 곳으로 향하려고 합니다. 현재 직장에서는 NextJS와 Flutter로
            하이브리드 앱을 만들고 있어요.
          </article>
        </Section>
        <Section title="this site">
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
