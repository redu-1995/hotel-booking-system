export type StatusType = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'responded';
export type RoomAvailability = 'available' | 'limited' | 'unavailable';

export interface Room {
  id: string;
  name: string;
  category: 'standard' | 'deluxe' | 'suite';
  shortDescription: string;
  fullDescription: string;
  pricePerNight: number;
  capacityGuests: number;
  bedType: string;
  sizeSqM: number;
  image: string;
  galleryImages: string[];
  keyAmenities: string[];
  allAmenities?: string[];
  rating: number;
  reviewsCount: number;
  availability: RoomAvailability;
  availableRoomsLeft?: number;
  isPopular?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badge?: string;
  image: string;
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface BookingSearchState {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface Inquiry {
  id: string;
  referenceNumber: string;
  guestName: string;
  email: string;
  phone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: StatusType;
  message: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  referenceNumber: string;
  roomId: string;
  roomName: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomsCount: number;
  totalPrice: number;
  status: StatusType;
  specialRequests?: string;
  createdAt: string;
}
