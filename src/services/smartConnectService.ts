import {
  BikeDetails,
  SmartConnectDevice,
  LiveVehicleTelemetry,
  BikeServiceRecord
} from "../types";

// Coimbatore / Tamil Nadu Fuel Benchmark Price (INR per litre)
export const PETROL_PRICE_PER_LITRE_INR = 101.5;

// Sample Initial Bikes
export const defaultBikes: BikeDetails[] = [
  {
    id: "bike_hunter350",
    nickname: "Road Hunter",
    make: "Royal Enfield",
    model: "Hunter 350 Dapper Ash",
    type: "motorcycle",
    regNumber: "TN 37 CK 4829",
    vinNumber: "ME4J3A78P019842",
    year: 2024,
    engineCc: 349,
    fuelType: "petrol",
    fuelTankCapacityLitres: 13.0,
    batteryVoltage: 12.6,
    batteryHealthPercent: 97,
    odometerKm: 8420,
    engineOilHealthPercent: 84,
    nextServiceDueKm: 1580,
    nextServiceDueDate: "18 Oct 2026",
    tyrePressure: {
      frontPsi: 29.2,
      rearPsi: 33.1,
      targetFrontPsi: 29.0,
      targetRearPsi: 33.0,
      frontStatus: "optimal",
      rearStatus: "optimal",
      frontTempC: 34,
      rearTempC: 37,
    },
    coolantTempC: 88,
    insuranceExpiry: "12 May 2027",
    pucExpiry: "24 Nov 2026",
    rcStatus: "Active & Verified",
    bluetoothDeviceId: "dev_ble_01",
  },
  {
    id: "bike_apache200",
    nickname: "Stealth Beast",
    make: "TVS",
    model: "Apache RTR 200 4V",
    type: "motorcycle",
    regNumber: "TN 38 BR 1920",
    vinNumber: "MD625BM34R582910",
    year: 2023,
    engineCc: 197,
    fuelType: "petrol",
    fuelTankCapacityLitres: 12.0,
    batteryVoltage: 12.5,
    batteryHealthPercent: 92,
    odometerKm: 14250,
    engineOilHealthPercent: 72,
    nextServiceDueKm: 750,
    nextServiceDueDate: "25 Sep 2026",
    tyrePressure: {
      frontPsi: 28.5,
      rearPsi: 32.0,
      targetFrontPsi: 29.0,
      targetRearPsi: 32.0,
      frontStatus: "optimal",
      rearStatus: "optimal",
      frontTempC: 35,
      rearTempC: 38,
    },
    coolantTempC: 91,
    insuranceExpiry: "08 Aug 2027",
    pucExpiry: "15 Oct 2026",
    rcStatus: "Active & Verified",
    bluetoothDeviceId: "dev_ble_02",
  },
  {
    id: "bike_mt15",
    nickname: "Cyber Samurai",
    make: "Yamaha",
    model: "MT-15 Version 2.0 (Metallic Black)",
    type: "motorcycle",
    regNumber: "TN 37 DW 5541",
    vinNumber: "ME1RG5410P991204",
    year: 2024,
    engineCc: 155,
    fuelType: "petrol",
    fuelTankCapacityLitres: 10.0,
    batteryVoltage: 12.8,
    batteryHealthPercent: 99,
    odometerKm: 4310,
    engineOilHealthPercent: 91,
    nextServiceDueKm: 2690,
    nextServiceDueDate: "10 Dec 2026",
    tyrePressure: {
      frontPsi: 28.8,
      rearPsi: 33.0,
      targetFrontPsi: 29.0,
      targetRearPsi: 33.0,
      frontStatus: "optimal",
      rearStatus: "optimal",
      frontTempC: 33,
      rearTempC: 36,
    },
    coolantTempC: 86,
    insuranceExpiry: "22 Jan 2028",
    pucExpiry: "18 Dec 2026",
    rcStatus: "Active & Verified",
    bluetoothDeviceId: "dev_ble_01",
  },
  {
    id: "bike_ather450x",
    nickname: "Volt Runner",
    make: "Ather",
    model: "450X Gen 3 (Space Grey)",
    type: "electric_bike",
    regNumber: "TN 37 EX 9011",
    vinNumber: "AT450XG3TN884102",
    year: 2024,
    engineCc: 0,
    fuelType: "electric",
    fuelTankCapacityLitres: 0,
    batteryVoltage: 51.1,
    batteryHealthPercent: 98,
    odometerKm: 6120,
    engineOilHealthPercent: 100,
    nextServiceDueKm: 3880,
    nextServiceDueDate: "15 Jan 2027",
    tyrePressure: {
      frontPsi: 30.0,
      rearPsi: 32.5,
      targetFrontPsi: 30.0,
      targetRearPsi: 33.0,
      frontStatus: "optimal",
      rearStatus: "optimal",
      frontTempC: 31,
      rearTempC: 33,
    },
    coolantTempC: 45,
    insuranceExpiry: "04 Mar 2027",
    pucExpiry: "Exempted (EV)",
    rcStatus: "Active & Verified",
    bluetoothDeviceId: "dev_ble_03",
  },
];

