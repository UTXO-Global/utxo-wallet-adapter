import { SignPsbtArgs, SignPSBTPayload, SignPSBTResponse, signPsbt as signPsbt_ } from "@utxoGlobalCore"
import { MutationConfig } from '../types'
import { useMutation } from "@tanstack/react-query"
import React from "react"

export type UseSignPsbtArgs = Partial<SignPsbtArgs>

export type UseSignPsbtConfig = MutationConfig<SignPSBTResponse, Error, SignPSBTPayload>

export const mutationKey = (args: SignPSBTPayload) => [{ entity: 'sendBitcoin', ...args }] as const

const mutationFn = (args: SignPSBTPayload) => {
  if (!args.psbtBase64) throw new Error('PSBT is required')
  return signPsbt_(args)
}

export function useSignPsbt({
  payload,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: UseSignPsbtArgs & UseSignPsbtConfig = {}) {
  const { data, error, isError, isIdle, isPending, isSuccess, mutate, mutateAsync, reset, status, variables } =
    useMutation({
      mutationKey: mutationKey(payload),
      mutationFn,
      onError,
      onMutate,
      onSettled,
      onSuccess,
    })

  const signPspt = React.useCallback(
    (payload?: SignPSBTPayload) => mutate(payload),
    [payload, mutate],
  )

  const signPsptAsync = React.useCallback(
    (args?: SignPSBTPayload) => mutateAsync(args),
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
    signPspt,
    signPsptAsync,
    status,
    variables,
  }
}
