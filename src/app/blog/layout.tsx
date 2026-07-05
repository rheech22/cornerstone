import { cn } from '@/shared/lib/cn';

const BlogLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <main className={cn('flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-vague-bg text-vague-fg tui-scroll')}>{children}</main>;

export default BlogLayout;
