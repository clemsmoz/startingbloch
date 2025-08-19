/*
 * ================================================================================================
 * MODAL ÉDITION CONTACT - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour éditer un contact existant selon le modèle .NET backend.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs, Button, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UpdateContactDto, Contact, Client, Cabinet } from '../../types';
import { clientService, cabinetService } from '../../services';

const { Option } = Select;
const { TabPane } = Tabs;

interface EditContactModalProps {
  visible: boolean;
  contact: Contact | null;
  onCancel: () => void;
  onSubmit: (values: UpdateContactDto) => Promise<void>;
  loading?: boolean;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  visible,
  contact,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [emails, setEmails] = useState<{ id: string; value: string }[]>([]);
  const [phones, setPhones] = useState<{ id: string; value: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; value: string }[]>([]);

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
      loadReferenceData();
    }
  }, [visible]);

  // Initialiser le formulaire avec les données du contact
  useEffect(() => {
    if (contact && visible) {
      form.setFieldsValue({
        nom: contact.nom,
        prenom: contact.prenom,
        email: contact.email,
        telephone: contact.telephone,
        role: contact.role,
        idClient: contact.idClient,
        idCabinet: contact.idCabinet,
      });

      // Initialiser les collections
      setEmails(
        contact.emails?.length > 0 
          ? contact.emails.map(email => ({ 
              id: crypto.randomUUID(), 
              value: typeof email === 'string' ? email : email.email || '' 
            }))
          : [{ id: crypto.randomUUID(), value: '' }]
      );
      setPhones(
        contact.phones?.length > 0 
          ? contact.phones.map(phone => ({ 
              id: crypto.randomUUID(), 
              value: typeof phone === 'string' ? phone : phone.numero || '' 
            }))
          : [{ id: crypto.randomUUID(), value: '' }]
      );
      setRoles(
        contact.roles?.length > 0 
          ? contact.roles.map(role => ({ 
              id: crypto.randomUUID(), 
              value: typeof role === 'string' ? role : role.role || '' 
            }))
          : [{ id: crypto.randomUUID(), value: '' }]
      );
    }
  }, [contact, visible, form]);

  const loadReferenceData = async () => {
    try {
      const clientsResponse = await clientService.getAll();
      if (clientsResponse.success) setClients(clientsResponse.data || []);
      
      const storedUser = sessionStorage.getItem('startingbloch_user');
      const role = storedUser ? (JSON.parse(storedUser).role || '').toLowerCase() : '';
      const cabinetsResponse = role === 'client' ? await (async () => {
        const r = await cabinetService.getMine();
        return { success: r.success, data: r.data } as any;
      })() : await cabinetService.getAll();
  if (cabinetsResponse.success) setCabinets(cabinetsResponse.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    }
  };

  const handleFinish = async (values: any) => {
    if (!contact) return;
    
    try {
      const contactData: UpdateContactDto = {
        id: contact.id,
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        telephone: values.telephone,
        role: values.role,
        idCabinet: values.idCabinet,
        idClient: values.idClient,
        emails: emails.filter(email => email.value.trim() !== '').map(email => email.value),
        phones: phones.filter(phone => phone.value.trim() !== '').map(phone => phone.value),
        roles: roles.filter(role => role.value.trim() !== '').map(role => role.value),
      };

      await onSubmit(contactData);
      form.resetFields();
      setEmails([{ id: crypto.randomUUID(), value: '' }]);
      setPhones([{ id: crypto.randomUUID(), value: '' }]);
      setRoles([{ id: crypto.randomUUID(), value: '' }]);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEmails([{ id: crypto.randomUUID(), value: '' }]);
    setPhones([{ id: crypto.randomUUID(), value: '' }]);
    setRoles([{ id: crypto.randomUUID(), value: '' }]);
    onCancel();
  };

  // Fonctions pour gérer les emails multiples
  const addEmail = () => setEmails([...emails, { id: crypto.randomUUID(), value: '' }]);
  const removeEmail = (id: string) => {
    const newEmails = emails.filter(email => email.id !== id);
    setEmails(newEmails.length === 0 ? [{ id: crypto.randomUUID(), value: '' }] : newEmails);
  };
  const updateEmail = (id: string, value: string) => {
    const newEmails = emails.map(email => 
      email.id === id ? { ...email, value } : email
    );
    setEmails(newEmails);
  };

  // Fonctions pour gérer les téléphones multiples
  const addPhone = () => setPhones([...phones, { id: crypto.randomUUID(), value: '' }]);
  const removePhone = (id: string) => {
    const newPhones = phones.filter(phone => phone.id !== id);
    setPhones(newPhones.length === 0 ? [{ id: crypto.randomUUID(), value: '' }] : newPhones);
  };
  const updatePhone = (id: string, value: string) => {
    const newPhones = phones.map(phone => 
      phone.id === id ? { ...phone, value } : phone
    );
    setPhones(newPhones);
  };

  // Fonctions pour gérer les rôles multiples
  const addRole = () => setRoles([...roles, { id: crypto.randomUUID(), value: '' }]);
  const removeRole = (id: string) => {
    const newRoles = roles.filter(role => role.id !== id);
    setRoles(newRoles.length === 0 ? [{ id: crypto.randomUUID(), value: '' }] : newRoles);
  };
  const updateRole = (id: string, value: string) => {
    const newRoles = roles.map(role => 
      role.id === id ? { ...role, value } : role
    );
    setRoles(newRoles);
  };

  return (
    <Modal
      title={`Modifier le contact ${contact?.prenom} ${contact?.nom}`}
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
                  name="prenom"
                  label="Prénom"
                  rules={[
                    { max: 100, message: 'Le prénom ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Prénom du contact"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nom"
                  label="Nom"
                  rules={[
                    { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nom de famille du contact"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email principal"
                  rules={[
                    { type: 'email', message: 'Format d\'email invalide' },
                    { max: 100, message: 'L\'email ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="contact@example.com"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telephone"
                  label="Téléphone principal"
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

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="role"
                  label="Rôle principal"
                  rules={[
                    { max: 100, message: 'Le rôle ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input
                    prefix={<TeamOutlined />}
                    placeholder="Ex: Directeur PI, Assistant juridique"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Organisation" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="idClient"
                  label="Client associé"
                  tooltip="Lier le contact à une organisation cliente"
                >
                  <Select
                    placeholder="Sélectionner un client"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {clients.map(client => (
                      <Option key={client.id} value={client.id}>
                        {client.nomClient}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="idCabinet"
                  label="Cabinet associé"
                  tooltip="Lier le contact à un cabinet d'avocats"
                >
                  <Select
                    placeholder="Sélectionner un cabinet"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                  >
                    {cabinets.map(cabinet => (
                      <Option key={cabinet.id} value={cabinet.id}>
                        {cabinet.nomCabinet}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Emails" key="3">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={addEmail}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Ajouter un email
              </Button>
            </div>

            {emails.map((email) => (
              <div key={email.id} style={{ marginBottom: 8 }}>
                <Space.Compact style={{ display: 'flex' }}>
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="email@example.com"
                    value={email.value}
                    onChange={(e) => updateEmail(email.id, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {emails.length > 1 && (
                    <Button 
                      type="text" 
                      danger
                      onClick={() => removeEmail(email.id)}
                      icon={<DeleteOutlined />}
                    />
                  )}
                </Space.Compact>
              </div>
            ))}
          </TabPane>

          <TabPane tab="Téléphones" key="4">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={addPhone}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Ajouter un téléphone
              </Button>
            </div>

            {phones.map((phone) => (
              <div key={phone.id} style={{ marginBottom: 8 }}>
                <Space.Compact style={{ display: 'flex' }}>
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+33 1 23 45 67 89"
                    value={phone.value}
                    onChange={(e) => updatePhone(phone.id, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {phones.length > 1 && (
                    <Button 
                      type="text" 
                      danger
                      onClick={() => removePhone(phone.id)}
                      icon={<DeleteOutlined />}
                    />
                  )}
                </Space.Compact>
              </div>
            ))}
          </TabPane>

          <TabPane tab="Rôles" key="5">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={addRole}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Ajouter un rôle
              </Button>
            </div>

            {roles.map((role) => (
              <div key={role.id} style={{ marginBottom: 8 }}>
                <Space.Compact style={{ display: 'flex' }}>
                  <Input
                    prefix={<TeamOutlined />}
                    placeholder="Ex: Inventeur, Titulaire, Déposant"
                    value={role.value}
                    onChange={(e) => updateRole(role.id, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {roles.length > 1 && (
                    <Button 
                      type="text" 
                      danger
                      onClick={() => removeRole(role.id)}
                      icon={<DeleteOutlined />}
                    />
                  )}
                </Space.Compact>
              </div>
            ))}
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default EditContactModal;
