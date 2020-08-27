import { EntityRepository, Repository, getRepository } from 'typeorm';

import IProfilesRepository from '@modules/profiles/repositories/IProfilesRepository';
import Profile from '@modules/profiles/infra/typeorm/entities/Profile';
import ICreateProfileDTO from '@modules/profiles/dtos/ICreateProfileDTO';

@EntityRepository(Profile)
export default class ProfilesRepository implements IProfilesRepository {
    private ormRepository: Repository<Profile>;

    constructor() {
        this.ormRepository = getRepository(Profile);
    }

    public async findByName(name: string): Promise<Profile | undefined> {
        const profile = this.ormRepository.findOne({ where: { name } });

        return profile;
    }

    public async create(data: ICreateProfileDTO): Promise<Profile> {
        const profile = this.ormRepository.create(data);

        await this.ormRepository.save(profile);

        return profile;
    }
}
