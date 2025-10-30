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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        { id: 1, nom: t('countries.FR'), code: 'FR' },
        { id: 2, nom: t('countries.US'), code: 'US' },
        { id: 3, nom: t('countries.DE'), code: 'DE' },
        { id: 4, nom: t('countries.GB'), code: 'GB' },
        { id: 5, nom: t('countries.ES'), code: 'ES' },
        { id: 6, nom: t('countries.IT'), code: 'IT' },
        { id: 7, nom: t('countries.CA'), code: 'CA' },
        { id: 8, nom: t('countries.BE'), code: 'BE' },
        { id: 9, nom: t('countries.CH'), code: 'CH' },
        { id: 10, nom: t('countries.NL'), code: 'NL' },
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
      return Promise.reject(new Error(t('clients.account.validation.passwordRequired')));
    }
    if (value.length < 8) {
      return Promise.reject(new Error(t('clients.account.validation.passwordMin')));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error(t('clients.account.validation.passwordPattern')));
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
                    label={t('clients.fields.name')}
                    rules={[
                      { required: true, message: t('clients.validation.nameRequired') },
                      { min: 2, message: t('clients.validation.nameMin') },
                      { max: 255, message: t('clients.validation.nameMax') }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder={t('clients.placeholders.officialName')}
                      maxLength={255}
                    />
                  </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                  <Form.Item
                  name="referenceClient"
                  label={t('clients.fields.reference')}
                  tooltip={t('clients.tooltips.reference')}
                  rules={[
                    { max: 255, message: t('clients.validation.referenceMax') }
                  ]}
                >
                  <Input
                    prefix={<NumberOutlined />}
                    placeholder={t('clients.placeholders.reference')}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider>{t('clients.sections.contact')}</Divider>

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
                    placeholder={t('clients.placeholders.contactEmail')}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telephoneClient"
                  label={t('clients.fields.phone')}
                  rules={[
                    { pattern: /^[\d\s\-+().]{8,20}$/, message: t('clients.validation.phoneInvalid') }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={t('clients.placeholders.phone')}
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>

                <Divider>{t('clients.sections.address')}</Divider>

            <Row gutter={16}>
              <Col span={24}>
                  <Form.Item
                  name="adresseClient"
                  label={t('clients.fields.postalAddress')}
                  rules={[
                    { max: 500, message: t('clients.validation.addressMax') }
                  ]}
                >
                  <TextArea
                    placeholder={t('clients.placeholders.postalAddress')}
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
                    label={t('clients.fields.postalCode')}
                    rules={[
                      { max: 20, message: t('clients.validation.postalCodeMax') }
                    ]}
                  >
                    <Input
                      placeholder={t('clients.placeholders.postalAddress')}
                      maxLength={20}
                    />
                  </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paysClient"
                  label={t('clients.fields.country')}
                  tooltip={t('clients.tooltips.country')}
                >
                  <Select
                    placeholder={t('clients.placeholders.selectCountry')}
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
              message={t('clients.recap.title')}
              description={t('clients.recap.description')}
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />

            <Card title={<><UserOutlined /> {t('clients.recap.clientInfo')}</>} style={{ marginBottom: 20 }}>
                <Descriptions bordered column={2}>
                <Descriptions.Item label={t('clients.fields.name')} span={2}>
                  <strong>{clientData?.nomClient}</strong>
                </Descriptions.Item>
                {clientData?.referenceClient && (
                  <Descriptions.Item label="Référence" span={2}>
                    {clientData.referenceClient}
                  </Descriptions.Item>
                )}
                {clientData?.emailClient && (
                  <Descriptions.Item label={t('clients.fields.email')}>
                    {clientData.emailClient}
                  </Descriptions.Item>
                )}
                {clientData?.telephoneClient && (
                  <Descriptions.Item label={t('clients.fields.phone')}>
                    {clientData.telephoneClient}
                  </Descriptions.Item>
                )}
                {clientData?.adresseClient && (
                  <Descriptions.Item label={t('clients.fields.address')} span={2}>
                    {clientData.adresseClient}
                  </Descriptions.Item>
                )}
                {clientData?.codePostal && (
                  <Descriptions.Item label={t('clients.fields.postalCode')}>
                    {clientData.codePostal}
                  </Descriptions.Item>
                )}
                {clientData?.paysClient && (
                  <Descriptions.Item label={t('clients.fields.country')}>
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
              <Card title={<><LockOutlined /> {t('clients.account.title')}</>}> 
                <Alert
                  message={t('clients.account.alertTitle')}
                  description={t('clients.account.alertDescription')}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 20 }}
                />

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="firstName"
                      label={t('clients.account.fields.firstName')}
                      rules={[
                        { required: true, message: t('clients.account.validation.firstNameRequired') },
                        { min: 2, message: t('clients.account.validation.firstNameMin') },
                        { max: 100, message: t('clients.account.validation.firstNameMax') }
                      ]}
                    >
                      <Input
                        placeholder={t('clients.account.placeholders.firstName')}
                        maxLength={100}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="lastName"
                      label={t('clients.account.fields.lastName')}
                      rules={[
                        { required: true, message: t('clients.account.validation.lastNameRequired') },
                        { min: 2, message: t('clients.account.validation.lastNameMin') },
                        { max: 100, message: t('clients.account.validation.lastNameMax') }
                      ]}
                    >
                      <Input
                        placeholder={t('clients.account.placeholders.lastName')}
                        maxLength={100}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="email"
                      label={t('clients.account.fields.email')}
                      rules={[
                        { required: true, message: t('clients.account.validation.emailRequired') },
                        { type: 'email', message: t('clients.account.validation.emailInvalid') },
                        { max: 255, message: t('clients.account.validation.emailMax') }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder={t('clients.account.placeholders.email')}
                        maxLength={255}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                      <Form.Item
                      name="password"
                      label={t('clients.account.fields.password')}
                      rules={[
                        { validator: validatePassword }
                      ]}
                    >
                      <Password
                        prefix={<LockOutlined />}
                        placeholder={t('clients.account.placeholders.password')}
                        maxLength={255}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                      <Form.Item
                      name="confirmPassword"
                      label={t('clients.account.fields.confirmPassword')}
                      dependencies={['password']}
                      rules={[
                        { required: true, message: t('clients.account.validation.confirmPasswordRequired') },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error(t('clients.account.validation.passwordsMismatch')));
                          },
                        }),
                      ]}
                    >
                      <Password
                        prefix={<LockOutlined />}
                        placeholder={t('clients.account.placeholders.confirmPassword')}
                        maxLength={255}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  message={t('clients.account.permissionsTitle')}
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>{t('clients.account.permissions.role')}</li>
                      <li>{t('clients.account.permissions.read')}</li>
                      <li>{t('clients.account.permissions.write')}</li>
                      <li>{t('clients.account.permissions.status')}</li>
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
        return t('clients.steps.titleStep', { step: 1, total: 2 });
      case 1:
        return t('clients.steps.titleStep', { step: 2, total: 2 });
      default:
        return t('clients.modals.createWithAccount.title');
    }
  };

  const getModalFooter = () => {
    switch (currentStep) {
      case 0:
        return [
          <Button key="cancel" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>,
          <Button key="next" type="primary" onClick={() => clientForm.submit()}>
            {t('common.next')}
          </Button>
        ];
      case 1:
        return [
          <Button key="previous" onClick={handlePrevious}>
            {t('common.back')}
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>,
          <Button 
            key="finish" 
            type="primary" 
            onClick={() => accountForm.submit()}
            loading={loading}
          >
            {t('clients.modals.createWithAccount.finish')}
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
    >
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step title={t('clients.steps.clientInfo')} icon={<InfoCircleOutlined />} />
              <Step title={t('clients.steps.recapAndAccount')} icon={<CheckCircleOutlined />} />
          </Steps>

      {renderStepContent()}
    </Modal>
  );
};

export default CreateClientWithAccountModal;
