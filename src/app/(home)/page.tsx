import { buildExplorerIndex } from '@/shared/lib/explorer';

import { Banner } from './_components/banner';
import { Menu } from './_components/menu';

export default function HomePage() {
  const docs = buildExplorerIndex();

  return (
    <Menu docs={docs}>
      <Banner />
    </Menu>
  );
}
