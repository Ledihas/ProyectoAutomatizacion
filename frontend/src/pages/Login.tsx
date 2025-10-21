import React from 'react';
import { useLogin } from '@refinedev/core';
import { Form, Input, Button, Card, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();

  const handleSubmit = (values: { email: string; password: string }) => {
    login(values);
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>WhatsApp Automation</Title>
          <Text type="secondary">Automatiza tus mensajes de WhatsApp</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Ingresa tu email' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              block
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f0f2f5', borderRadius: '4px' }}>
          <Text strong>Credenciales de Admin:</Text>
          <br />
          <Text type="secondary">Usuario: zaza@admin.com</Text>
          <br />
          <Text type="secondary">Password: -bsR266./GViaL</Text>
        </div>
      </Card>
    </Layout>
  );
};
