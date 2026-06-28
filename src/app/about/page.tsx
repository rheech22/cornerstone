import { cn } from '@/shared/lib/cn';

export default async function AboutPage() {
  const slug = 'about';
  const { default: AboutContent } = await import(`../_shared/content/blog/${slug}.mdx`);

  return (
    <main className={cn('mx-auto flex w-full max-w-3xl flex-col gap-16 px-6 py-16')}>
      <Section title={'this site'}>
        <article className={cn('markdown text-lg mx-0')}>
          <AboutContent />
        </article>
      </Section>
    </main>
  );
}

const Section = ({title, children}: {title: string; children: React.ReactNode}) => {
  return (
    <section className={cn('flex flex-col gap-6')}>
      <h1 className={cn('text-2xl font-semibold')}>{title}</h1>
      {children}
    </section>
  );
}
