export default interface IStudent {
  id: string;
  name: string;
  father_name: string;
  mother_name: string;
  birth_date: Date;
  nacionality: string;
  birth_city: string;
  birth_state: string;
  gender: 'male' | 'female';
  race: 'white' | 'brown' | 'black' | 'indigenous' | 'yellow';
  ease_relating: boolean;
  origin_school?: string;
  health_plan?: string;
  food_alergy?: string;
  medication_alergy?: string;
  health_problem?: string;
  special_necessities?: string;
  birth_certificate_photo?: string;
  vaccine_card_photo?: string;
  health_plan_photo?: string;
  transfer_declaration_photo?: string;
  monthly_declaration_photo?: string;
  school_records_photo?: string;
  birth_certificate_photo_url?: string;
  vaccine_card_photo_url?: string;
  health_plan_photo_url?: string;
  transfer_declaration_photo_url?: string;
  monthly_declaration_photo_url?: string;
  school_records_photo_url?: string;
}
