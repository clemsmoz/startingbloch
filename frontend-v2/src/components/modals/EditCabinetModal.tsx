/*
 * ================================================================================================
 * MODAL ÉDITION CABINET - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour éditer un cabinet existant selon le modèle backend.
 * 
 * ================================================================================================
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, Row, Col, Tabs } from 'antd';
import { BankOutlined, MailOutlined, PhoneOutlined, TagOutlined } from '@ant-design/icons';
import type { UpdateCabinetDto, Cabinet } from '../../types';

const { Option } = Select;
const { TabPane } = Tabs;

interface EditCabinetModalProps {
  visible: boolean;
  cabinet: Cabinet | null;
  onCancel: () => void;
  onSubmit: (values: UpdateCabinetDto) => Promise<void>;
  loading?: boolean;
}

const EditCabinetModal: React.FC<EditCabinetModalProps> = ({
  visible,
  cabinet,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const countries = t('countries', { returnObjects: true }) as Record<string, string> | string;

  // Initialiser le formulaire avec les données du cabinet
  useEffect(() => {
    if (cabinet && visible) {
  form.setFieldsValue({
        nomCabinet: cabinet.nomCabinet,
  adresseCabinet: cabinet.adresseCabinet,
  codePostal: cabinet.codePostal,
        emailCabinet: cabinet.emailCabinet,
        telephoneCabinet: cabinet.telephoneCabinet,
  paysCabinet: cabinet.paysCabinet,
        type: cabinet.type,
      });
    }
  }, [cabinet, visible, form]);

  const handleFinish = async (values: any) => {
    if (!cabinet) return;

    try {
      let typeValue: number = values.type;
      if (typeof values.type === 'string') {
        typeValue = values.type === 'annuite' ? 1 : 2;
      }

      const cabinetData: UpdateCabinetDto = {
        id: cabinet.id,
        nomCabinet: values.nomCabinet,
  adresseCabinet: values.adresseCabinet,
  codePostal: values.codePostal,
  paysCabinet: values.paysCabinet,
        emailCabinet: values.emailCabinet,
        telephoneCabinet: values.telephoneCabinet,
        type: typeValue,
      };

      await onSubmit(cabinetData);
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
      title={
        cabinet
          ? t('cabinets.modals.edit.titleWithName', { name: cabinet.nomCabinet })
          : t('cabinets.modals.edit.title')
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab={t('cabinets.modals.edit.tabs.general')} key="1">
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
              <Col span={16}>
                <Form.Item
                  name="adresseCabinet"
                  label={t('cabinets.fields.address')}
                  rules={[
                    { max: 500, message: t('cabinets.validation.addressMax') }
                  ]}
                >
                  <Input placeholder={t('cabinets.placeholders.address')} maxLength={500} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="codePostal"
                  label={t('cabinets.fields.postalCode')}
                  rules={[{ max: 20, message: t('cabinets.validation.postalCodeMax') }]}
                >
                  <Input placeholder={t('cabinets.placeholders.postalCode')} maxLength={20} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paysCabinet"
                  label={t('cabinets.fields.country')}
                  rules={[ { max: 100, message: t('cabinets.validation.countryMax') }]}
                >
                  {typeof countries === 'object' ? (
                    <Select placeholder={t('cabinets.placeholders.selectCountry')}>
                      {Object.entries(countries).map(([code, label]) => (
                        <Option key={code} value={code}>{label}</Option>
                      ))}
                    </Select>
                  ) : (
                    <Input placeholder={t('cabinets.placeholders.country')} maxLength={100} />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label={t('cabinets.fields.type')}
                >
                  <Select prefix={<TagOutlined />} placeholder={t('cabinets.placeholders.selectType')}>
                    <Option value={1}>{t('cabinets.types.annuity')}</Option>
                    <Option value={2}>{t('cabinets.types.procedure')}</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={t('cabinets.modals.edit.tabs.contact')} key="2">
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
                    placeholder={t('cabinets.placeholders.email')}
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
                    placeholder={t('cabinets.placeholders.phone')}
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
};

export default EditCabinetModal;
