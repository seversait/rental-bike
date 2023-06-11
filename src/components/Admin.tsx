import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import moment from 'moment';
import React, { MouseEvent, ReactNode, useEffect, useState } from 'react';
import { ActionFunction, Form, FormProps, Outlet, redirect, useActionData, useLoaderData, useNavigate } from 'react-router-dom';
import { AddCaseFields, AddOfficerFields, ApiError, TheftMessage, UpdateCaseFields, UpdateOfficerFields, User, addCase, addOfficer, currentUser, getCase, getOfficer, listCases, listOfficers, removeCase, removeOfficer, updateCase, updateOfficer } from '../lib/api';
import { ActionParams } from './Index';
import { AccountContext } from './User';
import { LinkButton } from './Util';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert, { AlertColor } from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import { GridColDef, DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import Add from '@mui/icons-material/Add';
import DeleteForever from '@mui/icons-material/DeleteForever';
import Edit from '@mui/icons-material/Edit';
import MoreVert from '@mui/icons-material/MoreVert';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import Save from '@mui/icons-material/Save';

export const AdminPage = () => <>
  <ButtonGroup>
    <LinkButton to="/admin/users">Пользователи</LinkButton>
    <LinkButton to="/admin/reports">Сообщения о краже</LinkButton>
  </ButtonGroup>
  <Box sx={{ marginTop: '30px' }}><Outlet /></Box>
</>

export async function loadUsers() {
  return await listOfficers();
}

export function baseUserCrudAction(action: (args: ActionParams) => any): ActionFunction {
  return async (args: ActionParams) => {
    try {
      await action(args);
    } catch (e) {
      if (e instanceof ApiError) {
        return { ok: false, error: e.message };
      }
      throw e;
    }
    return redirect('/admin/users');
  }
}

interface CrudFormProps extends FormProps {
  header?: ReactNode,
  text?: ReactNode,
  submitButtonContent: ReactNode,
  submitButtonIcon: ReactNode,
  cancelRedirect: string,
  alert?: { severity: AlertColor, message: string } | null,
};

const CrudForm = ({ header, alert, children, text, cancelRedirect, submitButtonIcon, submitButtonContent, ...props }: CrudFormProps) => {
  const [submited, setSubmit] = useState(false);
  useEffect(() => {
    if (submited && alert) setSubmit(false);
  }, [submited, alert]);

  return <Form onSubmit={() => { setSubmit(true) }} {...props}>
    {header && <Typography variant="h4">{header}</Typography>}
    {text && <Typography variant="body1">{text}</Typography>}
    {alert && <Alert severity={alert.severity}>{alert.message}</Alert>}
    {children}
    <LoadingButton loading={submited} type="submit" variant="contained" startIcon={submitButtonIcon}>{submitButtonContent}</LoadingButton>
    <LinkButton to={cancelRedirect}>Отмена</LinkButton>
  </Form>
}

export const MoreMenu = ({ children }: { children: React.ReactNode }) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const onOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.target as HTMLButtonElement);
  }
  const onCloseMenu = () => {
    setAnchor(null);
  }
  return <>
    <IconButton onClick={onOpenMenu}><MoreVert /></IconButton>
    <Menu
      id="basic-menu"
      anchorEl={anchor}
      open={anchor != null}
      onClose={onCloseMenu}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >{children}</Menu>
  </>
}

export const ListUsersPage = () => {
  const data = useLoaderData() as User[];
  const navigate = useNavigate();
  const columns: GridColDef[] = [
    { field: '_id', headerName: 'ID', width: 250 },
    { field: 'email', headerName: 'E-Mail', width: 250 },
    {
      field: 'action', headerName: 'Действие', width: 100, renderCell: (params) => <MoreMenu>
        <AccountContext.Consumer>
          {(user) => user && user.approved ? <>
            <MenuItem onClick={() => { navigate(`${params.id}/edit`) }}><Edit />Редактировать</MenuItem>
            <MenuItem color='error' onClick={() => { navigate(`${params.id}/delete`) }}><DeleteForever />Удалить</MenuItem>
          </> : null}
        </AccountContext.Consumer>
      </MoreMenu>
    }
  ];
  return <>
    <Typography variant="h4" sx={{ display: 'flex', marginBottom: '15px' }}>
      <div style={{ flex: 1 }}>Пользователи</div>
      <IconButton onClick={() => { navigate("/admin/users/add") }}><Add /></IconButton>
    </Typography>
    <DataGrid
      rows={data}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 20 },
        },
      }}
      getRowId={(row: any) => row._id}
      pageSizeOptions={[5, 10]}
    /></>
}