export const sampleBluetoothDevices: SmartConnectDevice[] = [
  {
    id: "dev_ble_01",
    name: "SmartConnect-BLE-OBD2",
    protocol: "Bluetooth 5.2 BLE",
    macAddress: "C4:4E:AC:7B:19:30",
    signalDbm: -54,
    firmwareVersion: "v2.6.4-CANPRO",
    isConnected: true,
    isPairing: false,
    autoConnect: true,
    batteryPercent: 96,
    lastSynced: "Just now",
  },
  {
    id: "dev_ble_02",
    name: "TVS-SmartXonnect-BT7",
    protocol: "Bluetooth 5.2 BLE",
    macAddress: "A2:78:BB:51:39:E1",
    signalDbm: -68,
    firmwareVersion: "v1.9.0",
    isConnected: false,
    isPairing: false,
    autoConnect: false,
    batteryPercent: 88,
    lastSynced: "2 hours ago",
  },
  {
    id: "dev_ble_03",
    name: "Ather-Halo-Dash-Link",
    protocol: "WiFi IoT Telemetry",
    macAddress: "B8:27:EB:4F:91:22",
    signalDbm: -48,
    firmwareVersion: "v4.1.2-OTA",
    isConnected: false,
    isPairing: false,
    autoConnect: false,
    batteryPercent: 100,
    lastSynced: "Yesterday",
  },
  {
    id: "dev_ble_04",
    name: "ELM327-V2.1-OBDII",
    protocol: "OBD-II CAN Bus",
    macAddress: "00:1D:A5:68:98:8B",
    signalDbm: -72,
    firmwareVersion: "v2.1.0-STD",
    isConnected: false,
    isPairing: false,
    autoConnect: false,
    batteryPercent: 90,
    lastSynced: "3 days ago",
  },
];

export const sampleServiceRecords: BikeServiceRecord[] = [
  {
    id: "srv_3",
    date: "14 Jun 2026",
    odometerKm: 5000,
    serviceType: "Periodic Maintenance",
    center: "Royal Enfield Authorized Service (Ganapathy, Coimbatore)",
    costInr: 1850,
    notes: "Semi-synthetic 15W-50 oil replacement, air filter cleaned, chain tension adjusted.",
    status: "Completed",
  },
  {
    id: "srv_2",
    date: "20 Mar 2026",
    odometerKm: 2500,
    serviceType: "Free Service",
    center: "Royal Enfield Service Hub (Mettupalayam Rd)",
    costInr: 420,
    notes: "General check-up, brake lever lubed, ECU software diagnostics check.",
    status: "Completed",
  },
  {
    id: "srv_1",
    date: "10 Jan 2026",
    odometerKm: 500,
    serviceType: "Free Service",
    center: "Royal Enfield Showroom & Service (Avinashi Rd)",
    costInr: 1200,
    notes: "First running-in service, engine oil flush, valve tappet inspection.",
    status: "Completed",
  },
];

