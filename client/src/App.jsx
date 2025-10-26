import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import ApiStatus from './components/ApiStatus';

export default function App() {
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Inventory App</h1>
        <ApiStatus />
      </div>

      <p>Welcome! This is your React + Bootstrap frontend.</p>
    </div>
  );
}
