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

  // Initialiser le formulaire avec les données du cabinet
  useEffect(() => {
    if (cabinet && visible) {
  form.setFieldsValue({
        nomCabinet: cabinet.nomCabinet,
        emailCabinet: cabinet.emailCabinet,
        telephoneCabinet: cabinet.telephoneCabinet,
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
      title={`Modifier le cabinet ${cabinet?.nomCabinet}`}
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
          <TabPane tab="Informations générales" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="nomCabinet"
                  label="Nom du cabinet"
                  rules={[
                    { required: true, message: 'Le nom du cabinet est obligatoire' },
                    { max: 255, message: 'Le nom ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<BankOutlined />}
                    placeholder="Ex: Cabinet Dupont & Associés"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Type de cabinet"
                  rules={[
                    { required: true, message: 'Le type de cabinet est obligatoire' }
                  ]}
                >
                  <Select
                    prefix={<TagOutlined />}
                    placeholder="Sélectionner le type"
                  >
                    <Option value={1}>Annuité</Option>
                    <Option value={2}>Procédure</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Coordonnées" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="emailCabinet"
                  label="Email du cabinet"
                  rules={[
                    { type: 'email', message: 'Format d\'email invalide' },
                    { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="cabinet@example.com"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telephoneCabinet"
                  label="Téléphone du cabinet"
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
        </Tabs>
      </Form>
    </Modal>
  );
};

export default EditCabinetModal;
