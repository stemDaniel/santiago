import ICreateStudentDTO from '@modules/students/dtos/ICreateStudentDTO';
import IResponsibles from '@modules/enrollments/dtos/IResponsiblesDTO';

export default interface ICreateEnrollmentDTO {
    student: ICreateStudentDTO;
    grade_id: string;
    financial_responsible: IResponsibles;
    supportive_responsible: IResponsibles;
}
