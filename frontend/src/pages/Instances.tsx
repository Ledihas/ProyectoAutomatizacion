import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Tag, QRCode, Space } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useList, useCreate, useUpdate, useDelete } from '@refinedev/core';
import { Instance } from '../types';
import { evolutionService } from '../services/evolution.service';
import dayjs from 'dayjs';

export const Instances: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { data, refetch } = useList<Instance>({
    resource: 'instances',
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const { mutate: createInstance } = useCreate();
  const { mutate: updateInstance } = useUpdate();
  const { mutate: deleteInstance } = useDelete();

  const handleCreate = async (values: any) => {
    setLoading(true);
    try {
      const result = await evolutionService.createInstance(values.name);

      createInstance({
        resource: 'instances',
        values: {
          name: values.name,
          status: 'qr_needed',
          qrCode: result.qrcode?.base64 || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      message.success('Instancia creada correctamente');
      setCreateModalVisible(false);
      form.resetFields();

      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error: any) {
      message.error(error.message || 'Error al crear instancia');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = async (instance: Instance) => {
    setLoading(true);
    setSelectedInstance(instance);
    setQrModalVisible(true);

    try {
      const qr = await evolutionService.getInstanceQR(instance.name);
      setQrCode(qr);
    } catch (error: any) {
      message.error(error.message || 'Error al obtener código QR');
      setQrModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async (instance: Instance) => {
    try {
      const status = await evolutionService.getInstanceStatus(instance.name);

      const newStatus = status.state === 'open' ? 'connected' :
                        status.state === 'close' ? 'disconnected' : 'qr_needed';

      updateInstance({
        resource: 'instances',
        id: instance.$id,
        values: {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...(newStatus === 'connected' && { lastConnectedAt: new Date().toISOString() }),
        },
      });

      message.success('Estado actualizado');
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Error al actualizar estado');
    }
  };

  const handleDelete = (instance: Instance) => {
    Modal.confirm({
      title: '¿Eliminar instancia?',
      content: 'Esta acción eliminará la instancia de Evolution API y no se puede deshacer',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await evolutionService.deleteInstance(instance.name);
          deleteInstance({
            resource: 'instances',
            id: instance.$id,
          });
          message.success('Instancia eliminada');
        } catch (error: any) {
          message.error(error.message || 'Error al eliminar instancia');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Número',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text: string) => text || '-',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: Instance['status']) => {
        const colors = {
          connected: 'success',
          disconnected: 'error',
          qr_needed: 'warning',
          connecting: 'processing',
          error: 'error',
        };
        const labels = {
          connected: 'Conectada',
          disconnected: 'Desconectada',
          qr_needed: 'QR Necesario',
          connecting: 'Conectando...',
          error: 'Error',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Última Conexión',
      dataIndex: 'lastConnectedAt',
      key: 'lastConnectedAt',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Creada',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Instance) => (
        <Space>
          {(record.status === 'qr_needed' || record.status === 'disconnected') && (
            <Button
              type="primary"
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => handleShowQR(record)}
            >
              Ver QR
            </Button>
          )}
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleRefreshStatus(record)}
          >
            Actualizar
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Instancias de WhatsApp"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Nueva Instancia
          </Button>
        }
      >
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="$id"
          loading={!data}
        />
      </Card>

      <Modal
        title="Crear Nueva Instancia"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Nombre de la Instancia"
            name="name"
            rules={[
              { required: true, message: 'Ingresa un nombre' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Solo letras, números, guiones y guión bajo' },
            ]}
          >
            <Input placeholder="mi-whatsapp-1" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Crear Instancia
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Código QR - ${selectedInstance?.name}`}
        open={qrModalVisible}
        onCancel={() => {
          setQrModalVisible(false);
          setQrCode('');
        }}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="refresh"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => selectedInstance && handleShowQR(selectedInstance)}
          >
            Actualizar QR
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {qrCode ? (
            <>
              <QRCode value={qrCode} size={300} />
              <p style={{ marginTop: '20px', color: '#999' }}>
                Escanea este código QR con WhatsApp para conectar la instancia
              </p>
            </>
          ) : (
            <p>Cargando código QR...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
