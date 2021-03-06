import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    OneToMany,
    OneToOne,
    CreateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

import User from '@modules/users/infra/typeorm/entities/User';
import Relationship from '@modules/relationships/infra/typeorm/entities/Relationship';
import Agreement from '@modules/agreements/infra/typeorm/entities/Agreement';
import uploadConfig from '@config/upload';

@Entity('persons')
export default class Person {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column('date')
    birth_date: Date;

    @Column()
    nacionality: string;

    @Column({ enum: ['single', 'married', 'divorced', 'widower', 'separeted'] })
    civil_state: 'single' | 'married' | 'divorced' | 'widower' | 'separeted';

    @Column()
    profission: string;

    @Column()
    cpf: string;

    @Column()
    rg: string;

    @Column()
    address_street: string;

    @Column()
    address_number: string;

    @Column()
    address_complement: string;

    @Column()
    address_neighborhood: string;

    @Column()
    address_city: string;

    @Column()
    address_cep: string;

    @Column()
    residencial_phone: string;

    @Column()
    commercial_phone: string;

    @Column()
    personal_phone: string;

    @Column()
    education_level:
        | 'elementary_incompleted'
        | 'elementary_completed'
        | 'highschool_incompleted'
        | 'highschool_completed'
        | 'university_incompleted'
        | 'university_completed';

    @Column()
    workplace: string;

    @Column({ enum: ['a_class', 'b_class', 'c_class', 'd_class', 'e_class'] })
    monthly_income: 'a_class' | 'b_class' | 'c_class' | 'd_class' | 'e_class';

    @Column('boolean')
    income_tax: boolean;

    @Column()
    cpf_photo: string;

    @Column()
    rg_photo: string;

    @Column()
    residencial_proof_photo: string;

    @Column()
    email: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    user_id: string;

    @OneToOne(() => User, user => user.person)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Relationship, relationship => relationship.person)
    relationships: Relationship[];

    @OneToMany(() => Agreement, agreement => agreement.person)
    agreements: Agreement[];

    @Expose({ name: 'cpf_photo_url' })
    getCpfPhotoURL(): string | null {
        if (!this.cpf_photo) {
            return null;
        }

        switch (uploadConfig.driver) {
            case 'disk':
                return `${process.env.APP_API_URL}/files/${this.cpf_photo}`;
            case 's3':
                return `${uploadConfig.config.s3.baseURL}/${this.cpf_photo}`;
            default:
                return null;
        }
    }

    @Expose({ name: 'rg_photo_url' })
    getRgPhotoURL(): string | null {
        if (!this.rg_photo) {
            return null;
        }

        switch (uploadConfig.driver) {
            case 'disk':
                return `${process.env.APP_API_URL}/files/${this.rg_photo}`;
            case 's3':
                return `${uploadConfig.config.s3.baseURL}/${this.rg_photo}`;
            default:
                return null;
        }
    }

    @Expose({ name: 'residencial_proof_photo_url' })
    getResidencialProofPhotoURL(): string | null {
        if (!this.residencial_proof_photo) {
            return null;
        }

        switch (uploadConfig.driver) {
            case 'disk':
                return `${process.env.APP_API_URL}/files/${this.residencial_proof_photo}`;
            case 's3':
                return `${uploadConfig.config.s3.baseURL}/${this.residencial_proof_photo}`;
            default:
                return null;
        }
    }
}
