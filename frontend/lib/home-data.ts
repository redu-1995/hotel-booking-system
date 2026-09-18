export type HomeRoom = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  tag: string;
  maxGuests: number;
  bedType: string;
};

export type HomeAmenity = { icon: string; title: string; description: string };
export type HomeFacility = { image: string; title: string; description: string; tag: string };

export const homeRooms: HomeRoom[] = [
  { id: 1, name: "Standard Room", description: "A calm, well-appointed room designed for restful nights.", price: "$95", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85", tag: "Best value", maxGuests: 2, bedType: "Queen bed" },
  { id: 2, name: "Superior Room", description: "More space, warm light, and everything you need to settle in.", price: "$115", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85", tag: "Popular", maxGuests: 2, bedType: "King bed" },
  { id: 3, name: "Deluxe King Room", description: "A generous room with a king bed and a little more room to breathe.", price: "$145", image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=85", tag: "Comfort", maxGuests: 2, bedType: "King bed" },
  { id: 4, name: "Deluxe Family Suite", description: "Flexible space for families, friends, and longer stays.", price: "$175", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85", tag: "Family pick", maxGuests: 4, bedType: "Two beds" },
  { id: 5, name: "Executive Suite", description: "A private living area for work, rest, and everything between.", price: "$220", image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=85", tag: "Premium", maxGuests: 3, bedType: "King bed" },
  { id: 6, name: "Presidential Penthouse Suite", description: "Our most spacious stay for celebrations and special occasions.", price: "$380", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85", tag: "Exclusive", maxGuests: 4, bedType: "King bed" },
];

export const homeAmenities: HomeAmenity[] = [
  { icon: "Wi-Fi", title: "Comfortable rooms", description: "Cozy, clean, and well-appointed spaces for a restful stay." },
  { icon: "24/7", title: "Friendly support", description: "Our team is here whenever you need a hand." },
  { icon: "Secure", title: "Secure booking", description: "Clear rates, instant confirmation, and direct communication." },
  { icon: "Central", title: "Convenient location", description: "Close to the city's most useful places and experiences." },
];

export const homeFacilities: HomeFacility[] = [
  { image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=85", title: "Restaurant & dining", description: "Fresh, familiar dishes served throughout the day.", tag: "Dining" },
  { image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=85", title: "Secure parking", description: "Convenient covered parking for guests arriving by car.", tag: "Parking" },
  { image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85", title: "Swimming pool", description: "A quiet place to cool off between city plans.", tag: "Leisure" },
  { image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=85", title: "Meeting space", description: "A polished room for small meetings and private events.", tag: "Business" },
];
