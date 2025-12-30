import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))

// AT Commands Data
const atCommands = {
  basic: [
    { cmd: 'AT', desc: 'اختبار الاتصال - يجب أن يرد المودم بـ OK', example: 'AT\nOK' },
    { cmd: 'ATZ', desc: 'إعادة تعيين المودم للإعدادات الافتراضية', example: 'ATZ\nOK' },
    { cmd: 'ATE0', desc: 'إيقاف Echo (عدم إظهار الأوامر المُدخلة)', example: 'ATE0\nOK' },
    { cmd: 'ATE1', desc: 'تفعيل Echo (إظهار الأوامر المُدخلة)', example: 'ATE1\nOK' },
    { cmd: 'ATI', desc: 'عرض معلومات المودم', example: 'ATI\nManufacturer: Quectel\nModel: EC25\nOK' },
    { cmd: 'AT+CGMI', desc: 'عرض اسم الشركة المصنعة', example: 'AT+CGMI\nQuectel\nOK' },
    { cmd: 'AT+CGMM', desc: 'عرض موديل المودم', example: 'AT+CGMM\nEC25\nOK' },
    { cmd: 'AT+CGMR', desc: 'عرض إصدار الفيرموير', example: 'AT+CGMR\nEC25EFAR06A03M4G\nOK' },
    { cmd: 'AT+CGSN', desc: 'عرض الرقم التسلسلي IMEI', example: 'AT+CGSN\n867698041234567\nOK' }
  ],
  sim: [
    { cmd: 'AT+CPIN?', desc: 'فحص حالة بطاقة SIM', example: 'AT+CPIN?\n+CPIN: READY\nOK' },
    { cmd: 'AT+CPIN="1234"', desc: 'إدخال رمز PIN', example: 'AT+CPIN="1234"\nOK' },
    { cmd: 'AT+CCID', desc: 'قراءة ICCID الخاص بالشريحة', example: 'AT+CCID\n89966062000012345678\nOK' },
    { cmd: 'AT+CIMI', desc: 'قراءة IMSI', example: 'AT+CIMI\n420011234567890\nOK' },
    { cmd: 'AT+CPBS=?', desc: 'عرض أنواع دفتر الهاتف المتاحة', example: 'AT+CPBS=?\n+CPBS: ("SM","FD","LD","ON")\nOK' }
  ],
  network: [
    { cmd: 'AT+CREG?', desc: 'فحص تسجيل الشبكة', example: 'AT+CREG?\n+CREG: 0,1\nOK' },
    { cmd: 'AT+COPS?', desc: 'فحص مشغل الشبكة الحالي', example: 'AT+COPS?\n+COPS: 0,0,"Zain SA",7\nOK' },
    { cmd: 'AT+COPS=?', desc: 'البحث عن الشبكات المتاحة', example: 'AT+COPS=?\n+COPS: (1,"Zain SA","Zain","42001",7)...\nOK' },
    { cmd: 'AT+CSQ', desc: 'فحص قوة الإشارة (0-31)', example: 'AT+CSQ\n+CSQ: 23,99\nOK' },
    { cmd: 'AT+CPOL?', desc: 'عرض قائمة المشغلين المفضلين', example: 'AT+CPOL?\n+CPOL: 1,2,"42001"\nOK' }
  ],
  calls: [
    { cmd: 'ATD1234567890;', desc: 'إجراء مكالمة صوتية', example: 'ATD1234567890;\nOK' },
    { cmd: 'ATA', desc: 'الرد على مكالمة واردة', example: 'ATA\nOK' },
    { cmd: 'ATH', desc: 'إنهاء المكالمة', example: 'ATH\nOK' },
    { cmd: 'AT+CLCC', desc: 'عرض المكالمات الحالية', example: 'AT+CLCC\n+CLCC: 1,0,2,0,0,"1234567890",129\nOK' },
    { cmd: 'AT+CLIP=1', desc: 'تفعيل عرض رقم المتصل', example: 'AT+CLIP=1\nOK' },
    { cmd: 'AT+CLIR=1', desc: 'إخفاء رقمك عند الاتصال', example: 'AT+CLIR=1\nOK' }
  ],
  sms: [
    { cmd: 'AT+CMGF=1', desc: 'تفعيل وضع النص للرسائل (Text Mode)', example: 'AT+CMGF=1\nOK' },
    { cmd: 'AT+CMGF=0', desc: 'تفعيل وضع PDU للرسائل', example: 'AT+CMGF=0\nOK' },
    { cmd: 'AT+CMGS="0501234567"', desc: 'إرسال رسالة SMS', example: 'AT+CMGS="0501234567"\n> Hello World\n+CMGS: 123\nOK' },
    { cmd: 'AT+CMGL="ALL"', desc: 'قراءة جميع الرسائل', example: 'AT+CMGL="ALL"\n+CMGL: 1,"REC READ","0501234567"\nHello\nOK' },
    { cmd: 'AT+CMGR=1', desc: 'قراءة رسالة معينة', example: 'AT+CMGR=1\n+CMGR: "REC READ","0501234567"\nMessage text\nOK' },
    { cmd: 'AT+CMGD=1', desc: 'حذف رسالة معينة', example: 'AT+CMGD=1\nOK' },
    { cmd: 'AT+CNMI=2,1', desc: 'تفعيل إشعارات الرسائل الواردة', example: 'AT+CNMI=2,1\nOK' }
  ],
  gprs: [
    { cmd: 'AT+CGATT?', desc: 'فحص الاتصال بشبكة GPRS/LTE', example: 'AT+CGATT?\n+CGATT: 1\nOK' },
    { cmd: 'AT+CGDCONT=1,"IP","internet"', desc: 'إعداد APN للإنترنت', example: 'AT+CGDCONT=1,"IP","internet"\nOK' },
    { cmd: 'AT+CGACT=1,1', desc: 'تفعيل السياق الخاص بالبيانات', example: 'AT+CGACT=1,1\nOK' },
    { cmd: 'AT+CGPADDR=1', desc: 'الحصول على عنوان IP', example: 'AT+CGPADDR=1\n+CGPADDR: 1,10.123.45.67\nOK' },
    { cmd: 'AT+COPS=1,2,"42001",7', desc: 'تحديد شبكة LTE يدويًا', example: 'AT+COPS=1,2,"42001",7\nOK' }
  ],
  advanced: [
    { cmd: 'AT+QENG="servingcell"', desc: 'معلومات الخلية الحالية (Quectel)', example: 'AT+QENG="servingcell"\n+QENG: "servingcell","NOCONN","LTE"\nOK' },
    { cmd: 'AT+CPMS?', desc: 'فحص ذاكرة الرسائل', example: 'AT+CPMS?\n+CPMS: "SM",10,50,"SM",10,50\nOK' },
    { cmd: 'AT+CFUN=1', desc: 'تفعيل كامل وظائف المودم', example: 'AT+CFUN=1\nOK' },
    { cmd: 'AT+CFUN=0', desc: 'وضع الطيران (Airplane Mode)', example: 'AT+CFUN=0\nOK' },
    { cmd: 'AT+QNWINFO', desc: 'معلومات الشبكة (Quectel)', example: 'AT+QNWINFO\n+QNWINFO: "FDD LTE","42001","LTE BAND 3",1575\nOK' },
    { cmd: 'AT+QCSQ', desc: 'معلومات جودة الإشارة المفصلة (Quectel)', example: 'AT+QCSQ\n+QCSQ: "LTE",-80,-10,200,-11\nOK' }
  ]
}

