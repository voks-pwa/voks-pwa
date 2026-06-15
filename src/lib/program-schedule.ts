import type { WordPressProgram } from '@/types/program'

import {
  DAYS,
  type DayOfWeek,
  type RadioSchedule,
} from '@/lib/schedule'

const dayMap: Record<string, DayOfWeek> = {
  senin: DAYS.MONDAY,
  selasa: DAYS.TUESDAY,
  rabu: DAYS.WEDNESDAY,
  kamis: DAYS.THURSDAY,
  jumat: DAYS.FRIDAY,
  sabtu: DAYS.SATURDAY,
  minggu: DAYS.SUNDAY,
}

export function buildSchedule(
  programs: WordPressProgram[]
): RadioSchedule {
  return {
    programs: programs
      .filter(
        (program) =>
          program.acf?.hari?.length &&
          program.acf?.jam_mulai &&
          program.acf?.jam_selesai
      )
      .map((program) => ({
        name: program.title.rendered,

        host:
          program.acf?.host ??
          program.acf?.penyiar ??
          '',

        days:
          program.acf?.hari
            ?.map((day) =>
              dayMap[
                day.trim().toLowerCase()
              ]
            )
            .filter(Boolean) ?? [],

        startTime:
  program.acf?.jam_mulai?.slice(0, 5) ?? '00:00',

        endTime:
  program.acf?.jam_selesai?.slice(0, 5) ?? '00:00',
      })),
  }
}