export async function userLoader({ request, params }: ActionParams) {
  return await getOfficer(params.id);
}

export const editUserAction = baseUserCrudAction(async ({ request, params }) => {
  const formData = await request.formData();
  const data: UpdateOfficerFields = {
    email: formData.get('email') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    approved: formData.get('approved') === 'on'
  };
  if (typeof formData.get('password') === 'string' && (formData.get('password') as string).length > 0) {
    data.password = formData.get('password') as string;
  }
  await updateOfficer(params.id, data);
})

export const EditUserPage = () => {
  const data = useLoaderData() as User;
  const actionData = useActionData() as { ok: boolean, error?: string };

  return <CrudForm
    method="PUT"
    header="Редактирование пользователя"
    alert={actionData ? { severity: 'error', message: actionData.error as string } : null}
    submitButtonContent={'Сохранить'}
    submitButtonIcon={<Save />}
    cancelRedirect='/admin/users'
  >
    <TextField fullWidth name="email" type="email" placeholder="E-Mail" defaultValue={data.email} required />
    <TextField fullWidth name="firstName" placeholder="Имя" defaultValue={data.firstName} />
    <TextField fullWidth name="lastName" placeholder="Фамилия" defaultValue={data.lastName} />
    <FormControlLabel control={<Checkbox name="approved" defaultChecked={data.approved} />} label="Подтвержден?" />
    <TextField fullWidth type="password" name="password" placeholder="Пароль" />
  </CrudForm>
}

export const deleteUserAction = baseUserCrudAction(async ({ request, params }) => {
  await removeOfficer(params.id);
})

export const DeleteUserPage = () => {
  const data = useActionData() as { ok: boolean, error?: string };
  const user = useLoaderData() as User;

  return <CrudForm
    header="Удаление пользователя"
    method="DELETE"
    text={`Вы действительно хотите удалить пользователя ${user.email}?`}
    alert={data ? { severity: 'error', message: data.error as string } : null}
    submitButtonContent={'Удалить'}
    submitButtonIcon={<DeleteForever />}
    cancelRedirect='/admin/users'
  >
  </CrudForm>
}

export const addUserAction = baseUserCrudAction(async ({ request, params }) => {
  const formData = await request.formData();
  const data: AddOfficerFields = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    approved: formData.get('approved') === 'on',
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string
  };
  await addOfficer(data);
})

export const AddUserPage = () => {
  const actionData = useActionData() as { ok: boolean, error?: string };

  return <CrudForm
    method="POST"
    header="Добавление пользователя"
    alert={actionData ? { severity: 'error', message: actionData.error as string } : null}
    submitButtonContent={'Сохранить'}
    submitButtonIcon={<Save />}
    cancelRedirect='/admin/users'
  >
    <TextField fullWidth name="email" type="email" placeholder="E-Mail" required />
    <TextField fullWidth name="firstName" placeholder="Имя" />
    <TextField fullWidth name="lastName" placeholder="Фамилия" />
    <FormControlLabel control={<Checkbox name="approved" />} label="Подтвержден?" />
    <TextField fullWidth type="password" name="password" placeholder="Пароль" required />
  </CrudForm>
}

export async function loadReports() {
  return await listCases();
}

export function baseReportCrudAction(action: (args: ActionParams) => any): ActionFunction {
  return async (args: ActionParams) => {
    try {
      await action(args);
    } catch (e) {
      if (e instanceof ApiError) {
        return { ok: false, error: e.message };
      }
      throw e;
    }
    return redirect('/admin/reports');
  }
}

