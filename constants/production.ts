import { ProductCatalog } from '@/types/production';

export const PRODUCTION_LINES = [
  { key: 'ULMA 1 (Central)', label: 'ULMA 1 (Central)' },
  { key: 'ULMA 2 (Izquierda)', label: 'ULMA 2 (Izquierda)' },
  { key: 'Multivac R-105', label: 'Multivac R-105' },
  { key: 'VS-95', label: 'VS-95' }
] as const;

export const PRODUCT_STATES = [
  { key: 'congelado', label: 'Congelado' },
  { key: 'refrigerado', label: 'Refrigerado' }
] as const;

export const PRODUCT_CONFIGS = [
  { key: 'porcionado', label: 'Porcionado' },
  { key: 'no_porcionado', label: 'Sin Porcionar' }
] as const;

export const PACKAGING_TYPES = [
  { key: 'termoformado', label: 'Termoformado' },
  { key: 'empacado_vacio', label: 'Empacado al Vacío' }
] as const;

export const EVENT_TYPES = [
  { key: 'cambio_molde', label: 'Cambio de Molde' },
  { key: 'reabastecimiento_film', label: 'Reabastecimiento de Film Plástico' },
  { key: 'paro_falla_equipo', label: 'Paro por falla del equipo' },
  { key: 'corte_energia_imprevisto', label: 'Corte de Energía Imprevisto' },
  { key: 'corte_energia_planificado', label: 'Corte de Energía Planificado' },
  { key: 'salida_bano', label: 'Salida al Baño' },
  { key: 'cambio_producto', label: 'Cambio de Producto' },
  { key: 'cambio_cuchilla', label: 'Cambio de Cuchilla' },
  { key: 'salida_material_empaque', label: 'Salida por Material de Empaque' }
] as const;

// Función para obtener las etapas según la configuración del producto
export const getProductionStages = (
  line: string,
  state: string,
  config: string,
  packagingType: string,
  hasIndividualWeight: boolean
): string[] => {
  const stages: string[] = [];
  const isPortioned = config === 'porcionado';
  const isThermoformed = packagingType === 'termoformado';
  const isVacuumPacked = packagingType === 'empacado_vacio';

  if (state === 'congelado') {
    if (isThermoformed) {
      // PRODUCTO CONGELADO TERMOFORMADO
      stages.push('Porcionado', 'Limpieza de Aserrín', 'Empacado');
      if (hasIndividualWeight) {
        stages.push('Pesaje y Etiquetado Individual');
      } else {
        stages.push('Etiquetado Individual');
      }
      stages.push('Flejado de Caja', 'Traslado a APT');
    } else if (isVacuumPacked) {
      // PRODUCTO CONGELADO EMPACADO AL VACÍO
      stages.push('Porcionado', 'Limpieza de Aserrín', 'Empacado', 'Retractilado');
      if (hasIndividualWeight) {
        stages.push('Secado Manual', 'Pesaje y Etiquetado Individual');
      } else {
        stages.push('Pesaje');
      }
      stages.push('Cierre de Caja y Etiquetado', 'Flejado de Caja', 'Traslado a APT');
    }
  } else if (state === 'refrigerado') {
    if (isThermoformed) {
      // PRODUCTO REFRIGERADO TERMOFORMADO
      if (isPortioned) {
        // PRODUCTO PORCIONADO REFRIGERADO TERMOFORMADO
        stages.push('Porcionado', 'Empacado');
        if (hasIndividualWeight) {
          stages.push('Pesaje y Etiquetado Individual');
        } else {
          stages.push('Etiquetado Individual');
        }
        stages.push('Cierre de Caja y Etiquetado', 'Flejado', 'Traslado a APT');
      } else {
        // PRODUCTO SIN PORCIONAR REFRIGERADO TERMOFORMADO
        stages.push('Empacado');
        if (hasIndividualWeight) {
          stages.push('Pesaje y Etiquetado Individual');
        } else {
          stages.push('Etiquetado Individual');
        }
        stages.push('Cierre de Caja y Etiquetado', 'Flejado', 'Traslado a APT');
      }
    }
  }

  return stages;
};

