export interface AdminPackage {
  quotationId: string;
  status: string;
  peopleQuantity: number;
  departureRegion: string;
  destinationRegion: string;
  departureDate: string;
  returnDate: string;
  total: number;
  userId: number;
  clientName: string;
  clientDni: string;
  clientEmail: string;
  mpOrderId?: string;
  itinerary?: string;
  parsedItinerary?: any;
}

export interface AdminPackageFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: number;
  quotationId?: string;
  status?: string;
}
