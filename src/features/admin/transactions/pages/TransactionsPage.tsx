import { useTransactions } from "../hooks/useTransactions";
import { TransactionTable } from "../components/TransactionTable";

export default function TransactionsPage() {
  const {
    data,
    isLoading,
    error,
  } = useTransactions();

  console.log({
    data,
    isLoading,
    error,
  });

  if (isLoading)
    return <div className="p-8">Loading...</div>;

  if (error)
    return (
      <div className="p-8 text-red-500">
        {String(error)}
      </div>
    );

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">
        Transactions
      </h1>

      <TransactionTable
        transactions={data ?? []}
      />
    </div>
  );
}