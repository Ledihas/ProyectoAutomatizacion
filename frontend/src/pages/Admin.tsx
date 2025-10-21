import React, { useState, useEffect } from 'react';
import { Card, Table, Tabs, Button, Tag, Modal, message, Typography, Space, Statistic, Row, Col } from 'antd';
import {
  ExclamationCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useList, useDelete } from '@refinedev/core';
import { SystemLog, UserFeedback } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const Admin: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const { data: logsData, refetch: refetchLogs } = useList<SystemLog>({
    resource: 'system_logs',
    pagination: { pageSize: 50 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const { data: feedbackData, refetch: refetchFeedback } = useList<UserFeedback>({
    resource: 'user_feedback',
    pagination: { pageSize: 50 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const { mutate: deleteFeedback } = useDelete();

  useEffect(() => {
    const mockSessions = [
      {
        id: '1',
        email: 'user1@example.com',
        loginAt: new Date().toISOString(),
        ip: '192.168.1.100',
      },
      {
        id: '2',
        email: 'user2@example.com',
        loginAt: dayjs().subtract(30, 'minutes').toISOString(),
        ip: '192.168.1.101',
      },
    ];
    setActiveSessions(mockSessions);
  }, []);

  const handleKickSession = (sessionId: string) => {
    Modal.confirm({
      title: '¿Expulsar sesión?',
      icon: <ExclamationCircleOutlined />,
      content: 'El usuario será desconectado inmediatamente',
      okText: 'Expulsar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
        message.success('Sesión expulsada');
      },
    });
  };

  const logColumns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const colors = {
          error: 'error',
          warning: 'warning',
          info: 'default',
          success: 'success',
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Mensaje',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Detalles',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
  ];

  const feedbackColumns = [
    {
      title: 'Usuario',
      dataIndex: 'userId',
      key: 'userId',
      ellipsis: true,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const colors = {
          bug: 'error',
          feature: 'processing',
          improvement: 'warning',
          other: 'default',
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      },
    },
    {
      title: 'Mensaje',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors = {
          new: 'blue',
          reviewing: 'orange',
          resolved: 'green',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  const sessionColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Inicio de Sesión',
      dataIndex: 'loginAt',
      key: 'loginAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          danger
          size="small"
          icon={<LogoutOutlined />}
          onClick={() => handleKickSession(record.id)}
        >
          Expulsar
        </Button>
      ),
    },
  ];

  const errorLogs = logsData?.data?.filter(log => log.type === 'error') || [];
  const totalLogs = logsData?.total || 0;
  const totalFeedback = feedbackData?.total || 0;
  const unreadFeedback = feedbackData?.data?.filter(f => f.status === 'new').length || 0;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Panel de Administración</Title>
      <Text type="secondary">Usuario: zaza (Administrador)</Text>

      <Row gutter={[16, 16]} style={{ marginTop: '24px', marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Errores Registrados"
              value={errorLogs.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Logs Totales"
              value={totalLogs}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sesiones Activas"
              value={activeSessions.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Feedback Nuevo"
              value={unreadFeedback}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="logs">
          <TabPane tab="Logs del Sistema" key="logs">
            <Space style={{ marginBottom: '16px' }}>
              <Button onClick={() => refetchLogs()}>Actualizar</Button>
            </Space>
            <Table
              dataSource={logsData?.data || []}
              columns={logColumns}
              rowKey="$id"
              loading={!logsData}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Sesiones Activas" key="sessions">
            <Table
              dataSource={activeSessions}
              columns={sessionColumns}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Feedback de Usuarios" key="feedback">
            <Space style={{ marginBottom: '16px' }}>
              <Button onClick={() => refetchFeedback()}>Actualizar</Button>
            </Space>
            <Table
              dataSource={feedbackData?.data || []}
              columns={feedbackColumns}
              rowKey="$id"
              loading={!feedbackData}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Últimos Errores" key="errors">
            <Table
              dataSource={errorLogs}
              columns={logColumns}
              rowKey="$id"
              pagination={{ pageSize: 20 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Card style={{ marginTop: '16px', background: '#fff7e6', borderColor: '#ffd666' }}>
        <Title level={5}>Permisos de Administrador</Title>
        <ul>
          <li>Ver y analizar todos los logs del sistema</li>
          <li>Gestionar sesiones activas de usuarios</li>
          <li>Revisar feedback y reportes de usuarios</li>
          <li>Acceso completo a la base de datos (excepto contraseñas)</li>
          <li>Expulsar usuarios conectados si es necesario</li>
        </ul>
      </Card>
    </div>
  );
};
