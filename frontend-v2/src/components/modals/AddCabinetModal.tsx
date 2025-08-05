/*
 * ================================================================================================
 * MODAL AJOUT CABINET - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour ajouter un nouveau cabinet selon le modèle backend.
 * 
 * ================================================================================================
 */

import React from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs } from 'antd';
import { BankOutlined, MailOutlined, PhoneOutlined, FileTextOutlined, TagOutlined } from '@ant-design/icons';
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

  const handleFinish = async (values: any) => {
    try {
      const cabinetData: CreateCabinetDto = {
        nomCabinet: values.nomCabinet,
        emailCabinet: values.emailCabinet,
        telephoneCabinet: values.telephoneCabinet,
        referenceCabinet: values.referenceCabinet,
        type: values.type,
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
      title="Ajouter un nouveau cabinet"
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
                    <Option value="annuite">Annuité</Option>
                    <Option value="procedure">Procédure</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="referenceCabinet"
                  label="Référence cabinet"
                  rules={[
                    { max: 100, message: 'La référence ne peut pas dépasser 100 caractères' }
                  ]}
                >
                  <Input
                    prefix={<FileTextOutlined />}
                    placeholder="Ex: CAB-001"
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

export default AddCabinetModal;