// Etapas generales para referencia
export const ALL_PRODUCTION_STAGES = [
  'Porcionado',
  'Limpieza de Aserrín',
  'Empacado',
  'Retractilado',
  'Secado Manual',
  'Pesaje',
  'Pesaje y Etiquetado Individual',
  'Etiquetado Individual',
  'Cierre de Caja y Etiquetado',
  'Flejado de Caja',
  'Flejado',
  'Traslado a APT'
];

export const QUEUE_STAGES = [
  { key: 'queueBeforePortioning', label: 'Antes del Porcionado' },
  { key: 'queueBeforePackaging', label: 'Antes del Empaque' },
  { key: 'queueBeforeIndividualLabeling', label: 'Antes del Etiquetado Individual' },
  { key: 'queueBeforeBoxClosure', label: 'Antes de Cierre de Caja' },
  { key: 'queueBeforeBoxStrapping', label: 'Antes del Flejado de Cajas' }
];

// Mapeo de códigos de producto a tipos de empaque
export const PRODUCT_PACKAGING: Record<string, string> = {
  '1-013': 'Bolsa TBG',
  '1-017': 'Bolsa TBG',
  '1-019': 'THERMO 3X1',
  '1-028': 'Bolsa Termoencogible',
  '1-059': 'Bolsa TBG',
  '1-077': 'Bolsa TBG',
  '1-089': 'THERMO 2X1',
  '1-098': 'Bolsa TBG',
  '1-099': 'THERMO 3X1',
  '1-112': 'THERMO 2X2',
  '1-118': 'Layerpack',
  '1-123': 'THERMO 2X2',
  '1-131': 'Bolsa TBG',
  '1-148': 'THERMO 3X1',
  '1-153': 'THERMO 2X2',
  '1-164': 'Layerpack',
  '1-206': 'Bolsa TBG',
  '1-277': 'THERMO 3X1',
  '1-285': 'Bolsa TBG',
  '1-327': 'THERMO 3X1',
  '1-328': 'THERMO 3X1',
  '1-330': 'THERMO 3X1',
  '1-335': 'THERMO 2X1',
  '1-342': 'THERMO 3X1',
  '1-343': 'THERMO 3X1',
  '1-345': 'THERMO 3X1',
  '1-376': 'Bolsa TBG',
  '1-400': 'THERMO 2X1',
  '1-407': 'THERMO 3X1',
  '1-408': 'THERMO 3X1',
  '1-413': 'Bolsa TBG',
  '1-416': 'THERMO 2X1',
  '1-425': 'THERMO 2X1',
  '1-454': 'Bolsa TBG',
  '1-456': 'Bolsa TBG',
  '1-466': 'Bolsa TBG',
  '1-545': 'THERMO 3X1',
  '1-589': 'THERMO 3X1',
  '1-655': 'THERMO 2X2',
  '1-860': 'THERMO 3X1',
  '1-863': 'Bolsa TBG',
  '1-864': 'Bolsa TBG',
  '1-867': 'Bolsa TBG',
  '1-873': 'Bolsa TBG',
  '1-874': 'THERMO 3X1',
  '1-875': 'THERMO 3X1',
  '1-877': 'THERMO 3X1',
  '1-898': 'Bolsa TBG',
  '1-903': 'THERMO 3X1',
  '3-030': 'THERMO 3X1',
  '3-036': 'THERMO 3X1',
  '3-039': 'THERMO 2X1',
  '3-074': 'THERMO 2X1',
  '3-079': 'THERMO 3X1',
  '3-087': 'Bolsa TBG',
  '3-096': 'THERMO 3X1',
  '3-097': 'Bolsa Termoencogible',
  '3-122': 'THERMO 3X1',
  '3-143': 'Bolsa Termoencogible',
  '3-161': 'Bolsa TBG',
  '3-173': 'Bolsa TBG',
  '3-191': 'THERMO 3X1',
  '3-193': 'THERMO 2X1',
  '3-194': 'Bolsa TBG',
  '3-195': 'Bolsa TBG',
  '3-211': 'THERMO 3X1',
  '3-212': 'THERMO 3X1',
  '3-213': 'THERMO 3X1',
  '3-215': 'THERMO 3X1',
  '3-216': 'Bolsa TBG',
  '3-218': 'THERMO 3X1',
  '3-219': 'Bolsa TBG',
  '3-220': 'THERMO 3X1',
  '3-221': 'Bolsa TBG',
  '3-222': 'Bolsa TBG',
  '3-225': 'Bolsa TBG',
  '3-233': 'THERMO 2X2',
  '3-234': 'THERMO 2X2',
  '3-235': 'THERMO 3X1',
  '3-243': 'Bolsa Termoencogible',
  '3-260': 'Layerpack',
  '3-279': 'THERMO 3X1',
  '3-280': 'Bolsa Termoencogible',
  '3-281': 'THERMO 3X1',
  '3-317': 'THERMO 2X1',
  '3-318': 'THERMO 2X1',
  '3-323': 'THERMO 3X1',
  '3-325': 'THERMO 2X1',
  '3-326': 'THERMO 2X1',
  '3-327': 'THERMO 3X1',
  '3-328': 'THERMO 3X1',
  '3-329': 'THERMO 3X1',
  '3-330': 'THERMO 3X1',
  '3-331': 'THERMO 3X1',
  '3-332': 'THERMO 3X1',
  '3-336': 'Bolsa TBG',
  '3-337': 'Bolsa TBG',
  '3-339': 'Bolsa TBG',
  '3-340': 'Bolsa Termoencogible',
  '3-373': 'THERMO 2X1',
  '3-374': 'THERMO 2X1',
  '3-379': 'THERMO 2X1',
  '3-380': 'THERMO 2X1',
  '3-381': 'Bolsa TBG',
  '3-382': 'Bolsa TBG',
  '3-384': 'THERMO 3X1',
  '3-385': 'THERMO 3X1',
  '3-386': 'Bolsa TBG',
  '3-397': 'THERMO 3X1',
  '3-400': 'Bolsa TBG',
  '3-401': 'Bolsa TBG',
  '3-402': 'Bolsa TBG',
  '3-403': 'Bolsa TBG',
  '3-407': 'THERMO 3X1',
  '3-408': 'THERMO 3X1',
  '3-416': 'THERMO 3X1',
  '3-418': 'THERMO 3X1',
  '3-422': 'THERMO 2X1',
  '3-440': 'THERMO 3X1',
  '3-443': 'THERMO 2X1',
  '3-448': 'THERMO 2X1',
  '3-454': 'THERMO 3X1',
  '3-465': 'THERMO 2X2',
  '3-467': 'THERMO 3X1',
  '3-477': 'THERMO 3X1',
  '3-481': 'THERMO 2X1',
  '3-487': 'Bolsa TBG',
  '3-495': 'THERMO 2X1',
  '3-499': 'THERMO 2X1',
  '3-505': 'Bolsa TBG',
  '3-513': 'Bolsa TBG',
  '3-521': 'Bolsa TBG',
  '3-522': 'Bolsa TBG',
  '3-551': 'THERMO 3X1',
  '3-554': 'THERMO 2X1',
  '3-558': 'Bolsa TBG',
  '3-568': 'Bolsa TBG',
  '3-573': 'Bolsa TBG',
  '3-599': 'THERMO 3X1',
  '3-654': 'Bolsa TBG',
  '3-675': 'THERMO 2X1',
  '3-683': 'THERMO 2X2',
  '3-684': 'Bolsa Termoencogible',
  '3-686': 'Bolsa Termoencogible',
  '3-696': 'Bolsa TBG',
  '3-698': 'THERMO 3X1',
  '3-717': 'Bolsa Termoencogible'
};

