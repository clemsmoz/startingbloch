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
  const [pays] = useState<Pays[]>([]); // TODO: Charger depuis un service si nécessaire

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
      title={`Modifier le client ${client?.nomClient}`}
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
          <TabPane tab="Informations générales" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nomClient"
                  label="Nom du client"
                  rules={[
                    { required: true, message: 'Le nom du client est obligatoire' },
                    { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nom de l'organisation"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="referenceClient"
                  label="Référence client"
                  rules={[
                    { max: 100, message: 'La référence ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input
                    prefix={<FileTextOutlined />}
                    placeholder="Ex: CLI-001"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Coordonnées" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="emailClient"
                  label="Email"
                  rules={[
                    { type: 'email', message: 'Format d\'email invalide' },
                    { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="client@example.com"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telephoneClient"
                  label="Téléphone"
                  rules={[
                    { max: 50, message: 'Le téléphone ne peut pas dépasser 50 caractères' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+33 1 23 45 67 89"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Adresse" key="3">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="adresseClient"
                  label="Adresse complète"
                  rules={[
                    { max: 500, message: 'L\'adresse ne peut pas dépasser 500 caractères' }
                  ]}
                >
                  <Input.TextArea
                    placeholder="Adresse complète du client"
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
                  label="Code postal"
                  rules={[
                    { max: 20, message: 'Le code postal ne peut pas dépasser 20 caractères' }
                  ]}
                >
                  <Input
                    placeholder="75001"
                    maxLength={20}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paysClient"
                  label="Pays"
                >
                  <Select
                    placeholder="Sélectionner un pays"
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

          {/* Onglet Permissions : uniquement pour les clients avec compte utilisateur */}
          {client?.canRead !== undefined && (
            <TabPane tab="Permissions" key="4">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="canWrite"
                    label="Autorisation d'écriture"
                    valuePropName="checked"
                    tooltip="Permet au client de créer et modifier des brevets"
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
                    label="Autorisation de lecture"
                    valuePropName="checked"
                    tooltip="Permet au client de consulter les brevets"
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
                    label="Compte bloqué"
                    valuePropName="checked"
                    tooltip="Bloque complètement l'accès du client"
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
