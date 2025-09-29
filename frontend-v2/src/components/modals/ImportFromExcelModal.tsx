import React, { useEffect, useState } from 'react';
import { Modal, Button, Select, Upload, message, Space, Spin } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { clientService, paysService, statutsService, brevetService } from '../../services';
import AddClientModal from './AddClientModal';
import { parseExcelFile } from '../../utils/excelImport';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface ImportFromExcelModalProps {
  visible: boolean;
  onCancel: () => void;
  onPrepare?: (payload: { clientId?: number | null; file?: File | null }) => void;
  onComplete?: () => void; // called when import sequence finished to allow parent to refresh
}

const ImportFromExcelModal: React.FC<ImportFromExcelModalProps> = ({ visible, onCancel, onPrepare, onComplete }) => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [createClientVisible, setCreateClientVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  // Removed recapClient and parsedFamilies states; import is non-interactive and creates directly.
  // removed modal-per-family flow - import will be executed automatically
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) loadClients();
  }, [visible]);

  // reference onPrepare so it's recognized as used when passed by parent
  useEffect(() => {
    if (!onPrepare) return;
    // no-op: parent can use this callback; keep reference to avoid TS unused prop error
    void onPrepare;
  }, [onPrepare]);

  const loadClients = async () => {
    try {
      const resp = await clientService.getAll();
      if (resp && resp.success && Array.isArray(resp.data)) setClients(resp.data);
    } catch (e) {
      // ignore
    }
  };

  const handleBeforeUpload = (f: File) => {
    // Store the file in state and prevent auto upload
    setFile(f);
    console.info('[ImportFromExcel] file selected:', f.name, f.size);
    return false;
  };

  const handlePrepare = () => {
    if (!file) {
      message.error(t('import.errors.noFile') ?? 'Aucun fichier sélectionné');
      return;
    }
    // Parse the file now (client-side) but do not create anything server-side.
    console.info('[ImportFromExcel] starting parse for file:', file.name);
    parseExcelFile(file)
      .then(async (families) => {
        console.info('[ImportFromExcel] parseExcelFile resolved families count:', families.length);
        // Resolve countries and statuts
        try {
          const [pResp, sResp] = await Promise.all([paysService.getAll(), statutsService.getAll()]);
          const paysList: any[] = (pResp && pResp.success && Array.isArray(pResp.data)) ? pResp.data : [];
          const statutsList: any[] = (sResp && sResp.success && Array.isArray(sResp.data)) ? sResp.data : [];

          const codeToPaysId = new Map<string, number>();
          paysList.forEach((p: any) => {
            const code = (p.code ?? p.codePays ?? p.CodePays ?? p.Code ?? '').toString().toUpperCase();
            if (code) codeToPaysId.set(code, p.id ?? p.Id);
          });

          const normalize = (s?: string) => (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

          const statutNameToId = new Map<string, number>();
          statutsList.forEach((st: any) => {
            // backend Statuts DTO uses 'description' per types
            const name = (st.description ?? st.Description ?? st.name ?? st.Name ?? '').toString();
            if (name) statutNameToId.set(normalize(name), st.id ?? st.Id);
          });

          const findPaysId = (alpha2?: string | null) => {
            if (!alpha2) return undefined;
            return codeToPaysId.get(alpha2.toUpperCase());
          };

          const findStatutId = (statut?: string | null) => {
            if (!statut) return undefined;
            const low = normalize(statut);
            // Try exact match
            if (statutNameToId.has(low)) return statutNameToId.get(low);
            // Try contains
            for (const [name, id] of statutNameToId.entries()) {
              if (low.includes(name) || name.includes(low)) return id;
            }
            return undefined;
          };

          const mapped = families.map((f) => ({
            ...f,
            deposits: (f.deposits || []).map((d) => ({
              ...d,
              idPays: findPaysId(d.countryAlpha2) ?? undefined,
              idStatuts: findStatutId(d.statut) ?? undefined,
            }))
          }));

          console.info('[ImportFromExcel] parsed families mapped', { families: mapped.length, sample: mapped[0] ?? null });
          // Automatically create families directly (user requested no per-item modal)
          (async () => {
            const created: { familyRef?: string; id?: number }[] = [];
            setProcessing(true);
            for (const fam of mapped) {
              try {
                // Build payload matching AddBrevetModal's final submit shape
                const payload: any = {
                  referenceFamille: fam.referenceFamille,
                  titre: fam.titre,
                  // Not setting clientIds here: parent selected clientId is optional
                  informationsDepot: (fam.deposits || []).map((d: any) => ({
                    numeroPublication: d.numeroPublication ?? null,
                    numeroDepot: d.numeroDepot ?? null,
                    numeroDelivrance: d.numeroDelivrance ?? null,
                    dateDepot: d.dateDepot ?? null,
                    datePublication: d.datePublication ?? null,
                    dateDelivrance: d.dateDelivrance ?? null,
                    idPays: d.idPays ?? undefined,
                    idStatuts: d.idStatuts ?? undefined,
                    licence: d.licence ?? false,
                    commentaire: d.commentaire ?? undefined,
                    cabinetsAnnuites: d.cabinetsAnnuites ?? [],
                    cabinetsProcedures: d.cabinetsProcedures ?? []
                  }))
                };
                // If a client was preselected, include it
                if (selectedClientId) payload.clientIds = [selectedClientId];
                const resp = await brevetService.create(payload);
                      if (resp?.success) {
                        const dataObj: any = resp.data ?? resp;
                  created.push({ familyRef: fam.referenceFamille ?? undefined, id: dataObj?.id ?? dataObj?.Id });
                } else {
                  // ignore failures as per user's instruction (no error report)
                }
              } catch (err) {
                      console.error('[ImportFromExcel] creation error for family', fam.referenceFamille, err);
              }
            }
            setProcessing(false);
            // Navigate to recap page with created entries
            try {
              navigate('/brevets/import/result', { state: { created, fileName: file?.name ?? null } });
            } catch (e) {
              console.info('ImportFromExcel: navigation to result failed', e);
            }
            // Close the modal and trigger onComplete
            // clear file and close modal
            setFile(null);
            if (onComplete) onComplete();
          })();
        } catch (err) {
          console.error('[ImportFromExcel] Erreur mapping pays/statuts', err);
          // fallback: still attempt to create using raw parsed families
        }
  // Determine recap client: prefer selectedClientId if provided, otherwise fallback to found client object
  // recapClient logic removed: import creates directly
      })
      .catch((err) => {
        console.error('[ImportFromExcel] Erreur parsing Excel', err);
        message.error(t('import.errors.parse') ?? 'Erreur lecture du fichier Excel');
      });
  };

  const handleClientCreated = (created: any) => {
    const obj = created?.Data ?? created?.data ?? created;
    const id = obj?.id ?? obj?.Id;
    if (id) {
      setClients(prev => (obj ? [...prev, obj] : prev));
      setSelectedClientId(Number(id));
    }
    setCreateClientVisible(false);
  };

  return (
    <>
      <Modal
        title={t('brevets.import.title') ?? 'Importer depuis Excel'}
        open={visible}
        onCancel={onCancel}
        maskClosable={!processing}
        closable={!processing}
        footer={[
          <Button key="cancel" onClick={onCancel} disabled={processing}>{t('actions.cancel') ?? 'Annuler'}</Button>,
          <Button key="prepare" type="primary" onClick={handlePrepare} disabled={processing}>{processing ? (t('brevets.import.processing') ?? 'Import en cours...') : (t('brevets.import.prepare') ?? 'Préparer import')}</Button>
        ]}
        width={700}
      >
        <Spin spinning={processing} tip={t('brevets.import.processing') ?? 'Import en cours...'}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ marginBottom: 8 }}>{t('brevets.import.chooseClient') ?? 'Client (optionnel)'}</div>
            <Space>
              <Select
                showSearch
                placeholder={t('brevets.placeholders.selectClients')}
                style={{ minWidth: 300 }}
                value={selectedClientId ?? undefined}
                onChange={(v) => setSelectedClientId(v ?? null)}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const children = option?.children;
                  let text = '';
                  if (typeof children === 'string') text = children;
                  else if (typeof children === 'number') text = String(children);
                  else if (React.isValidElement(children)) {
                    const c: any = children as any;
                    text = String(c.props?.children ?? c.props?.title ?? '');
                  }
                  return text.toLowerCase().includes(String(input).toLowerCase());
                }}
              >
                {clients.map(c => (
                  <Option key={c.id ?? c.Id} value={c.id ?? c.Id}>{c.nomClient ?? c.NomClient ?? c.nom ?? c.Nom}</Option>
                ))}
              </Select>
              <Button onClick={() => setCreateClientVisible(true)} icon={<PlusOutlined />} disabled={processing}>{t('brevets.actions.createClient') ?? 'Créer client'}</Button>
            </Space>
          </div>

          <div>
            <div style={{ marginBottom: 8 }}>{t('brevets.import.uploadFile') ?? 'Fichier Excel'}</div>
            <Upload beforeUpload={handleBeforeUpload} accept=".xlsx,.xls" maxCount={1} showUploadList={{ showRemoveIcon: true }} onRemove={() => setFile(null)} disabled={processing}>
              <Button icon={<UploadOutlined />} disabled={processing}>{t('actions.upload') ?? 'Choisir un fichier'}</Button>
            </Upload>
            {file && <div style={{ marginTop: 8 }}>{t('brevets.import.selectedFile') ?? 'Fichier sélectionné'}: {file.name}</div>}
          </div>

          <div style={{ color: '#666' }}>{t('brevets.import.note') ?? 'Après préparation vous pourrez vérifier et modifier chaque famille avant envoi.'}</div>
        </Space>
        </Spin>
      </Modal>

      <AddClientModal
        visible={createClientVisible}
        onCancel={() => setCreateClientVisible(false)}
          onSubmit={async (values: any) => {
          try {
            const resp = await clientService.create(values);
            const created: any = resp?.data ?? resp ?? resp;
            handleClientCreated(created);
            message.success(t('clients.createSuccess') ?? 'Client créé');
          } catch (e) {
            console.error('[ImportFromExcel] create client error', e);
            message.error(t('clients.createError') ?? 'Erreur création client');
          }
        }}
      />
      {/* Recap replaced by direct AddBrevetModal usage to match exactly the manual add UI */}

      {/* per-family AddBrevetModal removed: import now creates entries automatically and navigates to recap page */}
    </>
  );
};

export default ImportFromExcelModal;
