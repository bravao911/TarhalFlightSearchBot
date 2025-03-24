const { bot, userLanguage, welcomeMessage, getLanguageKeyboard, getActionButtons, 
    createFlightMessage, errorMessages, detectLanguage, parseInput, searchFlights } = require('./botService');

// Error handling wrapper
const withErrorHandling = async (fn, chatId) => {
    try {
        await fn();
    } catch (error) {
        console.error('Bot error:', error);
        const errorMsg = userLanguage[chatId] === "ar" 
            ? "حدث خطأ غير متوقع. يتم إعادة التشغيل..." 
            : "An unexpected error occurred. Restarting...";
        
        await bot.sendMessage(chatId, errorMsg);
        startBotSession(chatId);
    }
};

const startBotSession = (chatId) => {
    bot.sendMessage(
        chatId, 
        welcomeMessage[userLanguage[chatId] || 'en'], 
        getLanguageKeyboard(userLanguage[chatId] || 'en')
    );
};

// Message handler
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    await withErrorHandling(async () => {
        const text = msg.text.trim();

        if (text === "/start" || text.toLowerCase() === "restart") {
            return startBotSession(chatId);
        }

        if (!userLanguage[chatId]) {
            return bot.sendMessage(
                chatId, 
                "Please select language first / الرجاء اختيار اللغة أولاً", 
                getLanguageKeyboard()
            );
        }

        const inputLang = detectLanguage(text);
        const parsed = await parseInput(text, inputLang);

        if (!parsed) {
            return bot.sendMessage(chatId, errorMessages.invalidFormat[userLanguage[chatId]]);
        }

        if (parsed.error === 'past_date') {
            return bot.sendMessage(chatId, errorMessages.pastDate[userLanguage[chatId]]);
        }

        if (parsed.error === 'processing_error') {
            const errorMsg = userLanguage[chatId] === "ar" 
                ? "حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى" 
                : "Error processing your request. Please try again";
            return bot.sendMessage(chatId, errorMsg);
        }

        const { from, to, date, originalDate } = parsed;
        
        // Show corrected date if different
        let dateDisplay = date;
        if (originalDate && originalDate !== date) {
            dateDisplay = userLanguage[chatId] === "ar"
                ? `${originalDate} (${date})`
                : `${originalDate} (${date})`;
        }

        const searchMsg = userLanguage[chatId] === "ar"
            ? `🔍 يبحث عن رحلات من ${from} إلى ${to} في ${dateDisplay}...`
            : `🔍 Searching flights from ${from} to ${to} on ${dateDisplay}...`;

        await bot.sendMessage(chatId, searchMsg);

        const flights = await searchFlights(from, to, date);

        if (!flights.length) {
            return bot.sendMessage(chatId, errorMessages.noFlights[userLanguage[chatId]], 
                getActionButtons(userLanguage[chatId]));
        }

        flights.sort((a, b) => a.route.length - b.route.length);
        const directCount = flights.filter(f => f.route.length === 1).length;
        const transferCount = flights.length - directCount;
        const summaryMsg = userLanguage[chatId] === "ar"
            ? `🔍 وجدنا ${flights.length} رحلة (${directCount} مباشرة، ${transferCount} مع ترانزيت)`
            : `🔍 Found ${flights.length} flights (${directCount} direct, ${transferCount} with transfers)`;
        
        await bot.sendMessage(chatId, summaryMsg);

        for (const flight of flights) {
            await bot.sendMessage(
                chatId, 
                createFlightMessage(flight, userLanguage[chatId]), 
                { parse_mode: "Markdown" }
            );
        }

        await bot.sendMessage(
            chatId,
            userLanguage[chatId] === "ar" ? "اختر الإجراء التالي:" : "Choose your next action:",
            getActionButtons(userLanguage[chatId])
        );
    }, chatId);
});

// Callback handler (remain the same as your original)
bot.on("callback_query", async (callback) => {
    const chatId = callback.message.chat.id;

    await withErrorHandling(async () => {
        const data = callback.data;

        if (data.startsWith("lang_")) {
            userLanguage[chatId] = data.split("_")[1];
            const confirmMsg = userLanguage[chatId] === "ar"
                ? "تم اختيار العربية. اكتب البحث مثال: دبي لندن 25/04/2024"
                : "English selected. Enter search like: Dubai London 25/04/2024";
            await bot.sendMessage(chatId, confirmMsg);
        } 
        else if (data === "change_language") {
            await bot.sendMessage(
                chatId, 
                welcomeMessage[userLanguage[chatId] || 'en'], 
                getLanguageKeyboard(userLanguage[chatId] || 'en')
            );
        }
        else if (data === "new_search" || data === "restart") {
            const promptMsg = userLanguage[chatId] === "ar"
                ? "اكتب البحث الجديد مثال: دبي لندن 25/04/2024"
                : "Enter your new search like: Dubai London 25/04/2024";
            await bot.sendMessage(chatId, promptMsg);
        }
    }, chatId);
});

// Global error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log("🚀 Bot is operational");