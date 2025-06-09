import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

// backendUrl should be defined in your .env file
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const USER_API = `${backendUrl}/api/v1/user`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "/userdata",
        method: "GET",
      }),
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/userdata/${userId}`,
        method: "DELETE",
      }),
      // डिलीट के बाद फिर से user list को fetch करे
      invalidatesTags: ["Refetch_Users"],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
    }),
  }),
});
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
} = authApi;
