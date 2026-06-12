/**
 * Production-grade radio schedule engine
 *
 * Manages radio program schedules with support for:
 * - Multiple programs per day
 * - Weekday and weekend schedules
 * - Overnight programs (crossing midnight)
 * - Current and next program lookups using device local time
 *
 * No external dependencies. Fully typed and strict-mode compatible.
 */

/**
 * Days of the week, 0 = Sunday, 6 = Saturday (matches Date.getDay())
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Days of week constants for readability
 */
export const DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const

/**
 * A single radio program scheduled for one or more days of the week.
 *
 * @property name - Display name of the program (e.g., "Morning Drive", "Afternoon Mix")
 * @property days - Array of days this program airs (0=Sunday, 6=Saturday)
 * @property startTime - Program start time in HH:MM format (24-hour, e.g., "09:00")
 * @property endTime - Program end time in HH:MM format (24-hour, e.g., "12:00")
 *
 * Note: If endTime < startTime, the program is treated as overnight (e.g., 22:00 to 06:00).
 * Overnight programs must be specified on the day they START.
 */
export interface RadioProgram {
  name: string
  host: string
  days: DayOfWeek[]
  startTime: string
  endTime: string
}

/**
 * A collection of radio programs.
 * Represents the complete schedule for a radio station.
 */
export interface RadioSchedule {
  programs: RadioProgram[]
}

/**
 * Information about the current or next on-air program.
 *
 * @property program - The radio program object
 * @property startsAt - Absolute start time (minutes since midnight)
 * @property endsAt - Absolute end time (minutes since midnight)
 * @property isOvernight - True if the program crosses midnight
 * @property onDate - The date this program airs (as day of week, 0-6)
 */
export interface ProgramInfo {
  program: RadioProgram
  startsAt: number
  endsAt: number
  isOvernight: boolean
  onDate: DayOfWeek
}

/**
 * Parses a time string (HH:MM) into minutes since midnight.
 *
 * @param time - Time string in HH:MM format (e.g., "14:30")
 * @returns Minutes since midnight (0-1439)
 * @throws Error if time format is invalid
 *
 * @example
 * timeToMinutes("09:00") // => 540
 * timeToMinutes("23:59") // => 1439
 */
export function timeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Expected HH:MM`)
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: hours=${hours}, minutes=${minutes}`)
  }

  return hours * 60 + minutes
}

/**
 * Converts minutes since midnight to a time string (HH:MM).
 *
 * @param minutes - Minutes since midnight (0-1439)
 * @returns Time string in HH:MM format (e.g., "14:30")
 *
 * @example
 * minutesToTime(540) // => "09:00"
 * minutesToTime(1439) // => "23:59"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Gets the current minute of the day from a Date object.
 *
 * @param date - The date to extract time from (uses local timezone)
 * @returns Minutes since midnight
 *
 * @example
 * const now = new Date('2024-06-12T14:30:00')
 * getCurrentMinute(now) // => 870
 */
