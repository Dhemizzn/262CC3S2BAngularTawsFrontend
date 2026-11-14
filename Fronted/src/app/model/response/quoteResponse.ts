
export interface HotelView {
  id: number;
  name: string;
  pricePerNight: number;
  rooms: number;
  nights: number;
}

export interface AirplaneView {
  id: number;
  airline: string;
  roundTripPricePerPerson: number;
  outboundTime: string;
  returnTime: string;
}

export interface ActivityView {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  pricePerPerson: number;
}

export interface QuoteResponse {
  proposalId: string;
  departureCity: string;
  destination: string;
  passengerCount: number;
  departureDate: string;
  returnDate: string;
  days: number;
  hotel: HotelView;
  airplane: AirplaneView;
  activities: ActivityView[];
  totalPrice: number;
}
