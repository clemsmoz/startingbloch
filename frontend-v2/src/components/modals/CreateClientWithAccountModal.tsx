/*
 * ================================================================================================
 * MODAL CRÉATION CLIENT AVEC COMPTE - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal en plusieurs étapes pour créer un client avec récapitulatif et compte utilisateur
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  Steps, 
  Button, 
  Card, 
  Descriptions, 
  Divider,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  NumberOutlined,
  LockOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { CreateClientDto, Pays } from '../../types';

const { Option } = Select;
const { TextArea } = Input;
const { Password } = Input;
const { Step } = Steps;

interface CreateClientWithAccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (clientData: CreateClientDto, accountData: CreateAccountData) => Promise<void>;
  loading?: boolean;
}

interface CreateAccountData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  canRead: boolean;
  canWrite: boolean;
}

interface ClientFormData {
  nomClient: string;
  referenceClient?: string;
  adresseClient?: string;
  codePostal?: string;
  paysClient?: string;
  emailClient?: string;
  telephoneClient?: string;
}

const CreateClientWithAccountModal: React.FC<CreateClientWithAccountModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [clientForm] = Form.useForm();
  const [accountForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [pays, setPays] = useState<Pays[]>([]);
  const [clientData, setClientData] = useState<ClientFormData | null>(null);

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
      loadReferenceData();
      setCurrentStep(0);
      setClientData(null);
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

  const handleClientFormFinish = (values: ClientFormData) => {
    setClientData(values);
    setCurrentStep(1);
  };

  const handleAccountFormFinish = async (values: CreateAccountData) => {
    if (!clientData) return;

    try {
      const finalClientData: CreateClientDto = {
        ...clientData,
      };

      const finalAccountData: CreateAccountData = {
        ...values,
        canRead: true,  // Toujours true pour les clients
        canWrite: false, // Toujours false pour les clients par défaut
      };

      await onSubmit(finalClientData, finalAccountData);
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    clientForm.resetFields();
    accountForm.resetFields();
    setCurrentStep(0);
    setClientData(null);
    onCancel();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Le mot de passe est obligatoire'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Le mot de passe doit contenir au moins 8 caractères'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'));
    }
    return Promise.resolve();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={clientForm}
            layout="vertical"
            onFinish={handleClientFormFinish}
            autoComplete="off"
          >
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

            <Divider>Contact</Divider>

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

            <Divider>Adresse</Divider>

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
          </Form>
        );

      case 1:
        return (
          <div>
            <Alert
              message="Récapitulatif des informations client"
              description="Vérifiez les informations avant de continuer vers la création du compte utilisateur"
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />

            <Card title={<><UserOutlined /> Informations du client</>} style={{ marginBottom: 20 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nom du client" span={2}>
                  <strong>{clientData?.nomClient}</strong>
                </Descriptions.Item>
                {clientData?.referenceClient && (
                  <Descriptions.Item label="Référence" span={2}>
                    {clientData.referenceClient}
                  </Descriptions.Item>
                )}
                {clientData?.emailClient && (
                  <Descriptions.Item label="Email">
                    {clientData.emailClient}
                  </Descriptions.Item>
                )}
                {clientData?.telephoneClient && (
                  <Descriptions.Item label="Téléphone">
                    {clientData.telephoneClient}
                  </Descriptions.Item>
                )}
                {clientData?.adresseClient && (
                  <Descriptions.Item label="Adresse" span={2}>
                    {clientData.adresseClient}
                  </Descriptions.Item>
                )}
                {clientData?.codePostal && (
                  <Descriptions.Item label="Code postal">
                    {clientData.codePostal}
                  </Descriptions.Item>
                )}
                {clientData?.paysClient && (
                  <Descriptions.Item label="Pays">
                    {clientData.paysClient}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Form
              form={accountForm}
              layout="vertical"
              onFinish={handleAccountFormFinish}
              autoComplete="off"
              initialValues={{
                canRead: true,
                canWrite: false
              }}
            >
              <Card title={<><LockOutlined /> Création du compte utilisateur</>}>
                <Alert
                  message="Compte client"
                  description="Ce compte aura automatiquement le rôle 'Client' avec des permissions de lecture uniquement."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 20 }}
                />

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
                        placeholder="Nom de famille de l'utilisateur"
                        maxLength={100}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="email"
                      label="Email de connexion"
                      rules={[
                        { required: true, message: 'L\'email est obligatoire' },
                        { type: 'email', message: 'Format d\'email invalide' },
                        { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="utilisateur@client.com"
                        maxLength={255}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="password"
                      label="Mot de passe"
                      rules={[
                        { validator: validatePassword }
                      ]}
                    >
                      <Password
                        prefix={<LockOutlined />}
                        placeholder="Mot de passe sécurisé"
                        maxLength={255}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirmer le mot de passe"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Veuillez confirmer le mot de passe' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                          },
                        }),
                      ]}
                    >
                      <Password
                        prefix={<LockOutlined />}
                        placeholder="Confirmer le mot de passe"
                        maxLength={255}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  message="Permissions par défaut"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Rôle : Client</li>
                      <li>Lecture : Autorisée (ses propres données uniquement)</li>
                      <li>Écriture : Désactivée par défaut</li>
                      <li>Statut : Actif</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </Card>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 0:
        return "Étape 1/2 - Informations du client";
      case 1:
        return "Étape 2/2 - Récapitulatif et création de compte";
      default:
        return "Créer un client avec compte";
    }
  };

  const getModalFooter = () => {
    switch (currentStep) {
      case 0:
        return [
          <Button key="cancel" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button key="next" type="primary" onClick={() => clientForm.submit()}>
            Suivant
          </Button>
        ];
      case 1:
        return [
          <Button key="previous" onClick={handlePrevious}>
            Précédent
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button 
            key="finish" 
            type="primary" 
            onClick={() => accountForm.submit()}
            loading={loading}
          >
            Créer le client et le compte
          </Button>
        ];
      default:
        return [];
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={getModalFooter()}
      width={900}
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Informations client" icon={<InfoCircleOutlined />} />
        <Step title="Récapitulatif et compte" icon={<CheckCircleOutlined />} />
      </Steps>

      {renderStepContent()}
    </Modal>
  );
};

export default CreateClientWithAccountModal;
