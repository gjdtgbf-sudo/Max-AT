# 🔧 حل المشاكل الشائعة مع أوامر AT

دليل شامل لحل المشاكل والأخطاء الشائعة عند التعامل مع أوامر AT والمودمات.

---

## ⚠️ الأخطاء الشائعة

### 1. ERROR أو NO CARRIER

#### السبب المحتمل:
- أمر غير صحيح أو غير مدعوم
- بطاقة SIM غير موجودة أو معطلة
- عدم وجود تغطية شبكة

#### الحل:
```python
# 1. تحقق من الاتصال الأساسي
AT
# يجب أن يرد: OK

# 2. تحقق من بطاقة SIM
AT+CPIN?
# يجب أن يرد: +CPIN: READY

# 3. تحقق من تسجيل الشبكة
AT+CREG?
# يجب أن يرد: +CREG: 0,1 أو +CREG: 0,5

# 4. تحقق من قوة الإشارة
AT+CSQ
# قيمة أكبر من 10 تعتبر جيدة
```

---

### 2. CMS ERROR 304 - Invalid PDU mode parameter

#### السبب:
محاولة إرسال رسالة في وضع PDU بينما المودم في وضع Text أو العكس.

#### الحل:
```python
# تأكد من تفعيل وضع النص قبل الإرسال
AT+CMGF=1
# ثم أرسل الرسالة
AT+CMGS="0501234567"
> Hello World
# اضغط Ctrl+Z
```

---

### 3. CMS ERROR 330 - SIM not inserted

#### السبب:
- بطاقة SIM غير مركبة بشكل صحيح
- بطاقة SIM معطوبة
- قارئ SIM في المودم معطوب

#### الحل:
```python
# 1. إعادة تشغيل المودم
AT+CFUN=1,1

# 2. فحص وجود البطاقة
AT+CPIN?

# 3. قراءة ICCID
AT+CCID
# إذا لم يرد رقم، البطاقة غير مكتشفة
```

---

### 4. +CME ERROR: SIM PIN required

#### السبب:
بطاقة SIM محمية برمز PIN ولم يتم إدخاله.

#### الحل:
```python
# إدخال رمز PIN (الافتراضي عادة 0000 أو 1234)
AT+CPIN="1234"
# يجب أن يرد: OK

# للتحقق
AT+CPIN?
# يجب أن يرد: +CPIN: READY
```

---

### 5. +CME ERROR: Network timeout

#### السبب:
- ضعف الإشارة
- عدم تسجيل على الشبكة
- مشكلة في المشغل

#### الحل:
```python
# 1. فحص قوة الإشارة
AT+CSQ
# إذا كانت أقل من 10، الإشارة ضعيفة

# 2. البحث عن الشبكات المتاحة
AT+COPS=?
# سيستغرق وقتاً (30-120 ثانية)

# 3. التسجيل يدوياً
AT+COPS=1,2,"42001",7
# 42001 = Zain KSA, 7 = LTE

# 4. العودة للتسجيل التلقائي
AT+COPS=0
```

---

## 🐛 مشاكل الاتصال بالمودم

### 1. لا يوجد رد من المودم

#### الحل:
```python
# تحقق من:
# 1. المنفذ الصحيح
ls /dev/ttyUSB*  # في Linux
# أو Device Manager في Windows

# 2. سرعة الاتصال (Baud Rate)
# جرب: 9600, 19200, 38400, 57600, 115200

# 3. وجود تيار كهربائي
# بعض المودمات تحتاج تيار خارجي

# 4. في Python:
import serial.tools.list_ports
ports = serial.tools.list_ports.comports()
for port in ports:
    print(f"{port.device}: {port.description}")
```

---

### 2. حروف غريبة أو Garbage Characters

#### السبب:
سرعة الاتصال (Baud Rate) خاطئة.

#### الحل:
```python
# جرب سرعات مختلفة
baud_rates = [9600, 19200, 38400, 57600, 115200]

for baud in baud_rates:
    try:
        ser = serial.Serial('/dev/ttyUSB0', baud, timeout=1)
        ser.write(b'AT\r\n')
        time.sleep(0.5)
        response = ser.read_all().decode()
        if 'OK' in response:
            print(f"Correct baud rate: {baud}")
            break
        ser.close()
    except:
        continue
```

---

## 📱 مشاكل الرسائل SMS

### 1. لا يمكن إرسال رسائل