export const initialLiveTelemetry: LiveVehicleTelemetry = {
  currentSpeedKmh: 42,
  topSpeedKmh: 94,
  avgSpeedKmh: 41.8,
  currentRpm: 3850,
  maxRpm: 8500,
  currentGear: 3,
  leanAngleDeg: 12,
  maxLeanAngle: { left: 29, right: 33 },
  fuelLevelPercent: 68,
  fuelRemainingLitres: 8.84,
  distanceToEmptyKm: 284,
  instantFuelEfficiencyKmpl: 38.6,
  tripAvgFuelEfficiencyKmpl: 37.9,
  ecoScore: 89,
  tripDistanceKm: 14.2,
  tripDurationMin: 24,
  tripCostInr: 38.1,
  fuelSavedLitres: 0.45,
  harshBrakingCount: 1,
  rapidAccelerationCount: 2,
  engineKillSwitch: false,
  sideStandSensor: false,
  absActive: true,
  headlampBeam: "low",
  ridingMode: "City",
  engineTempC: 88,
};

// Singleton Service for Vehicle Smart Connect & Live Telemetry
class SmartConnectService {
  private bikes: BikeDetails[] = [];
  private activeBikeId: string = "bike_hunter350";
  private devices: SmartConnectDevice[] = [];
  private telemetry: LiveVehicleTelemetry = { ...initialLiveTelemetry };
  private serviceRecords: BikeServiceRecord[] = [...sampleServiceRecords];
  private isAutoSimulating: boolean = true;
  private timer: any = null;
  private listeners: Set<(t: LiveVehicleTelemetry) => void> = new Set();
  private bikeListeners: Set<(b: BikeDetails) => void> = new Set();
  private deviceListeners: Set<(d: SmartConnectDevice[]) => void> = new Set();

  constructor() {
    this.loadState();
    this.startTelemetryLoop();
  }

  private loadState() {
    if (typeof window === "undefined") return;

    try {
      const savedBikes = localStorage.getItem("smartroute_saved_bikes");
      if (savedBikes) {
        this.bikes = JSON.parse(savedBikes);
      } else {
        this.bikes = [...defaultBikes];
        localStorage.setItem("smartroute_saved_bikes", JSON.stringify(this.bikes));
      }

      const savedActiveId = localStorage.getItem("smartroute_active_bike_id");
      if (savedActiveId && this.bikes.some((b) => b.id === savedActiveId)) {
        this.activeBikeId = savedActiveId;
      } else {
        this.activeBikeId = this.bikes[0]?.id || "bike_hunter350";
      }

      const savedDevices = localStorage.getItem("smartroute_bluetooth_devices");
      if (savedDevices) {
        this.devices = JSON.parse(savedDevices);
      } else {
        this.devices = [...sampleBluetoothDevices];
        localStorage.setItem("smartroute_bluetooth_devices", JSON.stringify(this.devices));
      }

      const savedTelemetry = localStorage.getItem("smartroute_live_telemetry");
      if (savedTelemetry) {
        this.telemetry = { ...this.telemetry, ...JSON.parse(savedTelemetry) };
      }
    } catch (e) {
      console.warn("Failed to load smart connect state from localStorage", e);
      this.bikes = [...defaultBikes];
      this.devices = [...sampleBluetoothDevices];
    }
  }

  public getBikes(): BikeDetails[] {
    return [...this.bikes];
  }

  public getActiveBike(): BikeDetails {
    const found = this.bikes.find((b) => b.id === this.activeBikeId);
    return found || this.bikes[0] || defaultBikes[0];
  }

  public setActiveBike(bikeId: string): BikeDetails {
    this.activeBikeId = bikeId;
    localStorage.setItem("smartroute_active_bike_id", bikeId);
    const bike = this.getActiveBike();
    this.bikeListeners.forEach((l) => l(bike));
    return bike;
  }

  public updateBikeDetails(updated: BikeDetails): void {
    this.bikes = this.bikes.map((b) => (b.id === updated.id ? updated : b));
    localStorage.setItem("smartroute_saved_bikes", JSON.stringify(this.bikes));
    if (this.activeBikeId === updated.id) {
      this.bikeListeners.forEach((l) => l(updated));
    }
  }

  public addBike(newBike: Omit<BikeDetails, "id">): BikeDetails {
    const created: BikeDetails = {
      id: `bike_${Date.now()}`,
      ...newBike,
    };
    this.bikes.push(created);
    localStorage.setItem("smartroute_saved_bikes", JSON.stringify(this.bikes));
    this.setActiveBike(created.id);
    return created;
  }

