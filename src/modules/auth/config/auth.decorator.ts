import { SetMetadata } from '@nestjs/common';

export enum PermissionType {
  // Users
  CREATE_USER = 'CREATE_USER',
  READ_USER = 'READ_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',

  // Roles
  CREATE_ROLE = 'CREATE_ROLE',
  READ_ROLE = 'READ_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',

  // Cameras
  CREATE_CAMERA = 'CREATE_CAMERA',
  READ_CAMERA = 'READ_CAMERA',
  UPDATE_CAMERA = 'UPDATE_CAMERA',
  DELETE_CAMERA = 'DELETE_CAMERA',
}

export const AUTH_KEY = 'auth';
export const Auth = (...permissions: PermissionType[]) =>
  SetMetadata(AUTH_KEY, permissions);
