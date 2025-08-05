/*
 * ================================================================================================
 * MODAL CRÉATION TITULAIRE
 * ================================================================================================
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { titulaireService } from '../../services';
import type { CreateTitulaireDto } from '../../types';

interface CreateTitulaireModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (titulaire: any) => void;
}

const CreateTitulaireModal: React.FC<CreateTitulaireModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Mapper les valeurs vers le format attendu par l'API
      const titulaireData: CreateTitulaireDto = {
        nomTitulaire: values.nomTitulaire,
        adresseTitulaire: values.adresseTitulaire,
        emailTitulaire: values.emailTitulaire,
        telephoneTitulaire: values.telephoneTitulaire
      };

      const response = await titulaireService.create(titulaireData);
      if (response.success) {
        onSuccess(response.data);
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Erreur lors de la création du titulaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Créer un nouveau titulaire"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="nomTitulaire"
              label="Nom"
              rules={[
                { required: true, message: 'Le nom est obligatoire' },
                { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nom du titulaire"
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="adresseTitulaire"
              label="Adresse"
              rules={[
                { max: 500, message: 'L\'adresse ne peut pas dépasser 500 caractères' }
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="Adresse complète"
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="emailTitulaire"
              label="Email"
              rules={[
                { type: 'email', message: 'Format d\'email invalide' },
                { max: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="email@exemple.com"
                maxLength={255}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="telephoneTitulaire"
              label="Téléphone"
              rules={[
                { max: 20, message: 'Le téléphone ne peut pas dépasser 20 caractères' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="+33 1 23 45 67 89"
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateTitulaireModal;
