import { SendNativeCoinArgs, SendNativeCoinPayload, SendNativeCoinResponse, sendNativeCoin as sendNativeCoin_ } from "@utxoGlobalCore"
import { MutationConfig } from '../types'
import { useMutation } from "@tanstack/react-query"
import React from "react"

export type UseSendNativeCoinArgs = Partial<SendNativeCoinArgs>

export type UseSendBTCConfig = MutationConfig<SendNativeCoinResponse, Error, SendNativeCoinPayload>

export const mutationKey = (args: SendNativeCoinPayload) => [{ entity: 'sendBitcoin', ...args }] as const

const mutationFn = (args: SendNativeCoinPayload) => {
  if (!args.addressTo) throw new Error('Receiver is required')
  if (args.amount < 0) throw new Error('Amount invalid')
  return sendNativeCoin_(args)
}

export function useSendNativeCoin({
  payload,
  onError,
  onMutate,
  onSettled,
  onSuccess
}: UseSendNativeCoinArgs & UseSendBTCConfig = {}) {
  const { data, error, isError, isIdle, isPending, isSuccess, mutate, mutateAsync, reset, status, variables } =
    useMutation({
      mutationKey: mutationKey(payload),
      mutationFn,
      onError,
      onMutate,
      onSettled,
      onSuccess,
    })

  const sendNativeCoin = React.useCallback(
    (payload?: SendNativeCoinPayload) => mutate(payload),
    [payload, mutate],
  )

  const sendNativeCoinAsync = React.useCallback(
    (args?: SendNativeCoinPayload) => mutateAsync(args),
    [payload, mutateAsync],
  )

  return {
    data,
    error,
    isError,
    isIdle,
    isPending,
    isSuccess,
    reset,
    sendNativeCoin,
    sendNativeCoinAsync,
    status,
    variables,
  }
}
