/*
 * ================================================================================================
 * MODAL ÉDITION BREVET - STARTINGBLOCH (clean)
 * ================================================================================================
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddBrevetModal from './AddBrevetModal';
import dayjs from 'dayjs';
import { message } from 'antd';
import { brevetService } from '../../services';
import type { Brevet, UpdateBrevetDto } from '../../types';

interface EditBrevetModalProps {
  visible: boolean;
  brevet: Brevet | null;
  onCancel: () => void;
  /** Optional callback executed after a successful update. If provided it will be called with (id, values). */
  onSubmit?: (id: number, values: UpdateBrevetDto) => Promise<void>;
  /** Optional success callback (no args) */
  onSuccess?: () => void;
  loading?: boolean;
}

const EditBrevetModal: React.FC<EditBrevetModalProps> = ({ visible, brevet, onCancel, onSubmit, onSuccess, loading = false }) => {
  const { t } = useTranslation();

  const initialValues = React.useMemo(() => {
    if (!brevet) return undefined;
    const iv: any = {};
    // Map backend field names to the form fields expected by AddBrevetModal
    iv.titre = (brevet as any).titreBrevet ?? (brevet as any).titre ?? '';
    iv.referenceFamille = (brevet as any).numeroBrevet ?? (brevet as any).referenceFamille ?? (brevet as any).reference ?? '';
    iv.commentaire = (brevet as any).descriptionBrevet ?? (brevet as any).commentaire ?? '';
    // Dates
    if ((brevet as any).dateDepot) iv.dateDepot = dayjs((brevet as any).dateDepot);
    if ((brevet as any).datePublication) iv.datePublication = dayjs((brevet as any).datePublication);
    if ((brevet as any).dateDelivrance) iv.dateDelivrance = dayjs((brevet as any).dateDelivrance);
    if ((brevet as any).dateExpiration) iv.dateExpiration = dayjs((brevet as any).dateExpiration);
    // Clients
    if (Array.isArray((brevet as any).clients)) iv.clientIds = (brevet as any).clients.map((c: any) => c?.id ?? c?.Id).filter(Boolean);
    else if (typeof (brevet as any).clientId !== 'undefined') iv.clientIds = [(brevet as any).clientId];
    // informationsDepot -> normaliser les structures imbriquées (gérer PascalCase et camelCase + normaliser rows)
    const rawInfos = (brevet as any).informationsDepot ?? (brevet as any).InformationsDepot ?? null;
    if (Array.isArray(rawInfos)) {
      iv.informationsDepot = rawInfos.map((i: any) => {
        const info: any = { ...i };
        // assign temp id for UI tracking
  info._tempId = i._tempId ?? `tmp_init_${Date.now()}_${Math.floor(Math.random()*10000)}`;

        // map basic scalar fields (PascalCase -> camelCase)
        info.idPays = i.idPays ?? i.IdPays ?? (i.Pays && (i.Pays.id ?? i.Pays.Id)) ?? i.paysId ?? i.PaysId ?? undefined;
        info.idStatuts = i.idStatuts ?? i.IdStatuts ?? (i.Statuts && (i.Statuts.id ?? i.Statuts.Id)) ?? i.paysStatutId ?? undefined;
        info.numeroDepot = i.numeroDepot ?? i.NumeroDepot ?? i.Numero ?? i.numero ?? '';
        info.numeroPublication = i.numeroPublication ?? i.NumeroPublication ?? i.numeroPublication ?? '';
        info.numeroDelivrance = i.numeroDelivrance ?? i.NumeroDelivrance ?? i.numeroDelivrance ?? '';
        info.dateDepot = i.dateDepot ?? i.DateDepot ?? i.DateDepotIso ?? i.dateDepotIso ?? undefined;
        info.datePublication = i.datePublication ?? i.DatePublication ?? undefined;
        info.dateDelivrance = i.dateDelivrance ?? i.DateDelivrance ?? undefined;
        info.licence = typeof i.licence !== 'undefined' ? i.licence : (typeof i.Licence !== 'undefined' ? i.Licence : false);
        info.commentaire = i.commentaire ?? i.Commentaire ?? '';

        // Helper pour normaliser les rows de cabinets (annuites / procedures)
        const normRows = (rowsAny: any) => {
          const rows = rowsAny ?? [];
          if (!Array.isArray(rows)) return [];
          return rows.map((r: any) => {
            const cabinetId = r?.cabinetId ?? r?.CabinetId ?? (r?.Cabinet && (r.Cabinet.id ?? r.Cabinet.Id)) ?? undefined;
            // rôles peut être Roles / roles et peut être string ou array
            const rawRoles = r?.roles ?? r?.Roles ?? undefined;
            const roles = Array.isArray(rawRoles) ? rawRoles.map((x: any) => String(x)) : (rawRoles ? [String(rawRoles)] : []);
            // contacts peuvent être contactIds / ContactIds ou Contacts (obj)
            let contactIds: number[] = [];
            if (Array.isArray(r?.contactIds)) contactIds = r.contactIds;
            else if (Array.isArray(r?.ContactIds)) contactIds = r.ContactIds;
            else if (Array.isArray(r?.Contacts)) contactIds = r.Contacts.map((c: any) => c?.id ?? c?.Id).filter(Boolean);
            else if (r?.contactIds) contactIds = [r.contactIds].filter(Boolean);
            else if (r?.ContactIds) contactIds = [r.ContactIds].filter(Boolean);

            return { cabinetId, roles, contactIds };
          });
        };

        // pick possible sources for cabinets arrays (PascalCase / camelCase)
        const ann = i.cabinetsAnnuites ?? i.CabinetsAnnuites ?? i.CabinetsAnnuites ?? i.cabinets ?? i.Cabinets ?? [];
        const proc = i.cabinetsProcedures ?? i.CabinetsProcedures ?? i.CabinetsProcedures ?? i.cabinetsProcedures ?? [];
        info.cabinetsAnnuites = normRows(ann);
        info.cabinetsProcedures = normRows(proc);

        return info;
      });
    }

    // Relations: inventeurs / titulaires / deposants -> fournir les arrays d'IDs attendues par AddBrevetModal
    const toIds = (arr: any) => Array.isArray(arr) ? arr.map((x: any) => x?.id ?? x?.Id).filter(Boolean) : undefined;
    if (Array.isArray((brevet as any).inventeurs)) iv.inventeurIds = toIds((brevet as any).inventeurs);
    else if (Array.isArray((brevet as any).Inventeurs)) iv.inventeurIds = toIds((brevet as any).Inventeurs);

    if (Array.isArray((brevet as any).titulaires)) iv.titulaireIds = toIds((brevet as any).titulaires);
    else if (Array.isArray((brevet as any).Titulaires)) iv.titulaireIds = toIds((brevet as any).Titulaires);

    if (Array.isArray((brevet as any).deposants)) iv.deposantIds = toIds((brevet as any).deposants);
    else if (Array.isArray((brevet as any).Deposants)) iv.deposantIds = toIds((brevet as any).Deposants);
    // Pays par entité (inventeurs/deposants/titulaires) if present on the brevet payload
    if (Array.isArray((brevet as any).inventeursPays)) iv.inventeursPays = (brevet as any).inventeursPays;
    if (Array.isArray((brevet as any).deposantsPays)) iv.deposantsPays = (brevet as any).deposantsPays;
    if (Array.isArray((brevet as any).titulairesPays)) iv.titulairesPays = (brevet as any).titulairesPays;

    return iv;
  }, [brevet]);

  const [updating, setUpdating] = useState(false);

  const toIso = (d: any) => d?.toISOString?.() ?? undefined;
  const handleSubmit = async (values: any) => {
    if (!brevet || typeof (brevet as any).id !== 'number') return;
    const id = (brevet as any).id;
    // Merge submitted values with initialValues in a safe way:
    // - start from initialValues
    // - copy keys from values only if defined
    // - do NOT overwrite initial array fields with empty arrays coming from the form (these are usually unintentional)
  const mergedValues: any = { ...(initialValues ?? {}) };
    if (values && typeof values === 'object') {
      Object.keys(values).forEach((k) => {
        const v = (values as any)[k];
        // skip undefined
        if (typeof v === 'undefined') return;
        // if it's an array and empty, assume it's unintentional and keep initial value
        if (Array.isArray(v) && v.length === 0) return;
        mergedValues[k] = v;
      });
    }

    const payload: any = {};
    // helper to read from values when explicitly modified, otherwise from initialValues
  const hasOwn = (k: string) => (values && Object.prototype.hasOwnProperty.call(values, k));
    const getVal = (k: string) => {
      if (hasOwn(k)) return values[k];
      return initialValues ? initialValues[k] : undefined;
    };
  if (typeof getVal('titre') !== 'undefined') payload.titre = getVal('titre');
  if (typeof getVal('referenceFamille') !== 'undefined') payload.referenceFamille = getVal('referenceFamille');
  if (typeof getVal('commentaire') !== 'undefined') payload.commentaire = getVal('commentaire');
  if (typeof getVal('statut') !== 'undefined') payload.statut = getVal('statut');
  const dDepot = toIso(getVal('dateDepot')); if (dDepot) payload.dateDepot = dDepot;
  const dPub = toIso(getVal('datePublication')); if (dPub) payload.datePublication = dPub;
  const dDel = toIso(getVal('dateDelivrance')); if (dDel) payload.dateDelivrance = dDel;
  const dExp = toIso(getVal('dateExpiration')); if (dExp) payload.dateExpiration = dExp;
  // Only include relation arrays in the payload if the form explicitly modified them and they are non-empty.
  // This avoids accidental clearing when the form returns empty arrays for fields that weren't touched.
  if (hasOwn('clientIds') && Array.isArray(values.clientIds) && values.clientIds.length > 0) payload.clientIds = values.clientIds;
  if (hasOwn('inventeurIds') && Array.isArray(values.inventeurIds) && values.inventeurIds.length > 0) payload.inventeurIds = values.inventeurIds;
  if (hasOwn('titulaireIds') && Array.isArray(values.titulaireIds) && values.titulaireIds.length > 0) payload.titulaireIds = values.titulaireIds;
  if (hasOwn('deposantIds') && Array.isArray(values.deposantIds) && values.deposantIds.length > 0) payload.deposantIds = values.deposantIds;
  if (hasOwn('informationsDepot') && Array.isArray(values.informationsDepot) && values.informationsDepot.length > 0) payload.informationsDepot = values.informationsDepot;
  // Countries per entity (inventeurs/deposants/titulaires) - include when explicitly modified
  if (hasOwn('inventeursPays') && Array.isArray(values.inventeursPays) && values.inventeursPays.length > 0) payload.inventeursPays = values.inventeursPays;
  if (hasOwn('deposantsPays') && Array.isArray(values.deposantsPays) && values.deposantsPays.length > 0) payload.deposantsPays = values.deposantsPays;
  if (hasOwn('titulairesPays') && Array.isArray(values.titulairesPays) && values.titulairesPays.length > 0) payload.titulairesPays = values.titulairesPays;

    try {
      setUpdating(true);
      const resp = await brevetService.update(id, payload);
      // brevetService peut retourner différentes formes (camelCase / PascalCase)
      const anyResp: any = resp;
      const serverSuccess = anyResp?.success ?? anyResp?.Success ?? false;
      const serverData = anyResp?.data ?? anyResp?.Data ?? null;
      const serverId = anyResp?.id ?? anyResp?.Id ?? serverData?.id ?? serverData?.Id ?? null;

      // Considérer la mise à jour comme réussie si le serveur retourne Success=true ou bien un Id dans Data
      if (serverSuccess || serverId) {
        const successMsg = anyResp?.message ?? anyResp?.Message ?? (serverData && (serverData.Message ?? serverData.message)) ?? t('brevets.updateSuccess');
        message.success(successMsg);
        // notify parent but don't block on it
        if (typeof onSubmit === 'function') onSubmit(id, payload);
        if (typeof onSuccess === 'function') onSuccess();
        onCancel();
        return;
      }

      // Si here, considérer comme erreur: extraire message lisible
      const candidateMsg = anyResp?.message ?? anyResp?.Message ?? anyResp?.errors ?? anyResp?.Errors
        ?? (anyResp?.data && (anyResp.data.Message ?? anyResp.data.message ?? anyResp.data.Errors))
        ?? anyResp?.data ?? anyResp;
      console.error('Mise à jour du brevet échouée - réponse:', anyResp);
      // formatter proprement le message
      let msgStr: string;
      if (typeof candidateMsg === 'string') {
        msgStr = candidateMsg.length > 300 ? candidateMsg.slice(0, 300) + '...' : candidateMsg;
      } else {
        try { msgStr = JSON.stringify(candidateMsg); } catch { msgStr = 'Erreur lors de la mise à jour du brevet'; }
      }
      message.error(msgStr);
    } catch (e: any) {
      // Log detailed axios response if present
      console.error('Erreur lors de la requête de mise à jour du brevet', e);
      try {
        console.error('Axios response data:', e?.response?.data);
      } catch (err) {
        // ignore
      }
  const server = e?.response?.data;
  const err = server?.Message ?? server?.message ?? e?.message ?? t('brevets.notifications.unknownError');
  message.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const brevetNumber = brevet ? ((brevet as any).numeroBrevet ?? (brevet as any).numero ?? '') : '';
  const title = brevetNumber ? t('brevets.modals.edit.titleWithNumber', { number: brevetNumber }) : t('brevets.modals.edit.title');

  return (
    <AddBrevetModal
      visible={visible}
      editing
      initialValues={initialValues}
      title={title}
      onCancel={onCancel}
      onSubmit={handleSubmit}
  loading={loading || updating}
    />
  );
};

export default EditBrevetModal;
