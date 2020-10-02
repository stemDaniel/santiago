import { EntityRepository, Repository, getRepository } from 'typeorm';

import Debit from '@modules/debits/infra/typeorm/entities/Debit';
import IDebitsRepository from '@modules/debits/repositories/IDebitsRepository';
import ICreateDebitDTO from '@modules/debits/dtos/ICreateDebitDTO';

@EntityRepository(Debit)
export default class DebitsRepository implements IDebitsRepository {
    private ormRepository: Repository<Debit>;

    constructor() {
        this.ormRepository = getRepository(Debit);
    }

    public async findById(id: string): Promise<Debit | undefined> {
        const debit = await this.ormRepository.findOne({
            where: { id },
        });

        return debit;
    }

    public async findUnpaidByContract(
        contract_id: string,
    ): Promise<Debit[] | []> {
        const debits = await this.ormRepository.find({
            where: { contract_id, paid: false },
        });

        return debits;
    }

    public async create(data: ICreateDebitDTO): Promise<Debit> {
        const debit = this.ormRepository.create(data);

        await this.ormRepository.save(debit);

        return debit;
    }

    public async save(debit: Debit): Promise<Debit> {
        await this.ormRepository.save(debit);

        return debit;
    }
}