export function getCurrentMinute(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Checks if a program is currently active at the given time on the given day.
 *
 * Handles both regular programs and overnight programs (crossing midnight).
 *
 * @param program - The radio program to check
 * @param dayOfWeek - Current day of week (0-6)
 * @param currentMinute - Current minute of day (0-1439)
 * @returns True if the program is currently on-air
 *
 * @example
 * const morning = { name: 'Breakfast', days: [1,2,3,4,5], startTime: '06:00', endTime: '09:00' }
 * isProgramActive(morning, 1, 480) // => true (Monday, 8:00 AM)
 * isProgramActive(morning, 6, 480) // => false (Saturday, not scheduled)
 *
 * // Overnight program (10 PM to 6 AM)
 * const night = { name: 'Late Night', days: [0,1,2,3,4,5,6], startTime: '22:00', endTime: '06:00' }
 * isProgramActive(night, 1, 120) // => true (Monday, 2:00 AM - within 22:00 to 06:00)
 */
export function isProgramActive(
  program: RadioProgram,
  dayOfWeek: DayOfWeek,
  currentMinute: number
): boolean {
  if (!program.days.includes(dayOfWeek)) {
    return false
  }

  const startMinutes = timeToMinutes(program.startTime)
  const endMinutes = timeToMinutes(program.endTime)

  // Overnight program (e.g., 22:00 to 06:00)
  if (endMinutes < startMinutes) {
    return currentMinute >= startMinutes || currentMinute < endMinutes
  }

  // Regular program (e.g., 09:00 to 12:00)
  return currentMinute >= startMinutes && currentMinute < endMinutes
}

/**
 * Finds the current on-air program from the schedule.
 *
 * Uses the device's local timezone to determine the current day and time.
 * Returns null if no program is scheduled for the current time.
 *
 * @param schedule - The radio schedule to search
 * @param now - Optional: current date/time (defaults to Date.now())
 * @returns Current program info, or null if no program is active
 *
 * @example
 * const schedule = {
 *   programs: [
 *     { name: 'Breakfast', days: [1,2,3,4,5], startTime: '06:00', endTime: '09:00' },
 *     { name: 'Morning Drive', days: [1,2,3,4,5], startTime: '09:00', endTime: '12:00' },
 *   ]
 * }
 *
 * // If it's Monday 8:00 AM:
 * getCurrentProgram(schedule) // => { program: breakfast, startsAt: 360, endsAt: 540, isOvernight: false, onDate: 1 }
 *
 * // If it's Saturday 8:00 AM (no program scheduled):
 * getCurrentProgram(schedule) // => null
 */
export function getCurrentProgram(schedule: RadioSchedule, now = new Date()): ProgramInfo | null {
  const currentDay = now.getDay() as DayOfWeek
  const currentMinute = getCurrentMinute(now)

  for (const program of schedule.programs) {
    if (isProgramActive(program, currentDay, currentMinute)) {
      const startMinutes = timeToMinutes(program.startTime)
      const endMinutes = timeToMinutes(program.endTime)
      const isOvernight = endMinutes < startMinutes

      return {
        program,
        startsAt: startMinutes,
        endsAt: endMinutes,
        isOvernight,
        onDate: currentDay,
      }
    }
  }

  return null
}

/**
 * Finds the next scheduled program after the given time.
 *
 * Searches forward from the current time, looking up to 7 days ahead.
 * Returns null if no program is found within the search window.
 *
 * Handles edge cases:
 * - Programs scheduled later today
 * - Programs scheduled tomorrow or later in the week
 * - Overnight programs that start after midnight
 *
 * @param schedule - The radio schedule to search
 * @param now - Optional: current date/time (defaults to Date.now())
 * @returns Next program info, or null if no program is found in the next 7 days
 *
 * @example
 * const schedule = {
 *   programs: [
 *     { name: 'Breakfast', days: [1,2,3,4,5], startTime: '06:00', endTime: '09:00' },
 *     { name: 'Evening Show', days: [0,1,2,3,4,5,6], startTime: '17:00', endTime: '20:00' },
 *   ]
 * }
 *
 * // If it's Monday 10:00 AM:
 * getNextProgram(schedule) // => { program: eveningShow, startsAt: 1020, endsAt: 1200, isOvernight: false, onDate: 1 }
 *
 * // If it's Saturday 18:00 (Evening Show is on, next is Monday Breakfast):
 * getNextProgram(schedule) // => { program: breakfast, startsAt: 360, endsAt: 540, isOvernight: false, onDate: 1 }
 */
export function getNextProgram(schedule: RadioSchedule, now = new Date()): ProgramInfo | null {
  const currentDay = now.getDay() as DayOfWeek
  const currentMinute = getCurrentMinute(now)

  // Search up to 7 days ahead
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const searchDay = ((currentDay + daysAhead) % 7) as DayOfWeek
    const startMinute = daysAhead === 0 ? currentMinute : 0

    for (const program of schedule.programs) {
      if (!program.days.includes(searchDay)) {
        continue
      }

      const startMinutes = timeToMinutes(program.startTime)
      const endMinutes = timeToMinutes(program.endTime)
      const isOvernight = endMinutes < startMinutes

      // For today, only consider programs that start after the current time
      if (daysAhead === 0) {
        if (startMinutes > startMinute) {
          return {
            program,
            startsAt: startMinutes,
            endsAt: endMinutes,
            isOvernight,
            onDate: searchDay,
          }
        }

        // If this is an overnight program that started before midnight but
        // hasn't ended yet, skip it (it's probably the current program)
        if (isOvernight && startMinutes <= startMinute) {
          continue
        }
      } else {
        // For future days, return the first matching program
        return {
          program,
          startsAt: startMinutes,
          endsAt: endMinutes,
          isOvernight,
          onDate: searchDay,
        }
      }
    }
  }

  return null
}

