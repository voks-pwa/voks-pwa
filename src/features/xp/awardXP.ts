import { addXP } from './addXP'

export async function awardXP(
  userId: string,
  amount: number,
  activity: string
) {

  await addXP(
    userId,
    amount,
    activity
  )

}