/*
 * ================================================================================================
 * MODAL AJOUT BREVET - STARTINGBLOCH
 * ================================================================================================
 * 
 * Modal complet pour ajouter un nouveau brevet avec toutes ses informations et relations.
 * 
 * ================================================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Tabs, Button, DatePicker, Switch } from 'antd';
import { FileProtectOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CreateBrevetDto, Client, Contact, Pays, Statuts, CreateInformationDepotDto } from '../../types';
import { clientService, contactService, inventeurService, titulaireService, deposantService } from '../../services';
import CreateInventeurModal from './CreateInventeurModal';
import CreateTitulaireModal from './CreateTitulaireModal';
import CreateDeposantModal from './CreateDeposantModal';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface AddBrevetModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateBrevetDto) => Promise<void>;
  loading?: boolean;
}

const AddBrevetModal: React.FC<AddBrevetModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pays, setPays] = useState<Pays[]>([]);
  const [statuts, setStatuts] = useState<Statuts[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // États pour les modales de création
  const [createInventeurModalVisible, setCreateInventeurModalVisible] = useState(false);
  const [createTitulaireModalVisible, setCreateTitulaireModalVisible] = useState(false);
  const [createDeposantModalVisible, setCreateDeposantModalVisible] = useState(false);

  // Helper function to check if contact has a specific role
  const hasRole = (contact: Contact, roleType: string): boolean => {
    if (!contact.roles) return false;
    return contact.roles.some(role => {
      if (typeof role === 'string') {
        return role.includes(roleType);
      }
      return role.role?.includes(roleType) || false;
    });
  };
  const [informationsDepot, setInformationsDepot] = useState<(CreateInformationDepotDto & { _tempId?: string })[]>([]);
  const [nextTempId, setNextTempId] = useState(1);

  // Charger les données de référence
  useEffect(() => {
    if (visible) {
      loadReferenceData();
    }
  }, [visible]);

  const loadReferenceData = async () => {
    setLoadingData(true);
    try {
      const [clientsResponse, contactsResponse] = await Promise.all([
        clientService.getAll(),
        contactService.getAll()
      ]);

      if (clientsResponse.success) setClients(clientsResponse.data || []);
      if (contactsResponse.success) setContacts(contactsResponse.data || []);
      
      // Données mockées temporaires pour pays et statuts
      setPays([
        { id: 1, nom: 'France', code: 'FR' },
        { id: 2, nom: 'États-Unis', code: 'US' },
        { id: 3, nom: 'Europe', code: 'EP' },
        { id: 4, nom: 'PCT International', code: 'WO' },
        { id: 5, nom: 'Allemagne', code: 'DE' },
        { id: 6, nom: 'Royaume-Uni', code: 'GB' },
      ]);
      
      setStatuts([
        { id: 1, description: 'En cours d\'examen' },
        { id: 2, description: 'Publié' },
        { id: 3, description: 'Délivré' },
        { id: 4, description: 'Rejeté' },
        { id: 5, description: 'Abandonné' },
        { id: 6, description: 'En attente' },
      ]);
      
      // setCabinets([]) // Temporairement vide jusqu'à ce que cabinetService soit disponible
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      // Nettoyer les informations de dépôt en retirant les _tempId
      const cleanedInformationsDepot = informationsDepot.map(info => {
        const { _tempId, ...cleanInfo } = info;
        return cleanInfo;
      });

      const brevetData: CreateBrevetDto = {
        referenceFamille: values.referenceFamille,
        titre: values.titre,
        commentaire: values.commentaire,
        // Relations
        clientIds: values.clientIds || [],
        inventeurIds: values.inventeurIds || [],
        titulaireIds: values.titulaireIds || [],
        deposantIds: values.deposantIds || [],
        cabinetIds: values.cabinetIds || [],
        // Informations de dépôt
        informationsDepot: cleanedInformationsDepot.length > 0 ? cleanedInformationsDepot : undefined
      };

      await onSubmit(brevetData);
      form.resetFields();
      setInformationsDepot([]);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setInformationsDepot([]);
    onCancel();
  };

  // Fonctions pour gérer les informations de dépôt
  const addInformationDepot = () => {
    const newInfo = {
      licence: false,
      _tempId: `temp_${nextTempId}`
    };
    setInformationsDepot([...informationsDepot, newInfo]);
    setNextTempId(nextTempId + 1);
  };

  const removeInformationDepot = (tempId: string) => {
    const newInfos = informationsDepot.filter(info => info._tempId !== tempId);
    setInformationsDepot(newInfos);
  };

  const updateInformationDepot = (tempId: string, field: string, value: any) => {
    const newInfos = informationsDepot.map(info => 
      info._tempId === tempId ? { ...info, [field]: value } : info
    );
    setInformationsDepot(newInfos);
  };

  // Fonctions pour gérer la création d'entités
  const handleInventeurCreated = async (inventeur: any) => {
    console.log('Inventeur créé:', inventeur);
    // Optionnel : actualiser la liste des contacts si nécessaire
    await loadReferenceData();
  };

  const handleTitulaireCreated = async (titulaire: any) => {
    console.log('Titulaire créé:', titulaire);
    // Optionnel : actualiser la liste des contacts si nécessaire
    await loadReferenceData();
  };

  const handleDeposantCreated = async (deposant: any) => {
    console.log('Déposant créé:', deposant);
    // Optionnel : actualiser la liste des contacts si nécessaire
    await loadReferenceData();
  };

  return (
    <Modal
      title="Ajouter un nouveau brevet"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Informations générales" key="1">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="titre"
                  label="Titre du brevet"
                  rules={[
                    { required: true, message: 'Le titre du brevet est obligatoire' },
                    { max: 500, message: 'Le titre ne peut pas dépasser 500 caractères' }
                  ]}
                >
                  <Input
                    prefix={<FileProtectOutlined />}
                    placeholder="Titre descriptif du brevet"
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="referenceFamille"
                  label="Référence famille"
                  rules={[
                    { max: 255, message: 'La référence ne peut pas dépasser 255 caractères' }
                  ]}
                >
                  <Input
                    placeholder="Référence de la famille de brevets"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="commentaire"
                  label="Commentaire interne"
                >
                  <TextArea
                    placeholder="Commentaires internes sur le brevet"
                    rows={4}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Clients" key="2">
            <Form.Item
              name="clientIds"
              label="Clients associés"
              tooltip="Sélectionnez les clients propriétaires de ce brevet"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les clients"
                loading={loadingData}
                showSearch
              >
                {clients.map(client => (
                  <Option key={client.id} value={client.id}>
                    {client.nomClient}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Inventeurs" key="3">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={() => setCreateInventeurModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Créer un nouvel inventeur
              </Button>
            </div>
            
            <Form.Item
              name="inventeurIds"
              label="Inventeurs"
              tooltip="Sélectionnez les inventeurs de ce brevet"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les inventeurs"
                loading={loadingData}
                showSearch
              >
                {contacts.filter(c => hasRole(c, 'Inventeur')).map(contact => (
                  <Option key={contact.id} value={contact.id}>
                    {contact.prenom} {contact.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Titulaires" key="4">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={() => setCreateTitulaireModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Créer un nouveau titulaire
              </Button>
            </div>
            
            <Form.Item
              name="titulaireIds"
              label="Titulaires"
              tooltip="Sélectionnez les titulaires (propriétaires légaux) de ce brevet"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les titulaires"
                loading={loadingData}
                showSearch
              >
                {contacts.filter(c => hasRole(c, 'Titulaire')).map(contact => (
                  <Option key={contact.id} value={contact.id}>
                    {contact.prenom} {contact.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Déposants" key="5">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={() => setCreateDeposantModalVisible(true)}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Créer un nouveau déposant
              </Button>
            </div>
            
            <Form.Item
              name="deposantIds"
              label="Déposants"
              tooltip="Sélectionnez les déposants (entités effectuant le dépôt)"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les déposants"
                loading={loadingData}
                showSearch
              >
                {contacts.filter(c => hasRole(c, 'Déposant')).map(contact => (
                  <Option key={contact.id} value={contact.id}>
                    {contact.prenom} {contact.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Cabinets" key="6">
            <Form.Item
              name="cabinetIds"
              label="Cabinets d'avocats"
              tooltip="Sélectionnez les cabinets associés à ce brevet"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les cabinets"
                loading={loadingData}
                showSearch
                disabled
              >
                {/* Cabinet selection will be implemented later */}
              </Select>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Informations de dépôt" key="7">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="dashed" 
                onClick={addInformationDepot}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Ajouter une information de dépôt
              </Button>
            </div>

            {informationsDepot.map((info) => (
              <div key={info._tempId} style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: 6, 
                padding: 16, 
                marginBottom: 16,
                backgroundColor: '#fafafa'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16 
                }}>
                  <h4 style={{ margin: 0 }}>Dépôt #{informationsDepot.findIndex(i => i._tempId === info._tempId) + 1}</h4>
                  <Button 
                    type="text" 
                    danger 
                    onClick={() => removeInformationDepot(info._tempId!)}
                    icon={<DeleteOutlined />}
                  />
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Pays de dépôt</label>
                      <Select
                        placeholder="Sélectionner un pays"
                        value={info.idPays}
                        onChange={(value) => updateInformationDepot(info._tempId!, 'idPays', value)}
                        style={{ width: '100%' }}
                        showSearch
                      >
                        {pays.map(p => (
                          <Option key={p.id} value={p.id}>
                            {p.code} - {p.nom}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Statut</label>
                      <Select
                        placeholder="Sélectionner un statut"
                        value={info.idStatuts}
                        onChange={(value) => updateInformationDepot(info._tempId!, 'idStatuts', value)}
                        style={{ width: '100%' }}
                      >
                        {statuts.map(s => (
                          <Option key={s.id} value={s.id}>
                            {s.description}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Numéro de dépôt</label>
                      <Input
                        placeholder="Ex: FR2313456"
                        value={info.numeroDepot}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroDepot', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Numéro de publication</label>
                      <Input
                        placeholder="Numéro de publication"
                        value={info.numeroPublication}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroPublication', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Numéro de délivrance</label>
                      <Input
                        placeholder="Numéro de délivrance"
                        value={info.numeroDelivrance}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'numeroDelivrance', e.target.value)}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Date de dépôt</label>
                      <DatePicker
                        placeholder="Date de dépôt"
                        value={info.dateDepot ? dayjs(info.dateDepot) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'dateDepot', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Date de publication</label>
                      <DatePicker
                        placeholder="Date de publication"
                        value={info.datePublication ? dayjs(info.datePublication) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'datePublication', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Date de délivrance</label>
                      <DatePicker
                        placeholder="Date de délivrance"
                        value={info.dateDelivrance ? dayjs(info.dateDelivrance) : null}
                        onChange={(date) => updateInformationDepot(info._tempId!, 'dateDelivrance', date?.toISOString())}
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Licence accordée</label>
                      <Switch
                        checked={info.licence}
                        onChange={(checked) => updateInformationDepot(info._tempId!, 'licence', checked)}
                        checkedChildren="Oui"
                        unCheckedChildren="Non"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>Commentaire</label>
                      <TextArea
                        placeholder="Commentaires sur ce dépôt"
                        value={info.commentaire}
                        onChange={(e) => updateInformationDepot(info._tempId!, 'commentaire', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            ))}

            {informationsDepot.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: 32, 
                color: '#999',
                border: '1px dashed #d9d9d9',
                borderRadius: 6
              }}>
                Aucune information de dépôt ajoutée.
                <br />
                Cliquez sur le bouton ci-dessus pour ajouter des informations de dépôt par pays.
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </Form>

      {/* Modales de création d'entités */}
      <CreateInventeurModal
        visible={createInventeurModalVisible}
        onCancel={() => setCreateInventeurModalVisible(false)}
        onSuccess={handleInventeurCreated}
      />

      <CreateTitulaireModal
        visible={createTitulaireModalVisible}
        onCancel={() => setCreateTitulaireModalVisible(false)}
        onSuccess={handleTitulaireCreated}
      />

      <CreateDeposantModal
        visible={createDeposantModalVisible}
        onCancel={() => setCreateDeposantModalVisible(false)}
        onSuccess={handleDeposantCreated}
      />
    </Modal>
  );
};

export default AddBrevetModal;
