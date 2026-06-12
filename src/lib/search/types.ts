export interface SearchResult {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
  external_id: string;
  project_location: string | null;
  /** GES: santral adı */
  plant_name?: string | null;
  /** GES: santrali işleten / sahip şirket */
  operator_company?: string | null;
  /** GES: kurulu güç (ör. 10 MW) */
  plant_capacity?: string | null;
}
