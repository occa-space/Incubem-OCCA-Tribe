import { BuildingData, BuildingType, Resources, Squad, User } from '../types';

export const INITIAL_RESOURCES: Resources = { coins: 0 };

export const REAL_SQUADS: Squad[] = [
  { id: 'sq_board', name: 'Board', color: '#ffffff', description: 'Alta Gestão' },
  { id: 'sq_osc', name: 'OCCA Social Club', color: '#ef4444', description: 'Bem-vindos ao OSC' },
  { id: 'sq_academy', name: 'OCCA Academy', color: '#3b82f6', description: 'vamos juntos construir novos futuros com o aprendizado' },
  { id: 'sq_occasulo', name: 'OCCAsulo', color: '#d946ef', description: 'Transformando iniciativas' }
];

export const REAL_USERS: User[] = [
  { id: 'u_senior', name: 'Senior', squadId: 'sq_board', role: 'Master', cpf: '000.000.000-00', color: '#ffffff' },
  { id: 'u_14130055437', name: 'Vitoria Lira', squadId: 'sq_board', role: 'Mentor Júnior', cpf: '000.000.000-00', color: '#ef4444' },
  { id: 'u_07406180594', name: 'Luiz Guilherme', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_14900059439', name: 'Alice', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_12854473442', name: 'Camila', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_12379195412', name: 'Breno', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_16781484400', name: 'Gabriel Ferraz', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_71774671492', name: 'Rafael Cavalvanti', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_16817509459', name: 'Julia Moura', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_15067051469', name: 'Gabriel Vinicius', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_14634956411', name: 'Davi Andany', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_15671040450', name: 'Laish Rodrigues', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_15333194483', name: 'Evelin', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_12688925482', name: 'Caio Cesar', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_12854659465', name: 'Moises Carlos', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_11280537485', name: 'Gizelly', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
  { id: 'u_11363982443', name: 'Grazielly', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' }
];

export const INITIAL_BUILDINGS: BuildingData[] = [
  { id: 'b_tribal_center', ownerId: 'u_senior', squadId: 'sq_board', type: BuildingType.TRIBAL_CENTER, level: 1, position: { x: 8, z: 8 }, isPlaced: true, tasks: [] },
  { id: 'b_osc_hq', ownerId: 'u_senior', squadId: 'sq_osc', type: BuildingType.SQUAD_HQ, level: 1, position: { x: 4, z: 4 }, isPlaced: true, tasks: [] },
  { id: 'b_academy_hq', ownerId: 'u_senior', squadId: 'sq_academy', type: BuildingType.SQUAD_HQ, level: 1, position: { x: 16, z: 4 }, isPlaced: true, tasks: [] },
  { id: 'b_madein_hq', ownerId: 'u_senior', squadId: 'sq_occasulo', type: BuildingType.SQUAD_HQ, level: 1, position: { x: 4, z: 16 }, isPlaced: true, tasks: [] },
  { id: 'b_luiz_hq', ownerId: 'u_07406180594', squadId: 'sq_osc', type: BuildingType.RESIDENTIAL, level: 1, position: { x: 1, z: 2 }, isPlaced: true, tasks: [] },
  { id: 'b_alice_hq', ownerId: 'u_14900059439', squadId: 'sq_osc', type: BuildingType.RESIDENTIAL, level: 1, position: { x: 3, z: 2 }, isPlaced: true, tasks: [] }
];
