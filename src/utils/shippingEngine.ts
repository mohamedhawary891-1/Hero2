import { GovernorateRate } from '../types';

/**
 * All 27 Governorates in Egypt with exact pricing tiers provided by Hawari Store:
 * Tier 1: 1 - 3 books
 * Tier 2: 4 - 6 books
 * Tier 3: 7 - 10 books
 * Additional: +5 EGP for each extra physical book in the order (above 1 book).
 * Strict Max Books: 10 physical books per order.
 */
export const GOVERNORATES_RATES: Record<string, GovernorateRate> = {
  "الشرقية": {
    name: "الشرقية",
    nameEn: "Sharqia",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "أسوان": {
    name: "أسوان",
    nameEn: "Aswan",
    tier1to3: 122,
    tier4to6: 130,
    tier7to10: 150,
  },
  "أسيوط": {
    name: "أسيوط",
    nameEn: "Asyut",
    tier1to3: 105,
    tier4to6: 120,
    tier7to10: 130,
  },
  "الإسكندرية": {
    name: "الإسكندرية",
    nameEn: "Alexandria",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "الإسماعيلية": {
    name: "الإسماعيلية",
    nameEn: "Ismailia",
    tier1to3: 90,
    tier4to6: 105,
    tier7to10: 115,
  },
  "الأقصر": {
    name: "الأقصر",
    nameEn: "Luxor",
    tier1to3: 120,
    tier4to6: 130,
    tier7to10: 145,
  },
  "البحر الأحمر": {
    name: "البحر الأحمر",
    nameEn: "Red Sea",
    tier1to3: 122,
    tier4to6: 130,
    tier7to10: 150,
  },
  "البحيرة": {
    name: "البحيرة",
    nameEn: "Beheira",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "الجيزة": {
    name: "الجيزة",
    nameEn: "Giza",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "الدقهلية": {
    name: "الدقهلية",
    nameEn: "Dakahlia",
    tier1to3: 70,
    tier4to6: 85,
    tier7to10: 95,
  },
  "السويس": {
    name: "السويس",
    nameEn: "Suez",
    tier1to3: 95,
    tier4to6: 105,
    tier7to10: 120,
  },
  "الغربية": {
    name: "الغربية",
    nameEn: "Gharbia",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "الفيوم": {
    name: "الفيوم",
    nameEn: "Faiyum",
    tier1to3: 105,
    tier4to6: 120,
    tier7to10: 130,
  },
  "القاهرة": {
    name: "القاهرة",
    nameEn: "Cairo",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "القليوبية": {
    name: "القليوبية",
    nameEn: "Qalyubia",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "المنوفية": {
    name: "المنوفية",
    nameEn: "Monufia",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "المنيا": {
    name: "المنيا",
    nameEn: "Minya",
    tier1to3: 105,
    tier4to6: 120,
    tier7to10: 130,
  },
  "الوادي الجديد": {
    name: "الوادي الجديد",
    nameEn: "New Valley",
    tier1to3: 127,
    tier4to6: 140,
    tier7to10: 155,
  },
  "بني سويف": {
    name: "بني سويف",
    nameEn: "Beni Suef",
    tier1to3: 105,
    tier4to6: 120,
    tier7to10: 130,
  },
  "بورسعيد": {
    name: "بورسعيد",
    nameEn: "Port Said",
    tier1to3: 105,
    tier4to6: 120,
    tier7to10: 130,
  },
  "جنوب سيناء": {
    name: "جنوب سيناء",
    nameEn: "South Sinai",
    tier1to3: 137, // 127 + 10
    tier4to6: 150, // 140 + 10
    tier7to10: 165, // 155 + 10
  },
  "دمياط": {
    name: "دمياط",
    nameEn: "Damietta",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "سوهاج": {
    name: "سوهاج",
    nameEn: "Sohag",
    tier1to3: 127,
    tier4to6: 140,
    tier7to10: 155,
  },
  "شمال سيناء": {
    name: "شمال سيناء",
    nameEn: "North Sinai",
    tier1to3: 127,
    tier4to6: 140,
    tier7to10: 155,
  },
  "قنا": {
    name: "قنا",
    nameEn: "Qena",
    tier1to3: 120, // 105 + 15
    tier4to6: 135, // 120 + 15
    tier7to10: 145, // 130 + 15
  },
  "كفر الشيخ": {
    name: "كفر الشيخ",
    nameEn: "Kafr El Sheikh",
    tier1to3: 77,
    tier4to6: 90,
    tier7to10: 125,
  },
  "مطروح": {
    name: "مطروح",
    nameEn: "Matrouh",
    tier1to3: 127,
    tier4to6: 140,
    tier7to10: 155,
  },
};

export const MAX_PHYSICAL_BOOKS_PER_ORDER = 10;
export const EXTRA_PER_BOOK_FEE = 5; // +5 EGP for every book above 1

/**
 * Calculates shipping cost strictly according to governorate and quantity of physical books.
 * Digital books do NOT incur any shipping cost.
 * Includes base tier rate + 5 EGP per extra physical book in the order (above 1 book).
 */
export function calculateShippingCost(
  governorate: string, 
  physicalBooksCount: number,
  customRates?: Record<string, GovernorateRate>
): {
  shippingCost: number;
  baseTierRate: number;
  perBookExtra: number;
  error?: string;
} {
  if (physicalBooksCount <= 0) {
    return { shippingCost: 0, baseTierRate: 0, perBookExtra: 0 };
  }

  if (physicalBooksCount > MAX_PHYSICAL_BOOKS_PER_ORDER) {
    return {
      shippingCost: 0,
      baseTierRate: 0,
      perBookExtra: 0,
      error: `أقصى عدد للكتب الورقية في الطلب الواحد هو ${MAX_PHYSICAL_BOOKS_PER_ORDER} كتب فقط.`
    };
  }

  const ratesTable = customRates || GOVERNORATES_RATES;
  const rate = ratesTable[governorate] || ratesTable["الشرقية"] || GOVERNORATES_RATES["الشرقية"];

  let baseRate = rate.tier1to3;
  if (physicalBooksCount >= 1 && physicalBooksCount <= 3) {
    baseRate = rate.tier1to3;
  } else if (physicalBooksCount >= 4 && physicalBooksCount <= 6) {
    baseRate = rate.tier4to6;
  } else if (physicalBooksCount >= 7 && physicalBooksCount <= 10) {
    baseRate = rate.tier7to10;
  }

  // Extra 5 EGP per additional book in purchase above the first book
  const perBookExtra = (physicalBooksCount - 1) * EXTRA_PER_BOOK_FEE;
  const totalShipping = baseRate + perBookExtra;

  return {
    shippingCost: totalShipping,
    baseTierRate: baseRate,
    perBookExtra: perBookExtra
  };
}

export const EGYPT_GOVERNORATES_LIST = Object.keys(GOVERNORATES_RATES);
