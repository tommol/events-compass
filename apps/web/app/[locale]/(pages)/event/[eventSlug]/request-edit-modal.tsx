'use client';

import { Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type RequestEditModalDictionary = {
  editButton: string;
  requestEditTitle: string;
  requestEditDescription: string;
  requestEditEmailLabel: string;
  requestEditEmailPlaceholder: string;
  requestEditSubmit: string;
};

type RequestEditModalProps = {
  dictionary: RequestEditModalDictionary;
  action: (formData: FormData) => Promise<void>;
};

export function RequestEditModal({ dictionary, action }: RequestEditModalProps) {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="edit-btn" onClick={() => setOpen(true)}>
        <Pencil size={15} aria-hidden="true" />
        {dictionary.editButton}
      </button>

      {open && (
        <div
          className="modal-overlay"
          ref={overlayRef}
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
        >
          <div className="modal-content" role="dialog" aria-modal="true">
            <button
              type="button"
              className="modal-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={14} aria-hidden="true" />
            </button>

            <h3 className="modal-title">{dictionary.requestEditTitle}</h3>
            <p className="modal-description">{dictionary.requestEditDescription}</p>

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="modal-edit-email" className="modal-label">
                  {dictionary.requestEditEmailLabel}
                </label>
                <input
                  id="modal-edit-email"
                  name="email"
                  type="email"
                  placeholder={dictionary.requestEditEmailPlaceholder}
                  required
                  className="modal-input"
                />
              </div>
              <button type="submit" className="modal-submit">
                {dictionary.requestEditSubmit}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
