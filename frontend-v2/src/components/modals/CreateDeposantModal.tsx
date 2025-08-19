/*
 * ================================================================================================
 * MODAL CRÉATION DÉPOSANT
 * ================================================================================================
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { deposantService } from '../../services';
import type { CreateDeposantDto, Deposant } from '../../types';

interface CreateDeposantModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (deposant: any) => void;
  existing?: Deposant[];
  onDuplicate?: (deposant: any) => void;
}

const CreateDeposantModal: React.FC<CreateDeposantModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  existing = [],
  onDuplicate
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Détection doublon: par email si fourni, sinon (nom + prénom)
      const norm = (s?: string) => (s || '').toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const email = norm(values.emailDeposant);
      const nom = norm(values.nomDeposant);
      const prenom = norm(values.prenomDeposant);
      const duplicate = existing.find(d => {
        const dEmail = norm(d.emailDeposant);
        const dNom = norm(d.nomDeposant);
        const dPrenom = norm(d.prenomDeposant);
        if (email) return dEmail && dEmail === email;
        if (prenom) return dNom === nom && dPrenom === prenom;
        return dNom === nom;
      });

      if (duplicate) {
        message.info("Ce déposant existe déjà, il a été sélectionné.");
        onDuplicate?.(duplicate);
        form.resetFields();
        onCancel();
        return;
      }

      // Mapper les valeurs vers le format attendu par l'API
      const deposantData: CreateDeposantDto = {
        nomDeposant: values.nomDeposant,
        prenomDeposant: values.prenomDeposant,
        adresseDeposant: values.adresseDeposant,
        emailDeposant: values.emailDeposant,
        telephoneDeposant: values.telephoneDeposant
      };

      const response = await deposantService.create(deposantData);
      if (response.success) {
        onSuccess(response.data);
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Erreur lors de la création du déposant:', error);
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
      title="Créer un nouveau déposant"
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
              name="nomDeposant"
              label="Nom"
              rules={[
                { required: true, message: 'Le nom est obligatoire' },
                { max: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nom du déposant"
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="prenomDeposant"
              label="Prénom"
              rules={[
                { max: 100, message: 'Le prénom ne peut pas dépasser 100 caractères' }
              ]}
            >
              <Input
                placeholder="Prénom du déposant"
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="adresseDeposant"
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
              name="emailDeposant"
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
              name="telephoneDeposant"
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

export default CreateDeposantModal;
