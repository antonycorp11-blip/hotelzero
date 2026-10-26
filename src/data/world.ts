import type { AreaId, Permission } from '../core/types';

export interface AreaDefinition { id: AreaId; name: string; x: number; y: number; width: number; height: number; color: number }
export interface DoorDefinition { id: string; x: number; y: number; to: AreaId; label: string; permission?: Permission }

export const AREAS: AreaDefinition[] = [
  { id: 'lobby', name: 'LOBBY', x: 0, y: 0, width: 860, height: 600, color: 0x26242b },
  { id: 'corridor', name: 'CORREDOR LESTE', x: 860, y: 120, width: 760, height: 320, color: 0x22232b },
  { id: 'room201', name: 'QUARTO 201', x: 980, y: -300, width: 280, height: 420, color: 0x2a2428 },
  { id: 'room202', name: 'QUARTO 202', x: 1320, y: -300, width: 280, height: 420, color: 0x25232d },
  { id: 'office', name: 'ESCRITÓRIO', x: 60, y: -330, width: 330, height: 330, color: 0x2d2724 },
  { id: 'security', name: 'SEGURANÇA', x: 470, y: -300, width: 320, height: 300, color: 0x20282b },
];

export const DOORS: DoorDefinition[] = [
  { id: 'door201', x: 1100, y: 120, to: 'room201', label: 'Quarto 201', permission: 'guest-rooms' },
  { id: 'door202', x: 1440, y: 120, to: 'room202', label: 'Quarto 202', permission: 'guest-rooms' },
  { id: 'officeDoor', x: 225, y: 0, to: 'office', label: 'Escritório', permission: 'management' },
  { id: 'securityDoor', x: 630, y: 0, to: 'security', label: 'Segurança', permission: 'security' },
];

export const AREA_SPAWNS: Record<AreaId, { x: number; y: number }> = {
  lobby: { x: 430, y: 400 }, corridor: { x: 900, y: 280 }, room201: { x: 1120, y: -40 },
  room202: { x: 1460, y: -40 }, office: { x: 230, y: -130 }, security: { x: 630, y: -130 },
};
