export type UserRole = 'operator' | 'viewer' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  organization: string
}

export type AircraftStatus = 'active' | 'grounded' | 'maintenance'
export interface Aircraft {
  id: string
  registration: string
  model: string
  manufacturer: string
  yearOfManufacture: number
  totalFlightHours: number
  lastInspectionDate: string
  nextInspectionDue: string
  status: AircraftStatus
  location: string
}

export type MissionStatus = 'draft' | 'preflight' | 'flying' | 'uploading' | 'processing' | 'completed' | 'failed'
export type InspectionType = 'full_body' | 'fuselage' | 'wings' | 'tail' | 'landing_gear' | 'engine_nacelles'

export interface Mission {
  id: string
  name: string
  aircraftId: string
  aircraft?: Aircraft
  inspectionType: InspectionType
  altitude: number
  overlap: number
  assignedOperator: string
  assignedUAV: string
  status: MissionStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  imageCount?: number
  dataSize?: string
  progress?: number
  processingStage?: ProcessingStage
}

export type ProcessingStage =
  | 'queued'
  | 'uploading'
  | 'reconstructing'
  | 'mesh_generation'
  | 'texture_mapping'
  | 'defect_detection'
  | 'localization'
  | 'report_generation'
  | 'completed'

export interface ProcessingJob {
  id: string
  missionId: string
  stage: ProcessingStage
  progress: number
  startedAt: string
  completedAt?: string
  stages: { name: ProcessingStage; status: 'pending' | 'running' | 'completed' | 'failed'; duration?: number }[]
}

export type DefectType = 'dent' | 'corrosion' | 'crack' | 'delamination' | 'scratch' | 'paint_loss' | 'impact_damage'
export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Defect {
  id: string
  inspectionId: string
  type: DefectType
  severity: DefectSeverity
  location: string
  description: string
  x: number
  y: number
  width?: number
  height?: number
  area?: number
  depth?: number
  confidence?: number
  imageUrl?: string
  detectedAt: string
  confirmedBy?: string
  notes?: string
}

export interface Inspection {
  id: string
  missionId: string
  aircraftId: string
  aircraft?: Aircraft
  defects: Defect[]
  totalDefects: number
  criticalDefects: number
  completedAt: string
  operator: string
  status: 'pending_review' | 'in_review' | 'approved' | 'action_required'
  meshUrl?: string
  thumbnailUrl?: string
}

export interface Report {
  id: string
  inspectionId: string
  inspection: Inspection
  generatedAt: string
  generatedBy: string
  status: 'draft' | 'finalized' | 'shared'
  summary: string
  recommendations: string[]
  signedBy?: string
  signedAt?: string
}

export interface TelemetryData {
  timestamp: number
  altitude: number
  battery: number
  speed: number
  signal: number
  latitude: number
  longitude: number
  pitch: number
  roll: number
  yaw: number
}
