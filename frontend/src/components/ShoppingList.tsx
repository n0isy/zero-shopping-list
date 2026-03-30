'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useQuery, useZero} from '@rocicorp/zero/react';
import {nanoid} from 'nanoid';
import {ShareModal} from './ShareModal';
import {mutators} from '../../shared/mutators';
import {queries} from '../../shared/queries';

export function ShoppingList({listId}: {listId: string}) {
  const z = useZero();
  const [newItem, setNewItem] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Query the list with its items using defineQueries pattern
  const [list] = useQuery(queries.listWithItems(listId));

  // Create list if it doesn't exist
  const created = useRef(false);
  useEffect(() => {
    if (!list && !created.current) {
      created.current = true;
      z.mutate(mutators.list.create({
        id: listId,
        name: 'Shopping List',
        created_at: Date.now(),
      }));
    }
  }, [list, listId, z]);

  const items = list?.items ?? [];
  const uncheckedItems = items
    .filter((i) => !i.checked)
    .sort((a, b) => a.sort_order - b.sort_order);
  const checkedItems = items
    .filter((i) => i.checked)
    .sort((a, b) => a.sort_order - b.sort_order);
  const sortedItems = [...uncheckedItems, ...checkedItems];

  const totalCount = items.length;
  const doneCount = checkedItems.length;

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const title = newItem.trim();
      if (!title) return;

      const maxOrder = items.reduce(
        (max, i) => (i.checked ? max : Math.max(max, i.sort_order)),
        0,
      );

      z.mutate(mutators.item.add({
        id: nanoid(12),
        list_id: listId,
        title,
        sort_order: maxOrder + 1,
        created_at: Date.now(),
      }));
      setNewItem('');
      inputRef.current?.focus();
    },
    [newItem, items, listId, z],
  );

  const handleToggle = useCallback(
    (id: string, currentChecked: boolean) => {
      z.mutate(mutators.item.toggle({id, checked: !currentChecked}));
    },
    [z],
  );

  const handleDelete = useCallback(
    (id: string) => {
      z.mutate(mutators.item.remove(id));
    },
    [z],
  );

  const handleClearChecked = useCallback(() => {
    for (const item of checkedItems) {
      z.mutate(mutators.item.remove(item.id));
    }
  }, [checkedItems, z]);

  const handleRename = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const name = nameRef.current?.value.trim();
      if (name && list) {
        z.mutate(mutators.list.rename({id: listId, name}));
      }
      setEditingName(false);
    },
    [list, listId, z],
  );

  if (!list) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p style={{color: 'var(--text-secondary)'}}>Loading list...</p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          {editingName ? (
            <form onSubmit={handleRename} onBlur={handleRename}>
              <input
                ref={nameRef}
                defaultValue={list.name}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setEditingName(false);
                }}
              />
            </form>
          ) : (
            <span
              onClick={() => setEditingName(true)}
              style={{cursor: 'pointer'}}
            >
              {list.name}
            </span>
          )}
        </div>
        <div className="header-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowShare(true)}
            aria-label="Share list"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      <form className="add-form" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          className="add-input"
          type="text"
          placeholder="Add an item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          autoComplete="off"
          enterKeyHint="done"
        />
        <button className="btn btn-primary add-btn" type="submit">
          +
        </button>
      </form>

      {/* Counter */}
      {totalCount > 0 && (
        <div className="counter">
          <span>{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
          {doneCount > 0 && (
            <span className="counter-done">
              {doneCount} done
            </span>
          )}
        </div>
      )}

      {/* Items */}
      {sortedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.3}}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <p className="empty-text">Your list is empty</p>
          <p className="empty-hint">Add items to get started</p>
        </div>
      ) : (
        <div className="items-list">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className={`item-card ${item.checked ? 'checked' : ''}`}
              onClick={() => handleToggle(item.id, item.checked)}
            >
              <div className="item-checkbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <span className="item-text">{item.title}</span>
              <button
                className="item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                aria-label="Delete item"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clear checked items */}
      {doneCount > 0 && (
        <button className="btn btn-danger clear-checked" onClick={handleClearChecked}>
          Clear {doneCount} checked item{doneCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal listId={listId} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
