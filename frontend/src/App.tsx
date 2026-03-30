import {useMemo} from 'react';
import {nanoid} from 'nanoid';
import {ZeroProviderWrapper} from './components/ZeroProvider';
import {ShoppingList} from './components/ShoppingList';

function getListId(): string {
  const path = window.location.pathname;
  const match = path.match(/^\/list\/(.+)$/);
  if (match) {
    localStorage.setItem('last-list-id', match[1]);
    return match[1];
  }

  // Homepage: return to last list or create new
  const saved = localStorage.getItem('last-list-id');
  const id = saved || nanoid(12);
  if (!saved) localStorage.setItem('last-list-id', id);
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
