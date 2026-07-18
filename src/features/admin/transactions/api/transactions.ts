import { supabase } from "@/lib/supabase";

export async function getTransactions() {
  const result =
    await supabase.functions.invoke(
      "admin-transactions"
    );

  console.log("FULL RESULT", result);

  const { data, error } = result;

  if (error) {
    console.error("FUNCTION ERROR", error);

    if (error.context) {
      console.log(
        await error.context.text()
      );
    }

    throw error;
  }

  return data.transactions ?? [];
}