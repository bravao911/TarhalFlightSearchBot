Here's a comprehensive **README.md** file in both English and Arabic for your GitHub repository:

# **Tarhal Flight Search Bot - Cheap Flights Finder** ✈️  
**Telegram bot for finding cheap flights with Arabic/English support**  

---

## **English Documentation** 🇺🇸  

### **📌 Project Description**  
Tarhal is a smart Telegram bot that helps users find the cheapest flights between cities. It supports both Arabic and English languages, understands city names or airport codes, and provides detailed flight information including transfers.  

### **✨ Features**  
- **Bilingual Support**: Full Arabic/English interface  
- **Flexible Input**: Accepts city names (Dubai London) or airport codes (DXB LON)  
- **Date Validation**: Automatically detects and rejects past dates  
- **Transfer Info**: Shows number of stops and connecting cities  
- **Direct Results**: Sorts flights to show non-stop options first  
- **Quick Actions**: Change language or start new search with one tap  

### **🛠 Installation**  
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/tarhal-flight-search-bot.git
   cd tarhal-flight-search-bot
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Create `.env` file:  
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   KIWI_API_KEY=your_kiwi_api_key
   ```

4. Run the bot:  
   ```bash
   node index.js
   ```

### **🔧 Configuration**  
| Environment Variable | Description                          |
|----------------------|--------------------------------------|
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) |
| `KIWI_API_KEY`       | Get from [Kiwi Tequila](https://tequila.kiwi.com) |

### **🤖 Bot Commands**  
- `/start` - Begin interaction  
- `DXB LON 25/12/2024` - Search format (IATA codes)  
- `دبي لندن ٢٥/١٢/٢٠٢٤` - Arabic format with numerals  

### **📂 Project Structure**  
```
├── config.js         # Configuration & constants
├── languageService.js # Arabic/English processing
├── apiService.js     # Flight API communication
├── botService.js     # Telegram message handling
├── index.js          # Main application entry
└── .env.example      # Environment template
```

---

## **🇸🇦 الوثائق العربية**  

### **📌 وصف المشروع**  
"طَرهَل" بوت تلغرام ذكي للبحث عن أرخص تذاكر الطيران بين المدن. يدعم اللغتين العربية والإنجليزية، ويفهم أسماء المدن أو رموز المطارات، ويقدم تفاصيل الرحلة بما في ذلك الترانزيت.  

### **✨ المميزات**  
- دعم ثنائي اللغة: واجهة كاملة بالعربية والإنجليزية  
- مدخلات مرنة: يقبل أسماء المدن (دبي لندن) أو رموز المطارات (DXB LON)  
- تحقق من التاريخ: يرفض التواريخ الماضية تلقائياً  
- معلومات الترانزيت: يظهر عدد المحطات ومدن التوقف  
- نتائج مباشرة: يرتب الرحلات بحيث تظهر الخيارات المباشرة أولاً  
- إجراءات سريعة: تغيير اللغة أو بحث جديد بنقرة واحدة  

### **🛠 التثبيت**  
1. استنسخ المشروع:  
   ```bash
   git clone https://github.com/your-username/tarhal-flight-search-bot.git
   cd tarhal-flight-search-bot
   ```

2. ثبت المتطلبات:  
   ```bash
   npm install
   ```

3. أنشئ ملف `.env`:  
   ```env
   TELEGRAM_BOT_TOKEN=توكن_بوتك
   KIWI_API_KEY=مفتاح_كيوي_API
   ```

4. تشغيل البوت:  
   ```bash
   node index.js
   ```

### **🔧 الإعدادات**  
| المتغير          | الوصف                          |
|------------------|--------------------------------|
| `TELEGRAM_BOT_TOKEN` | احصل عليه من [@BotFather](https://t.me/BotFather) |
| `KIWI_API_KEY`   | احصل عليه من [Kiwi Tequila](https://tequila.kiwi.com) |

### **🤖 أوامر البوت**  
- `/start` - بدء التفاعل  
- `DXB LON 25/12/2024` - صيغة البحث (رموز المطارات)  
- `دبي لندن ٢٥/١٢/٢٠٢٤` - صيغة عربية بالأرقام  

### **📂 هيكل المشروع**  
```
├── config.js         # الإعدادات الثابتة
├── languageService.js # معالجة اللغة العربية/الإنجليزية
├── apiService.js     # التواصل مع واجهة الطيران
├── botService.js     # إدارة رسائل تلغرام
├── index.js          # نقطة التشغيل الرئيسية
└── .env.example      # نموذج ملف البيئة
```

---

## **📜 License**  
MIT License - Free for personal and commercial use  

## **📬 Contact**  
For support/questions:  
📧 Email: your-email@example.com  
🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)  

---

**🚀 Ready to deploy?** Follow the installation guide and start helping users find cheap flights today!  

**🚀 جاهز للنشر؟** اتبع دليل التثبيت وابدأ مساعدة المستخدمين في إيجاد تذاكر طيران رخيصة اليوم!  

[![Deploy](https://img.shields.io/badge/Deploy_to-Vercel-blue?style=for-the-badge)](https://vercel.com/new)  
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Live-green?style=for-the-badge)](https://t.me/YourBotName)  

---


This README provides:  
✅ **Full bilingual documentation**  
✅ **Clear setup instructions**  
✅ **Visual structure overview**  
✅ **License and contact info**  
✅ **Badges for quick actions**  
