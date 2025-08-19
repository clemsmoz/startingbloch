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
  const [isRecapStep, setIsRecapStep] = useState(false);
  const [formData, setFormData] = useState<CreateCabinetDto | null>(null);

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
    return type === 1 ? 'Annuité' : 'Procédure';
  };

  // Rendu du formulaire
  if (!isRecapStep) {
    return (
      <Modal
        title="Ajouter un nouveau cabinet"
        open={visible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={800}
        okText="Suivant"
        cancelText="Annuler"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
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
                    <Select placeholder="Sélectionner le type">
                      <Option value="1">Annuité</Option>
                      <Option value="2">Procédure</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Adresse" key="2">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="adresseCabinet"
                    label="Adresse"
                    rules={[
                      { required: true, message: 'L\'adresse est obligatoire' },
                      { max: 500, message: 'L\'adresse ne peut pas dépasser 500 caractères' }
                    ]}
                  >
                    <Input
                      placeholder="Ex: 123 Avenue des Champs-Élysées"
                      maxLength={500}
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
                      placeholder="Ex: 75008"
                      maxLength={20}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="paysCabinet"
                    label="Pays"
                    rules={[
                      { required: true, message: 'Le pays est obligatoire' },
                      { max: 100, message: 'Le pays ne peut pas dépasser 100 caractères' }
                    ]}
                  >
                    <Input
                      placeholder="Ex: France"
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Coordonnées" key="3">
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
  }

  // Rendu du récapitulatif
  return (
    <Modal
      title="Récapitulatif - Nouveau cabinet"
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBackToForm}>
          Retour
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          Annuler
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={loading}
          onClick={handleFinalSubmit}
        >
          Créer le cabinet
        </Button>,
      ]}
    >
      <Card>
        <Descriptions title="Informations du cabinet" column={1} bordered>
          <Descriptions.Item label="Nom du cabinet">
            {formData?.nomCabinet}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            {formData?.type ? getTypeLabel(formData.type) : ''}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions title="Adresse" column={1} bordered>
          <Descriptions.Item label="Adresse">
            {formData?.adresseCabinet}
          </Descriptions.Item>
          <Descriptions.Item label="Code postal">
            {formData?.codePostal || 'Non renseigné'}
          </Descriptions.Item>
          <Descriptions.Item label="Pays">
            {formData?.paysCabinet}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Descriptions title="Coordonnées" column={1} bordered>
          <Descriptions.Item label="Email">
            {formData?.emailCabinet || 'Non renseigné'}
          </Descriptions.Item>
          <Descriptions.Item label="Téléphone">
            {formData?.telephoneCabinet || 'Non renseigné'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Modal>
  );
};

export default AddCabinetModal;
