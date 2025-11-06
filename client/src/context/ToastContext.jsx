import { createContext, useContext, useState, useCallback } from 'react';
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type='success') => {
    const id = Date.now();
    setToasts(t=>[...t, { id, msg, type }]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="position-fixed end-0 bottom-0 p-3" style={{ zIndex: 1080 }}>
        {toasts.map(t=>(
          <div key={t.id} className={`toast show text-bg-${t.type} mb-2`}>
            <div className="toast-body">{t.msg}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
