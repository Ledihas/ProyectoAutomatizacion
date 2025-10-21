import React from 'react';
import { Layout, Menu, Badge, Button, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Instance } from '../types';

const { Sider } = Layout;

interface InstanceSidebarProps {
  instances: Instance[];
  selectedInstance: Instance | null;
  onSelectInstance: (instance: Instance) => void;
  onCreateInstance: () => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const getStatusIcon = (status: Instance['status']) => {
  switch (status) {
    case 'connected':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'disconnected':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'qr_needed':
      return <QrcodeOutlined style={{ color: '#faad14' }} />;
    case 'connecting':
      return <SyncOutlined spin style={{ color: '#1890ff' }} />;
    case 'error':
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return null;
  }
};

const getStatusText = (status: Instance['status']) => {
  switch (status) {
    case 'connected':
      return 'Conectada';
    case 'disconnected':
      return 'Desconectada';
    case 'qr_needed':
      return 'QR Necesario';
    case 'connecting':
      return 'Conectando...';
    case 'error':
      return 'Error';
    default:
      return 'Desconocido';
  }
};

export const InstanceSidebar: React.FC<InstanceSidebarProps> = ({
  instances,
  selectedInstance,
  onSelectInstance,
  onCreateInstance,
  collapsed,
  onCollapse,
}) => {
  const menuItems = instances.map((instance) => ({
    key: instance.$id,
    icon: getStatusIcon(instance.status),
    label: (
      <Tooltip title={getStatusText(instance.status)} placement="right">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {instance.name}
          </span>
          {instance.phoneNumber && !collapsed && (
            <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
              {instance.phoneNumber}
            </span>
          )}
        </div>
      </Tooltip>
    ),
  }));

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={280}
      style={{
        background: '#001529',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          {collapsed ? 'WA' : 'WhatsApp Auto'}
        </h2>
      </div>

      {!collapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateInstance}
            block
          >
            Nueva Instancia
          </Button>
        </div>
      )}

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedInstance ? [selectedInstance.$id] : []}
        items={menuItems}
        onClick={({ key }) => {
          const instance = instances.find(i => i.$id === key);
          if (instance) {
            onSelectInstance(instance);
          }
        }}
      />

      {!collapsed && instances.length === 0 && (
        <div style={{ padding: '16px', color: '#999', textAlign: 'center' }}>
          No hay instancias creadas
        </div>
      )}
    </Sider>
  );
};