  public getDevices(): SmartConnectDevice[] {
    return [...this.devices];
  }

  public getConnectedDevice(): SmartConnectDevice | undefined {
    return this.devices.find((d) => d.isConnected);
  }

  public async connectDevice(deviceId: string): Promise<boolean> {
    // Simulate connection delay
    this.devices = this.devices.map((d) =>
      d.id === deviceId ? { ...d, isPairing: true } : { ...d, isConnected: false }
    );
    this.notifyDevices();

    return new Promise((resolve) => {
      setTimeout(() => {
        this.devices = this.devices.map((d) =>
          d.id === deviceId
            ? { ...d, isConnected: true, isPairing: false, lastSynced: "Just now" }
            : { ...d, isConnected: false, isPairing: false }
        );
        localStorage.setItem("smartroute_bluetooth_devices", JSON.stringify(this.devices));
        this.notifyDevices();
        resolve(true);
      }, 1200);
    });
  }

  public disconnectDevice(deviceId?: string): void {
    this.devices = this.devices.map((d) =>
      !deviceId || d.id === deviceId ? { ...d, isConnected: false, isPairing: false } : d
    );
    localStorage.setItem("smartroute_bluetooth_devices", JSON.stringify(this.devices));
    this.notifyDevices();
  }

  public async scanForWebBluetooth(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (typeof navigator !== "undefined" && (navigator as any).bluetooth) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["battery_service", "generic_access"],
        });
        if (device) {
          const newDevice: SmartConnectDevice = {
            id: `dev_ble_${Date.now()}`,
            name: device.name || "Real Bluetooth OBD-II",
            protocol: "Bluetooth 5.2 BLE",
            macAddress: "FF:EE:DD:CC:BB:AA",
            signalDbm: -45,
            firmwareVersion: "v1.0-WebBLE",
            isConnected: true,
            isPairing: false,
            autoConnect: true,
            batteryPercent: 95,
            lastSynced: "Just now",
          };
          this.devices = [newDevice, ...this.devices.map((d) => ({ ...d, isConnected: false }))];
          localStorage.setItem("smartroute_bluetooth_devices", JSON.stringify(this.devices));
          this.notifyDevices();
          return { success: true, deviceName: newDevice.name };
        }
      } catch (err: any) {
        // User cancelled or pairing unsupported in frame
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: "Web Bluetooth API not available in iframe. Using built-in OBD-II simulator." };
  }

  public getTelemetry(): LiveVehicleTelemetry {
    return { ...this.telemetry };
  }

  public setManualSpeed(speedKmh: number): void {
    this.isAutoSimulating = false;
    this.updateTelemetryWithSpeed(speedKmh);
  }

  public toggleAutoSimulation(enabled?: boolean): boolean {
    this.isAutoSimulating = enabled !== undefined ? enabled : !this.isAutoSimulating;
    return this.isAutoSimulating;
  }

  public getIsAutoSimulating(): boolean {
    return this.isAutoSimulating;
  }

  public setRidingMode(mode: "Eco" | "City" | "Sport" | "Rain"): void {
    this.telemetry.ridingMode = mode;
    this.notifyTelemetry();
  }

  public refuelTank(litresToAdd?: number): void {
    const bike = this.getActiveBike();
    const capacity = bike.fuelTankCapacityLitres || 13.0;
    const add = litresToAdd || (capacity - this.telemetry.fuelRemainingLitres);
    this.telemetry.fuelRemainingLitres = Math.min(capacity, this.telemetry.fuelRemainingLitres + add);
    this.telemetry.fuelLevelPercent = Math.round((this.telemetry.fuelRemainingLitres / capacity) * 100);
    this.telemetry.distanceToEmptyKm = Math.round(this.telemetry.fuelRemainingLitres * this.telemetry.tripAvgFuelEfficiencyKmpl);
    this.notifyTelemetry();
  }

  public resetTripMeter(): void {
    this.telemetry.tripDistanceKm = 0.0;
    this.telemetry.tripDurationMin = 0;
    this.telemetry.tripCostInr = 0.0;
    this.telemetry.topSpeedKmh = this.telemetry.currentSpeedKmh;
    this.telemetry.harshBrakingCount = 0;
    this.telemetry.rapidAccelerationCount = 0;
    this.notifyTelemetry();
  }

  public getServiceRecords(): BikeServiceRecord[] {
    return [...this.serviceRecords];
  }

  public addServiceRecord(record: Omit<BikeServiceRecord, "id">): BikeServiceRecord {
    const newRecord: BikeServiceRecord = {
      id: `srv_${Date.now()}`,
      ...record,
    };
    this.serviceRecords = [newRecord, ...this.serviceRecords];
    return newRecord;
  }

  // Subscribe to real-time telemetry changes
  public subscribeTelemetry(callback: (t: LiveVehicleTelemetry) => void): () => void {
    this.listeners.add(callback);
    callback({ ...this.telemetry });
    return () => {
      this.listeners.delete(callback);
    };
  }

  public subscribeBike(callback: (b: BikeDetails) => void): () => void {
    this.bikeListeners.add(callback);
    callback(this.getActiveBike());
    return () => {
      this.bikeListeners.delete(callback);
    };
  }

  public subscribeDevices(callback: (d: SmartConnectDevice[]) => void): () => void {
    this.deviceListeners.add(callback);
    callback(this.getDevices());
    return () => {
      this.deviceListeners.delete(callback);
    };
  }

  private notifyTelemetry() {
    const clone = { ...this.telemetry };
    this.listeners.forEach((l) => l(clone));
  }

  private notifyDevices() {
    const clone = [...this.devices];
    this.deviceListeners.forEach((l) => l(clone));
  }

  private updateTelemetryWithSpeed(speed: number) {
    const isConnected = this.devices.some((d) => d.isConnected);
    if (!isConnected) {
      // If disconnected, speed shows 0 or standby
      this.telemetry.currentSpeedKmh = 0;
      this.telemetry.currentRpm = 0;
      this.telemetry.currentGear = "N";
      this.telemetry.instantFuelEfficiencyKmpl = 0;
      this.notifyTelemetry();
      return;
    }

    const roundedSpeed = Math.max(0, Math.min(130, Math.round(speed)));
    this.telemetry.currentSpeedKmh = roundedSpeed;

    if (roundedSpeed > this.telemetry.topSpeedKmh) {
      this.telemetry.topSpeedKmh = roundedSpeed;
    }

    // Dynamic Gear & RPM calculation
    let gear: number | "N" = "N";
    let rpm = 950; // idle

    if (roundedSpeed === 0) {
      gear = "N";
      rpm = 1050 + Math.round((Math.random() - 0.5) * 60);
    } else if (roundedSpeed < 18) {
      gear = 1;
      rpm = 1800 + Math.round(roundedSpeed * 120);
    } else if (roundedSpeed < 32) {
      gear = 2;
      rpm = 2200 + Math.round((roundedSpeed - 18) * 90);
    } else if (roundedSpeed < 50) {
      gear = 3;
      rpm = 2800 + Math.round((roundedSpeed - 32) * 85);
    } else if (roundedSpeed < 72) {
      gear = 4;
      rpm = 3200 + Math.round((roundedSpeed - 50) * 75);
    } else {
      gear = 5;
      rpm = 3800 + Math.round((roundedSpeed - 72) * 70);
    }

    rpm = Math.min(8400, Math.max(900, rpm));
    this.telemetry.currentGear = gear;
    this.telemetry.currentRpm = rpm;

    // Realistic lean angle based on speed & slight road curve variation
    if (roundedSpeed > 15) {
      const curveFactor = Math.sin(Date.now() / 3200);
      const angle = Math.round(curveFactor * (10 + (roundedSpeed / 80) * 16));
      this.telemetry.leanAngleDeg = angle;
      if (angle < -this.telemetry.maxLeanAngle.left) {
        this.telemetry.maxLeanAngle.left = Math.abs(angle);
      }
      if (angle > this.telemetry.maxLeanAngle.right) {
        this.telemetry.maxLeanAngle.right = angle;
      }
    } else {
      this.telemetry.leanAngleDeg = 0;
    }

    // Instant Mileage calculation (km/L)
    // Most bikes have optimal sweet spot between 40-55 km/h in top gear (40-48 km/L)
    let instantMileage = 0;
    if (roundedSpeed === 0) {
      instantMileage = 0;
    } else {
      const modeMultiplier =
        this.telemetry.ridingMode === "Eco"
          ? 1.12
          : this.telemetry.ridingMode === "Sport"
          ? 0.86
          : 1.0;

      if (roundedSpeed > 35 && roundedSpeed < 58) {
        instantMileage = 42.5 + (Math.random() - 0.5) * 3;
      } else if (roundedSpeed <= 35) {
        instantMileage = 31.0 + (roundedSpeed / 35) * 10;
      } else {
        // High speed wind resistance drag
        instantMileage = Math.max(22, 43 - ((roundedSpeed - 58) / 30) * 14);
      }
      instantMileage = Math.round(instantMileage * modeMultiplier * 10) / 10;
    }
    this.telemetry.instantFuelEfficiencyKmpl = instantMileage;

    // Fuel Consumption & Trip calculation (Every tick)
    if (roundedSpeed > 0) {
      const deltaDistanceKm = (roundedSpeed / 3600) * 1.5; // distance per tick
      this.telemetry.tripDistanceKm = Math.round((this.telemetry.tripDistanceKm + deltaDistanceKm) * 100) / 100;
      
      const fuelUsedLitres = deltaDistanceKm / (instantMileage || 36);
      this.telemetry.fuelRemainingLitres = Math.max(0.2, this.telemetry.fuelRemainingLitres - fuelUsedLitres);

      const bike = this.getActiveBike();
      const tankCapacity = bike.fuelTankCapacityLitres || 13.0;
      this.telemetry.fuelLevelPercent = Math.max(1, Math.round((this.telemetry.fuelRemainingLitres / tankCapacity) * 100));

      this.telemetry.distanceToEmptyKm = Math.round(this.telemetry.fuelRemainingLitres * this.telemetry.tripAvgFuelEfficiencyKmpl);

      // Trip financial cost
      const cost = fuelUsedLitres * PETROL_PRICE_PER_LITRE_INR;
      this.telemetry.tripCostInr = Math.round((this.telemetry.tripCostInr + cost) * 10) / 10;
    }

    this.notifyTelemetry();
  }

  // Periodic loop for smooth simulation
  private startTelemetryLoop() {
    let tick = 0;
    this.timer = setInterval(() => {
      tick++;

      // Check if connected
      const isConnected = this.devices.some((d) => d.isConnected);
      if (!isConnected) {
        if (this.telemetry.currentSpeedKmh !== 0) {
          this.updateTelemetryWithSpeed(0);
        }
        return;
      }

      if (this.isAutoSimulating) {
        // Realistic city commute speed curve (traffic waves: 0, 25, 45, 52, 38, 48, etc.)
        const timeFactor = (Date.now() / 4000) % 20;
        let simulatedSpeed = 40;

        if (timeFactor < 3) {
          // Accelerating from signal
          simulatedSpeed = 15 + timeFactor * 8;
        } else if (timeFactor < 8) {
          // Cruising on corridor
          simulatedSpeed = 44 + Math.sin(timeFactor) * 6;
        } else if (timeFactor < 12) {
          // Open highway stretch
          simulatedSpeed = 58 + Math.cos(timeFactor) * 5;
        } else if (timeFactor < 16) {
          // Slowing down for junction
          simulatedSpeed = 32 - (timeFactor - 12) * 4;
        } else {
          // Creeping in slow traffic
          simulatedSpeed = 18 + Math.sin(timeFactor) * 5;
        }

        this.updateTelemetryWithSpeed(simulatedSpeed);
      } else {
        // Just maintain slight engine pulse
        if (this.telemetry.currentSpeedKmh > 0) {
          this.updateTelemetryWithSpeed(this.telemetry.currentSpeedKmh);
        }
      }

      // Update trip duration every 40 ticks (~1 min)
      if (tick % 40 === 0 && this.telemetry.currentSpeedKmh > 0) {
        this.telemetry.tripDurationMin += 1;
      }
    }, 1500);
  }
}

export const smartConnectService = new SmartConnectService();
