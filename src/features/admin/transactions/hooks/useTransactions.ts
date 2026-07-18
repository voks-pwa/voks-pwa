import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api/transactions";

export function useTransactions() {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: getTransactions,
    initialData: [],
  });
}