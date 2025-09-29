import React, { useEffect, useState } from 'react';
import { Modal, Button, Select, Upload, message, Space } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { clientService, paysService, statutsService, brevetService } from '../../services';
import AddClientModal from './AddClientModal';
import { parseExcelFile, ParsedFamily } from '../../utils/excelImport';
import AddBrevetModal from './AddBrevetModal';
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
  const [recapClient, setRecapClient] = useState<any | null>(null);
  const [parsedFamilies, setParsedFamilies] = useState<ParsedFamily[] | null>(null);
  const [showAddModalForFamily, setShowAddModalForFamily] = useState<number | null>(null);

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

          setParsedFamilies(mapped);
          console.info('[ImportFromExcel] parsed families mapped', { families: mapped.length, sample: mapped[0] ?? null });
        } catch (err) {
          console.error('[ImportFromExcel] Erreur mapping pays/statuts', err);
          setParsedFamilies(families);
        }
  // Determine recap client: prefer selectedClientId if provided, otherwise fallback to found client object
  if (selectedClientId) {
    // Try to find full client object in loaded clients
    const found = clients.find(c => (c.id ?? c.Id) === selectedClientId) ?? null;
    // If not found, create a minimal object so AddBrevetModal receives the preselected id
    const clientObj = found ?? { id: selectedClientId };
    setRecapClient(clientObj);
  } else {
    const clientObj = clients.find(c => (c.id ?? c.Id) === selectedClientId) ?? null;
    setRecapClient(clientObj);
  }
  // Open the AddBrevetModal prefilled directly (recap uses the same modal as manual add)
  console.info('ImportFromExcelModal: recapClient', recapClient, 'selectedClientId', selectedClientId);
  setShowAddModalForFamily(0);
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
        footer={[
          <Button key="cancel" onClick={onCancel}>{t('actions.cancel') ?? 'Annuler'}</Button>,
          <Button key="prepare" type="primary" onClick={handlePrepare}>{t('brevets.import.prepare') ?? 'Préparer import'}</Button>
        ]}
        width={700}
      >
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
                filterOption={(input, option) => String(option?.children).toLowerCase().includes(String(input).toLowerCase())}
              >
                {clients.map(c => (
                  <Option key={c.id ?? c.Id} value={c.id ?? c.Id}>{c.nomClient ?? c.NomClient ?? c.nom ?? c.Nom}</Option>
                ))}
              </Select>
              <Button onClick={() => setCreateClientVisible(true)} icon={<PlusOutlined />}>{t('brevets.actions.createClient') ?? 'Créer client'}</Button>
            </Space>
          </div>

          <div>
            <div style={{ marginBottom: 8 }}>{t('brevets.import.uploadFile') ?? 'Fichier Excel'}</div>
            <Upload beforeUpload={handleBeforeUpload} accept=".xlsx,.xls" maxCount={1} showUploadList={{ showRemoveIcon: true }} onRemove={() => setFile(null)}>
              <Button icon={<UploadOutlined />}>{t('actions.upload') ?? 'Choisir un fichier'}</Button>
            </Upload>
            {file && <div style={{ marginTop: 8 }}>{t('brevets.import.selectedFile') ?? 'Fichier sélectionné'}: {file.name}</div>}
          </div>

          <div style={{ color: '#666' }}>{t('brevets.import.note') ?? 'Après préparation vous pourrez vérifier et modifier chaque famille avant envoi.'}</div>
        </Space>
      </Modal>

      <AddClientModal
        visible={createClientVisible}
        onCancel={() => setCreateClientVisible(false)}
        onSubmit={async (values: any) => {
          try {
            const resp = await clientService.create(values);
            const created: any = resp?.data ?? resp?.data ?? resp;
            handleClientCreated(created);
            message.success(t('clients.createSuccess') ?? 'Client créé');
          } catch (e) {
            message.error(t('clients.createError') ?? 'Erreur création client');
          }
        }}
      />
      {/* Recap replaced by direct AddBrevetModal usage to match exactly the manual add UI */}

      {parsedFamilies && showAddModalForFamily !== null && showAddModalForFamily < parsedFamilies.length && (
        <AddBrevetModal
          visible={true}
          onCancel={() => { setShowAddModalForFamily(null); onCancel(); }}
          onSubmit={async (values: any) => {
            // Create the brevet server-side after explicit user validation.
            // If multiple families were parsed we will advance to the next family
            // and keep the modal open so the user can review each family in turn.
            try {
              console.info('[ImportFromExcel] creating brevet for family index', showAddModalForFamily, 'payload', { titre: values.titre, referenceFamille: values.referenceFamille });
              const resp = await brevetService.create(values);
              if (resp?.success) {
                console.info('[ImportFromExcel] brevet created successfully for index', showAddModalForFamily, 'id', resp?.data?.id ?? null);
                message.success(t('brevets.addSuccess') ?? 'Brevet ajouté avec succès');
                // If there are more families, advance to the next one instead of closing
                if (parsedFamilies && showAddModalForFamily !== null) {
                  const next = showAddModalForFamily + 1;
                  if (next < parsedFamilies.length) {
                    setShowAddModalForFamily(next);
                    return; // keep the modal open for the next family
                  }
                }
                } else {
                try { console.error('[ImportFromExcel] brevetService.create returned failure', resp); } catch {}
                message.error(resp?.message ?? (t('brevets.createError') ?? 'Erreur création brevet'));
                // Stop the import sequence on error
                setShowAddModalForFamily(null);
                onCancel();
                if (onComplete) onComplete();
                return;
              }
            } catch (err) {
              try { console.error('[ImportFromExcel] Erreur création via import excel', err); } catch {}
              message.error(t('brevets.createError') ?? 'Erreur lors de la création du brevet');
              setShowAddModalForFamily(null);
              onCancel();
              if (onComplete) onComplete();
              return;
            }

            // If we reached here it means all families were created (or it was a single-family file)
            setShowAddModalForFamily(null);
            onCancel();
            if (onComplete) onComplete();
          }}
          // pass preselected client and initialValues mapped from the parsed family
          preselectedClientIds={recapClient ? [recapClient.id ?? recapClient.Id] : undefined}
          editing={false}
          initialValues={{
            titre: parsedFamilies[showAddModalForFamily]?.titre ?? undefined,
            referenceFamille: parsedFamilies[showAddModalForFamily]?.referenceFamille ?? undefined,
            clientIds: recapClient ? [recapClient.id ?? recapClient.Id] : undefined,
            // Map deposits into the shape expected by AddBrevetModal (CreateInformationDepotDto-ish)
            informationsDepot: (parsedFamilies[showAddModalForFamily]?.deposits ?? []).map((d, idx) => ({
              _tempId: `temp_${Date.now()}_${idx}`,
              numeroPublication: d.numeroPublication ?? null,
              numeroDepot: d.numeroDepot ?? null,
              numeroDelivrance: d.numeroDelivrance ?? null,
              dateDepot: d.dateDepot ?? null,
              datePublication: d.datePublication ?? null,
              dateDelivrance: d.dateDelivrance ?? null,
              idPays: (d as any).idPays ?? undefined,
              idStatuts: (d as any).idStatuts ?? undefined,
              licence: (d as any).licence ?? undefined,
              commentaire: (d as any).commentaire ?? undefined,
              cabinetsAnnuites: (d as any).cabinetsAnnuites ?? [],
              cabinetsProcedures: (d as any).cabinetsProcedures ?? [],
            }))
          }}
          title={t('brevets.import.recapAddTitle') ?? 'Vérifier et créer la famille'}
          submitText={t('brevets.import.createFamily') ?? 'Créer la famille'}
        />
      )}
    </>
  );
};

export default ImportFromExcelModal;
