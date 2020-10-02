import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateDischargeService from '@modules/discharges/services/CreateDischargeService';

export default class DischargesController {
    public async create(
        request: Request,
        response: Response,
    ): Promise<Response> {
        const { payment_id } = request.body;

        const user_id = request.user.id;

        const createDischarge = container.resolve(CreateDischargeService);

        const discharge = await createDischarge.execute({
            payment_id,
            user_id,
        });

        return response.json(discharge);
    }
}