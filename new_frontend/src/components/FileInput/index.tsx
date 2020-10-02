import React, { useEffect, useRef, useState } from 'react';
import { useField } from '@unform/core';

import Button from '../Button';
import { Container } from './styles';

interface Props {
  name: string;
  buttonText: string;
}

type InputProps = JSX.IntrinsicElements['input'] & Props;

const Input: React.FC<InputProps> = ({ name, buttonText, ...rest }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { fieldName, registerField } = useField(name);
  const [filename, setFilename] = useState('Nenhum arquivo selecionado');

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'files[0]',
      clearValue(ref: HTMLInputElement) {
        ref.value = '';
        setFilename('Nenhum arquivo selecionado');
      },
      setValue(_: HTMLInputElement, value: File) {
        setFilename(
          value && value.name ? value.name : 'Nenhum arquivo selecionado',
        );
      },
    });
  }, [fieldName, inputRef, registerField]);

  return (
    <Container>
      <input
        type="file"
        id={name}
        name={name}
        ref={inputRef}
        onChange={e =>
          setFilename(
            e.target.files && e.target.files[0]
              ? e.target.files[0].name
              : 'Nenhum arquivo selecionado',
          )
        }
        {...rest}
      />
      <Button type="button" backgroundColor="#CED4DA" color="#212529">
        <label htmlFor={name}>{buttonText}</label>
      </Button>
      <span>{filename}</span>
    </Container>
  );
};

export default Input;
