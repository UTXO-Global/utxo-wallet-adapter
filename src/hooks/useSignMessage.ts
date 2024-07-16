import { SignMessagePayload, SignMessageResult, signMessage as signMessage_ } from "@utxoGlobalCore"
import { MutationConfig } from '../types'
import { useMutation } from "@tanstack/react-query"
import React from "react"

export type UseSignMessageArgs = Partial<SignMessagePayload>

export type UseSignMessageConfig = MutationConfig<SignMessageResult, Error, SignMessagePayload>

export const mutationKey = (args: UseSignMessageArgs) => [{ entity: 'signMessage', ...args }] as const

const mutationFn = (args: UseSignMessageArgs) => {
  const { message } = args
  if (!message) throw new Error('message is required')
  return signMessage_({ ...args, message })
}

export function useSignMessage({
  message,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: UseSignMessageArgs & UseSignMessageConfig = {}) {
  const { data, error, isError, isIdle, isPending, isSuccess, mutate, mutateAsync, reset, status, variables } =
    useMutation({
      mutationKey: mutationKey({ message }),
      mutationFn,
      onError,
      onMutate,
      onSettled,
      onSuccess,
    })

  const signMessage = React.useCallback(
    (args?: SignMessagePayload) => mutate(args || ({ message } as SignMessagePayload)),
    [message, mutate],
  )

  const signMessageAsync = React.useCallback(
    (args?: SignMessagePayload) => mutateAsync(args || ({ message } as SignMessagePayload)),
    [message, mutateAsync],
  )

  return {
    data,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    reset,
    signMessage,
    signMessageAsync,
    status,
    variables,
  }
}
