import React from 'react';
import { Routes, Route } from 'react-router';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './Component/Pages/Home';
import Login from './Component/Authentication/login';
import Register from './Component/Authentication/register';
import Dashboard from './Component/Pages/Dashboard';
import Inventories from './Component/Pages/Inventories';
import Layout from './Component/Lyout/Layout';
import InventoryDetailPage from './Component/Pages/InventoryDetailPage';
import AdminSetup from './Component/Authentication/AdminSetup';
import AdminDashboard from './Component/Pages/AdminDashboard';
import CreateInventory from './Component/Pages/CreateInventory';
import EditInventory from './Component/Pages/EditInventory';
import ItemFormPage from './Component/Pages/ItemFormPage';
import ItemDetail from './Component/Pages/ItemDetail';
import ItemForm from './Component/Pages/ItemForm';

function App() {
  return (
    <Layout>
      <Routes>
      <Route path="/admin/setup" element={<AdminSetup />} />
<Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventories" element={<Inventories />} />
        <Route path="*" element={<NotFound />} />
<Route path="/inventories/:id" element={<InventoryDetailPage />} />
<Route path="/inventories/new" element={<CreateInventory />} />
<Route path="/inventories/:id/edit" element={<EditInventory />} />
<Route path="/inventories/:inventoryId/items/:itemId" element={<ItemDetail />} />
<Route path="/inventories/:inventoryId/items/:itemId/edit" element={<ItemFormPage />} />
<Route path="/inventories/:id/items/new" element={<ItemForm />} />
<Route path="/inventories/:id/items/:itemId/edit" element={<ItemForm />} />

      </Routes>
    </Layout>
  );
}

// Simple 404 component
const NotFound = () => {
  return (
    <div className="text-center py-5">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
};

export default App;