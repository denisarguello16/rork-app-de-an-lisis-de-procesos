export interface Inspector {
  name: string;
  timestamp: Date;
}

export interface ProductCatalog {
  code: string;
  name: string;
  category: string;
}

export type ProductionLine = 'ULMA 1 (Central)' | 'ULMA 2 (Izquierda)' | 'Multivac R-105' | 'VS-95';
export type RejectionLine = 'ULMA 1 (Central)' | 'ULMA 2 (Izquierda)' | 'Multivac R-105' | 'VS-95';
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
  productCode?: string;
  line?: string;
  stage?: string;
  packageSize: string;
  peopleCount: number;
  piecesProduced: number;
  defectivePieces: number;
  piecesPerMinute: number;
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

export type PackagingMachine = 
  | 'ULMA 1 (Central)' 
  | 'ULMA 2 (Izquierda)' 
  | 'Multivac R-105' 
  | 'VS-95'
  | 'Sierra 1'
  | 'Sierra 2'
  | 'Sierra 3'
  | 'Indicador 30'
  | 'Indicador 40'
  | 'Indicador 70'
  | 'Indicador 80';

export interface CycleTimeData {
  id: string;
  inspector: string;
  timestamp: Date;
  productName: string;
  packagingMachine: PackagingMachine;
  cycleTime: number;
  observations?: string;
}

export type WindowState = 'RUN' | 'STARVED' | 'BLOCKED' | 'SETUP' | 'AJUSTE' | 'SANIT' | 'FALLA' | 'LOGÍSTICA' | 'OTROS';

export type OutputUnit = 'piezas' | 'cajas';

export interface StateEvent {
  state: WindowState;
  startTime: number;
  endTime?: number;
}

export interface Window5minData {
  id: string;
  inspector: string;
  timestamp: Date;
  stage: string;
  productFamily: string;
  outputUnit: OutputUnit;
  output: number;
  events: StateEvent[];
  runPercentage: number;
  starvedPercentage: number;
  blockedPercentage: number;
  setupPercentage: number;
  ajustePercentage: number;
  sanitPercentage: number;
  fallaPercentage: number;
  logisticaPercentage: number;
  otrosPercentage: number;
  utilizationPercentage: number;
  capacityPerHour: number;
}

export interface ProductionStore {
  inspector: Inspector | null;
  selectedModule: 'capacity' | 'rejection' | 'setup' | 'utilization-5min' | null;
  capacityRecords: CapacityData[];
  rejectionRecords: RejectionData[];
  setupTimeRecords: SetupTimeData[];
  cycleTimeRecords: CycleTimeData[];
  window5minRecords: Window5minData[];
  productCatalog: ProductCatalog[];
}