import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import {
  FiClipboard,
  FiFlag,
  FiUser,
  FiUsers,
  FiHeart,
  FiBriefcase,
  FiPhone,
  FiSmartphone,
  FiMapPin,
  FiMail,
  FiDollarSign,
  FiArrowRight,
  FiInfo,
  FiCalendar,
  FiSmile,
  FiActivity,
} from 'react-icons/fi';
import cepPromise from 'cep-promise';
import { ValidationError as YupValidationError } from 'yup';
import { toast } from 'react-toastify';

import Loading from '../../components/Loading';
import Aside from '../../components/Aside';
import Header from '../../components/Header';
import Title from '../../components/Title';
import Heading from '../../components/Heading';
import Input from '../../components/Input';
import InputMask from '../../components/InputMask';
import Select from '../../components/SelectInput';
import Radio from '../../components/RadioInput';
import Checkbox from '../../components/Checkbox';
import File from '../../components/FileInput';
import Button from '../../components/Button';
import {
  educationLevelOptions,
  genderOptions,
  raceOptions,
  IOption,
  civilStateOptions,
  monthlyIncomeOptions,
} from '../../utils/defaults';
import { Container, Main, FormGroup, InputGroup, ButtonGroup } from './styles';
import api from '../../services/api';
import IGrade from '../../entities/IGrade';
import IPerson from '../../entities/IPerson';
import IStudent from '../../entities/IStudent';
import IEnrollment from '../../entities/IEnrollment';
import studentSchema from '../../schemas/studentSchema';
import responsibleSchema from '../../schemas/responsibleSchema';
import getValidationErrors from '../../utils/getValidationErrors';

interface IParams {
  contract_id: string;
}

interface IConfigDTO {
  has_food_alergy: 'no' | 'yes';
  has_health_plan: 'no' | 'yes';
  has_health_problem: 'no' | 'yes';
  has_medication_alergy: 'no' | 'yes';
  has_origin_school: 'no' | 'yes';
  has_special_necessities: 'no' | 'yes';
  reaproove_address: boolean;
  financial_income_tax: 'no' | 'yes';
  student_ease_relating: 'no' | 'yes';
}

interface IGradeDTO {
  id: string;
}

type IStudentDTO = Omit<
  IStudent,
  | 'birth_certificate_photo'
  | 'vaccine_card_photo'
  | 'health_plan_photo'
  | 'transfer_declaration_photo'
  | 'monthly_declaration_photo'
  | 'school_records_photo'
>;

interface IStudentPhotosDTO {
  birth_certificate_photo: string;
  vaccine_card_photo: string;
  health_plan_photo: string;
  transfer_declaration_photo: string;
  monthly_declaration_photo: string;
  school_records_photo: string;
}

interface IResponsibleDTO
  extends Omit<IPerson, 'rg_photo' | 'cpf_photo' | 'residencial_proof_photo'> {
  kinship: string;
}

interface IResponsiblePhotosDTO {
  rg_photo?: string;
  cpf_photo?: string;
  residencial_proof_photo?: string;
}

interface IFormData {
  config: IConfigDTO;
  grade: IGradeDTO;
  student: IStudentDTO;
  student_photos: IStudentPhotosDTO;
  financial_responsible: IResponsibleDTO;
  financial_photos: IResponsiblePhotosDTO;
  supportive_responsible: IResponsibleDTO;
  supportive_photos: IResponsiblePhotosDTO;
}

