import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { AppError } from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { UserLoginPage, UserRegisterPage, loginAction, loginLoader, logoutLoader, registerAction, registerLoader } from './components/User';
import { AddPublicReportForm, sendPublicReport } from './components/Index';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AddReportPage, AddUserPage, AdminPage, DeleteReportPage, DeleteUserPage, EditReportPage, EditUserPage, ListReportsPage, ListUsersPage, ShowReportPage, addReportAction, addUserAction, deleteReportAction, deleteUserAction, editUserAction, loadReports, loadUsers, reportLoader, updateReportAction, userLoader } from './components/Admin';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <AppError/>,
    children: [
      {
        index: true,
        element: <AddPublicReportForm/>,
        action: sendPublicReport
      },
      {
        path: 'login',
        element: <UserLoginPage/>,
        action: loginAction,
        loader: loginLoader
      },
      {
        path: 'register',
        element: <UserRegisterPage/>,
        action: registerAction,
        loader: registerLoader
      },
      {
        path: 'logout',
        loader: logoutLoader
      },
      {
        path: 'admin',
        element: <AdminPage/>,
        children: [
          {
            path: 'users',
            loader: loadUsers,
            element: <ListUsersPage/>,
          },
          {
            path: 'users/:id',
          },
          {
            path: 'users/:id/edit',
            element: <EditUserPage/>,
            loader: userLoader,
            action: editUserAction
          },
          {
            path: 'users/:id/delete',
            element: <DeleteUserPage/>,
            loader: userLoader,
            action: deleteUserAction
          },
          {
            path: 'users/add',
            element: <AddUserPage/>,
            action: addUserAction
          },
          {
            path: 'reports',
            element: <ListReportsPage/>,
            loader: loadReports
          },
          {
            path: 'reports/:id',
            element: <ShowReportPage/>,
            loader: reportLoader
          },
          {
            path: 'reports/:id/edit',
            element: <EditReportPage/>,
            loader: reportLoader,
            action: updateReportAction
          },
          {
            path: 'reports/:id/delete',
            element: <DeleteReportPage/>,
            action: deleteReportAction
          },
          {
            path: 'reports/add',
            element: <AddReportPage/>,
            action: addReportAction
          }
        ]
      }
    ]
  }
]);

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RouterProvider router={router}/>
    </LocalizationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
