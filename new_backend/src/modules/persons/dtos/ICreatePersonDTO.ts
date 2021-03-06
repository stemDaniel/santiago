export default interface ICreatePersonDTO {
    name: string;
    birth_date: Date;
    nacionality: string;
    civil_state: 'single' | 'married' | 'divorced' | 'widower' | 'separeted';
    profission: string;
    cpf: string;
    rg: string;
    address_street: string;
    address_number: string;
    address_complement?: string;
    address_neighborhood: string;
    address_city: string;
    address_cep: string;
    residencial_phone: string;
    commercial_phone: string;
    personal_phone: string;
    education_level:
        | 'elementary_incompleted'
        | 'elementary_completed'
        | 'highschool_incompleted'
        | 'highschool_completed'
        | 'university_incompleted'
        | 'university_completed';
    workplace: string;
    monthly_income: 'a_class' | 'b_class' | 'c_class' | 'd_class' | 'e_class';
    income_tax?: boolean;
    email: string;
}
