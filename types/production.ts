export interface Inspector {
  name: string;
  timestamp: Date;
}

export interface ProductCatalog {
  code: string;
  name: string;
  category: string;
}

export type ProductionLine = 'ULMA 1 (Central)' | 'ULMA 2 (Izquierda)' | 'Multivac R-105' | 'CRYOVAC VS';
export type RejectionLine = 'ULMA 1 (Central)' | 'ULMA 2 (Izquierda)' | 'Multivac R-105' | 'CRYOVAC VS';
export type ProductState = 'congelado' | 'refrigerado';
export type ProductConfig = 'porcionado' | 'no_porcionado';
export type PackagingType = 'termoformado' | 'empacado_vacio';

export interface CapacityData {
  id: string;
  inspector: string;
  timestamp: Date;
  resourceType: string;
  resourceName: string;
  productName: string;
  packageSize: string;
  peopleCount: number;
  piecesProduced: number;
  defectivePieces: number;
  piecesPerMinute: number;
}

export interface UtilizationData {
  id: string;
  inspector: string;
  timestamp: Date;
  resourceType: string;
  resourceName: string;
  productName: string;
  availableTime: number;
  productiveTime: number;
  utilizationPercentage: number;
  observations?: string;
}

export interface WIPData {
  id: string;
  inspector: string;
  timestamp: Date;
  line: ProductionLine;
  productState: ProductState;
  productConfig: ProductConfig;
  packagingType: PackagingType;
  hasIndividualWeightLabel: boolean;
  productCode: string;
  productName: string;
  packaging: string;
  queueBeforePortioning: number;
  queueBeforePackaging: number;
  queueBeforeIndividualLabeling: number;
  queueBeforeBoxClosure: number;
  queueBeforeBoxStrapping: number;
}

export interface RejectionData {
  id: string;
  inspector: string;
  timestamp: Date;
  line: RejectionLine;
  productName: string;
  packageSize: string;
  rejectionCause: string;
  quantity: number;
}

export type EventType = 
  | 'cambio_molde' 
  | 'reabastecimiento_film' 
  | 'paro_falla_equipo'
  | 'corte_energia_imprevisto'
  | 'corte_energia_planificado'
  | 'salida_bano'
  | 'cambio_producto'
  | 'cambio_cuchilla'
  | 'salida_material_empaque';

export interface SetupTimeData {
  id: string;
  inspector: string;
  timestamp: Date;
  resourceName: string;
  eventType: EventType;
  eventTime: number;
  description?: string;
}

export interface ProductionStore {
  inspector: Inspector | null;
  selectedModule: 'capacity' | 'utilization' | 'wip' | 'rejection' | 'setup' | null;
  capacityRecords: CapacityData[];
  utilizationRecords: UtilizationData[];
  wipRecords: WIPData[];
  rejectionRecords: RejectionData[];
  setupTimeRecords: SetupTimeData[];
  productCatalog: ProductCatalog[];
}