// API Route
app.get('/api/commands', (c) => {
  return c.json(atCommands)
})

app.get('/api/search', (c) => {
  const query = c.req.query('q')?.toLowerCase() || ''
  const results: any = {}
  
  Object.entries(atCommands).forEach(([category, commands]) => {
    const filtered = commands.filter((cmd: any) => 
      cmd.cmd.toLowerCase().includes(query) || 
      cmd.desc.toLowerCase().includes(query)
    )
    if (filtered.length > 0) {
      results[category] = filtered
    }
  })
  
  return c.json(results)
})

// Main Page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>دليل أوامر AT Commands الشامل</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          * { font-family: 'Cairo', sans-serif; }
          .command-card {
            transition: all 0.3s ease;
            border-right: 4px solid transparent;
          }
          .command-card:hover {
            transform: translateX(-5px);
            border-right-color: #3b82f6;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .code-block {
            background: #1e293b;
            color: #10b981;
            font-family: 'Courier New', monospace;
            direction: ltr;
            text-align: left;
          }
          .category-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .search-box {
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-8">
                <div class="flex items-center justify-center mb-4">
                    <i class="fas fa-terminal text-5xl ml-4"></i>
                    <h1 class="text-4xl font-bold">دليل أوامر AT Commands</h1>
                </div>
                <p class="text-center text-blue-100 text-lg">
                    الدليل الشامل للتحكم في مودمات GSM/LTE/4G/5G
                </p>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="container mx-auto px-4 -mt-6 mb-8">
            <div class="max-w-2xl mx-auto">
                <div class="relative search-box rounded-lg">
                    <input 
                        type="text" 
                        id="searchInput"
                        placeholder="ابحث عن أمر معين... مثل: CGMI, SMS, Signal"
                        class="w-full px-6 py-4 pr-14 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                    />
                    <i class="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="container mx-auto px-4 pb-12" id="content">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
                <p class="text-gray-600 mt-4">جاري التحميل...</p>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-6 mt-12">
            <div class="container mx-auto px-4 text-center">
                <p class="mb-2"><i class="fas fa-code"></i> تم التطوير بواسطة Claude AI</p>
                <p class="text-gray-400 text-sm">دليل شامل لأوامر AT للمودمات والأجهزة الخلوية</p>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