#### الحل خطوة بخطوة:
```python
# 1. تحقق من دعم SMS
AT+CMGF=?
# يجب أن يرد: +CMGF: (0,1)

# 2. فعّل وضع النص
AT+CMGF=1

# 3. تحقق من ذاكرة الرسائل
AT+CPMS?
# إذا كانت ممتلئة، احذف رسائل قديمة
AT+CMGD=1,4  # حذف جميع الرسائل

# 4. جرب إرسال رسالة قصيرة
AT+CMGS="0501234567"
> Test
# Ctrl+Z

# 5. إذا فشل، جرب PDU mode
AT+CMGF=0
```

---

### 2. الرسائل الواردة لا تظهر

#### الحل:
```python
# 1. فعّل إشعارات SMS
AT+CNMI=2,1,0,0,0
# الرسائل الجديدة ستظهر تلقائياً

# 2. قراءة الرسائل يدوياً
AT+CMGL="ALL"
# عرض جميع الرسائل

# 3. قراءة رسالة محددة
AT+CMGR=1
# قراءة الرسالة رقم 1
```

---

## 🌐 مشاكل الإنترنت GPRS/LTE

### 1. لا يمكن الاتصال بالإنترنت

#### الحل الكامل:
```python
# 1. تحقق من الاشتراك في خدمة الإنترنت لدى المشغل

# 2. تحقق من التسجيل على الشبكة
AT+CGATT?
# يجب أن يرد: +CGATT: 1

# 3. إذا كان 0، فعّل الاتصال
AT+CGATT=1
# انتظر 10-30 ثانية

# 4. إعداد APN الصحيح
# السعودية:
AT+CGDCONT=1,"IP","internet"      # STC
AT+CGDCONT=1,"IP","zain"          # Zain
AT+CGDCONT=1,"IP","web.sa"        # Mobily

# مصر:
AT+CGDCONT=1,"IP","internet.vodafone.net"  # Vodafone
AT+CGDCONT=1,"IP","mobinilweb"             # Orange

# الإمارات:
AT+CGDCONT=1,"IP","etisalat"      # Etisalat
AT+CGDCONT=1,"IP","internet"      # Du

# 5. تفعيل السياق
AT+CGACT=1,1

# 6. التحقق من عنوان IP
AT+CGPADDR=1
# يجب أن يرد: +CGPADDR: 1,"10.x.x.x"
```

---

### 2. الاتصال بطيء جداً

#### التشخيص:
```python
# 1. فحص نوع الشبكة
AT+COPS?
# الرد: ...,7 = LTE
# الرد: ...,2 = 3G
# الرد: ...,0 = GSM/2G

# 2. فحص جودة الإشارة بالتفصيل (Quectel)
AT+QCSQ
# يظهر RSSI, RSRP, RSRQ

# 3. فحص معلومات الخلية
AT+QENG="servingcell"
# يظهر Band, Bandwidth, PCI

# 4. إجبار الاتصال بـ LTE فقط
AT+QCFG="nwscanmode",3,1
# 3 = LTE only
```

---

## 🔐 مشاكل PIN و PUK

### حالة SIM مقفلة بـ PUK

#### الحل:
```python
# ⚠️ تحذير: لديك 10 محاولات فقط للـ PUK
# بعدها سيتم حظر البطاقة نهائياً

# 1. احصل على PUK من المشغل
# اتصل بخدمة العملاء أو تطبيق المشغل

# 2. إدخال PUK ورمز PIN جديد
AT+CPIN="12345678","1234"
# 12345678 = PUK code
# 1234 = new PIN

# 3. التحقق
AT+CPIN?
# يجب أن يرد: +CPIN: READY
```

---

## 🛠️ أدوات تشخيص مفيدة

### سكريبت Python للتشخيص الشامل

```python
import serial
import time

def full_diagnostic(port='/dev/ttyUSB0'):
    """تشخيص شامل للمودم"""
    
    try:
        ser = serial.Serial(port, 115200, timeout=1)
        time.sleep(2)
        
        tests = {
            'Connection Test': 'AT',
            'Manufacturer': 'AT+CGMI',
            'Model': 'AT+CGMM',
            'Firmware': 'AT+CGMR',
            'IMEI': 'AT+CGSN',
            'SIM Status': 'AT+CPIN?',
            'ICCID': 'AT+CCID',
            'IMSI': 'AT+CIMI',
            'Signal Strength': 'AT+CSQ',
            'Network Registration': 'AT+CREG?',
            'Current Operator': 'AT+COPS?',
            'GPRS Attachment': 'AT+CGATT?',
            'IP Address': 'AT+CGPADDR=1',
        }
        
        print("=" * 60)
        print("📱 GSM MODEM DIAGNOSTIC REPORT")
        print("=" * 60)
        
        for test_name, command in tests.items():
            ser.write((command + '\r\n').encode())
            time.sleep(0.5)
            response = ser.read_all().decode().strip()
            
            print(f"\n{test_name}:")
            print(f"  Command: {command}")
            print(f"  Response: {response}")
            
            if 'ERROR' in response:
                print("  ❌ FAILED")
            elif 'OK' in response:
                print("  ✅ PASSED")
        
        ser.close()
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"Error: {e}")

# تشغيل التشخيص
full_diagnostic('/dev/ttyUSB0')
```

