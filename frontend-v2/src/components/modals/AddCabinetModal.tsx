/*
 * ================================================================================================
 * MODAL AJOUT CABINET - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour ajouter un nouveau cabinet avec système de récapitulatif.
 * Workflow en 2 étapes : formulaire → récapitulatif → création
 * 
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, Row, Col, Tabs, Button, Descriptions, Card, Divider } from 'antd';
import { BankOutlined, MailOutlined, PhoneOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { CreateCabinetDto } from '../../types';

const { Option } = Select;
const { TabPane } = Tabs;

interface AddCabinetModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateCabinetDto) => Promise<void>;
  loading?: boolean;
}

const AddCabinetModal: React.FC<AddCabinetModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [isRecapStep, setIsRecapStep] = useState(false);
  const [formData, setFormData] = useState<CreateCabinetDto | null>(null);
  // Pull countries list from translations (object of code->label)
  const countries = t('countries', { returnObjects: true }) as Record<string, string> | string;

  const handleFormFinish = async (values: any) => {
    try {
      const cabinetData: CreateCabinetDto = {
        nomCabinet: values.nomCabinet,
        adresseCabinet: values.adresseCabinet,
        codePostal: values.codePostal,
        paysCabinet: values.paysCabinet,
        emailCabinet: values.emailCabinet,
        telephoneCabinet: values.telephoneCabinet,
        type: parseInt(values.type), // Convertir en nombre pour l'enum
      };

      setFormData(cabinetData);
      setIsRecapStep(true);
    } catch (error) {
      console.error('Erreur lors de la validation du formulaire:', error);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData) return;
    
    try {
      await onSubmit(formData);
      handleCancel(); // Reset et fermer le modal
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsRecapStep(false);
    setFormData(null);
    onCancel();
  };

  const handleBackToForm = () => {
    setIsRecapStep(false);
  };

  const getTypeLabel = (type: number): string => {
    return type === 1 ? t('brevets.sections.annuities') : t('brevets.sections.procedures');
  };

  // Rendu du formulaire
  if (!isRecapStep) {
    return (
      <Modal
        title={t('cabinets.modals.add.title')}
        open={visible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={800}
        okText={t('common.next')}
        cancelText={t('common.cancel')}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          autoComplete="off"
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab={t('cabinets.modals.add.tabs.general')} key="1">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="nomCabinet"
                    label={t('cabinets.fields.name')}
                    rules={[
                      { max: 255, message: t('cabinets.validation.nameMax') }
                    ]}
                  >
                    <Input
                      prefix={<BankOutlined />}
                      placeholder={t('cabinets.placeholders.exampleName')}
                      maxLength={255}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label={t('cabinets.fields.type')}
                  >
                    <Select placeholder={t('cabinets.placeholders.selectType')}>
                      <Option value="1">{t('cabinets.types.annuity')}</Option>
                      <Option value="2">{t('cabinets.types.procedure')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={t('cabinets.modals.add.tabs.address')} key="2">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                          name="adresseCabinet"
                    label={t('cabinets.fields.address')}
                          rules={[
                            { max: 500, message: t('cabinets.validation.addressMax') }
                          ]}
                        >
                    <Input
                      placeholder={t('cabinets.placeholders.addressExample')}
                                  maxLength={500}
                                />
                        </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                    name="codePostal"
                    label={t('cabinets.fields.postalCode')}
                    rules={[
                      { max: 20, message: t('cabinets.validation.postalCodeMax') }
                    ]}
                  >
                    <Input
                      placeholder={t('cabinets.placeholders.postalExample')}
                      maxLength={20}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="paysCabinet"
                    label={t('cabinets.fields.country')}
                    rules={[
                      { max: 100, message: t('cabinets.validation.countryMax') }
                    ]}
                  >
                    {/* If countries is an object, render options; otherwise fallback to Input */}
                    {typeof countries === 'object' ? (
                      <Select placeholder={t('cabinets.placeholders.selectCountry')}>
                        {Object.entries(countries).map(([code, label]) => (
                          <Option key={code} value={code}>{label}</Option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        placeholder={t('cabinets.placeholders.countryExample')}
                        maxLength={100}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={t('cabinets.modals.add.tabs.contact')} key="3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                          name="emailCabinet"
                    label={t('cabinets.fields.email')}
                          rules={[
                      { type: 'email', message: t('cabinets.validation.emailInvalid') },
                      { max: 255, message: t('cabinets.validation.emailMax') }
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined />}
                      placeholder={t('cabinets.placeholders.emailExample')}
                            maxLength={255}
                          />
                        </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="telephoneCabinet"
                    label={t('cabinets.fields.phone')}
                    rules={[
                      { max: 50, message: t('cabinets.validation.phoneMax') }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder={t('cabinets.placeholders.phoneExample')}
                      maxLength={50}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    );
  }

  // Rendu du récapitulatif
  // Pré-calculer label pays pour éviter ternary imbriquée
  let countryLabel = '';
  if (formData?.paysCabinet) {
    if (typeof countries === 'object') {
      countryLabel = t(`countries.${formData.paysCabinet}`);
    } else {
      countryLabel = formData.paysCabinet;
    }
  }

  return (
    <Modal
  title={t('cabinets.modals.add.recapTitle')}
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBackToForm}>
          {t('common.back')}
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={loading}
          onClick={handleFinalSubmit}
        >
          {t('cabinets.modals.add.create')}
        </Button>,
      ]}
    >
      <Card>
          <Descriptions title={t('cabinets.recap.title')} column={1} bordered>
          <Descriptions.Item label={t('cabinets.fields.name')}>
            {formData?.nomCabinet}
          </Descriptions.Item>
          <Descriptions.Item label={t('cabinets.fields.type')}>
            {formData?.type ? getTypeLabel(formData.type) : ''}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions title={t('cabinets.recap.addressTitle')} column={1} bordered>
          <Descriptions.Item label={t('cabinets.fields.address')}>
            {formData?.adresseCabinet}
          </Descriptions.Item>
          <Descriptions.Item label={t('cabinets.fields.postalCode')}>
            {formData?.codePostal ?? t('common.notProvided')}
          </Descriptions.Item>
                    <Descriptions.Item label={t('cabinets.fields.country')}>
            {countryLabel}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions title={t('cabinets.recap.contactTitle')} column={1} bordered>
          <Descriptions.Item label={t('cabinets.fields.email')}>
            {formData?.emailCabinet ?? t('common.notProvided')}
          </Descriptions.Item>
          <Descriptions.Item label={t('cabinets.fields.phone')}>
            {formData?.telephoneCabinet ?? t('common.notProvided')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Modal>
  );
};

export default AddCabinetModal;
