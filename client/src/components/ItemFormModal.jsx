import { useState } from 'react';

export default function ItemFormModal({ onSubmit, onClose }) {
  const [customId, setCustomId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ custom_id: customId, quantity });
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Item</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={submit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Custom ID</label>
                <input
                  className="form-control"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  required
                />
                <div className="form-text">
                  Must be unique within this inventory.
                </div>
              </div>

              {/* ✅ new quantity field */}
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