---

### فحص جميع المنافذ المتاحة

```python
import serial.tools.list_ports

def find_modem():
    """البحث عن المودم في جميع المنافذ"""
    ports = serial.tools.list_ports.comports()
    
    print("Available Ports:")
    print("-" * 60)
    
    for port in ports:
        print(f"Port: {port.device}")
        print(f"Description: {port.description}")
        print(f"Hardware ID: {port.hwid}")
        
        # محاولة الاتصال
        try:
            ser = serial.Serial(port.device, 115200, timeout=1)
            ser.write(b'AT\r\n')
            time.sleep(0.5)
            response = ser.read_all().decode()
            
            if 'OK' in response:
                print("✅ Modem found!")
                ser.write(b'AT+CGMI\r\n')
                time.sleep(0.5)
                manufacturer = ser.read_all().decode()
                print(f"Manufacturer: {manufacturer}")
            
            ser.close()
        except:
            print("❌ Not a modem or access denied")
        
        print("-" * 60)

find_modem()
```

---

## 📚 رموز الأخطاء الشائعة

### CMS Errors (SMS Related)

| الكود | المعنى | الحل |
|------|---------|------|
| 300 | ME failure | أعد تشغيل المودم |
| 301 | SMS service reserved | انتظر قليلاً وأعد المحاولة |
| 304 | Invalid PDU mode | تأكد من `AT+CMGF=1` |
| 305 | Invalid text mode | تأكد من `AT+CMGF=0` |
| 310 | SIM not inserted | تحقق من تركيب البطاقة |
| 311 | SIM PIN required | أدخل PIN: `AT+CPIN="1234"` |
| 312 | PH-SIM PIN required | البطاقة مقفلة على شبكة معينة |
| 313 | SIM failure | البطاقة معطوبة |
| 314 | SIM busy | انتظر قليلاً |
| 315 | SIM wrong | بطاقة خاطئة أو غير مدعومة |
| 330 | SMSC address unknown | اضبط SMSC: `AT+CSCA="+966500000100"` |

### CME Errors (General)

| الكود | المعنى | الحل |
|------|---------|------|
| 3 | Operation not allowed | الأمر غير مسموح في الحالة الحالية |
| 4 | Operation not supported | الأمر غير مدعوم |
| 5 | PH-SIM PIN required | أدخل رمز فك القفل |
| 10 | SIM not inserted | تحقق من البطاقة |
| 11 | SIM PIN required | أدخل PIN |
| 12 | SIM PUK required | أدخل PUK |
| 13 | SIM failure | بطاقة معطوبة |
| 14 | SIM busy | انتظر |
| 15 | SIM wrong | بطاقة خاطئة |
| 16 | Incorrect password | PIN أو PUK خاطئ |
| 17 | SIM PIN2 required | مطلوب PIN2 |
| 18 | SIM PUK2 required | مطلوب PUK2 |
| 30 | No network service | لا توجد تغطية |
| 31 | Network timeout | انتهت مهلة الشبكة |
| 32 | Network not allowed | الشبكة غير مسموحة |

---

## 💡 نصائح عامة

### 1. دائماً ابدأ بإعادة التعيين
```python
ATZ  # إعادة تعيين المودم
ATE0 # إيقاف echo للحصول على ردود نظيفة
```

### 2. استخدم timeout مناسب
```python
# بعض الأوامر تحتاج وقت طويل
AT+COPS=?  # يحتاج 30-120 ثانية
```

### 3. تحقق من دليل AT الخاص بالمصنع
- كل مودم له أوامر خاصة
- Quectel, Simcom, Huawei - لكل منهم امتدادات خاصة

### 4. استخدم logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
# سيظهر لك كل ما يرسل ويستقبل
```

---

**المصادر المفيدة:**
- [3GPP TS 27.007](https://www.3gpp.org/DynaReport/27007.htm) - المواصفات الرسمية
- [Quectel Forums](https://forums.quectel.com/)
- [Arduino GSM Library](https://www.arduino.cc/en/Reference/GSM)

تم التحديث: 2025-10-24
