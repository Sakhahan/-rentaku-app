import { btoa } from "buffer";

interface MidtransSnapParams {
  orderId: string;              // = bookingCode
  grossAmount: number;          // totalPayment + deposit
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
  expiryDuration: number;       // dalam menit (contoh: 120 = 2 jam)
}

/**
 * Membuat transaksi baru di Midtrans Snap dan mengembalikan Snap token serta payment URL.
 */
export async function createSnapToken(params: MidtransSnapParams): Promise<{
  token: string;
  redirect_url: string;
  expiry: Date;
}> {
  const isProd = process.env.NODE_ENV === "production";
  
  // Ambil server key dari env
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-DummyKey";
  
  // Base snap URL
  const snapUrl = isProd 
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const expiryDurationMinutes = params.expiryDuration || 120; // Default 2 jam
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + expiryDurationMinutes);

  // Format payload sesuai format SDK Midtrans Snap API
  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    item_details: params.itemDetails.map(item => ({
      id: item.id,
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.substring(0, 50), // Batas max nama item di Midtrans
    })),
    customer_details: {
      first_name: params.customerDetails.firstName,
      last_name: params.customerDetails.lastName,
      email: params.customerDetails.email,
      phone: params.customerDetails.phone,
    },
    expiry: {
      duration: expiryDurationMinutes,
      unit: "minutes",
    },
    credit_card: {
      secure: true,
    }
  };

  try {
    const authString = typeof window === "undefined" 
      ? Buffer.from(serverKey + ":").toString("base64")
      : btoa(serverKey + ":");

    console.log(`[Midtrans] Mengirim request transaksi ke ${snapUrl} untuk Order: ${params.orderId}`);
    
    // Jika server key masih dummy, simulasikan response sukses agar tidak crash
    if (serverKey === "SB-Mid-server-DummyKey" || !process.env.MIDTRANS_SERVER_KEY) {
      console.warn("[Midtrans] Menggunakan Mock Signature karena MIDTRANS_SERVER_KEY tidak diset.");
      const mockToken = `mock-snap-token-${Math.random().toString(36).substr(2, 9)}`;
      return {
        token: mockToken,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
        expiry: expiryDate,
      };
    }

    const response = await fetch(snapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Midtrans API error (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
      token: data.token,
      redirect_url: data.redirect_url,
      expiry: expiryDate,
    };
  } catch (error) {
    console.error("[Midtrans] Gagal membuat snap token:", error);
    // Graceful fallback dummy token jika sedang pengembangan luring agar developer tidak terblokir
    if (!isProd) {
      console.warn("[Midtrans] Fallback ke Mock Token karena error pemanggilan API.");
      const fallbackToken = `fallback-snap-token-${Math.random().toString(36).substr(2, 9)}`;
      return {
        token: fallbackToken,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${fallbackToken}`,
        expiry: expiryDate,
      };
    }
    throw error;
  }
}
