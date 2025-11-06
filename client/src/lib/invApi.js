import api from './api';

export const fetchLatest = () => api.get('/inventories/latest').then(r => r.data);
export const fetchTop5 = () => api.get('/inventories/top5').then(r => r.data);
export const fetchInventories = (params) => api.get('/inventories', { params }).then(r => r.data);
export const createInventory = (payload) => api.post('/inventories', payload).then(r => r.data);

// get single inventory (also read ETag)
export const getInventory = async (id) => {
  const res = await api.get(`/inventories/${id}`);
  return { data: res.data, etag: res.headers.etag };
};

// update inventory with optimistic lock
export const updateInventory = async (id, payload, version) => {
  const res = await api.patch(`/inventories/${id}`, payload, {
    headers: { 'If-Match': String(version) }
  });
  return { data: res.data, etag: res.headers.etag };
};

export const fetchDiscussion = (inventoryId) =>
  api.get(`/inventories/${inventoryId}/posts`).then(r => r.data);

export const createDiscussionPost = (inventoryId, body_md, user_id) =>
  api.post(`/inventories/${inventoryId}/posts`, { body_md, user_id }).then(r => r.data);
