import { injectable, inject } from 'tsyringe';

import IPaymentsRepository from '@modules/payments/repositories/IPaymentsRepository';
import Payment from '@modules/payments/infra/typeorm/entities/Payment';

@injectable()
export default class IndexPaymentsByContractService {
    constructor(
        @inject('PaymentsRepository')
        private paymentsRepository: IPaymentsRepository,
    ) {}

    public async execute(contract_id: string): Promise<Payment[] | []> {
        const payments = await this.paymentsRepository.findByContract(
            contract_id,
        );

        return payments;
    }
}
