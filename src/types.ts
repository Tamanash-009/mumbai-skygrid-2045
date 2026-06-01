export type AppView =
  | "operations"
  | "executive"
  | "passenger"
  | "traffic"
  | "revenue"
  | "safety"
  | "fleet"
  | "pred-lab"
  | "digital-twin"
  | "powerbi-docs"
  | "sustainability";

export interface FlightRecord {
  flightID: string;
  vehicleID: string;
  pilotMode: "AI" | "Manual";
  originHub: "Colaba" | "Bandra" | "Dadar" | "Juhu" | "Kurla" | "Andheri" | "Nariman Point" | "Thane";
  destinationHub: "Colaba" | "Bandra" | "Dadar" | "Juhu" | "Kurla" | "Andheri" | "Nariman Point" | "Thane";
  departureTime: string;
  arrivalTime: string;
  flightDuration: number; // in minutes
  distance: number; // in km
  passengerCount: number;
  airLaneUsed: string; // e.g. "Lane-A1", "Lane-Express", "Lane-Coastal"
  averageAltitude: number; // in meters
  energyConsumed: number; // in MJ
  status: "active" | "completed" | "delayed" | "diverted";
}

export interface TelemetryRecord {
  vehicleID: string;
  batteryHealth: number; // %
  motorTemp: number; // Celsius
  sensorStatus: "Optimal" | "Degraded" | "Anomalous";
  aiConfidence: number; // %
  signalStrength: number; // dBm
  maintenanceNeeded: boolean;
  rul: number; // Remaining Useful Life in flight cycles
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  category: string;
  message: string;
  timestamp: string;
}

export interface SmartGridState {
  activeFlights: number;
  activeVehicles: number;
  dailyPassengers: number;
  revenueToday: number;
  safetyScore: number;
  fleetUtilization: number;
  avgWaitTime: number; // in mins
  surgeMultiplier: number;
  peakSector: string;
  weather: string;
  co2Savings: number; // tons of CO2 saved compared to internal combustion vehicles
}

export interface DAXFormula {
  name: string;
  category: "KPI" | "Time Intelligence" | "AI Forecasting" | "Operational";
  expression: string;
  description: string;
}

export interface DataDictionaryField {
  tableName: string;
  fieldName: string;
  dataType: string;
  description: string;
  sampleValue: string;
}
