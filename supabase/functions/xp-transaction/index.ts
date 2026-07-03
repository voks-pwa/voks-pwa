import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const {
      user_id,
      amount,
      transaction_type,
      reason,
      reference_id,
    } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /*
      1.
      Ambil profile
    */

    const { data: profile, error: profileError } =
          await removeXP(
        userId,
        amount,
        "Admin Deduction"
      );

    if (profileError) throw profileError;

    /*
      2.
      Hitung saldo baru
    */

    const current =
      Number(profile.current_vxp ?? 0);

    const lifetime =
      Number(profile.lifetime_vxp ?? 0);

    const newCurrent =
      current + amount;

    if (newCurrent < 0) {
      return new Response(
        JSON.stringify({
          error: "Insufficient VXP",
        }),
        {
          status: 400,
        }
      );
    }

    const newLifetime =
      amount > 0
        ? lifetime + amount
        : lifetime;

    /*
      3.
      Simpan transaction
    */

    const { error: trxError } =
      await supabase
        .from("vxp_transactions")
        .insert({
          user_id,
          amount,
          transaction_type,
          reason,
          reference_id,
        });

    if (trxError) throw trxError;

    /*
      4.
      Update profile
    */

    const { error: updateError } =
        await removeXP(
        userId,
        amount,
        "Admin Deduction"
      );

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        current_vxp: newCurrent,
        lifetime_vxp: newLifetime,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: String(err),
      }),
      {
        status: 500,
      }
    );
  }
});