export const ListReportsPage = () => {
  const data = useLoaderData() as TheftMessage[];
  const navigate = useNavigate();
  const columns: GridColDef[] = [
    { field: '_id', headerName: 'ID', width: 250 },
    { field: 'status', headerName: 'Статус', width: 150 },
    {
      field: 'date', headerName: 'Дата кражи', width: 200,
      valueFormatter: params => params.value && moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },
    {
      field: 'createdAt', headerName: 'Дата создания', width: 200,
      valueFormatter: params => params.value && moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },
    {
      field: 'action', headerName: 'Действие', width: 100, renderCell: (params) => <MoreMenu>
        <MenuItem onClick={() => { navigate(`${params.id}`) }}><RemoveRedEye />Посмотреть</MenuItem>
        <AccountContext.Consumer>
          {(user) => user && user.approved ? <>
            <MenuItem onClick={() => { navigate(`${params.id}/edit`) }}><Edit />Редактировать</MenuItem>
            <MenuItem color='error' onClick={() => { navigate(`${params.id}/delete`) }}><DeleteForever />Удалить</MenuItem>
          </> : null}
        </AccountContext.Consumer>
      </MoreMenu>
    }
  ];
  return <>
    <Typography variant="h4" sx={{ display: 'flex', marginBottom: '15px' }}><div style={{ flex: 1 }}>Сообщения о краже</div><IconButton onClick={() => { navigate("add") }}><Add /></IconButton></Typography>
    <DataGrid
      rows={data}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 20 },
        },
      }}
      getRowId={(row: any) => row._id}
      pageSizeOptions={[20, 50, 100]}
    /></>
}

export const deleteReportAction = baseReportCrudAction(async ({ request, params }) => {
  await removeCase(params.id);
})

export const DeleteReportPage = () => {
  const data = useActionData() as { ok: boolean, error?: string };

  return <CrudForm
    header="Удаление сообщения"
    method="DELETE"
    text={`Вы действительно хотите удалить сообщение о краже?`}
    alert={data ? { severity: 'error', message: data.error as string } : null}
    submitButtonContent={'Удалить'}
    submitButtonIcon={<DeleteForever />}
    cancelRedirect='/admin/reports'
  >
  </CrudForm>
}

export const addReportAction = baseReportCrudAction(async ({ request, params }) => {
  const formData = await request.formData();
  const user = currentUser() as User;
  let data: AddCaseFields = {
    status: 'new',
    licenseNumber: formData.get('licenseNumber') as string,
    type: formData.get('type') as string,
    ownerFullName: formData.get('ownerFullName') as string,
    date: formData.get('date') as string,
    officer: user._id as string,
    description: formData.get('description') as string
  };
  if ((formData.get('color') as string).length > 0) {
    data.color = formData.get('color') as string;
  }
  await addCase(data);
})

export const AddReportPage = () => {
  const [type, setType] = useState('general');
  const data = useActionData() as { ok: boolean, error?: string };

  return <CrudForm
    header="Добавить сообщение о краже"
    method="POST"
    alert={data ? { severity: 'error', message: data.error as string } : null}
    submitButtonContent={'Сохранить'}
    submitButtonIcon={<Save />}
    cancelRedirect='/admin/reports'
  >
    <TextField fullWidth name="licenseNumber" placeholder="Номер лицензии" required />
    <FormControl>
      <InputLabel id="demo-simple-select-label">Тип велосипеда</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        name="type"
        value={type}
        label="Тип велосипеда"
        onChange={(e) => { setType(e.target.value) }}
        required
      >
        <MenuItem value="general">Обычный</MenuItem>
        <MenuItem value="sport">Спортивный</MenuItem>
      </Select>
    </FormControl>
    <TextField fullWidth name="ownerFullName" placeholder='ФИО пользователя' required />
    <DatePicker slotProps={{
      textField: {
        name: 'date',
        helperText: 'MM/DD/YYYY',
      },
    }} />
    <TextField fullWidth name="color" placeholder='Цвет велосипеда' />
    <TextField fullWidth multiline minRows={3} maxRows={10} placeholder="Дополнительная информация" />
  </CrudForm>
}

