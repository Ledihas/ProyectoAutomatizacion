import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, Space, Switch, message, Typography, Divider, Row, Col } from 'antd';
import { SendOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useInstances } from '../hooks/useInstances';
import { n8nService } from '../services/n8n.service';
import { useCreate } from '@refinedev/core';

const { TextArea } = Input;
const { Title, Text } = Typography;

export const SendMessages: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const { instances, selectedInstance } = useInstances();
  const { mutate: createMessage } = useCreate();

  const handleSubmit = async (values: any) => {
    if (!selectedInstance) {
      message.error('Selecciona una instancia primero');
      return;
    }

    if (selectedInstance.status !== 'connected') {
      message.error('La instancia debe estar conectada para enviar mensajes');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        instance: selectedInstance.name,
        messages: values.messages,
        targets: values.targets,
        isGroup: isGroup,
        delayMin: values.delayMin || 5,
        delayMax: values.delayMax || 10,
      };

      await n8nService.sendMessages(payload);

      values.messages.forEach((msg: string) => {
        values.targets.forEach((target: string) => {
          createMessage({
            resource: 'messages',
            values: {
              text: msg,
              target: target,
              isGroup: isGroup,
              instanceId: selectedInstance.$id,
              status: 'sent',
              sentAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          });
        });
      });

      message.success('Mensajes enviados correctamente');
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Error al enviar mensajes');

      const logError = {
        type: 'error',
        message: 'Error al enviar mensajes',
        details: error.message,
        instanceId: selectedInstance.$id,
        createdAt: new Date().toISOString(),
      };

      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logError),
        });
      } catch (e) {
        console.error('Error al registrar log:', e);
      }

      setTimeout(() => {
        message.info('Se reintentará automáticamente en 5 minutos');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const connectedInstances = instances.filter(i => i.status === 'connected');

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Title level={2}>Enviar Mensajes</Title>

      {connectedInstances.length === 0 && (
        <Card style={{ marginBottom: '16px', background: '#fff3cd', borderColor: '#ffc107' }}>
          <Text>No hay instancias conectadas. Por favor, conecta una instancia primero.</Text>
        </Card>
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            delayMin: 5,
            delayMax: 10,
          }}
        >
          <Form.Item
            label="Instancia"
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

          <Form.Item
            label="Tipo de Envío"
            tooltip="Selecciona si vas a enviar a números directos o grupos"
          >
            <Switch
              checked={isGroup}
              onChange={setIsGroup}
              checkedChildren="Grupos"
              unCheckedChildren="Números"
            />
            <Text style={{ marginLeft: '12px', color: '#999' }}>
              {isGroup ? 'Enviando a grupos' : 'Enviando a números directos'}
            </Text>
          </Form.Item>

          <Form.List name="messages" initialValue={['']}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="Mensajes (se elegirá uno al azar)">
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        rules={[{ required: true, message: 'Ingresa un mensaje' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <TextArea
                          placeholder={`Mensaje ${index + 1}`}
                          rows={3}
                          style={{ width: '100%', minWidth: '400px' }}
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
                    Agregar Mensaje
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.List name="targets" initialValue={['']}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item label={isGroup ? 'Códigos de Invitación o IDs de Grupo' : 'Números de Teléfono'}>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        rules={[{ required: true, message: 'Ingresa un destino' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input
                          placeholder={isGroup ? 'https://chat.whatsapp.com/... o ID' : '+1234567890'}
                          style={{ width: '100%', minWidth: '400px' }}
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
                    Agregar Destino
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />

          <Title level={5}>Control de Tiempo entre Mensajes</Title>
          <Text type="secondary">
            Para evitar bloqueos, configura un intervalo aleatorio entre cada envío
          </Text>

          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Form.Item
                label="Retraso Mínimo (segundos)"
                name="delayMin"
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <InputNumber min={1} max={60} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Retraso Máximo (segundos)"
                name="delayMax"
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <InputNumber min={1} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
              block
              disabled={!selectedInstance || selectedInstance.status !== 'connected'}
            >
              Enviar Mensajes
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: '16px', background: '#e6f7ff', borderColor: '#91d5ff' }}>
        <Title level={5}>Guía de Uso</Title>
        <ul>
          <li>Asegúrate de tener una instancia conectada antes de enviar mensajes</li>
          <li>Puedes agregar múltiples mensajes - se elegirá uno al azar para cada destinatario</li>
          <li>Los retrasos entre mensajes ayudan a evitar bloqueos de WhatsApp</li>
          <li>Para grupos, puedes usar el enlace de invitación completo o solo el código</li>
        </ul>
      </Card>
    </div>
  );
};
