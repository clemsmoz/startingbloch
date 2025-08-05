/*
 * ================================================================================================
 * MODAL CRÉATION INVENTEUR
 * ================================================================================================
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { inventeurService } from '../../services';
import type { CreateInventeurDto } from '../../types';

interface CreateInventeurModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (inventeur: any) => void;
}

const CreateInventeurModal: React.FC<CreateInventeurModalProps> = ({
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
      const inventeurData: CreateInventeurDto = {
        nomInventeur: values.nomInventeur,
        prenomInventeur: values.prenomInventeur,
        adresseInventeur: values.adresseInventeur,
        emailInventeur: values.emailInventeur,
        telephoneInventeur: values.telephoneInventeur
      };

      const response = await inventeurService.create(inventeurData);
      if (response.success) {
        onSuccess(response.data);
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'inventeur:', error);
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
      title="Créer un nouvel inventeur"
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
          <Col span={12}>
            <Form.Item
              name="nomInventeur"
              label="Nom"
              rules={[
                { required: true, message: 'Le nom est obligatoire' },
                { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nom de l'inventeur"
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="prenomInventeur"
              label="Prénom"
              rules={[
                { required: true, message: 'Le prénom est obligatoire' },
                { max: 100, message: 'Le prénom ne peut pas dépasser 100 caractères' }
              ]}
            >
              <Input
                placeholder="Prénom de l'inventeur"
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="adresseInventeur"
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
              name="emailInventeur"
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
              name="telephoneInventeur"
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

export default CreateInventeurModal;
