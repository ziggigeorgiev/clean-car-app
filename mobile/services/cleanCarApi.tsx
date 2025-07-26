const BASE_URL = "http://127.0.0.1:8000";
// const BASE_URL = "https://clean-car-app.onrender.com";

export type ProcessStepStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  plate_number: string;
  phone_number: string;
  location_id: number;
  availability_id: number;
  service_ids: number[];
  created_at: string;
  status: OrderStatus;
  location: Location;
  availability: Availability;
  services: Service[];
  process_steps: ProcessStep[];
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface ProcessStep {
  id: number;
  name: string;
  status: ProcessStepStatus;
  order_id: number;
  created_at: string;
}

// Schema for creating an order (matches FastAPI's OrderCreate)
export interface OrderCreatePayload {
  plate_number: string;
  phone_number: string;
  location_id: number;
  availability_id: number;
  service_ids: number[];
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
      const response = await fetch(`${BASE_URL}/api/orders/get/phone_identifier/${phone_identifier}`);
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
      const response = await fetch(`${BASE_URL}/api/orders/get/phone_identifier/${phone_identifier}/id/${order_id}`);
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
      const response = await fetch(`${BASE_URL}/api/services/get`);
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
    console.log('Creating order with data:', orderData);
    console.log('Body: ', JSON.stringify(orderData))
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
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