const NewEnrollment: React.FC = () => {
  const params = useParams<IParams>();
  const history = useHistory();

  const formRef = useRef<FormHandles>(null);
  const [enrollment, setEnrollment] = useState({} as IEnrollment);
  const [reuseAddress, setReuseAddress] = useState(false);
  const [gradeOptions, setGradeOptions] = useState([] as IOption[]);
  const [showOriginSchool, setShowOriginSchool] = useState(false);
  const [showHealthPlan, setShowHealthPlan] = useState(false);
  const [showMedicationAlergy, setShowMedicationAlergy] = useState(false);
  const [showFoodAlergy, setShowFoodAlergy] = useState(false);
  const [showHealthProblem, setShowHealthProblem] = useState(false);
  const [showSpecialNecessities, setShowSpecialNecessities] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const submitForm = useCallback(
    async (data: IFormData) => {
      if (loadingSubmit) {
        return;
      }

      let actualPrefixVerification = '';

      setLoadingSubmit(true);

      try {
        formRef.current?.setErrors({});

        const {
          config,
          financial_photos,
          financial_responsible,
          supportive_photos,
          supportive_responsible,
          student_photos,
          student,
          grade,
        } = data;

        financial_responsible.income_tax =
          config.financial_income_tax === 'yes';

        student.ease_relating = config.student_ease_relating === 'yes';

        financial_responsible.kinship = 'none';

        supportive_responsible.kinship = 'none';

        actualPrefixVerification = 'financial_responsible';

        await responsibleSchema.validate(financial_responsible, {
          abortEarly: false,
        });

        actualPrefixVerification = 'supportive_responsible';

        await responsibleSchema.validate(supportive_responsible, {
          abortEarly: false,
        });

        actualPrefixVerification = 'student';

        await studentSchema.validate(student, {
          abortEarly: false,
        });

        await api.put(`/students/${enrollment.student.id}`, student);

        await api.patch(`/contracts/${enrollment.id}/grade`, {
          grade_id: grade.id,
        });

        await api.put(
          `/persons/${enrollment.agreements[0].person.id}`,
          financial_responsible,
        );

        await api.put(
          `/persons/${enrollment.agreements[1].person.id}`,
          supportive_responsible,
        );

        if (financial_photos) {
          const financialPhotos = new FormData();

          if (financial_photos.rg_photo) {
            financialPhotos.append('rg_photo', financial_photos.rg_photo);
          }

          if (financial_photos.cpf_photo) {
            financialPhotos.append('cpf_photo', financial_photos.cpf_photo);
          }

          if (financial_photos.residencial_proof_photo) {
            financialPhotos.append(
              'residencial_proof_photo',
              financial_photos.residencial_proof_photo,
            );
          }

          await api.patch(
            `/persons/photos/${enrollment.agreements[0].person.id}`,
            financialPhotos,
          );
        }

        if (supportive_photos) {
          const supportivePhotos = new FormData();

          if (supportive_photos.rg_photo) {
            supportivePhotos.append('rg_photo', supportive_photos.rg_photo);
          }

          if (supportive_photos.cpf_photo) {
            supportivePhotos.append('cpf_photo', supportive_photos.cpf_photo);
          }

          if (supportive_photos.residencial_proof_photo) {
            supportivePhotos.append(
              'residencial_proof_photo',
              supportive_photos.residencial_proof_photo,
            );
          }

          await api.patch(
            `/persons/photos/${enrollment.agreements[1].person.id}`,
            supportivePhotos,
          );
        }

        if (student_photos) {
          const studentPhotos = new FormData();

          if (student_photos.birth_certificate_photo) {
            studentPhotos.append(
              'birth_certificate_photo',
              student_photos.birth_certificate_photo,
            );
          }

          if (student_photos.health_plan_photo) {
            studentPhotos.append(
              'health_plan_photo',
              student_photos.health_plan_photo,
            );
          }

          if (student_photos.monthly_declaration_photo) {
            studentPhotos.append(
              'monthly_declaration_photo',
              student_photos.monthly_declaration_photo,
            );
          }

          if (student_photos.school_records_photo) {
            studentPhotos.append(
              'school_records_photo',
              student_photos.school_records_photo,
            );
          }

          if (student_photos.transfer_declaration_photo) {
            studentPhotos.append(
              'transfer_declaration_photo',
              student_photos.transfer_declaration_photo,
            );
          }

          if (student_photos.vaccine_card_photo) {
            studentPhotos.append(
              'vaccine_card_photo',
              student_photos.vaccine_card_photo,
            );
          }

          await api.patch(
            `/students/photos/${enrollment.student.id}`,
            studentPhotos,
          );
        }

        toast.success('Dados da matrícula atualizada com sucesso!');

        history.goBack();
      } catch (err) {
        console.log(err.response);

        if (err instanceof YupValidationError) {
          err.inner.forEach(error => {
            error.path = `${actualPrefixVerification}.${error.path}`;
          });

          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          toast.error(`Oops, alguns dados não foram preenchidos corretamente!`);

          return;
        }

        if (err.response) {
          toast.error(
            `Erro ao atualizar matrícula: ${err.response.data.message}`,
          );
        } else {
          toast.error(`Erro interno do servidor!`);
        }
      } finally {
        setLoadingSubmit(false);
      }
    },
    [enrollment, history, loadingSubmit],
  );

  const handleSearchAddressByCep = useCallback((cep, responsible_type) => {
    cepPromise(cep).then(result => {
      const { street, neighborhood, city } = result;

      if (responsible_type === 'financial') {
        formRef.current?.setFieldValue(
          'financial_responsible.address_street',
          street,
        );
        formRef.current?.setFieldValue(
          'financial_responsible.address_neighborhood',
          neighborhood,
        );
        formRef.current?.setFieldValue(
          'financial_responsible.address_city',
          city,
        );
      } else {
        formRef.current?.setFieldValue(
          'supportive_responsible.address_street',
          street,
        );
        formRef.current?.setFieldValue(
          'supportive_responsible.address_neighborhood',
          neighborhood,
        );
        formRef.current?.setFieldValue(
          'supportive_responsible.address_city',
          city,
        );
      }
    });
  }, []);

  useEffect(() => {
    if (reuseAddress) {
      const street = formRef.current?.getFieldValue(
        'financial_responsible.address_street',
      );
      const number = formRef.current?.getFieldValue(
        'financial_responsible.address_number',
      );
      const complement = formRef.current?.getFieldValue(
        'financial_responsible.address_complement',
      );
      const neighborhood = formRef.current?.getFieldValue(
        'financial_responsible.address_neighborhood',
      );
      const city = formRef.current?.getFieldValue(
        'financial_responsible.address_city',
      );
      const cep = formRef.current?.getFieldValue(
        'financial_responsible.address_cep',
      );

      formRef.current?.setFieldValue(
        'supportive_responsible.address_street',
        street,
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_number',
        number,
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_complement',
        complement,
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_neighborhood',
        neighborhood,
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_city',
        city,
      );
      formRef.current?.setFieldValue('supportive_responsible.address_cep', cep);
    } else {
      formRef.current?.setFieldValue(
        'supportive_responsible.address_street',
        '',
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_number',
        '',
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_complement',
        '',
      );
      formRef.current?.setFieldValue(
        'supportive_responsible.address_neighborhood',
        '',
      );
      formRef.current?.setFieldValue('supportive_responsible.address_city', '');
      formRef.current?.setFieldValue('supportive_responsible.address_cep', '');
    }
  }, [reuseAddress]);

  useEffect(() => {
    setLoadingPage(true);

    const { contract_id } = params;

    api
      .get('/grades')
      .then(gradesResponse => {
        const grades = [] as IOption[];

        const gradesFromApi = gradesResponse.data as IGrade[];

        grades.push({ value: '', label: 'Turma desejada' });

        gradesFromApi.forEach(grade => {
          grades.push({ value: grade.id, label: grade.name });
        });

        setGradeOptions(grades);

        api.get(`/contracts/${contract_id}`).then(response => {
          const enrollmentFromApi = response.data as IEnrollment;

          setEnrollment(enrollmentFromApi);

          setShowHealthPlan(!!enrollmentFromApi.student.health_plan);
          setShowFoodAlergy(!!enrollmentFromApi.student.food_alergy);
          setShowOriginSchool(!!enrollmentFromApi.student.origin_school);
          setShowHealthProblem(!!enrollmentFromApi.student.health_problem);
          setShowMedicationAlergy(
            !!enrollmentFromApi.student.medication_alergy,
          );
          setShowSpecialNecessities(
            !!enrollmentFromApi.student.special_necessities,
          );
          setShowSpecialNecessities(
            !!enrollmentFromApi.student.special_necessities,
          );

          enrollmentFromApi.student.birth_certificate_photo =
            enrollmentFromApi.student.birth_certificate_photo_url;

          enrollmentFromApi.student.health_plan_photo =
            enrollmentFromApi.student.health_plan_photo_url;

          enrollmentFromApi.student.vaccine_card_photo =
            enrollmentFromApi.student.vaccine_card_photo_url;

          enrollmentFromApi.student.school_records_photo =
            enrollmentFromApi.student.school_records_photo_url;

          enrollmentFromApi.student.transfer_declaration_photo =
            enrollmentFromApi.student.transfer_declaration_photo_url;

          enrollmentFromApi.student.monthly_declaration_photo =
            enrollmentFromApi.student.monthly_declaration_photo_url;

          enrollmentFromApi.agreements[0].person.rg_photo =
            enrollmentFromApi.agreements[0].person.rg_photo_url;

          enrollmentFromApi.agreements[0].person.cpf_photo =
            enrollmentFromApi.agreements[0].person.cpf_photo_url;

          enrollmentFromApi.agreements[0].person.residencial_proof_photo =
            enrollmentFromApi.agreements[0].person.residencial_proof_photo_url;

          enrollmentFromApi.agreements[1].person.rg_photo =
            enrollmentFromApi.agreements[1].person.rg_photo_url;

          enrollmentFromApi.agreements[1].person.cpf_photo =
            enrollmentFromApi.agreements[1].person.cpf_photo_url;

          enrollmentFromApi.agreements[1].person.residencial_proof_photo =
            enrollmentFromApi.agreements[1].person.residencial_proof_photo_url;

          const formData = {
            config: {
              financial_income_tax: enrollmentFromApi.agreements[0].person
                .income_tax
                ? 'yes'
                : 'no',
              has_food_alergy: enrollmentFromApi.student.food_alergy
                ? 'yes'
                : 'no',
              has_health_plan: enrollmentFromApi.student.health_plan
                ? 'yes'
                : 'no',
              has_health_problem: enrollmentFromApi.student.health_problem
                ? 'yes'
                : 'no',
              has_medication_alergy: enrollmentFromApi.student.medication_alergy
                ? 'yes'
                : 'no',
              has_origin_school: enrollmentFromApi.student.origin_school
                ? 'yes'
                : 'no',
              has_special_necessities: enrollmentFromApi.student
                .special_necessities
                ? 'yes'
                : 'no',
              reaproove_address: false,
              student_ease_relating: enrollmentFromApi.student.ease_relating
                ? 'yes'
                : 'no',
            },
            grade: {
              id: enrollmentFromApi.grade.id,
            },
            student: enrollmentFromApi.student,
            student_photos: {
              birth_certificate_photo:
                enrollmentFromApi.student.birth_certificate_photo,
              health_plan_photo: enrollmentFromApi.student.health_plan_photo,
              monthly_declaration_photo:
                enrollmentFromApi.student.monthly_declaration_photo,
              school_records_photo:
                enrollmentFromApi.student.school_records_photo,
              transfer_declaration_photo:
                enrollmentFromApi.student.transfer_declaration_photo,
              vaccine_card_photo: enrollmentFromApi.student.vaccine_card_photo,
            },
            financial_responsible: {
              ...enrollmentFromApi.agreements[0].person,
              kinship: '',
            },
            financial_photos: {
              cpf_photo: enrollmentFromApi.agreements[0].person.cpf_photo,
              residencial_proof_photo:
                enrollmentFromApi.agreements[0].person.residencial_proof_photo,
              rg_photo: enrollmentFromApi.agreements[0].person.rg_photo,
            },
            supportive_responsible: {
              ...enrollmentFromApi.agreements[1].person,
              kinship: '',
            },
            supportive_photos: {
              cpf_photo: enrollmentFromApi.agreements[1].person.cpf_photo,
              residencial_proof_photo:
                enrollmentFromApi.agreements[1].person.residencial_proof_photo,
              rg_photo: enrollmentFromApi.agreements[1].person.rg_photo,
            },
          } as IFormData;

          formRef.current?.setData(formData);
        });
      })
      .catch(() => {
        toast.error(
          'Erro interno do servidor! Por favor, tente novamente mais tarde.',
        );
      })
      .finally(() => {
        setLoadingPage(false);
      });
  }, [params]);

  return (
    <Container>
      <Loading show={loadingPage} />

      <Header />

      <Aside />

      <Main>
        <Title title="Editar solicitação de matrícula" />

        <Form ref={formRef} onSubmit={submitForm}>
          <FormGroup>
            <Heading title="Dados do responsável financeiro" />

            <InputGroup>
              <Input
                name="financial_responsible.name"
                placeholder="Nome"
                icon={FiUser}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="financial_responsible.rg"
                placeholder="RG"
                icon={FiClipboard}
              />

              <InputMask
                mask="999.999.999-99"
                maskType="cpf"
                name="financial_responsible.cpf"
                placeholder="CPF"
                icon={FiClipboard}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="financial_responsible.nacionality"
                placeholder="Nacionalidade"
                icon={FiFlag}
              />

              <Select
                name="financial_responsible.civil_state"
                icon={FiHeart}
                optionsArray={civilStateOptions}
              />
            </InputGroup>

            <InputGroup>
              <Select
                name="financial_responsible.education_level"
                icon={FiInfo}
                optionsArray={educationLevelOptions}
              />

              <Input
                name="financial_responsible.profission"
                placeholder="Profissão"
                icon={FiBriefcase}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="financial_responsible.workplace"
                placeholder="Local de trabalho"
                icon={FiBriefcase}
              />

              <Input
                name="financial_responsible.commercial_phone"
                placeholder="Telefone comercial"
                icon={FiPhone}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="financial_responsible.residencial_phone"
                placeholder="Telefone residencial"
                icon={FiPhone}
              />

              <Input
                name="financial_responsible.personal_phone"
                placeholder="Telefone pessoal"
                icon={FiSmartphone}
              />
            </InputGroup>

            <InputGroup>
              <InputMask
                mask="99999-999"
                maskType="cep"
                name="financial_responsible.address_cep"
                placeholder="CEP"
                icon={FiMapPin}
                onBlur={e =>
                  handleSearchAddressByCep(
                    e.target.value.replace(/[^0-9]+/g, ''),
                    'financial',
                  )
                }
              />

              <Input
                name="financial_responsible.address_street"
                placeholder="Rua"
                icon={FiMapPin}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="number"
                name="financial_responsible.address_number"
                placeholder="Número"
                icon={FiMapPin}
              />

              <Input
                name="financial_responsible.address_complement"
                placeholder="Complemento"
                icon={FiMapPin}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="financial_responsible.address_neighborhood"
                placeholder="Bairro"
                icon={FiMapPin}
              />

              <Input
                name="financial_responsible.address_city"
                placeholder="Cidade"
                icon={FiMapPin}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="email"
                name="financial_responsible.email"
                placeholder="E-mail"
                icon={FiMail}
              />

              <Select
                name="financial_responsible.monthly_income"
                icon={FiDollarSign}
                optionsArray={monthlyIncomeOptions}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="date"
                name="financial_responsible.birth_date"
                icon={FiCalendar}
                label="Data de nascimento"
              />
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.financial_income_tax"
                label="Declara imposto de renda?"
                options={[
                  { id: 'fit1', label: 'Sim', value: 'yes' },
                  {
                    id: 'fit2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="financial_photos.rg_photo"
                buttonText="RG"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="financial_photos.cpf_photo"
                buttonText="CPF"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="financial_photos.residencial_proof_photo"
                buttonText="Comprovante de endereço"
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Heading title="Dados do responsável solidário" />

            <InputGroup>
              <Input
                name="supportive_responsible.name"
                placeholder="Nome"
                icon={FiUser}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="supportive_responsible.rg"
                placeholder="RG"
                icon={FiClipboard}
              />

              <InputMask
                mask="999.999.999-99"
                maskType="cpf"
                name="supportive_responsible.cpf"
                placeholder="CPF"
                icon={FiClipboard}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="supportive_responsible.nacionality"
                placeholder="Nacionalidade"
                icon={FiFlag}
              />

              <Select
                name="supportive_responsible.civil_state"
                icon={FiHeart}
                optionsArray={civilStateOptions}
              />
            </InputGroup>

            <InputGroup>
              <Select
                name="supportive_responsible.education_level"
                icon={FiInfo}
                optionsArray={educationLevelOptions}
              />

              <Input
                name="supportive_responsible.profission"
                placeholder="Profissão"
                icon={FiBriefcase}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="supportive_responsible.workplace"
                placeholder="Local de trabalho"
                icon={FiBriefcase}
              />

              <Input
                name="supportive_responsible.commercial_phone"
                placeholder="Telefone comercial"
                icon={FiPhone}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="supportive_responsible.residencial_phone"
                placeholder="Telefone residencial"
                icon={FiPhone}
              />

              <Input
                name="supportive_responsible.personal_phone"
                placeholder="Telefone pessoal"
                icon={FiSmartphone}
              />
            </InputGroup>

            <InputGroup>
              <Checkbox
                name="config.reaproove_address"
                label="Utilizar o mesmo endereço do responsável financeiro?"
                onChange={e => setReuseAddress(e.target.checked)}
              />
            </InputGroup>

            <InputGroup>
              <InputMask
                mask="99999-999"
                maskType="cep"
                name="supportive_responsible.address_cep"
                placeholder="CEP"
                icon={FiMapPin}
                onBlur={e =>
                  handleSearchAddressByCep(
                    e.target.value.replace(/[^0-9]+/g, ''),
                    'supportive',
                  )
                }
              />

              <Input
                name="supportive_responsible.address_street"
                placeholder="Rua"
                icon={FiMapPin}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="number"
                name="supportive_responsible.address_number"
                placeholder="Número"
                icon={FiMapPin}
              />

              <Input
                name="supportive_responsible.address_complement"
                placeholder="Complemento"
                icon={FiMapPin}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="supportive_responsible.address_neighborhood"
                placeholder="Bairro"
                icon={FiMapPin}
              />

              <Input
                name="supportive_responsible.address_city"
                placeholder="Cidade"
                icon={FiMapPin}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="email"
                name="supportive_responsible.email"
                placeholder="E-mail"
                icon={FiMail}
              />

              <Select
                name="supportive_responsible.monthly_income"
                icon={FiDollarSign}
                optionsArray={monthlyIncomeOptions}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="date"
                name="supportive_responsible.birth_date"
                icon={FiCalendar}
                label="Data de nascimento"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="supportive_photos.rg_photo"
                buttonText="RG"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="supportive_photos.cpf_photo"
                buttonText="CPF"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="supportive_photos.residencial_proof_photo"
                buttonText="Comprovante de endereço"
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Heading title="Dados do aluno" />

            <InputGroup>
              <Input name="student.name" placeholder="Nome" icon={FiUser} />
            </InputGroup>

            <InputGroup>
              <Input
                name="student.nacionality"
                placeholder="Nacionalidade"
                icon={FiFlag}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="student.birth_city"
                placeholder="Cidade natal"
                icon={FiMapPin}
              />

              <Input
                name="student.birth_state"
                placeholder="Estado natal (UF)"
                icon={FiMapPin}
                minLength={2}
                maxLength={2}
              />
            </InputGroup>

            <InputGroup>
              <Input
                name="student.father_name"
                placeholder="Nome do pai"
                icon={FiUsers}
              />

              <Input
                name="student.mother_name"
                placeholder="Nome da mãe"
                icon={FiUsers}
              />
            </InputGroup>

            <InputGroup>
              <Select
                name="student.gender"
                icon={FiInfo}
                optionsArray={genderOptions}
              />

              <Select
                name="student.race"
                icon={FiInfo}
                optionsArray={raceOptions}
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="date"
                name="student.birth_date"
                icon={FiCalendar}
                label="Data de nascimento"
              />

              <Select
                name="grade.id"
                icon={FiSmile}
                optionsArray={gradeOptions}
              />
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.has_origin_school"
                label="Selecione uma opção:"
                options={[
                  {
                    id: 'hos1',
                    label: 'Matrícula',
                    value: 'yes',
                  },
                  {
                    id: 'hos2',
                    label: 'Rematrícula',
                    value: 'no',
                    default: true,
                  },
                ]}
                change={value => setShowOriginSchool(value === 'yes')}
              />

              {showOriginSchool && (
                <Input
                  name="student.origin_school"
                  placeholder="Escola de origem"
                  icon={FiMapPin}
                />
              )}
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.has_health_plan"
                label="Possui algum plano de saúde?"
                options={[
                  { id: 'hhp1', label: 'Sim', value: 'yes' },
                  {
                    id: 'hhp2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
                change={value => setShowHealthPlan(value === 'yes')}
              />

              {showHealthPlan && (
                <Input
                  name="student.health_plan"
                  placeholder="Qual?"
                  icon={FiActivity}
                />
              )}
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.has_medication_alergy"
                label="Possui alergia a algum medicamento?"
                options={[
                  { id: 'hma1', label: 'Sim', value: 'yes' },
                  {
                    id: 'hma2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
                change={value => setShowMedicationAlergy(value === 'yes')}
              />

              {showMedicationAlergy && (
                <Input
                  name="student.medication_alergy"
                  placeholder="Qual?"
                  icon={FiActivity}
                />
              )}
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.has_food_alergy"
                label="Possui alergia a algum alimento?"
                options={[
                  { id: 'hfa1', label: 'Sim', value: 'yes' },
                  {
                    id: 'hfa2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
                change={value => setShowFoodAlergy(value === 'yes')}
              />

              {showFoodAlergy && (
                <Input
                  name="student.food_alergy"
                  placeholder="Qual?"
                  icon={FiActivity}
                />
              )}
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.has_health_problem"
                label="Possui algum problema de saúde?"
                options={[
                  { id: 'hhpp1', label: 'Sim', value: 'yes' },
                  {
                    id: 'hhpp2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
                change={value => setShowHealthProblem(value === 'yes')}
              />

              {showHealthProblem && (
                <Input
                  name="student.health_problem"
                  placeholder="Qual?"
                  icon={FiActivity}
                />
              )}
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.has_special_necessities"
                label="Possui alguma necessidade especial?"
                options={[
                  { id: 'hsn1', label: 'Sim', value: 'yes' },
                  {
                    id: 'hsn2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
                change={value => setShowSpecialNecessities(value === 'yes')}
              />

              {showSpecialNecessities && (
                <Input
                  name="student.special_necessities"
                  placeholder="Qual?"
                  icon={FiActivity}
                />
              )}
            </InputGroup>

            <InputGroup>
              <Radio
                name="config.student_ease_relating"
                label="Tem facilidade de se relacionar?"
                options={[
                  { id: 'ser1', label: 'Sim', value: 'yes' },
                  {
                    id: 'ser2',
                    label: 'Não',
                    value: 'no',
                    default: true,
                  },
                ]}
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="student_photos.school_records_photo"
                buttonText="Histórico escolar"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="student_photos.vaccine_card_photo"
                buttonText="Cartão de vacina"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="student_photos.birth_certificate_photo"
                buttonText="Certidão de nascimento"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="student_photos.health_plan_photo"
                buttonText="Cartão do plano de saúde"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="student_photos.transfer_declaration_photo"
                buttonText="Declaração de transferência"
              />
            </InputGroup>

            <InputGroup>
              <File
                showPreview
                name="student_photos.monthly_declaration_photo"
                buttonText="Declaração de quitação de débito da escola anterior"
              />
            </InputGroup>
          </FormGroup>

          <ButtonGroup>
            <Button type="submit" loading={loadingSubmit}>
              Atualizar
              <FiArrowRight size={20} />
            </Button>
          </ButtonGroup>
        </Form>
      </Main>
    </Container>
  );
};

export default NewEnrollment;
