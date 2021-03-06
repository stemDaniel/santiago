import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import IndexUsersService from '@modules/users/services/IndexUsersService';
import CreateUserService from '@modules/users/services/CreateUserService';
import UpdateUserService from '@modules/users/services/UpdateUserService';

export default class UsersController {
    public async index(
        request: Request,
        response: Response,
    ): Promise<Response> {
        const indexUsers = container.resolve(IndexUsersService);

        const users = await indexUsers.execute();

        return response.json(classToClass(users));
    }

    public async create(
        request: Request,
        response: Response,
    ): Promise<Response> {
        const { username, password, profile_id } = request.body;

        const createUser = container.resolve(CreateUserService);

        const user = await createUser.execute({
            username,
            password,
            profile_id,
        });

        return response.json(classToClass(user));
    }

    public async update(
        request: Request,
        response: Response,
    ): Promise<Response> {
        const { user_id } = request.params;

        const { username, password, profile_id } = request.body;

        const updateUser = container.resolve(UpdateUserService);

        const user = await updateUser.execute({
            id: user_id,
            username,
            password,
            profile_id,
        });

        return response.json(classToClass(user));
    }
}
