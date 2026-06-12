import { BRAND } from '../constants/brand';

// Backend base URL — driven by .env (EXPO_PUBLIC_API_BASE_URL).
// Falls back to the production URL so a missing env doesn't break runtime.
// Strip any trailing slash so `${BASE_URL}/api/...` never produces a double slash.
const BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://cargrime.de'
).replace(/\/+$/, '');

// Every white-label app shares one backend; `?brand=` scopes the data.
const BRAND_PARAM = `brand=${encodeURIComponent(BRAND.apiBrand)}`;

export type ProcessStepStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  brand?: string;
  name?: string | null;
  plate_number?: string | null;
  phone_number: string;
  location_id: number;
  availability_id: number;
  service_ids: number[];
  created_at: string;
  status: OrderStatus;
  location: Location;
  availability: Availability;
  services: Service[];
  // Quantity-aware view of booked services (home app shows "Sofa × 2").
  service_items?: ServiceItem[];
  process_steps: ProcessStep[];
}

export interface Service {
  id: number;
  brand?: string;
  category?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceItem {
  service: Service;
  quantity: number;
}

export interface ProcessStep {
  id: number;
  name: string;
  status: ProcessStepStatus;
  order_id: number;
  created_at: string;
}

export interface LocationCreatePayload {
  address: string;
  longitude: number;
  latitude: number;
}

// Schema for creating an order (matches FastAPI's OrderCreate).
export interface OrderCreatePayload {
  brand?: string;
  phone_identifier: string;
  status?: string;
  name?: string;
  plate_number?: string | null;
  phone_number: string;
  location: LocationCreatePayload;
  availability_id: number;
  service_ids: number[];
  // Optional per-service quantities, keyed by service id (home app).
  service_quantities?: Record<number, number>;
  email?: string;
  locale?: string;
}

// Schema for creating a process step (matches FastAPI's ProcessStepCreate)
export interface ProcessStepCreatePayload {
  name: string;
  status?: ProcessStepStatus;
}

export interface Availability {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // ISO format string
  is_taken: boolean;
}

export const CleanCarAPI = {

  getOrdersByPhoneIdentifier: async (phone_identifier: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/get/phone_identifier/${phone_identifier}?${BRAND_PARAM}`);
      const data = await response.json();
      return data
    }
    catch (error) {
      console.error("Error getting orders by phone identifier:", error);
      return [];
    }
  },

  getOrderByByPhoneIdentifierAndId: async (phone_identifier: string, order_id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/get/phone_identifier/${phone_identifier}/id/${order_id}?${BRAND_PARAM}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting order by id:", error);
      return null;
    }
  },

  getAvailability: async(availability_id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/availabilities/get/${availability_id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting availability by id", error);
      return null;
    }
  },

  getAvailabilities: async() => {
    try {
      const response = await fetch(`${BASE_URL}/api/availabilities/get`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting availabilities:", error);
      return {};
    }
  },

  getServices: async() => {
    try {
      const response = await fetch(`${BASE_URL}/api/services/get?${BRAND_PARAM}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting services:", error);
      return {};
    }
  },

  /**
   * Creates a new order in the backend.
   * @param orderData The payload for creating the order.
   * @returns A Promise that resolves to the created Order object.
   */
  createOrder: async (orderData: OrderCreatePayload): Promise<Order> => {
    const url = `${BASE_URL}/api/orders/create`;
    // Stamp the active brand unless the caller already set one.
    const payload = { brand: BRAND.apiBrand, ...orderData };
    console.log('Creating order with data:', payload);
    console.log('Body: ', JSON.stringify(payload))
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log("response", response)
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  },

};
