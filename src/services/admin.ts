import apiClient from './apiClient';

export interface EventPayload {
  name: string;
  genre: string;
  venue_name: string;
  estimated_attendee_count: number;
  start_datetime: string;
  end_datetime: string;
}

export interface ReviewEventPayload {
  action: 'approve' | 'reject';
  name?: string;
  genre?: string;
  estimated_attendee_count?: number;
}

export interface AdminEvent {
  id: string;
  name: string;
  genre: string;
  venue_name: string;
  estimated_attendee_count: number;
  start_datetime: string;
  end_datetime: string;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewed_by_admin_id?: string;
  created_at: string;
  is_expired: boolean;
}

export const adminService = {
  getEvents: async (status?: 'pending_review' | 'approved' | 'rejected') => {
    const params = status ? { status } : {};
    const response = await apiClient.get<AdminEvent[]>('/api/admin/events', { params });
    return response.data;
  },

  createEvent: async (payload: EventPayload) => {
    const response = await apiClient.post('/api/admin/events', payload);
    return response.data;
  },

  reviewEvent: async (eventId: string, payload: ReviewEventPayload) => {
    const response = await apiClient.patch(`/api/admin/events/${eventId}/review`, payload);
    return response.data;
  },

  recalculateInventory: async () => {
    const response = await apiClient.post('/api/admin/inventory-recommendations/recalculate');
    return response.data;
  }
};
