import FakeGradesRepository from '@modules/grades/repositories/fakes/FakeGradesRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeContractsRepository from '../repositories/fakes/FakeContractsRepository';
import IndexActiveContractsByGradeIdService from './IndexActiveContractsByGradeIdService';

let fakeContractsRepository: FakeContractsRepository;
let fakeGradesRepository: FakeGradesRepository;
let fakeCacheProvider: FakeCacheProvider;
let indexActiveContractsByGradeId: IndexActiveContractsByGradeIdService;

describe('IndexActiveContractsByGradeId', () => {
    beforeEach(() => {
        fakeContractsRepository = new FakeContractsRepository();
        fakeGradesRepository = new FakeGradesRepository();
        fakeCacheProvider = new FakeCacheProvider();

        indexActiveContractsByGradeId = new IndexActiveContractsByGradeIdService(
            fakeContractsRepository,
            fakeCacheProvider,
        );
    });

    it('should be able to list all active contracts by grade id', async () => {
        const grade = await fakeGradesRepository.create({
            name: 'grade',
            value: 100,
            year: '2020',
        });

        const activeContractThatMatches = await fakeContractsRepository.create({
            grade_id: grade.id,
            student_id: 'student',
            status: 'active',
        });

        activeContractThatMatches.grade = grade;

        await fakeContractsRepository.save(activeContractThatMatches);

        await fakeContractsRepository.create({
            grade_id: 'another-grade',
            student_id: 'student',
            status: 'active',
        });

        await fakeContractsRepository.create({
            grade_id: 'grade',
            student_id: 'student',
            status: 'accepted',
        });

        const contracts = await indexActiveContractsByGradeId.execute(grade.id);

        expect(contracts).toEqual([activeContractThatMatches]);
    });
});
