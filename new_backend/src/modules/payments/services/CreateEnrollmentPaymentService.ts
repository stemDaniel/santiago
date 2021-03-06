import { injectable, inject } from 'tsyringe';
import { v4 } from 'uuid';
import { getYear } from 'date-fns';
import axios from 'axios';

import AppError from '@shared/errors/AppError';
import ICreatePaymentDTO from '@modules/payments/dtos/ICreatePaymentDTO';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IDebitsRepository from '@modules/debits/repositories/IDebitsRepository';
import IPaymentsRepository from '@modules/payments/repositories/IPaymentsRepository';
import IReceiptProvider from '@shared/container/providers/ReceiptProvider/models/IReceiptProvider';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import IContractsRepository from '@modules/contracts/repositories/IContractsRepository';
import IPersonsRepository from '@modules/persons/repositories/IPersonsRepository';
import IStudentsRepository from '@modules/students/repositories/IStudentsRepository';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import IProfilesRepository from '@modules/profiles/repositories/IProfilesRepository';
import IHashProvider from '@shared/container/providers/HashProvider/models/IHashProvider';
import IGradesRepository from '@modules/grades/repositories/IGradesRepository';
import recursiveReturnNextBusinessDay from '@shared/utils/recursiveReturnNextBusinessDay';
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProvider';
import { capitalize } from '@shared/utils/formatFunctions';
import Payment from '../infra/typeorm/entities/Payment';

interface IHoliday {
    date: string;
    name: string;
    link: string;
    type: string;
    description: string;
    type_code: string;
}

@injectable()
export default class CreatePaymentService {
    constructor(
        @inject('DebitsRepository')
        private debitsRepository: IDebitsRepository,

        @inject('PaymentsRepository')
        private paymentsRepository: IPaymentsRepository,

        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject('ContractsRepository')
        private contractsRepository: IContractsRepository,

        @inject('StudentsRepository')
        private studentsRepository: IStudentsRepository,

        @inject('PersonsRepository')
        private personsRepository: IPersonsRepository,

        @inject('ProfilesRepository')
        private profilesRepository: IProfilesRepository,

        @inject('GradesRepository')
        private gradesRepository: IGradesRepository,

        @inject('ReceiptProvider')
        private receiptProvider: IReceiptProvider,

        @inject('StorageProvider')
        private storageProvider: IStorageProvider,

        @inject('CacheProvider')
        private cacheProvider: ICacheProvider,

        @inject('MailProvider')
        private mailProvider: IMailProvider,

        @inject('HashProvider')
        private hashProvider: IHashProvider,
    ) {}

