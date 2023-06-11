export const API_ENTRY = 'https://sf-final-project-be.herokuapp.com/api';
export const CLIENT_ID = '650fd131-6be9-46a6-a156-0c2d85134c78';

export class ApiError extends Error {}

async function api(method: string, path: string, params?: Object) {
  let fetchParams: RequestInit = { method };

  let headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('token');
  if( token ) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if( params ) {
    fetchParams.body = JSON.stringify(params);
  }
  fetchParams.headers = headers;
  const data = await fetch(`${API_ENTRY}${path}`, fetchParams);
  const jsonData = await data.json();
  if( !data.ok || (jsonData.status !== undefined && jsonData.status !== 'OK') ) {
    return Promise.reject( new ApiError( (jsonData.error || jsonData.message) as string ) );
  }
  return jsonData;
}

export default api;

export interface User {
  _id?: string, 
  email: string,
  clientId?: string,
  approved: boolean,
  firstName: string,
  lastName: string,
  password?: string,
  __v: any
};

export const currentUser = () => JSON.parse( localStorage.getItem('user') || 'null' );

export const login = async ( login: string, password: string ): Promise<User> => {
  const data = await api('POST', '/auth/sign_in', { email: login, password });
  localStorage.setItem( 'token', data.data.token );
  localStorage.setItem( 'user', JSON.stringify( data.data.user ) );
  document.dispatchEvent( new CustomEvent('auth:sign_in', { detail: data.data.user }) )
  return data.data.user;
}

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.dispatchEvent( new CustomEvent('auth:sign_out') )
}

export interface TheftMessage {
  _id: string,
  status: 'new' | 'in_progress' | 'done',
  licenseNumber: string,
  type: string,
  ownerFullName: string,
  clientId: string,
  createdAt: string,
  updatedAt: string|null,
  color: string|null,
  date: string|null,
  officer: string|null,
  description: string|null,
  resolution: string|null,
  __v: any
}

export interface PublicReportFields {
  status: 'new' | 'in_progress' | 'done',
  clientId: string,
  licenseNumber: string,
  type: string,
  ownerFullName: string,
  color?: string|null,
  date?: string|null,
  description?: string|null,
  resolution?: string|null,
}

export const  publicReport = async ( message: PublicReportFields ): Promise<TheftMessage> =>
  api('POST', '/public/report', message).then(response => response.data);

export const listCases = async (): Promise<TheftMessage[]> =>
  api('GET', '/cases').then(response => response.data);

export const getCase = async ( id: string ): Promise<TheftMessage|null> => {
  return api('GET', `/cases/${id}`)
    .then(response => response.data)
    .catch(reason => {
      if( reason.typeof(Object) && reason.errCode === 'UNKNOWN_CASE' ) return null;
    });
}

export interface AddCaseFields {
  status: 'new' | 'in_progress' | 'done',
  licenseNumber: string,
  type: string,
  ownerFullName: string,
  color?: string,
  date: string,
  officer: string,
  description?: string,
  resolution?: string
}

export const addCase = async ( message: AddCaseFields ): Promise<TheftMessage> =>
  api('POST', '/cases', message).then(response => response.data);

export interface UpdateCaseFields {
  status?: 'new' | 'in_progress' | 'done',
  licenseNumber?: string,
  type?: string,
  ownerFullName?: string,
  color?: string,
  date?: string,
  officer?: string,
  description?: string,
  resolution?: string
}

export const updateCase = async ( id: string, fields: UpdateCaseFields ): Promise<TheftMessage> =>
  api('PUT', `/cases/${id}`, fields).then(response => response.data);

export const removeCase = async ( id: string ): Promise<null> =>
  api('DELETE', `/cases/${id}`).then(_response => null);

export const listOfficers = async(): Promise<User[]> =>
  api('GET', '/officers').then(response => response.officers);

export interface AddOfficerFields {
  email: string,
  password: string,
  approved?: boolean,
  firstName?: string | null,
  lastName?: string | null,
}

export const register = async (fields: AddOfficerFields ): Promise<User> =>
  api('POST', '/auth/sign_in', fields ).then(response => response.data);

export const addOfficer = async ( fields: AddOfficerFields ): Promise<User> => 
  api('POST', '/officers', fields).then(response => response.data );

export interface UpdateOfficerFields {
  email?: string,
  approved?: boolean,
  firstName?: string|null,
  lastName?: string|null,
  password?: string,
}

export const updateOfficer = async ( id: string, fields: UpdateOfficerFields ): Promise<User> => 
  api('PUT', `/officers/${id}`, fields ).then(response => response.data);

export const getOfficer = async ( id: string ): Promise<User|null> =>
  api('GET', `/officers/${id}`)
  .then(response => response.data)
  .catch(reason => {
    if( reason.typeof(Object) && reason.errCode === 'UNKNOWN_OFFICER' ) return null;
  });

export const removeOfficer = async ( id: string ): Promise<null> => 
  api('DELETE', `/officers/${id}`).then(_response => null);