/**
 * Gets a human-readable description of when a program airs.
 *
 * Useful for displaying schedule information in the UI.
 *
 * @param program - The radio program
 * @returns A string description (e.g., "Mon-Fri, 09:00 - 12:00")
 *
 * @example
 * const program = { name: 'Breakfast', days: [1,2,3,4,5], startTime: '06:00', endTime: '09:00' }
 * getProgramScheduleText(program) // => "Mon-Fri, 06:00 - 09:00"
 *
 * const weekend = { name: 'Sunday Special', days: [0], startTime: '10:00', endTime: '12:00' }
 * getProgramScheduleText(weekend) // => "Sun, 10:00 - 12:00"
 */
export function getProgramScheduleText(program: RadioProgram): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayLabels = program.days.map((day) => dayNames[day]).join(', ')
  return `${dayLabels}, ${program.startTime} - ${program.endTime}`
}

export interface VoksRadioProgram {
  name: string
  host: string
  days: string[]
  startTime: string
  endTime: string
}

const WEEKDAY_MAP: Record<string, DayOfWeek> = {
  mon: DAYS.MONDAY,
  tue: DAYS.TUESDAY,
  wed: DAYS.WEDNESDAY,
  thu: DAYS.THURSDAY,
  fri: DAYS.FRIDAY,
  sat: DAYS.SATURDAY,
  sun: DAYS.SUNDAY,
}

const normalizeDayToken = (day: string): string => day.trim().slice(0, 3).toLowerCase()

const parseDay = (value: string): DayOfWeek => {
  const normalized = normalizeDayToken(value)
  const mappedDay = WEEKDAY_MAP[normalized]

  if (mappedDay === undefined) {
    throw new Error(`Invalid day token: ${value}. Expected one of mon, tue, wed, thu, fri, sat, sun.`)
  }

  return mappedDay
}

/**
 * Converts Voks Radio program definitions into the schedule engine's RadioProgram format.
 *
 * @param programs - Array of Voks Radio program objects
 * @returns Array of RadioProgram objects ready for use with the schedule engine
 *
 * @example
 * const schedulePrograms = createSchedulePrograms([
 *   {
 *     title: 'Morning Show',
 *     host: 'Jane Doe',
 *     days: ['mon', 'tue', 'wed'],
 *     start: '07:00',
 *     end: '10:00',
 *   },
 * ])
 */
export function createSchedulePrograms(programs: VoksRadioProgram[]): RadioProgram[] {
  return programs.map((program) => ({
    name: program.name,
    host: program.host,
    days: program.days.map(parseDay),
    startTime: program.startTime,
    endTime: program.endTime,
  }))
}

/**
 * Validates a radio schedule for common errors.
 *
 * Checks:
 * - All times are in valid HH:MM format
 * - All days are in range 0-6
 * - Program names are not empty
 *
 * Throws an error if validation fails.
 *
 * @param schedule - The schedule to validate
 * @throws Error if the schedule is invalid
 *
 * @example
 * const schedule = { programs: [{ name: 'Show', days: [1], startTime: '09:00', endTime: '12:00' }] }
 * validateSchedule(schedule) // Does not throw
 */
export function validateSchedule(schedule: RadioSchedule): void {
  if (!Array.isArray(schedule.programs)) {
    throw new Error('Schedule must have a programs array')
  }

  for (let i = 0; i < schedule.programs.length; i++) {
    const program = schedule.programs[i]

    if (!program.name || typeof program.name !== 'string') {
      throw new Error(`Program ${i}: name must be a non-empty string`)
    }

    if (!Array.isArray(program.days) || program.days.length === 0) {
      throw new Error(`Program ${i} (${program.name}): days must be a non-empty array`)
    }

    for (const day of program.days) {
      if (typeof day !== 'number' || day < 0 || day > 6) {
        throw new Error(`Program ${i} (${program.name}): days must be in range 0-6, got ${day}`)
      }
    }

    try {
      timeToMinutes(program.startTime)
    } catch (error) {
      throw new Error(`Program ${i} (${program.name}): startTime is invalid: ${program.startTime}`)
    }

    try {
      timeToMinutes(program.endTime)
    } catch (error) {
      throw new Error(`Program ${i} (${program.name}): endTime is invalid: ${program.endTime}`)
    }
  }
}
