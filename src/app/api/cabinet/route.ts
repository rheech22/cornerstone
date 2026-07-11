import { NextResponse } from 'next/server';

import { buildExplorerIndex } from '@/shared/lib/explorer';

export const dynamic = 'force-static';

export const GET = () => NextResponse.json(buildExplorerIndex());
