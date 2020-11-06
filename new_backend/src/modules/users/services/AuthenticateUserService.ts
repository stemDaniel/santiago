import { injectable, inject } from 'tsyringe';
import { sign } from 'jsonwebtoken';

import User from '@modules/users/infra/typeorm/entities/User';
import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IHashProvider from '@shared/container/providers/HashProvider/models/IHashProvider';
import IPermissions from '@modules/profiles/dtos/IPermissions';

interface IRequest {
    username: string;
    password: string;
}

interface IResponse {
    user: User;
    token: string;
}

@injectable()
export default class AuthenticateUserService {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject('HashProvider')
        private hashProvider: IHashProvider,
    ) {}

    public async execute({ username, password }: IRequest): Promise<IResponse> {
        const user = await this.usersRepository.findByUsername(username);

        if (!user) {
            throw new AppError('Credenciais incorretas!', 401);
        }

        const passwordsMatches = await this.hashProvider.compare(
            password,
            user.password,
        );

        if (!passwordsMatches) {
            throw new AppError('Credenciais incorretas!', 401);
        }

        const { secret, expiresIn } = authConfig.jwt;

        const payload = {
            create_new_enrollments_permiss:
                user.profile.create_new_enrollments_permiss,
            validate_enrollments_permiss:
                user.profile.validate_enrollments_permiss,
            create_extra_debits_permiss:
                user.profile.create_extra_debits_permiss,
            pay_debits_permiss: user.profile.pay_debits_permiss,
            discharge_payments_permiss: user.profile.discharge_payments_permiss,
            crud_profiles_permiss: user.profile.crud_profiles_permiss,
            crud_users_permiss: user.profile.crud_users_permiss,
            crud_grades_permiss: user.profile.crud_grades_permiss,
            crud_extra_debits_permiss: user.profile.crud_extra_debits_permiss,
        } as IPermissions;

        const token = sign(payload, secret, {
            subject: user.id,
            expiresIn,
        });

        return {
            user,
            token,
        };
    }
}
