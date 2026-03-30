import {useMemo} from 'react';
import {nanoid} from 'nanoid';
import {ZeroProviderWrapper} from './components/ZeroProvider';
import {ShoppingList} from './components/ShoppingList';

function getListId(): string {
  const path = window.location.pathname;
  const match = path.match(/^\/list\/(.+)$/);
  if (match) return match[1];

  // Homepage: redirect to a new list
  const id = nanoid(12);
  window.history.replaceState(null, '', `/list/${id}`);
  return id;
}

export function App() {
  const listId = useMemo(getListId, []);

  return (
    <ZeroProviderWrapper>
      <ShoppingList listId={listId} />
    </ZeroProviderWrapper>
  );
}
