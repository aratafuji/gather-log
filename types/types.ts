export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  url: string;
}

export interface Participant {
  id: string;
  name: string;
  discordId: string;
}

export interface Opportunity {
  id: string;
  eventId: string;
  name: string;
  date: string;
  content: string;
  relatedUrl: string;
}

