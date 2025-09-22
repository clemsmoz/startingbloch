/*
 * ================================================================================================
 * MODAL AJOUT CLIENT - STARTINGBLOCH
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Switch, Tabs, Button, Card, Descriptions, Tag, Divider, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, NumberOutlined, LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { CreateClientDto, Pays } from '../../types';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      // Construire la liste des pays à partir des traductions (fr.json est la source)
      const countriesObj = t('countries', { returnObjects: true }) as Record<string, string> | undefined;
      const codes = [
        { id: 1, code: 'FR' }, { id: 2, code: 'US' }, { id: 3, code: 'DE' }, { id: 4, code: 'GB' },
        { id: 5, code: 'ES' }, { id: 6, code: 'IT' }, { id: 7, code: 'CA' }, { id: 8, code: 'BE' },
        { id: 9, code: 'CH' }, { id: 10, code: 'NL' }
      ];

  setPays(codes.map(c => ({ id: c.id, nom: (countriesObj && (countriesObj as any)[c.code]) ?? c.code, code: c.code })));
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
      return Promise.reject(new Error(t('clients.modals.add.errors.confirmPasswordRequired')));
    }

    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error(t('clients.account.validation.passwordsMismatch')));
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
      <Tabs.TabPane tab={t('clients.modals.add.tabs.general')} key="1">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="nomClient"
                label={t('clients.fields.name')}
                rules={[
                  { min: 2, message: t('clients.validation.nameMin') },
                  { max: 255, message: t('clients.validation.nameMax') }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder={t('clients.placeholders.name')}
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
        </Tabs.TabPane>

  <Tabs.TabPane tab={t('clients.modals.add.tabs.contact')} key="2">
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
        </Tabs.TabPane>

  <Tabs.TabPane tab={t('clients.modals.add.tabs.address')} key="3">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="adresseClient"
                label={t('clients.fields.address')}
                rules={[
                  { max: 500, message: t('clients.validation.addressMax') }
                ]}
              >
                <TextArea
                  placeholder={t('clients.placeholders.address')}
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
                  placeholder={t('clients.placeholders.postal')}
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
        </Tabs.TabPane>

  <Tabs.TabPane tab={t('clients.modals.add.tabs.account')} key="4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="hasUserAccount"
                label={t('clients.modals.add.labels.hasAccount')}
                tooltip={t('clients.modals.add.tooltips.hasAccount')}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren={t('common.yes')}
                  unCheckedChildren={t('common.no')}
                  onChange={setHasUserAccount}
                />
              </Form.Item>
            </Col>
          </Row>

          {hasUserAccount && (
            <>
              <Divider orientation="left">{t('clients.modals.add.accountSection')}</Divider>
              
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
                      prefix={<UserOutlined />}
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
                      { min: 2, message: t('clients.account.validation.firstNameMin') },
                      { max: 100, message: t('clients.account.validation.firstNameMax') }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder={t('clients.account.placeholders.lastName')}
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="userEmail"
                    label={t('clients.account.fields.email')}
                    rules={[
                      { required: true, message: t('clients.modals.add.errors.userEmailRequired') },
                      { type: 'email', message: t('clients.validation.emailInvalid') },
                      { max: 255, message: t('clients.validation.emailMax') }
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
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label={t('clients.account.fields.password')}
                    rules={[
                      { required: true, message: t('clients.account.validation.passwordRequired') },
                      { min: 8, message: t('clients.account.validation.passwordMin') },
                      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: t('clients.modals.add.errors.passwordPattern') }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder={t('clients.account.placeholders.password')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                      name="confirmPassword"
                      label={t('clients.account.fields.confirmPassword')}
                      dependencies={['password']}
                      rules={[
                        { validator: validatePasswords }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder={t('clients.account.placeholders.confirmPassword')}
                      />
                    </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">{t('clients.modals.add.permissions')}</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="canRead"
                    label={t('clients.modals.add.labels.canRead')}
                    tooltip={t('clients.modals.add.tooltips.canRead')}
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren={t('common.enabled')}
                      unCheckedChildren={t('common.disabled')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="canWrite"
                    label={t('clients.modals.add.labels.canWrite')}
                    tooltip={t('clients.modals.add.tooltips.canWrite')}
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren={t('common.enabled')}
                      unCheckedChildren={t('common.disabled')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="isBlocked"
                    label={t('clients.modals.add.labels.isBlocked')}
                    tooltip={t('clients.modals.add.tooltips.isBlocked')}
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren={t('clients.modals.add.labels.blocked')}
                      unCheckedChildren={t('clients.modals.add.labels.active')}
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
        {t('clients.modals.add.recapTitle')}
      </Title>
      
          <Card title={t('clients.modals.add.clientInfo')} style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small">
          <Descriptions.Item label={t('clients.fields.name')} span={3}>
            {formData.nomClient}
          </Descriptions.Item>
          {formData.referenceClient && (
            <Descriptions.Item label={t('clients.fields.reference')} span={3}>
              {formData.referenceClient}
            </Descriptions.Item>
          )}
          {formData.emailClient && (
            <Descriptions.Item label={t('clients.fields.email')} span={3}>
              {formData.emailClient}
            </Descriptions.Item>
          )}
          {formData.telephoneClient && (
            <Descriptions.Item label={t('clients.fields.phone')} span={3}>
              {formData.telephoneClient}
            </Descriptions.Item>
          )}
          {formData.adresseClient && (
            <Descriptions.Item label={t('clients.fields.address')} span={3}>
              {formData.adresseClient}
            </Descriptions.Item>
          )}
          {formData.codePostal && (
            <Descriptions.Item label={t('clients.fields.postalCode')} span={1}>
              {formData.codePostal}
            </Descriptions.Item>
          )}
          {formData.paysClient && (
            <Descriptions.Item label={t('clients.fields.country')} span={2}>
              {formData.paysClient}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

          {hasUserAccount && (
        <Card title={t('clients.modals.add.userAccount')} style={{ marginBottom: 16 }}>
          <Descriptions bordered size="small">
            <Descriptions.Item label={t('clients.modals.add.fullName')} span={3}>
              {formData.firstName} {formData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label={t('clients.account.fields.email')} span={3}>
              {formData.userEmail}
            </Descriptions.Item>
            <Descriptions.Item label={t('clients.modals.add.roleLabel')} span={3}>
              <Tag color="blue">{t('clients.role.client')}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('clients.modals.add.readPermission')} span={1}>
              <Tag color={formData.canRead ? "green" : "red"}>
                {formData.canRead ? t('common.yes') : t('common.no')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('clients.modals.add.writePermission')} span={1}>
              <Tag color={formData.canWrite ? "green" : "red"}>
                {formData.canWrite ? t('common.yes') : t('common.no')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('clients.modals.add.status')} span={1}>
              <Tag color={formData.isBlocked ? "red" : "green"}>
                {formData.isBlocked ? t('clients.modals.add.blocked') : t('clients.modals.add.active')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <div style={{ textAlign: 'center', color: '#666' }}>
        <Text>
          {t('clients.modals.add.recapNote')}
          {hasUserAccount && ` ${t('clients.modals.add.recapAccountNote')}`}
        </Text>
      </div>
    </div>
  );

  return (
    <Modal
      title={currentStep === 'form' ? t('clients.modals.add.title') : t('clients.modals.add.confirmTitle')}
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={
        currentStep === 'form' ? [
          <Button key="cancel" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>,
          <Button key="next" type="primary" onClick={() => form.submit()}>
            {t('clients.modals.add.next')}
          </Button>
        ] : [
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBackToForm}>
            {t('clients.modals.add.back')}
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading}
            onClick={handleFinalSubmit}
            icon={<CheckCircleOutlined />}
          >
            {t('clients.modals.add.create')}
          </Button>
        ]
      }
    >
      {currentStep === 'form' ? renderFormStep() : renderRecapStep()}
    </Modal>
  );
};

export default AddClientModal;
