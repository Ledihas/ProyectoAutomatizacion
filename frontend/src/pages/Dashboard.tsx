import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography } from 'antd';
import {
  MessageOutlined,
  TeamOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { DashboardStats, Message, Group } from '../types';
import { evolutionService } from '../services/evolution.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInstances: 0,
    connectedInstances: 0,
    totalGroups: 0,
    totalMessages: 0,
    messagesLastHour: 0,
    evolutionApiStatus: 'offline',
  });

  const { data: instancesData } = useList({
    resource: 'instances',
  });

  const { data: groupsData } = useList({
    resource: 'groups',
    pagination: { pageSize: 5 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const { data: messagesData } = useList<Message>({
    resource: 'messages',
    pagination: { pageSize: 10 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  useEffect(() => {
    const checkEvolutionStatus = async () => {
      const isOnline = await evolutionService.checkStatus();
      setStats(prev => ({ ...prev, evolutionApiStatus: isOnline ? 'online' : 'offline' }));
    };

    checkEvolutionStatus();
    const interval = setInterval(checkEvolutionStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (instancesData?.data) {
      const instances = instancesData.data;
      const connected = instances.filter(i => i.status === 'connected').length;
      setStats(prev => ({
        ...prev,
        totalInstances: instances.length,
        connectedInstances: connected,
      }));
    }
  }, [instancesData]);

  useEffect(() => {
    if (groupsData?.data) {
      setStats(prev => ({ ...prev, totalGroups: groupsData.total || 0 }));
    }
  }, [groupsData]);

  useEffect(() => {
    if (messagesData?.data) {
      const messages = messagesData.data;
      const oneHourAgo = dayjs().subtract(1, 'hour');
      const recentMessages = messages.filter(m =>
        dayjs(m.createdAt).isAfter(oneHourAgo)
      ).length;

      setStats(prev => ({
        ...prev,
        totalMessages: messagesData.total || 0,
        messagesLastHour: recentMessages,
      }));
    }
  }, [messagesData]);

  const messageColumns = [
    {
      title: 'Mensaje',
      dataIndex: 'text',
      key: 'text',
      ellipsis: true,
      width: '40%',
    },
    {
      title: 'Destino',
      dataIndex: 'target',
      key: 'target',
      render: (text: string, record: Message) => (
        <span>
          {text} {record.isGroup && <Tag color="blue">Grupo</Tag>}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          sent: 'success',
          pending: 'processing',
          failed: 'error',
          delivered: 'success',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).fromNow(),
    },
  ];

  const groupColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Estado',
      dataIndex: 'isMember',
      key: 'isMember',
      render: (isMember: boolean) => (
        <Tag color={isMember ? 'success' : 'default'}>
          {isMember ? 'Miembro' : 'No miembro'}
        </Tag>
      ),
    },
    {
      title: 'Unido',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => date ? dayjs(date).fromNow() : '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Panel de Control</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Instancias Totales"
              value={stats.totalInstances}
              prefix={<ApiOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              {stats.connectedInstances} conectadas
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Grupos"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mensajes Enviados"
              value={stats.totalMessages}
              prefix={<MessageOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              {stats.messagesLastHour} en la última hora
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Evolution API"
              value={stats.evolutionApiStatus === 'online' ? 'Online' : 'Offline'}
              valueStyle={{ color: stats.evolutionApiStatus === 'online' ? '#3f8600' : '#cf1322' }}
              prefix={
                stats.evolutionApiStatus === 'online' ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Últimos Mensajes" style={{ height: '100%' }}>
            <Table
              dataSource={messagesData?.data || []}
              columns={messageColumns}
              rowKey="$id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Grupos Recientes" style={{ height: '100%' }}>
            <Table
              dataSource={groupsData?.data || []}
              columns={groupColumns}
              rowKey="$id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
