import { DatePicker } from '@mui/x-date-pickers';
import React, { useEffect, useState } from 'react';
import { Form, useActionData} from 'react-router-dom';
import { ApiError, CLIENT_ID, PublicReportFields, publicReport } from '../lib/api';
import moment from 'moment';
import LoadingButton from '@mui/lab/LoadingButton';
import Send from '@mui/icons-material/Send';

import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export interface ActionParams {
  request: Request,
  params: {[key: string]: any}
}

export async function sendPublicReport({request, params}: ActionParams ) {
  const formData = await request.formData();
  let data: PublicReportFields = {
    clientId: CLIENT_ID,
    ownerFullName: formData.get('ownerFullName') as string,
    status: 'new',
    licenseNumber: formData.get('licenseNumber') as string,
    type: formData.get('type') as string,
    date: formData.get('date') ? moment( formData.get('date') as string ).utc(true).toString() : null,
    description: formData.get('description') as string|null,
  };
  try {
    await publicReport( data );
  } catch(e) {
    if( e instanceof ApiError ) {
      return { ok: false, error: e.message }
    }
    throw e;
  }
  return {ok: true}
}

export const AddPublicReportForm = () => {
  const [type, setType] = useState('general');

  const onTypeChange = (e: SelectChangeEvent) => {
    setType( e.target.value );
  }
  const data = useActionData() as {ok: boolean, error?: string};

  const [submited, setSubmited] = useState(false);

  useEffect(() => {
    if( submited && data ) setSubmited(false);
  }, [ submited, data ])

  return <Form style={{maxWidth: "400px", margin: 'auto'}} method="POST" action="" onSubmit={() => {setSubmited(true)}}>
    <fieldset disabled={submited}>
    <Typography variant="h4">Сообщите о краже</Typography>
    {data && !data.ok && <Alert severity='error'>{data.error}</Alert>}
    {data && data.ok && <Alert severity='success'>Спасибо за ваш запрос. Мы примем меры.</Alert>}
    <TextField fullWidth name="licenseNumber" placeholder="Номер лицензии" required/>
    <FormControl>
    <InputLabel id="demo-simple-select-label">Тип велосипеда</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        name="type"
        value={type}
        label="Тип велосипеда"
        onChange={onTypeChange}
        required
      >
        <MenuItem value="general">Обычный</MenuItem>
        <MenuItem value="sport">Спортивный</MenuItem>
      </Select>
    </FormControl>
    <TextField fullWidth name="ownerFullName" placeholder='ФИО пользователя' required/>
    <DatePicker slotProps={{
      textField: {
        name: 'date',
        required: true,
        helperText: 'MM/DD/YYYY',
      },
    }}/>
    <TextField fullWidth name="color" placeholder='Цвет велосипеда'/>
    <TextField fullWidth multiline minRows={3} maxRows={10} name="description" placeholder="Дополнительная информация"/>
    <LoadingButton loading={submited} type="submit" variant="contained" startIcon={<Send/>}>Отправить</LoadingButton>
    </fieldset>
  </Form>
}