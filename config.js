require("dotenv").config();

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    KIWI_API_KEY: process.env.KIWI_API_KEY,
    welcomeMessage: {
        en: "Welcome to the Flight Booking Bot!\nPlease select your language:",
        ar: "مرحبًا بكم في بوت حجز تذاكر الطيران!\nالرجاء اختيار اللغة:"
    },
    errorMessages: {
        invalidFormat: {
            en: "❌ Invalid format. Example: Dubai London 25/04/2024 or DXB LON 25/04/2024",
            ar: "❌ صيغة غير صحيحة. مثال: دبي لندن 25/04/2024 أو DXB LON 25/04/2024"
        },
        pastDate: {
            en: "❌ Date cannot be in the past. Please enter a future date",
            ar: "❌ التاريخ لا يمكن أن يكون في الماضي. الرجاء إدخال تاريخ مستقبلي"
        },
        noFlights: {
            en: "❌ No flights found. Try different dates or cities",
            ar: "❌ لا توجد رحلات. حاول بتواريخ أو مدن أخرى"
        }
    }
};