// Función para obtener el tipo de empaque por código de producto
export const getPackagingByCode = (code: string): string => {
  return PRODUCT_PACKAGING[code] || '';
};

// Catálogo completo de códigos de producto
export const PRODUCT_CATALOG: ProductCatalog[] = [
  { code: '1-013', name: 'SIGNATURE - B/I CC SHANK', category: 'SIGNATURE' },
  { code: '1-017', name: 'SIGNATURE - B/I CC SHANK', category: 'SIGNATURE' },
  { code: '1-019', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '1-028', name: 'SIGNATURE- MATAMBRE ARGENTINO', category: 'SIGNATURE' },
  { code: '1-059', name: 'SIGNATURE - ASADO DE TIRA', category: 'SIGNATURE' },
  { code: '1-077', name: 'SIGNATURE - CARACU', category: 'SIGNATURE' },
  { code: '1-089', name: 'SIGNATURE - BRISKET', category: 'SIGNATURE' },
  { code: '1-098', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '1-099', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '1-112', name: 'SIGNATURE - POSTA DE PIERNA', category: 'SIGNATURE' },
  { code: '1-118', name: 'VALOR AGREGADO (RECORTE)', category: 'VALOR AGREGADO' },
  { code: '1-123', name: 'SIGNATURE - POSTA DE CORONA', category: 'SIGNATURE' },
  { code: '1-131', name: 'SIGNATURE - PORTERHOUSE', category: 'SIGNATURE' },
  { code: '1-148', name: 'SIGNATURE - NEW YORK STEAK', category: 'SIGNATURE' },
  { code: '1-153', name: 'SIGNATURE - MANO DE PIEDRA', category: 'SIGNATURE' },
  { code: '1-164', name: 'RECORTE SHORTLOIN', category: 'RECORTE' },
  { code: '1-200', name: 'SIRLOIN BUTT', category: 'CORTES ESPECIALES' },
  { code: '1-206', name: 'SIGNATURE - FLECHA PARA ASAR', category: 'SIGNATURE' },
  { code: '1-277', name: 'SIGNATURE - NEW YORK STEAK', category: 'SIGNATURE' },
  { code: '1-285', name: 'SIGNATURE - B/I CC SHANK', category: 'SIGNATURE' },
  { code: '1-327', name: 'DANESA - TP', category: 'TERCERA PERSONA' },
  { code: '1-328', name: 'CORBATA - TP', category: 'TERCERA PERSONA' },
  { code: '1-330', name: 'BROCHETA - TP', category: 'TERCERA PERSONA' },
  { code: '1-335', name: 'PUNTA DE CADERA - TP', category: 'TERCERA PERSONA' },
  { code: '1-342', name: 'ENTRAÑA - TP', category: 'TERCERA PERSONA' },
  { code: '1-343', name: 'CORDON - TP', category: 'TERCERA PERSONA' },
  { code: '1-345', name: 'CHAPA - TP', category: 'TERCERA PERSONA' },
  { code: '1-376', name: 'SIGNATURE - B/I CC SHANK', category: 'SIGNATURE' },
  { code: '1-400', name: 'SIGNATURE - PEELED TRI TIP', category: 'SIGNATURE' },
  { code: '1-407', name: 'SIGNATURE - BROCHETA', category: 'SIGNATURE' },
  { code: '1-408', name: 'SIGNATURE - TIRAS DE CECINA', category: 'SIGNATURE' },
  { code: '1-413', name: 'SIGNATURE - CARACU', category: 'SIGNATURE' },
  { code: '1-416', name: 'FLANK STEAK - TP', category: 'TERCERA PERSONA' },
  { code: '1-425', name: 'SIGNATURE - DIEZMILLO', category: 'SIGNATURE' },
  { code: '1-454', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '1-456', name: 'SIGNATURE-PORTERHOUSE<30M', category: 'SIGNATURE' },
  { code: '1-466', name: 'SIGNATURE - COWBOY', category: 'SIGNATURE' },
  { code: '1-545', name: 'SIGNATURE - CECINA', category: 'SIGNATURE' },
  { code: '1-589', name: 'SIGNATURE - BISTEC C. PALETA', category: 'SIGNATURE' },
  { code: '1-655', name: 'SIGNATURE - SALON BLANCO', category: 'SIGNATURE' },
  { code: '1-860', name: 'SIGNATURE - ENTRANA', category: 'SIGNATURE' },
  { code: '1-863', name: 'SIGNATURE - COWBOY', category: 'SIGNATURE' },
  { code: '1-864', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '1-867', name: 'SIGNATURE - T-BONE', category: 'SIGNATURE' },
  { code: '1-873', name: 'SIGNATURE - ASADO DE TIRA', category: 'SIGNATURE' },
  { code: '1-874', name: 'SIGNATURE - NEW YORK STEAK', category: 'SIGNATURE' },
  { code: '1-875', name: 'SIGNATURE - TENDER BUTT - TP', category: 'SIGNATURE' },
  { code: '1-877', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '1-898', name: 'SIGNATURE - PRIME RIB STEAK', category: 'SIGNATURE' },
  { code: '1-903', name: 'SIGNATURE - INTERCOSTAL', category: 'SIGNATURE' },
  { code: '3-030', name: 'SIGNATURE-BISTEC C. DE PALETA', category: 'SIGNATURE' },
  { code: '3-036', name: 'SIGNATURE - RIBEYE PORCIONADO', category: 'SIGNATURE' },
  { code: '3-039', name: 'SIGNATURE - DIEZMILLO-1/2 plg', category: 'SIGNATURE' },
  { code: '3-074', name: 'SIGNATURE - DIEZMILLO C/H', category: 'SIGNATURE' },
  { code: '3-079', name: 'SIGNATURE - CHURRASCO - M', category: 'SIGNATURE' },
  { code: '3-087', name: 'SIGNATURE - B/I CC FORE SHANK', category: 'SIGNATURE' },
  { code: '3-096', name: 'SIGNATURE - PALETILLA', category: 'SIGNATURE' },
  { code: '3-097', name: 'SIGNATURE - TIRAS DE ASAR', category: 'SIGNATURE' },
  { code: '3-122', name: 'SIGNATURE-PUNTA DE ARRACHERA', category: 'SIGNATURE' },
  { code: '3-143', name: 'CARNE EN CUBITOS', category: 'PROCESADOS' },
  { code: '3-161', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '3-173', name: 'SIGNATURE - B/I CC HIND SHANK', category: 'SIGNATURE' },
  { code: '3-191', name: 'SIGNATURE - LIFTER MEAT', category: 'SIGNATURE' },
  { code: '3-193', name: 'SIGNATURE - BISTEC DE GIBA', category: 'SIGNATURE' },
  { code: '3-194', name: 'SIGNATURE - COWBOY', category: 'SIGNATURE' },
  { code: '3-195', name: 'SIGNATURE - FLECHA PARA ASAR', category: 'SIGNATURE' },
  { code: '3-211', name: 'S. PETITE TENDER-BISTRO FILET', category: 'SIGNATURE' },
  { code: '3-212', name: 'S. NEW YORK-FAUX FILET STEAK', category: 'SIGNATURE' },
  { code: '3-213', name: 'S. RIBBEYE-ENTRECOTE PORTION', category: 'SIGNATURE' },
  { code: '3-215', name: 'S. RIB B/I-COTE DE BOEUF - P', category: 'SIGNATURE' },
  { code: '3-216', name: 'S. TOMAHAWK - COTE DE BOEUF', category: 'SIGNATURE' },
  { code: '3-218', name: 'S. HANGING T.-ONGLET DE BOEUF', category: 'SIGNATURE' },
  { code: '3-219', name: 'S. T BONE <30M-T BONE PORTION', category: 'SIGNATURE' },
  { code: '3-220', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '3-221', name: 'SIGNATURE - PORTERHOUSE <30M', category: 'SIGNATURE' },
  { code: '3-222', name: 'SIGNATURE - T - BONE <30M', category: 'SIGNATURE' },
  { code: '3-225', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '3-233', name: 'CARNE EN CUBITOS - TP', category: 'TERCERA PERSONA' },
  { code: '3-234', name: 'POSTA DE GALLINA - TP', category: 'TERCERA PERSONA' },
  { code: '3-235', name: 'PALETA PEQUEÑA - TP', category: 'TERCERA PERSONA' },
  { code: '3-243', name: 'SIGNATURE - CALIFORNIA STEAK', category: 'SIGNATURE' },
  { code: '3-260', name: 'SIGNATURE - CARACU - LP', category: 'SIGNATURE' },
  { code: '3-279', name: 'SIGNATURE - PETIT TENDER', category: 'SIGNATURE' },
  { code: '3-280', name: 'SIGNATURE - PARRILLERO STEAK', category: 'SIGNATURE' },
  { code: '3-281', name: 'SIGNATURE - LOMO DE ENTRANA', category: 'SIGNATURE' },
  { code: '3-317', name: 'SIGNATURE - FLANK STEAK', category: 'SIGNATURE' },
  { code: '3-318', name: 'SIGNATURE - PEELED TRI TIP', category: 'SIGNATURE' },
  { code: '3-323', name: 'SIGNATURE - BISTEC P. CADERA', category: 'SIGNATURE' },
  { code: '3-324', name: 'SIGNATURE - MANO PIEDRA P', category: 'SIGNATURE' },
  { code: '3-325', name: 'SIGNATURE-FLAT IRON STEAK', category: 'SIGNATURE' },
  { code: '3-326', name: 'SIGNATURE - DIEZMILLO', category: 'SIGNATURE' },
  { code: '3-327', name: 'SIGNATURE - C.PARA PARRILLA', category: 'SIGNATURE' },
  { code: '3-328', name: 'SIGNATURE - NEW YORK STEAK', category: 'SIGNATURE' },
  { code: '3-329', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '3-330', name: 'SIGNATURE - CORBATA', category: 'SIGNATURE' },
  { code: '3-331', name: 'SIGNATURE - DANESA', category: 'SIGNATURE' },
  { code: '3-332', name: 'SIGNATURE - ENTRANA', category: 'SIGNATURE' },
  { code: '3-336', name: 'SIGNATURE - PORTERHOUSE', category: 'SIGNATURE' },
  { code: '3-337', name: 'SIGNATURE - PRIME RIB STEAK', category: 'SIGNATURE' },
  { code: '3-339', name: 'SIGNATURE - NY BONE IN', category: 'SIGNATURE' },
  { code: '3-340', name: 'SIGNATURE - SHORT PLATE', category: 'SIGNATURE' },
  { code: '3-373', name: 'SIGNATURE - FS', category: 'SIGNATURE' },
  { code: '3-374', name: 'SIGNATURE - TRI TIP', category: 'SIGNATURE' },
  { code: '3-379', name: 'SIGNATURE - FLAT IRON STEAK', category: 'SIGNATURE' },
  { code: '3-380', name: 'SIGNATURE - DIEZMILLO', category: 'SIGNATURE' },
  { code: '3-381', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '3-382', name: 'SIGNATURE - PORTERHOUSE <30M', category: 'SIGNATURE' },
  { code: '3-384', name: 'SIGNATURE - NY STEAK', category: 'SIGNATURE' },
  { code: '3-385', name: 'SIGNATURE - RE STEAK', category: 'SIGNATURE' },
  { code: '3-386', name: 'SIGNATURE - ASADO DE TIRA', category: 'SIGNATURE' },
  { code: '3-397', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '3-400', name: 'SIGNATURE - COWBOY', category: 'SIGNATURE' },
  { code: '3-401', name: 'SIGNATURE - T - BONE <30M', category: 'SIGNATURE' },
  { code: '3-402', name: 'SIGNATURE - NY BONE IN', category: 'SIGNATURE' },
  { code: '3-403', name: 'SIGNATURE - ASADO DE TIRA', category: 'SIGNATURE' },
  { code: '3-407', name: 'SIGNATURE - NEW YORK STEAK', category: 'SIGNATURE' },
  { code: '3-408', name: 'SIGNATURE - RIBEYE STEAK', category: 'SIGNATURE' },
  { code: '3-416', name: 'SIGNATURE - BISTEC FAMILIAR', category: 'SIGNATURE' },
  { code: '3-418', name: 'SIGNATURE - CHURRASCO - S', category: 'SIGNATURE' },
  { code: '3-422', name: 'SIGNATURE-FLAT IRON STEAK', category: 'SIGNATURE' },
  { code: '3-440', name: 'SIGNATURE - ARRACHERA - C', category: 'SIGNATURE' },
  { code: '3-443', name: 'SIGNATURE - FLANK STEAK', category: 'SIGNATURE' },
  { code: '3-448', name: 'SIGNATURE - TRI TIP', category: 'SIGNATURE' },
  { code: '3-454', name: 'SIGNATURE - CHAPA', category: 'SIGNATURE' },
  { code: '3-465', name: 'SIGNATURE-POSTA DE GALLINA-P', category: 'SIGNATURE' },
  { code: '3-467', name: 'SIGNATURE - CORDON', category: 'SIGNATURE' },
  { code: '3-477', name: 'SIGNATURE - HANGING TENDER', category: 'SIGNATURE' },
  { code: '3-481', name: 'SIGNATURE - FLANK STEAK', category: 'SIGNATURE' },
  { code: '3-487', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '3-495', name: 'SIGNATURE - PEELED TRI TIP', category: 'SIGNATURE' },
  { code: '3-499', name: 'SIGNATURE - DIEZMILLO', category: 'SIGNATURE' },
  { code: '3-505', name: 'SIGNATURE-PORTERHOUSE<30M', category: 'SIGNATURE' },
  { code: '3-513', name: 'SIGNATURE-CHUCK SHORT RIB-P', category: 'SIGNATURE' },
  { code: '3-521', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '3-522', name: 'SIGNATURE-CHUCK SHORT RIB-P', category: 'SIGNATURE' },
  { code: '3-551', name: 'SIGNATURE - PETIT TENDER', category: 'SIGNATURE' },
  { code: '3-554', name: 'SIGNATURE - FLANK STEAK', category: 'SIGNATURE' },
  { code: '3-558', name: 'SIGNATURE - PRIME RIB STEAK', category: 'SIGNATURE' },
  { code: '3-568', name: 'SIGNATURE - B/I CC HIND SHANK', category: 'SIGNATURE' },
  { code: '3-573', name: 'SIGNATURE - TOMAHAWK', category: 'SIGNATURE' },
  { code: '3-599', name: 'SIGNATURE - NEW YORK STEAK', category: 'SIGNATURE' },
  { code: '3-654', name: 'SIGNATURE - FLECHA PARA ASAR', category: 'SIGNATURE' },
  { code: '3-675', name: 'SIGNATURE - CHUCK ROLL STEAK', category: 'SIGNATURE' },
  { code: '3-683', name: 'SIGNATURE-BEEFSTEAK MACHACADO', category: 'SIGNATURE' },
  { code: '3-684', name: 'SIGNATURE - DICED BEEF', category: 'SIGNATURE' },
  { code: '3-686', name: 'SIGNATURE - DICED BEEF', category: 'SIGNATURE' },
  { code: '3-696', name: 'SIGNATURE - B/I CC FORE SHANK', category: 'SIGNATURE' },
  { code: '3-698', name: 'SIGNATURE - FALDITA DE RES', category: 'SIGNATURE' },
  { code: '3-717', name: 'SIGNATURE - CARNE PICADA', category: 'SIGNATURE' }
];

