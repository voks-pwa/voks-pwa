import type { AdminTransaction } from "../types";

interface Props {

  transactions: AdminTransaction[];

}

export function TransactionTable({

  transactions,

}: Props) {

  return (

    <div className="overflow-hidden rounded-3xl bg-white shadow">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">

              User

            </th>

            <th>

              Type

            </th>

            <th>

              Amount

            </th>

            <th>

              Reason

            </th>

            <th>

              Date

            </th>

          </tr>

        </thead>

        <tbody>

          {transactions.map((trx) => (

            <tr
              key={trx.id}
              className="border-t"
            >

              <td className="p-4">

                <div className="flex items-center gap-3">

                  <img
                    src={
                      trx.profile?.avatar_url ??
                      "https://placehold.co/80"
                    }
                    className="h-10 w-10 rounded-full"
                  />

                  <span>

                    {trx.profile?.display_name}

                  </span>

                </div>

              </td>

              <td>

                {trx.transaction_type}

              </td>

              <td>

                {trx.amount}

              </td>

              <td>

                {trx.reason}

              </td>

              <td>

                {new Date(
                  trx.created_at
                ).toLocaleString()}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}