import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import IndexDebitsService from '@modules/debits/services/IndexDebitsByContractService';

export default class ContractDebitsController {
    public async index(
        request: Request,
        response: Response,
    ): Promise<Response> {
        const { contract_id } = request.params;

        const indexDebits = container.resolve(IndexDebitsService);

        const debits = await indexDebits.execute(contract_id);

        return response.json(classToClass(debits));
    }
}
