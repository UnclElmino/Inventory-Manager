import api from './api';

export const fetchItems = (inventoryId, params) =>
  api.get(`/items/inventory/${inventoryId}`, { params }).then(r => r.data);

export const getItem = (id) =>
  api.get(`/items/${id}`).then(r => ({ data: r.data, etag: r.headers.etag }));

export const createItem = (inventoryId, payload) =>
  api.post(`/items/inventory/${inventoryId}`, payload).then(r => r.data);

export const updateItem = async (id, payload, version) => {
  const res = await api.patch(`/items/${id}`, payload, {
    headers: { 'If-Match': String(version) }
  });
  return { data: res.data, etag: res.headers.etag };
};

export const likeItem = (id, user_id) =>
  api.post(`/items/${id}/like`, { user_id }).then(r => r.data);

export const unlikeItem = (id, user_id) =>
  api.delete(`/items/${id}/like`, { data: { user_id } }).then(r => r.data);

export const removeItemQuantity = (id, remove) =>
  api.patch(`/items/${id}/quantity`, { remove }).then(r => r.data);

export const increaseItemQuantity = (id, amount = 1) =>
  api.patch(`/items/${id}/increase`, { amount }).then(r => r.data);
