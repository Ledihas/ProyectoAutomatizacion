import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, Space, message, Typography, Divider, Modal, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useList, useCreate, useDelete } from '@refinedev/core';
import { useInstances } from '../hooks/useInstances';
import { n8nService } from '../services/n8n.service';
import { Group } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const Groups: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { selectedInstance } = useInstances();

  const { data: groupsData, refetch } = useList<Group>({
    resource: 'groups',
    filters: selectedInstance ? [
      { field: 'instanceId', operator: 'eq', value: selectedInstance.$id }
    ] : [],
  });

  const { mutate: createGroup } = useCreate();
  const { mutate: deleteGroup } = useDelete();

  const handleJoinGroups = async (values: any) => {
    if (!selectedInstance) {
      message.error('Selecciona una instancia primero');
      return;
    }

    if (selectedInstance.status !== 'connected') {
      message.error('La instancia debe estar conectada');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        instance: selectedInstance.name,
        inviteCodes: values.inviteCodes,
      };

      const result = await n8nService.joinGroups(payload);

      values.inviteCodes.forEach((code: string, index: number) => {
        const groupName = `Grupo ${index + 1}`;
        createGroup({
          resource: 'groups',
          values: {
            groupId: code,
            name: groupName,
            inviteCode: code,
            isMember: true,
            instanceId: selectedInstance.$id,
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        });
      });

      message.success(`Unido a ${values.inviteCodes.length} grupos correctamente`);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Error al unirse a grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (groupId: string) => {
    Modal.confirm({
      title: '¿Eliminar grupo?',
      content: 'Esta acción no eliminará el grupo de WhatsApp, solo de tu lista local',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        deleteGroup({
          resource: 'groups',
          id: groupId,
        });
        message.success('Grupo eliminado de la lista');
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
      title: 'Código de Invitación',
      dataIndex: 'inviteCode',
      key: 'inviteCode',
      ellipsis: true,
      render: (text: string) => (
        <Text copyable ellipsis style={{ maxWidth: '200px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'isMember',
      key: 'isMember',
      render: (isMember: boolean) => (
        <Tag color={isMember ? 'success' : 'default'} icon={<TeamOutlined />}>
          {isMember ? 'Miembro' : 'No miembro'}
        </Tag>
      ),
    },
    {
      title: 'Fecha de Unión',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Group) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.$id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Gestión de Grupos</Title>

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Unirse a Nuevos Grupos</Title>
        <Text type="secondary">
          Ingresa los enlaces de invitación de los grupos a los que deseas unirte
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleJoinGroups}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label="Instancia Actual"
            tooltip="La instancia seleccionada en el sidebar se usará automáticamente"
          >
            <Input
              value={selectedInstance?.name || 'Ninguna seleccionada'}
              disabled
              addonAfter={
                <span style={{ color: selectedInstance?.status === 'connected' ? '#52c41a' : '#ff4d4f' }}>
                  {selectedInstance?.status || 'N/A'}
                </span>
              }
            />
          </Form.Item>

          <Form.List name="inviteCodes" initialValue={['']}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="Enlaces de Invitación">
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        rules={[
                          { required: true, message: 'Ingresa un enlace de invitación' },
                          {
                            pattern: /chat\.whatsapp\.com/,
                            message: 'Debe ser un enlace válido de WhatsApp',
                          },
                        ]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input
                          placeholder="https://chat.whatsapp.com/XYZ123ABC..."
                          style={{ width: '100%', minWidth: '500px' }}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: '8px' }}
                  >
                    Agregar Enlace
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<TeamOutlined />}
              size="large"
              disabled={!selectedInstance || selectedInstance.status !== 'connected'}
            >
              Unirse a Grupos
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title={`Grupos de ${selectedInstance?.name || 'la instancia'}`}>
        <Table
          dataSource={groupsData?.data || []}
          columns={columns}
          rowKey="$id"
          loading={!groupsData}
          locale={{
            emptyText: selectedInstance
              ? 'No hay grupos registrados para esta instancia'
              : 'Selecciona una instancia para ver sus grupos',
          }}
        />
      </Card>

      <Card style={{ marginTop: '16px', background: '#e6f7ff', borderColor: '#91d5ff' }}>
        <Title level={5}>Información</Title>
        <ul>
          <li>Solo puedes unirte a grupos si la instancia está conectada</li>
          <li>Puedes agregar múltiples enlaces a la vez</li>
          <li>Los grupos se guardan automáticamente en la base de datos</li>
          <li>Eliminar un grupo de esta lista no te hace salir del grupo en WhatsApp</li>
        </ul>
      </Card>
    </div>
  );
};
