export interface Resource {
  type: string;
  name: string;
}

export const RESOURCES: Resource[] = [
  { type: 'Máquina Empaque', name: 'Multivac R-105' },
  { type: 'Máquina Empaque', name: 'ULMA 1' },
  { type: 'Máquina Empaque', name: 'ULMA 2' },
  { type: 'Máquina Empaque', name: 'VS-95' },
  { type: 'Sierra', name: 'Sierra 1' },
  { type: 'Sierra', name: 'Sierra 2' },
  { type: 'Sierra', name: 'Sierra 3' },
  { type: 'Sierra', name: 'Sierra 4' },
  { type: 'Porcionadora', name: 'Grasselli' },
  { type: 'Porcionadora', name: 'Cubicadora' },
  { type: 'Etiquetado', name: 'Indicador 30' },
  { type: 'Etiquetado', name: 'Indicador 40' },
  { type: 'Etiquetado', name: 'Indicador 70' },
  { type: 'Etiquetado', name: 'Indicador 80' },
  { type: 'Flejadora', name: 'Flejadora 1' },
];

export const RESOURCE_TYPES = [
  'Máquina Empaque',
  'Sierra',
  'Porcionadora',
  'Etiquetado',
  'Flejadora',
] as const;

export type ResourceType = typeof RESOURCE_TYPES[number];

export const getResourcesByType = (type: ResourceType): Resource[] => {
  return RESOURCES.filter(resource => resource.type === type);
};

export const getAllResourceNames = (): string[] => {
  return RESOURCES.map(resource => resource.name);
};
