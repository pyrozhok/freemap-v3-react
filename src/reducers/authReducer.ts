import { RootAction } from 'fm3/actions';
import { authLogout, authSetUser } from 'fm3/actions/authActions';
import { User } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';

export interface AuthState {
  validated: boolean;
  user: User | null;
}

export const authInitialState: AuthState = {
  validated: false,
  user: null,
};

export const authReducer = createReducer<AuthState, RootAction>(
  authInitialState,
)
  .handleAction(authSetUser, (state, action) => ({
    ...state,
    user: action.payload && {
      name: action.payload.name,
      email: action.payload.email,
      sendGalleryEmails: action.payload.sendGalleryEmails,
      id: action.payload.id,
      authToken: action.payload.authToken,
      isAdmin: action.payload.isAdmin,
    },
    validated: true,
  }))
  .handleAction(authLogout, () => authInitialState);
