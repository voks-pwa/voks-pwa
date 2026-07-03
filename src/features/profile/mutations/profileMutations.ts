import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateProfile,
} from "../services/profileService";

import {
  profileKeys,
} from "../queries/profileQueries";

import type {
  Profile,
  UpdateProfileInput,
} from "../types";

type UpdatePayload = {
  id: string;
  payload: UpdateProfileInput;
};

export function useUpdateProfileMutation() {

  const queryClient = useQueryClient();

  return useMutation<
    Profile,
    Error,
    UpdatePayload
  >({

    mutationFn: ({ id, payload }) =>
      updateProfile(id, payload),

    onSuccess(data) {

      queryClient.invalidateQueries({
        queryKey: profileKeys.list(),
      });

      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(data.id),
      });

    },

  });

}