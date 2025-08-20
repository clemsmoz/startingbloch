/*
 * ================================================================================================
 * MODAL AJOUT CLIENT - STARTINGBLOCH
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Switch, Tabs, Button, Card, Descriptions, Tag, Divider, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, NumberOutlined, LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { CreateClientDto, Pays } from '../../types';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface AddClientModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateClientDto, hasUserAccount: boolean) => Promise<void>;
  loading?: boolean;
}

// (interface UserAccountData supprimée car non utilisée)

const AddClientModal: React.FC<AddClientModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [pays, setPays] = useState<Pays[]>([]);
  const [hasUserAccount, setHasUserAccount] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'recap'>('form');
  const [formData, setFormData] = useState<any>({});

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
      loadReferenceData();
      setCurrentStep('form');
    }
  }, [visible]);

  const loadReferenceData = async () => {
    try {
      // Données mockées temporaires pour pays
      setPays([
        { id: 1, nom: 'France', code: 'FR' },
        { id: 2, nom: 'États-Unis', code: 'US' },
        { id: 3, nom: 'Allemagne', code: 'DE' },
        { id: 4, nom: 'Royaume-Uni', code: 'GB' },
        { id: 5, nom: 'Espagne', code: 'ES' },
        { id: 6, nom: 'Italie', code: 'IT' },
        { id: 7, nom: 'Canada', code: 'CA' },
        { id: 8, nom: 'Belgique', code: 'BE' },
        { id: 9, nom: 'Suisse', code: 'CH' },
        { id: 10, nom: 'Pays-Bas', code: 'NL' },
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setFormData(values);
    setCurrentStep('recap');
  };

  const handleFinalSubmit = async () => {
    try {
      const clientData: CreateClientDto = {
        nomClient: formData.nomClient,
        referenceClient: formData.referenceClient,
        adresseClient: formData.adresseClient,
        codePostal: formData.codePostal,
        paysClient: formData.paysClient,
        emailClient: formData.emailClient,
        telephoneClient: formData.telephoneClient,
        canWrite: formData.canWrite,
        canRead: formData.canRead,
        isBlocked: formData.isBlocked,
        // Les données utilisateur sont passées via hasUserAccount et formData
        ...(hasUserAccount && {
          userEmail: formData.userEmail,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      };

      await onSubmit(clientData, hasUserAccount);
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setHasUserAccount(false);
    setCurrentStep('form');
    setFormData({});
    onCancel();
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const validatePasswords = (_: any, value: string) => {
    if (!hasUserAccount) return Promise.resolve();
    
    if (!value) {
      return Promise.reject(new Error('La confirmation du mot de passe est obligatoire'));
    }
    
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
    }
    
    return Promise.resolve();
  };

  const renderFormStep = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      autoComplete="off"
      initialValues={{
        canWrite: false,
        canRead: true,
        isBlocked: false,
        ...formData
      }}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Informations générales" key="1">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="nomClient"
                label="Nom du client"
                rules={[
                  { required: true, message: 'Le nom du client est obligatoire' },
                  { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
                  { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nom officiel de l'organisation cliente"
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="referenceClient"
                label="Référence client"
                tooltip="Code métier pour identification rapide"
                rules={[
                  { max: 255, message: 'La référence ne peut pas dépasser 255 caractères' }
                ]}
              >
                <Input
                  prefix={<NumberOutlined />}
                  placeholder="Référence interne du client (optionnel)"
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Contact" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="emailClient"
                label="Email principal"
                rules={[
                  { type: 'email', message: 'Format d\'email invalide' },
                  { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="contact@client.com"
                  maxLength={255}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telephoneClient"
                label="Téléphone principal"
                rules={[
                  { pattern: /^[\d\s\-+().]{8,20}$/, message: 'Format de téléphone invalide' }
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
        </Tabs.TabPane>

        <Tabs.TabPane tab="Adresse" key="3">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="adresseClient"
                label="Adresse postale"
                rules={[
                  { max: 500, message: 'L\'adresse ne peut pas dépasser 500 caractères' }
                ]}
              >
                <TextArea
                  placeholder="Adresse postale complète de l'organisation"
                  maxLength={500}
                  rows={3}
                  showCount
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
                  placeholder="Code postal"
                  maxLength={20}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paysClient"
                label="Pays"
                tooltip="Pays de domiciliation du client"
              >
                <Select
                  placeholder="Sélectionner un pays"
                  showSearch
                  optionFilterProp="children"
                >
                  {pays.map(p => (
                    <Option key={p.id} value={p.nom}>
                      {p.code} - {p.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Compte" key="4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="hasUserAccount"
                label="Ce client aura-t-il un compte utilisateur ?"
                tooltip="Détermine si ce client pourra se connecter à l'application"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Oui"
                  unCheckedChildren="Non"
                  onChange={setHasUserAccount}
                />
              </Form.Item>
            </Col>
          </Row>

          {hasUserAccount && (
            <>
              <Divider orientation="left">Informations du compte</Divider>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label="Prénom"
                    rules={[
                      { required: true, message: 'Le prénom est obligatoire' },
                      { min: 2, message: 'Le prénom doit contenir au moins 2 caractères' },
                      { max: 100, message: 'Le prénom ne peut pas dépasser 100 caractères' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Prénom de l'utilisateur"
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    label="Nom"
                    rules={[
                      { required: true, message: 'Le nom est obligatoire' },
                      { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
                      { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nom de famille de l'utilisateur"
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="userEmail"
                    label="Email de connexion"
                    rules={[
                      { required: true, message: 'L\'email de connexion est obligatoire' },
                      { type: 'email', message: 'Format d\'email invalide' },
                      { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="email@utilisateur.com"
                      maxLength={255}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Mot de passe"
                    rules={[
                      { required: true, message: 'Le mot de passe est obligatoire' },
                      { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
                      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Mot de passe sécurisé"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirmer le mot de passe"
                    dependencies={['password']}
                    rules={[
                      { validator: validatePasswords }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Confirmez le mot de passe"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Permissions</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="canRead"
                    label="Permission de lecture"
                    tooltip="Autoriser l'accès en consultation aux données"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Activé"
                      unCheckedChildren="Désactivé"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="canWrite"
                    label="Permission d'écriture"
                    tooltip="Autoriser la création/modification des données"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Activé"
                      unCheckedChildren="Désactivé"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="isBlocked"
                    label="Compte bloqué"
                    tooltip="Suspendre l'accès (impayés, violations, etc.)"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Bloqué"
                      unCheckedChildren="Actif"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Form>
  );

  const renderRecapStep = () => (
    <div>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        Récapitulatif de création du client
      </Title>
      
      <Card title="Informations du client" style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small">
          <Descriptions.Item label="Nom du client" span={3}>
            {formData.nomClient}
          </Descriptions.Item>
          {formData.referenceClient && (
            <Descriptions.Item label="Référence client" span={3}>
              {formData.referenceClient}
            </Descriptions.Item>
          )}
          {formData.emailClient && (
            <Descriptions.Item label="Email principal" span={3}>
              {formData.emailClient}
            </Descriptions.Item>
          )}
          {formData.telephoneClient && (
            <Descriptions.Item label="Téléphone" span={3}>
              {formData.telephoneClient}
            </Descriptions.Item>
          )}
          {formData.adresseClient && (
            <Descriptions.Item label="Adresse" span={3}>
              {formData.adresseClient}
            </Descriptions.Item>
          )}
          {formData.codePostal && (
            <Descriptions.Item label="Code postal" span={1}>
              {formData.codePostal}
            </Descriptions.Item>
          )}
          {formData.paysClient && (
            <Descriptions.Item label="Pays" span={2}>
              {formData.paysClient}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {hasUserAccount && (
        <Card title="Compte utilisateur" style={{ marginBottom: 16 }}>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Nom complet" span={3}>
              {formData.firstName} {formData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email de connexion" span={3}>
              {formData.userEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Rôle" span={3}>
              <Tag color="blue">Client</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Permission de lecture" span={1}>
              <Tag color={formData.canRead ? "green" : "red"}>
                {formData.canRead ? "Activée" : "Désactivée"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Permission d'écriture" span={1}>
              <Tag color={formData.canWrite ? "green" : "red"}>
                {formData.canWrite ? "Activée" : "Désactivée"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Statut" span={1}>
              <Tag color={formData.isBlocked ? "red" : "green"}>
                {formData.isBlocked ? "Bloqué" : "Actif"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <div style={{ textAlign: 'center', color: '#666' }}>
        <Text>
          Vérifiez attentivement ces informations avant de confirmer la création du client.
          {hasUserAccount && " Un compte utilisateur sera automatiquement créé avec ces paramètres."}
        </Text>
      </div>
    </div>
  );

  return (
    <Modal
      title={currentStep === 'form' ? "Ajouter un nouveau client" : "Confirmer la création"}
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
            Créer le client
          </Button>
        ]
      }
    >
      {currentStep === 'form' ? renderFormStep() : renderRecapStep()}
    </Modal>
  );
};

export default AddClientModal;
