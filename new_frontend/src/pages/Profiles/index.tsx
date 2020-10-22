import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { FiBriefcase, FiTrash, FiEdit2 } from 'react-icons/fi';
import { ValidationError as YupValidationError } from 'yup';
import { toast } from 'react-toastify';

import { Container, Main, ButtonGroup, DoubleColumn } from './styles';
import Header from '../../components/Header';
import Aside from '../../components/Aside';
import Title from '../../components/Title';
import Input from '../../components/Input';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import ProfilesList from '../../components/List';
import IProfile from '../../entities/IProfile';
import api from '../../services/api';
import profileSchema from '../../schemas/profileSchema';
import getValidationErrors from '../../utils/getValidationErrors';

const Profiles: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const [profiles, setProfiles] = useState([] as IProfile[]);

  const [profileId, setProfileId] = useState('');

  useEffect(() => {
    api.get('/profiles').then(response => setProfiles(response.data));
  }, []);

  const handleGetProfile = useCallback((data: IProfile) => {
    setProfileId(data.id);

    formRef.current?.setErrors({});

    formRef.current?.setData(data);
  }, []);

  const handleUngetProfile = useCallback(() => {
    setProfileId('');

    formRef.current?.setErrors({});

    formRef.current?.reset();
  }, []);

  const handleAddProfile = useCallback(
    async (data: Omit<IProfile, 'id'>, { reset }) => {
      try {
        formRef.current?.setErrors({});

        await profileSchema.validate(data, {
          abortEarly: false,
        });

        const response = await api.post('/profiles', data);

        setProfiles([...profiles, response.data]);

        reset();

        toast.success('Perfil criado com sucesso!');
      } catch (err) {
        if (err instanceof YupValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }

        toast.error(`Erro ao criar perfil: ${err.response.data.message}`);
      }
    },
    [profiles],
  );

  const handleUpdateProfile = useCallback(
    async (data: Omit<IProfile, 'id'>, { reset }) => {
      try {
        formRef.current?.setErrors({});

        await profileSchema.validate(data, {
          abortEarly: false,
        });

        const response = await api.put(`/profiles/${profileId}`, data);

        const profilesWithoutEdited = profiles.filter(
          profile => profile.id !== profileId,
        );

        setProfiles([...profilesWithoutEdited, response.data]);

        setProfileId('');

        reset();

        toast.success('Perfil atualizado com sucesso!');
      } catch (err) {
        if (err instanceof YupValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }

        toast.error(`Erro ao atualizar perfil: ${err.response.data.message}`);
      }
    },
    [profiles, profileId],
  );

  return (
    <Container>
      <Header />

      <Aside />

      <Main>
        <Title title="Gerenciar perfis" />

        <DoubleColumn>
          <Form
            ref={formRef}
            onSubmit={!profileId ? handleAddProfile : handleUpdateProfile}
          >
            <Input placeholder="Nome" name="name" icon={FiBriefcase} />

            <Checkbox
              name="new_enrollment_permiss"
              label="Criar nova matrícula"
            />

            <Checkbox
              name="validate_enrollment_permiss"
              label="Aprovar e desaprovar matrículas"
            />

            <Checkbox name="pay_debit_permiss" label="Pagar débitos" />

            <Checkbox
              name="discharge_payment_permiss"
              label="Receber pagamentos"
            />

            <Checkbox name="crud_profiles_permiss" label="Gerenciar perfis" />

            <Checkbox name="crud_users_permiss" label="Gerenciar usuários" />

            <Checkbox name="crud_grades_permiss" label="Gerenciar turmas" />

            <ButtonGroup>
              {!profileId ? (
                <Button type="submit">Adicionar</Button>
              ) : (
                <>
                  <Button type="submit">Atualizar</Button>

                  <Button
                    type="submit"
                    backgroundColor="#f44336"
                    onClick={handleUngetProfile}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </ButtonGroup>
          </Form>

          {profiles.length > 0 && (
            <ProfilesList>
              {profiles.map(profile => (
                <li key={profile.id}>
                  <FiEdit2
                    size={20}
                    onClick={() => handleGetProfile(profile)}
                  />
                  {/* <FiTrash
                    size={20}
                    onClick={() => handleRemoveProfile(profile.id)}
                  /> */}
                  <span>{profile.name}</span>
                </li>
              ))}
            </ProfilesList>
          )}
        </DoubleColumn>
      </Main>
    </Container>
  );
};

export default Profiles;
