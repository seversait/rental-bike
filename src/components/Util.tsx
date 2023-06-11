import Button from '@mui/material/Button';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LinkButton = ({to, ...props}: {to: string, [key: string]: any}) => {
  const navigate = useNavigate();
  return <Button onClick={() => { navigate(to) }} {...props}></Button> 
}