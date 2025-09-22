/*
 * ================================================================================================
 * MODAL CRÉATION DÉPOSANT
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Détection doublon: par email si fourni, sinon (nom + prénom)
  const norm = (s?: string) => (s ?? '').toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
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
        message.info(t('deposants.messages.duplicate'));
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
      title={t('deposants.modals.create.title')}
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
              label={t('deposants.fields.lastName')}
              rules={[
                { max: 100, message: t('deposants.validation.nameMax') }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('deposants.placeholders.lastName')}
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="prenomDeposant"
              label={t('deposants.fields.firstName')}
              rules={[
                { max: 100, message: t('deposants.validation.firstNameMax') }
              ]}
            >
              <Input
                placeholder={t('deposants.placeholders.firstName')}
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="adresseDeposant"
              label={t('deposants.fields.address')}
              rules={[
                { max: 500, message: t('deposants.validation.addressMax') }
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder={t('deposants.placeholders.address')}
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="emailDeposant"
              label={t('deposants.fields.email')}
              rules={[
                { type: 'email', message: t('deposants.validation.emailInvalid') },
                { max: 255, message: t('deposants.validation.emailMax') }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={t('deposants.placeholders.email')}
                maxLength={255}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="telephoneDeposant"
              label={t('deposants.fields.phone')}
              rules={[
                { max: 20, message: t('deposants.validation.phoneMax') }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder={t('deposants.placeholders.phone')}
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
