/*
 * ================================================================================================
 * MODAL AJOUT CONTACT - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour ajouter un nouveau contact selon le modèle .NET backend.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs, Button, Space, Card, Descriptions, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { CreateContactDto, Client, Cabinet } from '../../types';
import { clientService, cabinetService } from '../../services';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

interface AddContactModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateContactDto) => Promise<void>;
  loading?: boolean;
  prefilledClientId?: number; // ID du client pré-sélectionné
  prefilledCabinetId?: number; // ID du cabinet pré-sélectionné
  prefilledContactId?: number; // ID du contact parent pré-sélectionné
}

const AddContactModal: React.FC<AddContactModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  prefilledClientId,
  prefilledCabinetId,
  prefilledContactId
}) => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [emails, setEmails] = useState<{ id: string; value: string }[]>([{ id: crypto.randomUUID(), value: '' }]);
  const [phones, setPhones] = useState<{ id: string; value: string }[]>([{ id: crypto.randomUUID(), value: '' }]);
  const [roles, setRoles] = useState<{ id: string; value: string }[]>([{ id: crypto.randomUUID(), value: '' }]);
  
  // États pour le système de récapitulatif
  const [currentStep, setCurrentStep] = useState<'form' | 'recap'>('form');
  const [formData, setFormData] = useState<any>({});

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
      loadReferenceData();
    }
  }, [visible]);

  // Pré-remplir le formulaire avec les IDs fournis
  useEffect(() => {
    if (visible) {
      const initialValues: any = {};
      
      if (prefilledClientId) {
        initialValues.idClient = prefilledClientId;
      }
      
      if (prefilledCabinetId) {
        initialValues.idCabinet = prefilledCabinetId;
      }
      
      if (prefilledContactId) {
        initialValues.idContact = prefilledContactId;
      }
      
      form.setFieldsValue(initialValues);
    }
  }, [visible, prefilledClientId, prefilledCabinetId, prefilledContactId, form]);

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

  const handleFormSubmit = async (values: any) => {
    // Stocker les données du formulaire et passer au récapitulatif
    setFormData({
      ...values,
      emails: emails.filter(email => email.value.trim() !== '').map(email => email.value),
      phones: phones.filter(phone => phone.value.trim() !== '').map(phone => phone.value),
      roles: roles.filter(role => role.value.trim() !== '').map(role => role.value),
    });
    setCurrentStep('recap');
  };

  const handleFinalSubmit = async () => {
    try {
      const contactData: CreateContactDto = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        role: formData.role,
        idCabinet: formData.idCabinet,
        idClient: formData.idClient,
        emails: formData.emails || [],
        phones: formData.phones || [],
        roles: formData.roles || [],
      };

      await onSubmit(contactData);
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEmails([{ id: crypto.randomUUID(), value: '' }]);
    setPhones([{ id: crypto.randomUUID(), value: '' }]);
    setRoles([{ id: crypto.randomUUID(), value: '' }]);
    setCurrentStep('form');
    setFormData({});
    onCancel();
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
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

  const renderRecapStep = () => (
    <div>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        Récapitulatif de création du contact
      </Title>
      
      <Card title="Informations du contact" style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small">
          <Descriptions.Item label="Nom" span={1}>
            {formData.nom}
          </Descriptions.Item>
          <Descriptions.Item label="Prénom" span={2}>
            {formData.prenom}
          </Descriptions.Item>
          
          {formData.idClient && (
            <Descriptions.Item label="Client" span={3}>
              {clients.find(c => c.id === formData.idClient)?.nomClient}
            </Descriptions.Item>
          )}
          
          {formData.idCabinet && (
            <Descriptions.Item label="Cabinet" span={3}>
              {cabinets.find(c => c.id === formData.idCabinet)?.nomCabinet}
            </Descriptions.Item>
          )}
          
          {formData.emails && formData.emails.length > 0 && (
            <Descriptions.Item label="Emails" span={3}>
              {formData.emails.join(', ')}
            </Descriptions.Item>
          )}
          
          {formData.phones && formData.phones.length > 0 && (
            <Descriptions.Item label="Téléphones" span={3}>
              {formData.phones.join(', ')}
            </Descriptions.Item>
          )}
          
          {formData.roles && formData.roles.length > 0 && (
            <Descriptions.Item label="Rôles" span={3}>
              {formData.roles.join(', ')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );

  return (
    <Modal
      title={currentStep === 'form' ? "Ajouter un nouveau contact" : "Confirmer la création"}
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={
        currentStep === 'form' ? [
          <Button key="cancel" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button key="next" type="primary" onClick={() => form.submit()}>
            Suivant - Récapitulatif
          </Button>
        ] : [
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBackToForm}>
            Retour au formulaire
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading}
            onClick={handleFinalSubmit}
            icon={<CheckCircleOutlined />}
          >
            Créer le contact
          </Button>
        ]
      }
    >
      {currentStep === 'form' ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
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
      ) : (
        renderRecapStep()
      )}
    </Modal>
  );
};

export default AddContactModal;
