import AppError from '@shared/errors/AppError';
import FakeHashProvider from '@shared/container/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeProfilesRepository from '@modules/profiles/repositories/fakes/FakeProfilesRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import CreateUserService from './CreateUserService';

let fakeHashProvider: FakeHashProvider;
let fakeUsersRepository: FakeUsersRepository;
let fakeProfilesRepository: FakeProfilesRepository;
let fakeCacheProvider: FakeCacheProvider;
let createUser: CreateUserService;

describe('CreateUser', () => {
    beforeEach(() => {
        fakeUsersRepository = new FakeUsersRepository();
        fakeHashProvider = new FakeHashProvider();
        fakeProfilesRepository = new FakeProfilesRepository();
        fakeCacheProvider = new FakeCacheProvider();

        createUser = new CreateUserService(
            fakeUsersRepository,
            fakeProfilesRepository,
            fakeHashProvider,
            fakeCacheProvider,
        );
    });

    it('should be able to create a new user by passing username, password and profile id', async () => {
        const profile = await fakeProfilesRepository.create({
            name: 'profile',
            create_extra_debits_permiss: true,
            create_new_enrollments_permiss: true,
            crud_extra_debits_permiss: true,
            crud_grades_permiss: true,
            crud_profiles_permiss: true,
            crud_users_permiss: true,
            discharge_payments_permiss: true,
            generate_documents_permiss: true,
            pay_debits_permiss: true,
            validate_enrollments_permiss: true,
        });

        const user = await createUser.execute({
            profile_id: profile.id,
            username: 'username',
            password: 'password',
        });

        expect(user).toHaveProperty('id');
    });

    it('should not be able to create a new user with a profile that does not exists', async () => {
        await expect(
            createUser.execute({
                profile_id: 'non-existing profile',
                username: 'username',
                password: 'password',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to create a new user with the same username from another', async () => {
        const profile = await fakeProfilesRepository.create({
            name: 'profile',
            create_extra_debits_permiss: true,
            create_new_enrollments_permiss: true,
            crud_extra_debits_permiss: true,
            crud_grades_permiss: true,
            crud_profiles_permiss: true,
            crud_users_permiss: true,
            discharge_payments_permiss: true,
            generate_documents_permiss: true,
            pay_debits_permiss: true,
            validate_enrollments_permiss: true,
        });

        const user = await createUser.execute({
            profile_id: profile.id,
            username: 'username',
            password: 'password',
        });

        await expect(
            createUser.execute({
                profile_id: profile.id,
                username: user.username,
                password: 'password',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });
});
