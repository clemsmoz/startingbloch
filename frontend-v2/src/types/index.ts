/*
 * ================================================================================================
 * TYPES PRINCIPAUX - STARTINGBLOCH FRONTEND V2
 * ================================================================================================
 * 
 * Définitions TypeScript pour les entités métier de l'application
 * de gestion de propriété intellectuelle StartingBloch.
 * 
 * Synchronisé avec le backend .NET 8 pour cohérence des données.
 * 
 * ================================================================================================
 */

// Types d'authentification
export interface User {
  id: number;
  email: string;
  username: string;
  nom: string;
  prenom: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export type UserRole = 'Admin' | 'User' | 'ReadOnly';

// Types d'entités métier
export interface Client {
  id: number;
  nomClient: string;
  referenceClient?: string;
  adresseClient?: string;
  codePostal?: string;
  paysClient?: string;
  emailClient?: string;
  telephoneClient?: string;
  statut?: string;
  canWrite: boolean;
  canRead: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactEmail {
  email: string;
  type?: string;
}

export interface ContactPhone {
  numero: string;
  type?: string;
}

export interface ContactRole {
  role: string;
}

export interface Contact {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  fonction?: string;
  societe?: string;
  idCabinet?: number;
  idClient?: number;
  createdAt: string;
  updatedAt: string;
  // Collections JSON (peuvent être stockées comme string[] dans la BDD mais typées comme objets ici)
  emails: ContactEmail[] | string[];
  phones: ContactPhone[] | string[];
  roles: ContactRole[] | string[];
  // Relations navigationelles
  cabinet?: Cabinet;
  client?: Client;
}

export interface Cabinet {
  id: number;
  nomCabinet: string;
  emailCabinet?: string;
  telephoneCabinet?: string;
  referenceCabinet?: string;
  type?: string; // 'annuite' | 'procedure'
  createdAt: string;
  updatedAt: string;
}

export interface Brevet {
  id: number;
  numeroBrevet?: string; // ReferenceFamille du backend
  titreBrevet?: string; // Titre du backend
  descriptionBrevet?: string; // Commentaire du backend
  dateDepot?: string;
  dateDelivrance?: string;
  dateExpiration?: string;
  statutBrevet?: string;
  paysBrevet?: string;
  classesBrevet?: string;
  createdAt: string;
  updatedAt: string;
  clientId?: number;
  // Relations
  clients?: Client[];
  inventeurs?: Inventeur[];
  deposants?: Deposant[];
  titulaires?: Titulaire[];
  cabinets?: Cabinet[];
  informationsDepot?: InformationDepot[];
}

export interface InformationDepot {
  id: number;
  idBrevet: number;
  idPays?: number;
  idStatuts?: number;
  numeroDepot?: string;
  numeroPublication?: string;
  numeroDelivrance?: string;
  dateDepot?: string;
  datePublication?: string;
  dateDelivrance?: string;
  licence: boolean;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
  // Relations navigationelles
  pays?: Pays;
  statuts?: Statuts;
}

export interface Inventeur {
  id: number;
  nomInventeur: string;
  prenomInventeur: string;
  adresseInventeur?: string;
  emailInventeur?: string;
  telephoneInventeur?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Titulaire {
  id: number;
  nomTitulaire: string;
  adresseTitulaire?: string;
  emailTitulaire?: string;
  telephoneTitulaire?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deposant {
  id: number;
  nomDeposant: string;
  prenomDeposant?: string;
  adresseDeposant?: string;
  emailDeposant?: string;
  telephoneDeposant?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pays {
  id: number;
  nom: string;
  code: string;
  flagUrl?: string;
}

export interface Statuts {
  id: number;
  description: string;
}

export interface Log {
  id: number;
  userId?: number;
  userEmail?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

// Types pour DTOs (Data Transfer Objects)
export interface CreateClientDto {
  nomClient: string;
  referenceClient?: string;
  adresseClient?: string;
  codePostal?: string;
  paysClient?: string;
  emailClient?: string;
  telephoneClient?: string;
  canWrite?: boolean;
  canRead?: boolean;
  isBlocked?: boolean;
}

export interface UpdateClientDto {
  id: number;
  nomClient?: string;
  referenceClient?: string;
  adresseClient?: string;
  codePostal?: string;
  paysClient?: string;
  emailClient?: string;
  telephoneClient?: string;
  canWrite?: boolean;
  canRead?: boolean;
  isBlocked?: boolean;
}

export interface CreateContactDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  idCabinet?: number;
  idClient?: number;
  emails?: string[];
  phones?: string[];
  roles?: string[];
}

export interface UpdateContactDto {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  idCabinet?: number;
  idClient?: number;
  emails?: string[];
  phones?: string[];
  roles?: string[];
}

export interface CreateBrevetDto {
  referenceFamille?: string;
  titre?: string;
  commentaire?: string;
}

export interface UpdateBrevetDto extends CreateBrevetDto {
  id: number;
}

// DTOs pour Inventeur
export interface CreateInventeurDto {
  nomInventeur: string;
  prenomInventeur: string;
  adresseInventeur?: string;
  emailInventeur?: string;
  telephoneInventeur?: string;
}

export interface UpdateInventeurDto {
  id: number;
  nomInventeur?: string;
  prenomInventeur?: string;
  adresseInventeur?: string;
  emailInventeur?: string;
  telephoneInventeur?: string;
}

// DTOs pour Titulaire
export interface CreateTitulaireDto {
  nomTitulaire: string;
  adresseTitulaire?: string;
  emailTitulaire?: string;
  telephoneTitulaire?: string;
}

export interface UpdateTitulaireDto {
  id: number;
  nomTitulaire?: string;
  adresseTitulaire?: string;
  emailTitulaire?: string;
  telephoneTitulaire?: string;
}

// DTOs pour Deposant
export interface CreateDeposantDto {
  nomDeposant: string;
  prenomDeposant?: string;
  adresseDeposant?: string;
  emailDeposant?: string;
  telephoneDeposant?: string;
}

export interface UpdateDeposantDto {
  id: number;
  nomDeposant?: string;
  prenomDeposant?: string;
  adresseDeposant?: string;
  emailDeposant?: string;
  telephoneDeposant?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Type pour les réponses API paginées (correspond au backend PagedResponse)
export interface PagedApiResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  errors?: string[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Types pour les formulaires
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Types pour les notifications
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// Types pour les permissions
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Types utilitaires
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// DTOs pour la création et mise à jour
export interface CreateClientDto {
  nomClient: string;
  adresseClient?: string;
  telephoneClient?: string;
  emailClient?: string;
  statut?: string;
}

export interface UpdateClientDto {
  id: number;
  nomClient?: string;
  adresseClient?: string;
  telephoneClient?: string;
  emailClient?: string;
  statut?: string;
}

export interface CreateBrevetDto {
  referenceFamille?: string;
  titre?: string;
  commentaire?: string;
  // Relations
  clientIds?: number[];
  inventeurIds?: number[];
  titulaireIds?: number[];
  deposantIds?: number[];
  cabinetIds?: number[];
  // Informations de dépôt
  informationsDepot?: CreateInformationDepotDto[];
}

export interface CreateInformationDepotDto {
  idPays?: number;
  idStatuts?: number;
  numeroDepot?: string;
  numeroPublication?: string;
  numeroDelivrance?: string;
  dateDepot?: string;
  datePublication?: string;
  dateDelivrance?: string;
  licence?: boolean;
  commentaire?: string;
}

export interface UpdateBrevetDto {
  id: number;
  referenceFamille?: string;
  titre?: string;
  commentaire?: string;
  // Relations
  clientIds?: number[];
  inventeurIds?: number[];
  titulaireIds?: number[];
  deposantIds?: number[];
  cabinetIds?: number[];
  // Informations de dépôt
  informationsDepot?: UpdateInformationDepotDto[];
}

export interface UpdateInformationDepotDto {
  id?: number; // Si nouveau, pas d'ID
  idPays?: number;
  idStatuts?: number;
  numeroDepot?: string;
  numeroPublication?: string;
  numeroDelivrance?: string;
  dateDepot?: string;
  datePublication?: string;
  dateDelivrance?: string;
  licence?: boolean;
  commentaire?: string;
}

export interface CreateCabinetDto {
  nomCabinet: string;
  emailCabinet?: string;
  telephoneCabinet?: string;
  referenceCabinet?: string;
  type?: string; // 'annuite' | 'procedure'
}

export interface UpdateCabinetDto {
  id: number;
  nomCabinet?: string;
  emailCabinet?: string;
  telephoneCabinet?: string;
  referenceCabinet?: string;
  type?: string; // 'annuite' | 'procedure'
}

export type SortDirection = 'asc' | 'desc';

export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  fixed?: 'left' | 'right';
  render?: (value: any, record: any) => React.ReactNode;
}

// DTOs pour Pays
export interface CreatePaysDto {
  nomPays: string;
  codePays: string;
  isoPays?: string;
}

export interface UpdatePaysDto {
  id: number;
  nomPays?: string;
  codePays?: string;
  isoPays?: string;
}

// DTOs pour Statuts
export interface CreateStatutsDto {
  description: string;
}

export interface UpdateStatutsDto {
  id: number;
  description?: string;
}