export const reportLoader = async ({params}: ActionParams) => await getCase(params.id);

export const updateReportAction = baseReportCrudAction( async ({request, params}) => {
  const user = currentUser() as User;
  const formData = await request.formData();
  let data: UpdateCaseFields = {
    status: formData.get('status') as 'new' | 'in_progress' | 'done',
    licenseNumber: formData.get('licenseNumber') as string,
    type: formData.get('type') as string,
    ownerFullName: formData.get('ownerFullName') as string,
    date: formData.get('date') as string,
    officer: user._id as string,
    description: formData.get('description') as string,
  };
  if( (formData.get('resolution') as string).length > 0 ) {
    data.resolution = formData.get('resolution') as string;
  }
  if ((formData.get('color') as string).length > 0) {
    data.color = formData.get('color') as string;
  }
  await updateCase( params.id, data );
});

export const EditReportPage = () => {
  const data = useActionData() as { ok: boolean, error?: string };
  const report = useLoaderData() as TheftMessage;
  const [type, setType] = useState(report.type);
  const [status, setStatus] = useState(report.status);
  const date = report.date ? moment(report.date).toDate() : null;

  return <CrudForm
    header="Редактировать сообщение о краже"
    method="PUT"
    alert={data ? { severity: 'error', message: data.error as string } : null}
    submitButtonContent={'Сохранить'}
    submitButtonIcon={<Save />}
    cancelRedirect='/admin/reports'
  >
    <FormControl>
      <InputLabel id="demo-status-label">Статус</InputLabel>
      <Select
        labelId="demo-status-label"
        id="demo-status-select"
        name="status"
        value={status}
        label="Статус"
        onChange={(e) => { setStatus(e.target.value as 'new' | 'in_progress' | 'done') }}
        required
      >
        <MenuItem value="new">Новый</MenuItem>
        <MenuItem value="in_progress">В работе</MenuItem>
        <MenuItem value="done">Завершен</MenuItem>
      </Select>
    </FormControl>
    {status === 'done' && <TextField fullWidth multiline minRows={3} maxRows={10} name="resolution" placeholder="Заключение" defaultValue={report.resolution} required/> }
    <TextField fullWidth name="licenseNumber" placeholder="Номер лицензии" defaultValue={report.licenseNumber} required />
    <FormControl>
      <InputLabel id="demo-simple-select-label">Тип велосипеда</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        name="type"
        value={type}
        label="Тип велосипеда"
        onChange={(e) => { setType(e.target.value) }}
        required
      >
        <MenuItem value="general">Обычный</MenuItem>
        <MenuItem value="sport">Спортивный</MenuItem>
      </Select>
    </FormControl>
    <TextField fullWidth name="ownerFullName" placeholder='ФИО пользователя' defaultValue={report.ownerFullName} required />
    <DatePicker slotProps={{
      textField: {
        name: 'date',
        required: true,
        helperText: 'MM/DD/YYYY',
      },
    }}
    defaultValue={dayjs(date)}
    />
    <TextField fullWidth name="color" placeholder='Цвет велосипеда' />
    <TextField fullWidth multiline minRows={3} maxRows={10} placeholder="Дополнительная информация" />
  </CrudForm>
}

export const ShowReportPage = () => {
  const report = useLoaderData() as TheftMessage;
  return <>
    <Typography variant="h4">Сообщение о краже</Typography>
    <Typography variant="body1">
    <div>id: {report._id}</div>
    <div>статус: {report.status}</div>
    <div>номер лицензии: {report.licenseNumber}</div>
    <div>тип: {report.type}</div>
    <div>ФИО Арендателя: {report.ownerFullName}</div>
    <div>цвет: {report.color}</div>
    <div>дата кражи: {report.date ? moment(report.date).format("DD/MM/YYYY hh:mm A") : null}</div>
    <div>id сотрудника: {report.officer}</div>
    <div>описание: {report.description}</div>
    <div>заключение: {report.resolution}</div>
    </Typography>
  </>
}