// Función para buscar productos por código o nombre
export const searchProducts = (query: string): ProductCatalog[] => {
  if (!query.trim()) return PRODUCT_CATALOG;
  
  const searchTerm = query.toLowerCase().trim();
  return PRODUCT_CATALOG.filter(product => 
    product.code.toLowerCase().includes(searchTerm) ||
    product.name.toLowerCase().includes(searchTerm)
  );
};

// Función para obtener productos por categoría
export const getProductsByCategory = (category: string): ProductCatalog[] => {
  return PRODUCT_CATALOG.filter(product => product.category === category);
};

// Obtener todas las categorías únicas
export const getProductCategories = (): string[] => {
  const categories = [...new Set(PRODUCT_CATALOG.map(product => product.category))];
  return categories.sort();
};

// Configuraciones válidas de línea de producción
// Basado en las especificaciones del usuario sobre qué combinaciones son permitidas
export interface ValidLineConfiguration {
  line: string;
  productState: string;
  productConfig: string;
  packagingType: string;
  hasIndividualWeightLabel: boolean;
}

// Definir las configuraciones válidas basadas en las especificaciones
export const VALID_LINE_CONFIGURATIONS: ValidLineConfiguration[] = [
  // ULMA 1 (Central) - Configuraciones válidas
  { line: 'ULMA 1 (Central)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'ULMA 1 (Central)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },
  { line: 'ULMA 1 (Central)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: true },
  { line: 'ULMA 1 (Central)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: false },
  { line: 'ULMA 1 (Central)', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'ULMA 1 (Central)', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },
  { line: 'ULMA 1 (Central)', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'ULMA 1 (Central)', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },

  // ULMA 2 (Izquierda) - Configuraciones válidas
  { line: 'ULMA 2 (Izquierda)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'ULMA 2 (Izquierda)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },
  { line: 'ULMA 2 (Izquierda)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: true },
  { line: 'ULMA 2 (Izquierda)', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: false },
  { line: 'ULMA 2 (Izquierda)', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'ULMA 2 (Izquierda)', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },
  { line: 'ULMA 2 (Izquierda)', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'ULMA 2 (Izquierda)', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },

  // Multivac R-105 - Configuraciones válidas
  { line: 'Multivac R-105', productState: 'congelado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'Multivac R-105', productState: 'congelado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },
  { line: 'Multivac R-105', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: true },
  { line: 'Multivac R-105', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: false },
  { line: 'Multivac R-105', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'Multivac R-105', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },
  { line: 'Multivac R-105', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: true },
  { line: 'Multivac R-105', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'termoformado', hasIndividualWeightLabel: false },

  // VS-95 - Configuraciones válidas (solo empacado al vacío)
  { line: 'VS-95', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: true },
  { line: 'VS-95', productState: 'congelado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: false },
  { line: 'VS-95', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: true },
  { line: 'VS-95', productState: 'refrigerado', productConfig: 'porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: false },
  { line: 'VS-95', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: true },
  { line: 'VS-95', productState: 'refrigerado', productConfig: 'no_porcionado', packagingType: 'empacado_vacio', hasIndividualWeightLabel: false },
];

// Función para validar si una configuración es válida
export const isValidLineConfiguration = (
  line: string,
  productState: string,
  productConfig: string,
  packagingType: string,
  hasIndividualWeightLabel: boolean
): boolean => {
  return VALID_LINE_CONFIGURATIONS.some(config => 
    config.line === line &&
    config.productState === productState &&
    config.productConfig === productConfig &&
    config.packagingType === packagingType &&
    config.hasIndividualWeightLabel === hasIndividualWeightLabel
  );
};

// Función para obtener opciones válidas basadas en selecciones previas
export const getValidOptions = (
  currentField: 'productState' | 'productConfig' | 'packagingType' | 'hasIndividualWeightLabel',
  line?: string,
  productState?: string,
  productConfig?: string,
  packagingType?: string
): string[] | boolean[] => {
  let validConfigs = VALID_LINE_CONFIGURATIONS;

  // Filtrar por selecciones previas
  if (line) {
    validConfigs = validConfigs.filter(config => config.line === line);
  }
  if (productState) {
    validConfigs = validConfigs.filter(config => config.productState === productState);
  }
  if (productConfig) {
    validConfigs = validConfigs.filter(config => config.productConfig === productConfig);
  }
  if (packagingType) {
    validConfigs = validConfigs.filter(config => config.packagingType === packagingType);
  }

  // Obtener opciones únicas para el campo solicitado
  switch (currentField) {
    case 'productState':
      return [...new Set(validConfigs.map(config => config.productState))];
    case 'productConfig':
      return [...new Set(validConfigs.map(config => config.productConfig))];
    case 'packagingType':
      return [...new Set(validConfigs.map(config => config.packagingType))];
    case 'hasIndividualWeightLabel':
      return [...new Set(validConfigs.map(config => config.hasIndividualWeightLabel))];
    default:
      return [];
  }
};