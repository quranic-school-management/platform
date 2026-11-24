import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import Modal from '../components/common/Modal.jsx';
import { ROLE } from '../components/common/format.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import TabBar from './TabBar.jsx';

/** Role layout: sidebar on desktop, app bar + bottom tabs on phones. */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(false);
  const out = async () => { await logout(); navigate('/login', { replace: true }); };
  return (
    <div dir="rtl" className="grid grid-cols-[16rem_1fr] min-h-screen max-md:grid-cols-1 bg-paper text-ink overflow-x-clip">
      <Sidebar user={user} onLogout={out} />
      <Header user={user} onAccount={() => setAccount(true)} />
      <main className="py-6 px-8 w-full max-md:px-4 max-md:pb-24">
        <Outlet />
      </main>
      <TabBar role={user.role} />
      {account && (
        <Modal title="الحساب" onClose={() => setAccount(false)}
          actions={<><button type="button" className="btn btn-primary" onClick={out}>تسجيل الخروج</button><button type="button" className="btn" onClick={() => setAccount(false)}>إغلاق</button></>}>
          <p><strong>{user.name}</strong></p>
          <p className="text-muted text-sm">{ROLE[user.role]}، {user.username}</p>
        </Modal>
      )}
    </div>
  );
}
