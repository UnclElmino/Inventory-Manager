import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchItems, createItem, getItem, updateItem, removeItemQuantity, increaseItemQuantity } from '../lib/itemApi';
import ItemFormModal from '../components/ItemFormModal';
import LikeButton from '../components/LikeButton';
import { useAuth } from '../context/AuthContext';
import Tabs from '../components/Tabs';
import { useToast } from '../context/ToastContext';
import Discussion from '../components/Discussion';
import Stats from '../components/Stats';
import AccessPanel from '../components/AccessPanel';
import FieldsPanel from '../components/FieldsPanel';



export default function InventoryDetail() {
    const { id } = useParams();
    const invId = Number(id);                     // <- inventory id from URL
    const { user } = useAuth();
    const { push } = useToast();

    const [tab, setTab] = useState('items');
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [search, setSearch] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [deleteQtyByItem, setDeleteQtyByItem] = useState({}); // track dropdowns

    // ✅ safe loader: do nothing if invId is missing/NaN
    const loadItems = useCallback(async () => {
        if (!invId || Number.isNaN(invId)) return;

        setLoadingItems(true);
        try {
            const res = await fetchItems(invId, { page, pageSize, search });
            // backend returns { data: [...] }
            setItems(res.data ?? []);
        } catch (e) {
            console.error(e);
            push('Failed to load items', 'danger');
        } finally {
            setLoadingItems(false);
        }
    }, [invId, page, pageSize, search, push]);

    // ✅ run when: component mounts, invId changes, page/search changes
    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // create item
    // create item
    const onCreate = async ({ custom_id, quantity, field_values }) => {
        if (!user) {
            push('Sign in first', 'warning');
            return;
        }
        try {
            await createItem(invId, {
                custom_id,
                created_by: user.id,
                user_id: user.id,        // <- helps auth middleware
                quantity,
                field_values,            // <- pass custom field values
            });
            setShowNew(false);
            setPage(1);
            loadItems();               // <- correct function
        } catch (e) {
            if (e?.response?.status === 409) {
                push('Custom ID must be unique in this inventory', 'danger');
            } else if (e?.response?.status === 401) {
                push('Not authorized to add items to this inventory', 'danger');
            } else {
                push('Failed to create item', 'danger');
            }
        }
    };


    // rename with optimistic locking
    const onInlineRename = async (itemId) => {
        const newId = prompt('New Custom ID?');
        if (!newId) return;
        try {
            const { data: current, etag } = await getItem(itemId);
            await updateItem(itemId, { custom_id: newId }, etag);
            push('Item updated');
            loadItems();
        } catch (e) {
            if (e?.response?.status === 409) {
                push('Version conflict. Reloaded latest.', 'warning');
                loadItems();
            } else {
                push('Failed to update item', 'danger');
            }
        }
    };

    const rows = useMemo(() => items.map(it => {
        const maxQty = it.quantity || 1;
        const selected = deleteQtyByItem[it.id] || 1;

        return (
            <tr key={it.id}>
                <td>{it.id}</td>
                <td>{it.custom_id}</td>
                <td>
                    <div className="d-flex align-items-center gap-2">
                        <span>{maxQty}</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={async () => {
                                try {
                                    await increaseItemQuantity(it.id, 1);
                                    push('Quantity increased');
                                    loadItems();
                                } catch (e) {
                                    console.error(e);
                                    push('Failed to increase quantity', 'danger');
                                }
                            }}
                            style={{ lineHeight: 1 }}
                        >
                            +
                        </button>
                    </div>
                </td>
                <td>
                    {it.field_values?.length
                        ? it.field_values.map(v => (
                            <div key={v.field_id}>
                                <strong>{v.field?.name || 'Field'}:</strong>{' '}
                                {v.value_text ??
                                    v.value_number ??
                                    (v.value_bool === true
                                        ? 'Yes'
                                        : v.value_bool === false
                                            ? 'No'
                                            : '') ??
                                    v.value_link ??
                                    ''}
                            </div>
                        ))
                        : <span className="text-muted small">—</span>}
                </td>
                <td>
                    <div className="d-flex gap-2 align-items-center">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onInlineRename(it.id)}
                        >
                            Rename
                        </button>

                        <LikeButton itemId={it.id} />

                        {/* ▼ dropdown for how many to delete */}
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            value={selected}
                            onChange={e =>
                                setDeleteQtyByItem(prev => ({
                                    ...prev,
                                    [it.id]: Number(e.target.value),
                                }))
                            }
                        >
                            {Array.from({ length: maxQty }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>

                        {/* delete button */}
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                                try {
                                    await removeItemQuantity(it.id, selected);
                                    push('Quantity updated');
                                    loadItems(); // reload list
                                } catch (e) {
                                    console.error(e);
                                    push('Failed to update quantity', 'danger');
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        );
    }), [items, deleteQtyByItem]);


    return (
        <div className="container py-4">
            <h2 className="h5 mb-3">Inventory #{invId}</h2>

            {/* tabs shell */}
            <Tabs
                active={tab}
                onChange={setTab}
                tabs={[
                    { key: 'items', label: 'Items' },
                    { key: 'discussion', label: 'Discussion' },
                    { key: 'stats', label: 'Statistics' },
                    { key: 'access', label: 'Access' },
                    { key: 'fields', label: 'Custom Fields' },
                ]}
            />

            {tab === 'items' && (
                <>
                    <div className="d-flex gap-2 mb-3">
                        <input
                            className="form-control"
                            placeholder="Search custom_id..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setPage(1);
                                loadItems();
                            }}
                        >
                            Search
                        </button>
                        <button className="btn btn-success" onClick={() => setShowNew(true)}>
                            + New Item
                        </button>
                    </div>

                    {loadingItems ? (
                        <div className="py-3">Loading items…</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Custom ID</th>
                                        <th>Quantity</th>
                                        <th>Custom Fields</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{rows}</tbody>
                            </table>
                        </div>
                    )}
                    {showNew && (
                        <ItemFormModal
                            inventoryId={invId}
                            onSubmit={onCreate}                 // <- use the function above
                            onClose={() => setShowNew(false)}
                        />
                    )}                </>
            )}

            {tab === 'discussion' && <Discussion inventoryId={invId} />}
            {tab === 'stats' && <Stats inventoryId={invId} />}
            {tab === 'access' && <AccessPanel inventoryId={invId} />}
            {tab === 'fields' && <FieldsPanel inventoryId={invId} />}
        </div>
    );
}
