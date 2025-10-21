import React, { useState } from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedTitleV2,
  useNotificationProvider,
} from '@refinedev/antd';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import routerBindings, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router-v6';
import { dataProvider, liveProvider } from '@refinedev/appwrite';
import { ConfigProvider, App as AntdApp } from 'antd';
import esES from 'antd/locale/es_ES';
import '@refinedev/antd/dist/reset.css';

import {
  DashboardOutlined,
  SendOutlined,
  TeamOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { appwriteClient, account, DATABASE_ID } from './providers/appwrite';
import { InstanceSidebar } from './components/InstanceSidebar';
import { useInstances } from './hooks/useInstances';

import { Dashboard } from './pages/Dashboard';
import { SendMessages } from './pages/SendMessages';
import { Groups } from './pages/Groups';
import { Instances } from './pages/Instances';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { instances, selectedInstance, switchInstance } = useInstances();

  return (
    <div style={{ display: 'flex' }}>
      <InstanceSidebar
        instances={instances}
        selectedInstance={selectedInstance}
        onSelectInstance={switchInstance}
        onCreateInstance={() => {}}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />
      <div style={{ marginLeft: collapsed ? 80 : 280, width: '100%', transition: 'all 0.2s' }}>
        <ThemedLayoutV2
          Title={({ collapsed }) => (
            <ThemedTitleV2
              collapsed={collapsed}
              text="WhatsApp Automation"
            />
          )}
        >
          <Outlet />
        </ThemedLayoutV2>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider locale={esES}>
          <AntdApp>
            <Refine
              dataProvider={dataProvider(appwriteClient, {
                databaseId: DATABASE_ID,
              })}
              liveProvider={liveProvider(appwriteClient, {
                databaseId: DATABASE_ID,
              })}
              authProvider={{
                login: async ({ email, password }) => {
                  try {
                    await account.createEmailPasswordSession(email, password);
                    return { success: true, redirectTo: '/' };
                  } catch (error) {
                    return {
                      success: false,
                      error: {
                        name: 'LoginError',
                        message: 'Credenciales inválidas',
                      },
                    };
                  }
                },
                logout: async () => {
                  try {
                    await account.deleteSession('current');
                    return { success: true, redirectTo: '/login' };
                  } catch (error) {
                    return { success: false };
                  }
                },
                check: async () => {
                  try {
                    const session = await account.get();
                    if (session) {
                      return { authenticated: true };
                    }
                    return { authenticated: false, redirectTo: '/login' };
                  } catch (error) {
                    return { authenticated: false, redirectTo: '/login' };
                  }
                },
                getIdentity: async () => {
                  try {
                    const user = await account.get();
                    return {
                      id: user.$id,
                      name: user.name,
                      email: user.email,
                    };
                  } catch (error) {
                    return null;
                  }
                },
                onError: async (error) => {
                  console.error(error);
                  return { error };
                },
              }}
              notificationProvider={useNotificationProvider}
              routerProvider={routerBindings}
              resources={[
                {
                  name: 'dashboard',
                  list: '/',
                  meta: {
                    label: 'Panel',
                    icon: <DashboardOutlined />,
                  },
                },
                {
                  name: 'send-messages',
                  list: '/send-messages',
                  meta: {
                    label: 'Enviar Mensajes',
                    icon: <SendOutlined />,
                  },
                },
                {
                  name: 'groups',
                  list: '/groups',
                  meta: {
                    label: 'Grupos',
                    icon: <TeamOutlined />,
                  },
                },
                {
                  name: 'instances',
                  list: '/instances',
                  meta: {
                    label: 'Instancias',
                    icon: <ApiOutlined />,
                  },
                },
                {
                  name: 'admin',
                  list: '/admin',
                  meta: {
                    label: 'Administración',
                    icon: <SettingOutlined />,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                liveMode: 'auto',
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}>
                      <AppLayout />
                    </Authenticated>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="/send-messages" element={<SendMessages />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/instances" element={<Instances />} />
                  <Route path="/admin" element={<Admin />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="auth" fallback={<Outlet />}>
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
