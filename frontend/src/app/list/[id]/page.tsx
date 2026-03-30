import type {Metadata} from 'next';
import {ListPageClient} from './client';

interface Props {
  params: Promise<{id: string}>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://list.nvect.com';

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {id} = await params;
  const ogImageUrl = `${BASE_URL}/list/${id}/opengraph-image`;
  return {
    title: 'Shopping List',
    description: 'Collaborative shopping list - add items, share with others, sync in real-time',
    openGraph: {
      title: 'Shopping List',
      description: 'Join this shared shopping list and collaborate in real-time!',
      url: `${BASE_URL}/list/${id}`,
      type: 'website',
      siteName: 'Zero Shopping List',
      images: [{url: ogImageUrl, width: 1200, height: 630, alt: 'Shopping List'}],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shopping List',
      description: 'Join this shared shopping list and collaborate in real-time!',
      images: [ogImageUrl],
    },
  };
}

export default async function ListPage({params}: Props) {
  const {id} = await params;
  return <ListPageClient listId={id} />;
}
