import React, {createContext, useEffect, useState} from 'react';
import { AddOfficerFields, ApiError, User, currentUser, login, logout, register } from '../lib/api';
import { LinkButton } from './Util';
import { Form, redirect, useActionData, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { ActionParams } from './Index';
import { MouseEvent } from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import ExitToApp from '@mui/icons-material/ExitToApp';
import Person from '@mui/icons-material/Person';


export const AccountContext = createContext<User|null>(null);

export async function logoutLoader() {
  await logout();
  return redirect('/');
}

export const UserButton = () => {
  const [anchor, setAnchor] = useState<HTMLButtonElement|null>(null);

  const onOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.target as HTMLButtonElement);
  }

  const onCloseMenu = () => {
    setAnchor(null);
  }

  const navigate = useNavigate();

  return <AccountContext.Consumer>
    {user => user 
      ? <><IconButton color="inherit" onClick={onOpenMenu}><Avatar sx={{ width: 24, height: 24 }} alt={user.firstName || user.email}/></IconButton>
        <Menu
        id="basic-menu"
        anchorEl={anchor}
        open={anchor != null}
        onClose={onCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => {navigate('/admin')}}><AdminPanelSettings/>Администрирование</MenuItem>
        <MenuItem onClick={() => {navigate('/logout')}}><ExitToApp/>Выйти</MenuItem>
      </Menu>
      </>
      : <LinkButton color="inherit" to="/login">войти</LinkButton>}
  </AccountContext.Consumer>
}

export async function loginAction({request, params}: ActionParams) {
  const formData = await request.formData();
  try {
    await login( formData.get('login') as string, formData.get('password') as string );
  } catch( e ) {
    if( e instanceof ApiError ) {
      return { ok: false, error: e.message };
    }
    throw e;
  }
  return redirect('/');
}

export async function loginLoader() {
  if( currentUser() != null ) {
    return redirect('/')
  }
  return null;
}

export const UserLoginPage = () => {
  const [submited, setSubmit] = useState(false);
  const data = useActionData() as {ok: boolean, error?: string};

  useEffect(() => {
    if( submited && data ) setSubmit(false);
  }, [submited, data]);

  return <Form method="POST" action="" style={{maxWidth: "400px", margin: 'auto'}} onSubmit={() => {setSubmit(true)}}>
    <Typography variant="h4">Авторизация</Typography>
    {data && !data.ok && <Alert severity='error'>{data.error}</Alert>}
    <TextField fullWidth name="login" placeholder="Логин" required />
    <TextField fullWidth type="password" name="password" placeholder="Пароль" required />
    <LoadingButton loading={submited} type="submit" variant="contained" startIcon={<Person/>}>Войти</LoadingButton>
    <LinkButton to="/register" type="button">Зарегистрироватся</LinkButton>
  </Form>
}

export async function registerAction({request, params}: ActionParams) {
  const formData = await request.formData();
  const data: AddOfficerFields = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string
  };
  try {
    await register( data );
  } catch( e ) {
    if( e instanceof ApiError ) {
      return { ok: false, error: e.message };
    }
    throw e;
  }
  return redirect('/login')
}

export async function registerLoader() { 
  if( currentUser() != null ) {
    return redirect('/');
  }
  return null;
}

export const UserRegisterPage = () => {
  const [submited, setSubmit] = useState(false);
  const data = useActionData() as {ok: boolean, error?: string};

  useEffect(() => {
    if( submited && data ) setSubmit(false);
  }, [submited, data]);

  return <Form method="POST" action="" style={{maxWidth: "400px", margin: 'auto'}} onSubmit={() => {setSubmit(true)}}>
    <Typography variant="h4">Регистрация</Typography>
    {data && !data.ok && <Alert severity='error'>{data.error}</Alert>}
    <TextField fullWidth name="email" type="email" placeholder="E-Mail" required />
    <TextField fullWidth name="firstName" placeholder="Имя" />
    <TextField fullWidth name="lastName" placeholder="Фамилия" />
    <TextField fullWidth type="password" name="password" placeholder="Пароль" required />
    <LoadingButton loading={submited} type="submit" variant="contained" startIcon={<Person/>}>Зарегистрироваться</LoadingButton>
    <LinkButton to="/login" type="button">Войти</LinkButton>
  </Form>
}