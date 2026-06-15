import { usePrograms } from './usePrograms'

export function useProgramsByHost(
  hostName?: string
) {
  const query = usePrograms()

  const programs =
    query.data?.filter((program) =>
      program.acf?.host
        ?.toLowerCase()
        .includes(hostName?.toLowerCase() ?? '')
    ) ?? []

  return {
    ...query,
    programs,
  }
}