    public async execute({
        method,
        debit_id,
        user_id,
    }: Omit<ICreatePaymentDTO, 'amount' | 'receipt'>): Promise<Payment> {
        const user = await this.usersRepository.findById(user_id);

        if (!user) {
            throw new AppError(
                'não é possível pagar uma matrícula sem estar logado no sistema!',
            );
        }

        const debit = await this.debitsRepository.findById(debit_id);

        if (!debit) {
            throw new AppError(
                'não é possível pagar uma matrícula que não existe!',
            );
        }

        if (debit.paid) {
            throw new AppError(
                'não é possível pagar uma matrícula que já foi paga!',
            );
        }

        if (debit.type !== 'enrollment') {
            throw new AppError(
                'não é possível pagar um débito que não é do tipo matrícula a partir deste serviço!',
            );
        }

        const contract = await this.contractsRepository.findById(
            debit.contract_id,
        );

        if (!contract) {
            throw new AppError(
                'não é possível pagar um débito de um contrato inexistente!',
            );
        }

        const grade = await this.gradesRepository.findById(contract.grade_id);

        if (!grade) {
            throw new AppError(
                'não é possível pagar um débito de uma turma inexistente!',
            );
        }

        const receipt = await this.receiptProvider.generate({
            client: {
                name: contract.agreements[0].person.name,
                cpf: contract.agreements[0].person.cpf,
            },
            operative: {
                name: user.username,
            },
            items: [
                {
                    description: debit.description,
                    base_value: Number(debit.value),
                    true_value: Number(debit.value),
                    quantity: 1,
                    variation: 0,
                },
            ],
            method,
        });

        await this.storageProvider.saveFile(receipt);

        const payment = await this.paymentsRepository.create({
            amount: debit.value,
            debit_id,
            method,
            user_id,
            receipt,
        });

        Object.assign(debit, { paid: true, payday: new Date() });

        await this.debitsRepository.save(debit);

        Object.assign(contract, { status: 'active' });

        await this.contractsRepository.save(contract);

        let studentProfile = await this.profilesRepository.findByName('Aluno');

        if (!studentProfile) {
            studentProfile = await this.profilesRepository.create({
                name: 'Aluno',
            });

            this.cacheProvider.invalidate('profiles');
        }

        const studentPassword = v4().slice(0, 6);

        const studentUser = await this.usersRepository.create({
            username: v4(),
            password: await this.hashProvider.generateHash(studentPassword),
            profile_id: studentProfile.id,
        });

        const { student } = contract;

        await this.studentsRepository.updateUser(student.id, studentUser.id);

        let responsibleProfile = await this.profilesRepository.findByName(
            'Responsável',
        );

        if (!responsibleProfile) {
            responsibleProfile = await this.profilesRepository.create({
                name: 'Responsável',
            });

            this.cacheProvider.invalidate('profiles');
        }

        for (const agreement of contract.agreements) {
            const { person } = agreement;

            let responsibleUsername = 'usuário já utilizado no sistema.';

            let responsiblePassword = 'senha já utilizada no sistema.';

            if (!person.user_id) {
                responsibleUsername = v4();

                responsiblePassword = v4().slice(0, 6);

                const responsibleUser = await this.usersRepository.create({
                    username: responsibleUsername,
                    password: await this.hashProvider.generateHash(
                        responsiblePassword,
                    ),
                    profile_id: responsibleProfile.id,
                });

                await this.personsRepository.updateUser(
                    person.id,
                    responsibleUser.id,
                );
            }

            const studentArticleWithNoun =
                student.gender === 'male' ? 'do aluno' : 'da aluna';

            const studentArticle = student.gender === 'male' ? 'do' : 'da';

            this.mailProvider.sendMail({
                to: {
                    name: person.name,
                    email: person.email,
                },
                subject: '[Santiago] Matrícula Efetivada',
                body: {
                    file: 'notify_active_enrollment.hbs',
                    variables: {
                        responsibleName: capitalize(person.name),
                        responsibleUsername,
                        responsiblePassword,
                        studentName: capitalize(student.name),
                        studentUsername: studentUser.username,
                        studentPassword,
                        studentArticleWithNoun,
                        studentArticle,
                    },
                },
            });
        }

        const actualYear = getYear(new Date());

        let holidays = [] as IHoliday[];

        try {
            const response = await axios.get(
                `https://api.calendario.com.br/?json=true&ano=${actualYear}&estado=MG&cidade=BETIM&token=b2ZpY2lhbC5kYW5pZWxvbGl2ZWlyYUBnbWFpbC5jb20maGFzaD0xMzgxMjA4NDA`,
            );

            holidays = response.data as IHoliday[];
        } catch {}

        for (let i = 1; i < 12; ++i) {
            const payment_limit_date = await recursiveReturnNextBusinessDay(
                new Date(actualYear, i, 10, 0, 0, 0),
                holidays,
            );

            await this.debitsRepository.create({
                contract_id: contract.id,
                description: `${i + 1}ª parcela`,
                payment_limit_date,
                value: grade.value,
                type: 'installment',
                discount: contract.discount,
            });
        }

        await this.cacheProvider.invalidate('users');

        await this.cacheProvider.invalidate(`active-contracts:${grade.id}`);

        return payment;
    }
}
