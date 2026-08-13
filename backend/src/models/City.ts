export interface Terminal {
  id: string;
  name: string;
  address: string;
}

export interface City {
  id: string;
  name: string;
  region: string;
  popularTerminals: Terminal[];
}
