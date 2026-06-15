import { usePrograms } from './usePrograms'

export function useProgram(
  slug?: string
) {
  const query = usePrograms()

  return {
    ...query,
    data: query.data?.find(
      (program) => program.slug === slug
    ),
  }
}