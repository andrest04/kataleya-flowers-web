import { useEffect, useRef, useState, useTransition } from 'react';

import type { TaxonomyActionResult, TaxonomyItem } from './types';

interface Params<TItem extends TaxonomyItem> {
  items: TItem[];
  initialExtra?: { hex: string };
  onRename: (oldName: string, newName: string) => Promise<TaxonomyActionResult>;
  onItemRenamedInForm: (oldName: string, newName: string) => void;
  onDelete: (name: string) => Promise<TaxonomyActionResult>;
  onItemRemovedFromForm: (name: string) => void;
  getUsageCount: (name: string) => Promise<number>;
  onAddPending: (name: string, extra: { hex?: string }) => void;
  onError: (msg: string) => void;
}

export function useTaxonomyManager<TItem extends TaxonomyItem>({
  items,
  initialExtra,
  onRename,
  onItemRenamedInForm,
  onDelete,
  onItemRemovedFromForm,
  getUsageCount,
  onAddPending,
  onError,
}: Params<TItem>) {
  const [manageMode, setManageMode] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [showNewInput, setShowNewInput] = useState(false);
  const [newInput, setNewInput] = useState('');
  const [extra, setExtra] = useState<{ hex: string }>(initialExtra ?? { hex: '' });
  const newInputRef = useRef<HTMLInputElement>(null);

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (showNewInput) newInputRef.current?.focus();
  }, [showNewInput]);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  const isDuplicate = (name: string) => items.some((i) => i.name === name);

  const toggleManageMode = () => {
    setManageMode((v) => !v);
    setRenaming(null);
    setDeleting(null);
  };

  const startRename = (name: string) => {
    setRenaming(name);
    setRenameValue(name);
    setDeleting(null);
  };

  const cancelRename = () => setRenaming(null);

  const commitRename = (oldName: string) => {
    const newName = renameValue.toLowerCase().trim();
    if (!newName || newName === oldName || isDuplicate(newName)) return;
    startTransition(async () => {
      const result = await onRename(oldName, newName);
      if (result.success) {
        onItemRenamedInForm(oldName, newName);
        setRenaming(null);
      } else {
        onError(result.error ?? 'Error al renombrar');
      }
    });
  };

  const startDelete = (name: string) => {
    setDeleting(name);
    setRenaming(null);
    setUsageCount(null);
    void (async () => {
      try {
        const count = await getUsageCount(name);
        setUsageCount(count);
      } catch {
        setUsageCount(0);
      }
    })();
  };

  const cancelDelete = () => {
    setDeleting(null);
    setUsageCount(null);
  };

  const commitDelete = (name: string) => {
    startTransition(async () => {
      const result = await onDelete(name);
      if (result.success) {
        onItemRemovedFromForm(name);
        setDeleting(null);
        setUsageCount(null);
      } else {
        onError(result.error ?? 'Error al eliminar');
      }
    });
  };

  const openAdd = () => setShowNewInput(true);

  const cancelAdd = () => {
    setNewInput('');
    setShowNewInput(false);
  };

  const commitAdd = () => {
    const name = newInput.toLowerCase().trim();
    if (!name || isDuplicate(name)) return;
    onAddPending(name, extra);
    setNewInput('');
    setExtra(initialExtra ?? { hex: '' });
    setShowNewInput(false);
  };

  return {
    manageMode,
    renaming,
    renameValue,
    deleting,
    usageCount,
    renameInputRef,
    showNewInput,
    newInput,
    extra,
    newInputRef,
    setRenameValue,
    setNewInput,
    setExtra,
    toggleManageMode,
    startRename,
    cancelRename,
    commitRename,
    startDelete,
    cancelDelete,
    commitDelete,
    openAdd,
    cancelAdd,
    commitAdd,
  };
}
