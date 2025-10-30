/*
 * ================================================================================================
 * MODAL ÉDITION CLIENT - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour éditer un client existant selon le modèle .NET backend.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs, Switch } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, FileTextOutlined, LockOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import type { UpdateClientDto, Client, Pays } from '../../types';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { TabPane } = Tabs;

interface EditClientModalProps {
  visible: boolean;
  client: Client | null;
  onCancel: () => void;
  onSubmit: (values: UpdateClientDto) => Promise<void>;
  loading?: boolean;
}

const EditClientModal: React.FC<EditClientModalProps> = ({
  visible,
  client,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
    const [pays] = useState<Pays[]>([]);
  const { t } = useTranslation();

  // Initialiser le formulaire avec les données du client
  useEffect(() => {
    if (client && visible) {
      form.setFieldsValue({
        nomClient: client.nomClient,
        referenceClient: client.referenceClient,
        adresseClient: client.adresseClient,
        codePostal: client.codePostal,
        paysClient: client.paysClient,
        emailClient: client.emailClient,
        telephoneClient: client.telephoneClient,
        canWrite: client.canWrite,
        canRead: client.canRead,
        isBlocked: client.isBlocked,
      });
    }
  }, [client, visible, form]);

  const handleFinish = async (values: any) => {
    if (!client) return;
    
    try {
      const clientData: UpdateClientDto = {
        id: client.id,
        nomClient: values.nomClient,
        referenceClient: values.referenceClient,
        adresseClient: values.adresseClient,
        codePostal: values.codePostal,
        paysClient: values.paysClient,
        emailClient: values.emailClient,
        telephoneClient: values.telephoneClient,
        canWrite: values.canWrite,
        canRead: values.canRead,
        isBlocked: values.isBlocked,
      };

      await onSubmit(clientData);
      form.resetFields();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('clients.modals.edit.title', { name: client?.nomClient })}
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
      <Tabs defaultActiveKey="1">
  <TabPane tab={t('clients.modals.edit.tabs.general')} key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nomClient"
                    label={t('clients.fields.name')}
                  rules={[
                      { max: 255, message: t('clients.validation.nameMax') }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                      placeholder={t('clients.modals.edit.placeholders.name')}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="referenceClient"
                    label={t('clients.fields.reference')}
                    rules={[
                      { max: 100, message: t('clients.validation.referenceMax') }
                    ]}
                >
                  <Input
                    prefix={<FileTextOutlined />}
                      placeholder={t('clients.modals.edit.placeholders.reference')}
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={t('clients.modals.edit.tabs.contact')} key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="emailClient"
                  label={t('clients.fields.email')}
                  rules={[
                    { type: 'email', message: t('clients.validation.emailInvalid') },
                    { max: 255, message: t('clients.validation.emailMax') }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder={t('clients.modals.edit.placeholders.email')}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telephoneClient"
                  label={t('clients.fields.phone')}
                  rules={[
                    { max: 50, message: t('clients.validation.phoneMax') }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={t('clients.modals.edit.placeholders.phone')}
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={t('clients.modals.edit.tabs.address')} key="3">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="adresseClient"
                  label={t('clients.fields.address')}
                  rules={[
                    { max: 500, message: t('clients.validation.addressMax') }
                  ]}
                >
                  <Input.TextArea
                    placeholder={t('clients.modals.edit.placeholders.address')}
                    maxLength={500}
                    rows={3}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="codePostal"
                  label={t('clients.fields.postalCode')}
                  rules={[
                    { max: 20, message: t('clients.validation.postalCodeMax') }
                  ]}
                >
                  <Input
                    placeholder={t('clients.modals.edit.placeholders.postal')}
                    maxLength={20}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paysClient"
                  label={t('clients.fields.country')}
                >
                  <Select
                    placeholder={t('clients.modals.edit.placeholders.country')}
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {pays.map(p => (
                      <Option key={p.id} value={p.nom}>
                        {p.nom}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          {client?.canRead !== undefined && (
            <TabPane tab={t('clients.modals.edit.permissions')} key="4">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="canWrite"
                    label={t('clients.modals.edit.labels.canWrite')}
                    valuePropName="checked"
                    tooltip={t('clients.modals.edit.tooltips.canWrite')}
                  >
                    <Switch
                      checkedChildren={<LockOutlined />}
                      unCheckedChildren={<LockOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="canRead"
                    label={t('clients.modals.edit.labels.canRead')}
                    valuePropName="checked"
                    tooltip={t('clients.modals.edit.tooltips.canRead')}
                  >
                    <Switch
                      checkedChildren={<EyeOutlined />}
                      unCheckedChildren={<EyeOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="isBlocked"
                    label={t('clients.modals.edit.labels.isBlocked')}
                    valuePropName="checked"
          tooltip={t('clients.modals.edit.tooltips.isBlocked')}
                  >
                    <Switch
                      checkedChildren={<StopOutlined />}
                      unCheckedChildren={<StopOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          )}
        </Tabs>
      </Form>
    </Modal>
  );
};

export default EditClientModal;
