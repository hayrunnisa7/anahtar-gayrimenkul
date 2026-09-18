import Iyzipay from "iyzipay";

/**
 * iyzico ödeme entegrasyonu — mock ve gerçek modu bir arada barındırır.
 *
 * `IYZICO_API_KEY`/`IYZICO_SECRET_KEY` tanımlı değilken (şu anki durum) her
 * zaman MOCK yol kullanılır — hiçbir ağ çağrısı yapılmaz, gerçek para/ödeme
 * asla söz konusu olmaz. Bu iki değişken bir sandbox hesabından alınıp
 * `.env`'e eklendiğinde, çağıran taraf (`/api/paketler/checkout`)
 * `isIyzicoConfigured()`'a bakarak gerçek akışa (Checkout Form API) geçer.
 *
 * GERÇEK AKIŞ NOTU: iyzico'nun Checkout Form API'si bir yönlendirme URL'si
 * DEĞİL, gömülebilir bir HTML/JS parçası (`checkoutFormContent`) döner —
 * bu içerik ödeme sayfasında bir kapsayıcıya enjekte edilir ve iyzico'nun
 * kendi widget'ı kart bilgilerini ORADA toplar (bizim sunucumuza hiç
 * uğramaz). Bu, mevcut mock `PaymentForm`'un kart alanları toplayan
 * yapısından farklıdır — gerçek moda geçildiğinde arayüz de güncellenmeli
 * (bkz. proje notları).
 */

export interface MockCheckoutRequest {
  packageId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
}

export interface MockCheckoutResult {
  status: "success" | "failure";
  checkoutId: string;
}

/**
 * Mock stand-in for the iyzico Checkout Form API. No network call is made;
 * this simulates a successful payment so SaaS package flows can be built
 * end-to-end. Used whenever `isIyzicoConfigured()` is false.
 */
export async function createMockCheckout(request: MockCheckoutRequest): Promise<MockCheckoutResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    status: "success",
    checkoutId: `mock-${request.packageId}-${Date.now()}`,
  };
}

/** iyzico gerçek anahtarları `.env`'de tanımlıysa true döner. Tanımlı değilse her zaman mock mod kullanılır. */
export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

function getClient(): Iyzipay {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY ?? "",
    secretKey: process.env.IYZICO_SECRET_KEY ?? "",
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });
}

export interface RealCheckoutRequest {
  packageId: string;
  packageName: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  callbackUrl: string;
}

export interface RealCheckoutInitResult {
  status: "success" | "failure";
  token?: string;
  /** iyzico'nun ödeme sayfasında render edilecek gömülebilir HTML/JS içeriği. */
  checkoutFormContent?: string;
  errorMessage?: string;
}

/**
 * GERÇEK iyzico Checkout Form akışının 1. adımı. Yalnızca
 * `isIyzicoConfigured()` true olduğunda çağrılmalıdır.
 *
 * NOT: `buyer`/adres alanlarındaki bazı zorunlu bilgiler (T.C. kimlik no,
 * telefon, açık adres) şu an uygulamada toplanmıyor — gerçek sandbox
 * testine geçildiğinde ilgili formun genişletilmesi gerekecek. Şimdilik
 * makul yer tutucu değerler kullanılıyor.
 *
 * `@types/iyzipay` paketindeki istek tipi (`ThreeDSInitializePaymentRequestData`),
 * doğrudan kart ile ödeme uç noktasıyla paylaşıldığı için `paymentCard` ve
 * `installments` alanlarını zorunlu gösteriyor — ama Checkout Form API'nin
 * gerçek REST sözleşmesinde bu alanlara gerek yok (kart bilgisi iyzico'nun
 * kendi sayfasında toplanır). Bu tip uyumsuzluğu nedeniyle burada dar
 * kapsamlı bir tip iddiası (type assertion) kullanılıyor.
 */
export async function initializeCheckoutForm(request: RealCheckoutRequest): Promise<RealCheckoutInitResult> {
  const client = getClient();
  const [name, ...rest] = request.buyerName.trim().split(" ");
  const surname = rest.join(" ") || name || "Danışman";

  const data = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: `${request.packageId}-${Date.now()}`,
    price: request.amount.toString(),
    paidPrice: request.amount.toString(),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: request.packageId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl: request.callbackUrl,
    buyer: {
      id: request.buyerId,
      name: name || "Danışman",
      surname,
      gsmNumber: "+905000000000",
      email: request.buyerEmail,
      identityNumber: "11111111111",
      registrationAddress: "Belirtilmedi",
      ip: "0.0.0.0",
      city: "Istanbul",
      country: "Turkey",
    },
    shippingAddress: {
      contactName: request.buyerName,
      city: "Istanbul",
      country: "Turkey",
      address: "Belirtilmedi",
    },
    billingAddress: {
      contactName: request.buyerName,
      city: "Istanbul",
      country: "Turkey",
      address: "Belirtilmedi",
    },
    basketItems: [
      {
        id: request.packageId,
        name: request.packageName,
        category1: "SaaS Paketi",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: request.amount.toString(),
      },
    ],
  } as unknown as Iyzipay.ThreeDSInitializePaymentRequestData;

  return new Promise((resolve) => {
    client.checkoutFormInitialize.create(data, (err, result) => {
      if (err || !result || result.status !== "success") {
        resolve({ status: "failure", errorMessage: err?.message ?? "Bilinmeyen bir hata oluştu." });
        return;
      }
      resolve({
        status: "success",
        token: result.token,
        checkoutFormContent: result.checkoutFormContent,
      });
    });
  });
}

export interface RealCheckoutRetrieveResult {
  status: "success" | "failure";
  paymentStatus?: string;
  paidPrice?: string;
  /** initializeCheckoutForm'a verilen basketId (= packageId) — hangi paketin satın alındığını güvenilir şekilde belirler. */
  basketId?: string;
  errorMessage?: string;
}

/**
 * GERÇEK akışın 2. adımı — iyzico'nun `callbackUrl`'e yönlendirmesinden
 * sonra, aldığı `token` ile ödemenin gerçekten başarılı olup olmadığını
 * doğrular.
 */
export async function retrieveCheckoutForm(token: string): Promise<RealCheckoutRetrieveResult> {
  const client = getClient();

  return new Promise((resolve) => {
    client.checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, conversationId: `retrieve-${Date.now()}`, token },
      (err, result) => {
        if (err || !result) {
          resolve({ status: "failure", errorMessage: err?.message ?? "Bilinmeyen bir hata oluştu." });
          return;
        }
        resolve({
          status: result.status === "success" && result.paymentStatus === "SUCCESS" ? "success" : "failure",
          paymentStatus: result.paymentStatus,
          paidPrice: String(result.paidPrice ?? ""),
          basketId: result.basketId,
        });
      },
    );
  });
}
