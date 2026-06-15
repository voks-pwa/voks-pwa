import { usePrograms } from '@/hooks/usePrograms'

import {
  getCurrentProgram,
} from '@/lib/schedule'

import { buildSchedule } from '@/lib/program-schedule'

export function useCurrentProgram() {
  const { data: programs } = usePrograms()

  if (!programs) {
    return null
  }

  const schedule =
    buildSchedule(programs)

  const current =
    getCurrentProgram(schedule)

  if (!current) {
    return null
  }

  return programs.find(
    (program) =>
      program.title.rendered ===
      current.program.name
  )
}