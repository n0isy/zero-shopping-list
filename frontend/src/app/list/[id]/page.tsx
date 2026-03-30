import type {Metadata} from 'next';
import {ListPageClient} from './client';

interface Props {
  params: Promise<{id: string}>;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {id} = await params;
  return {
    title: 'Shopping List',
    description: 'Collaborative shopping list - add items, share with others, sync in real-time',
    openGraph: {
      title: 'Shopping List',
      description: 'Join this shared shopping list and collaborate in real-time!',
      url: `/list/${id}`,
      type: 'website',
      siteName: 'Zero Shopping List',
    },
  };
}

export default async function ListPage({params}: Props) {
  const {id} = await params;
  return <ListPageClient listId={id} />;
}
