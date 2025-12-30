# 💻 أمثلة عملية لاستخدام أوامر AT

هذا الملف يحتوي على أمثلة برمجية عملية لكيفية استخدام أوامر AT مع لغات البرمجة المختلفة.

---

## 📌 الاتصال بالمودم

### Python - pySerial
```python
import serial
import time

# فتح اتصال تسلسلي مع المودم
ser = serial.Serial(
    port='/dev/ttyUSB0',  # أو COM3 في Windows
    baudrate=115200,
    timeout=1
)

def send_at_command(command, delay=1):
    """إرسال أمر AT وانتظار الرد"""
    ser.write((command + '\r\n').encode())
    time.sleep(delay)
    response = ser.read_all().decode()
    return response

# اختبار الاتصال
print(send_at_command('AT'))
# النتيجة المتوقعة: OK

# الحصول على معلومات المودم
print(send_at_command('AT+CGMI'))  # الشركة المصنعة
print(send_at_command('AT+CGMM'))  # الموديل
print(send_at_command('AT+CGSN'))  # IMEI

# إغلاق الاتصال
ser.close()
```

### Node.js - serialport
```javascript
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// فتح اتصال تسلسلي
const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 115200
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// إرسال أمر AT
function sendATCommand(command) {
  return new Promise((resolve) => {
    port.write(command + '\r\n');
    parser.once('data', (data) => {
      resolve(data);
    });
  });
}

// استخدام الأوامر
async function main() {
  console.log(await sendATCommand('AT'));
  console.log(await sendATCommand('AT+CGMI'));
  console.log(await sendATCommand('AT+CSQ'));
}

main();
```

---

## 📱 إرسال واستقبال الرسائل SMS

### Python - إرسال SMS
```python
import serial
import time

ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

def send_sms(phone_number, message):
    # تفعيل وضع النص
    ser.write(b'AT+CMGF=1\r\n')
    time.sleep(0.5)
    
    # تحديد رقم المستقبل
    ser.write(f'AT+CMGS="{phone_number}"\r\n'.encode())
    time.sleep(0.5)
    
    # كتابة نص الرسالة
    ser.write(message.encode())
    time.sleep(0.5)
    
    # إرسال Ctrl+Z لإنهاء الرسالة
    ser.write(bytes([26]))
    time.sleep(2)
    
    response = ser.read_all().decode()
    return response

# مثال
result = send_sms('0501234567', 'مرحباً من Python!')
print(result)
```

### Python - قراءة الرسائل
```python
def read_all_sms():
    # تفعيل وضع النص
    ser.write(b'AT+CMGF=1\r\n')
    time.sleep(0.5)
    
    # قراءة جميع الرسائل
    ser.write(b'AT+CMGL="ALL"\r\n')
    time.sleep(2)
    
    response = ser.read_all().decode()
    return response

messages = read_all_sms()
print(messages)
```

---

## 🌐 الاتصال بالإنترنت عبر GPRS/LTE

### Python - إعداد الاتصال
```python
def setup_internet_connection(apn):
    commands = [
        'AT+CFUN=1',                              # تفعيل المودم
        f'AT+CGDCONT=1,"IP","{apn}"',            # إعداد APN
        'AT+CGACT=1,1',                          # تفعيل السياق
        'AT+CGPADDR=1'                           # الحصول على IP
    ]
    
    for cmd in commands:
        ser.write((cmd + '\r\n').encode())
        time.sleep(1)
        response = ser.read_all().decode()
        print(f'{cmd}: {response}')

# استخدام
setup_internet_connection('internet')  # أو 'zain' أو 'mobily' حسب المشغل
```

---

## 📞 إجراء المكالمات

### Python - إجراء مكالمة
```python
def make_call(phone_number):
    """إجراء مكالمة صوتية"""
    command = f'ATD{phone_number};'
    ser.write((command + '\r\n').encode())
    time.sleep(1)
    response = ser.read_all().decode()
    return response

def end_call():
    """إنهاء المكالمة"""
    ser.write(b'ATH\r\n')
    time.sleep(1)
    response = ser.read_all().decode()
    return response

# مثال
print(make_call('0501234567'))
time.sleep(10)  # المكالمة لمدة 10 ثواني
print(end_call())
```

---

## 📊 فحص حالة الشبكة والإشارة

### Python - مراقبة الشبكة
```python
def check_network_status():
    """فحص شامل لحالة الشبكة"""
    
    # فحص قوة الإشارة
    ser.write(b'AT+CSQ\r\n')
    time.sleep(0.5)
    signal = ser.read_all().decode()
    
    # فحص تسجيل الشبكة
    ser.write(b'AT+CREG?\r\n')
    time.sleep(0.5)
    registration = ser.read_all().decode()
    
    # فحص المشغل الحالي
    ser.write(b'AT+COPS?\r\n')
    time.sleep(0.5)
    operator = ser.read_all().decode()
    
    return {
        'signal': signal,
        'registration': registration,
        'operator': operator
    }

status = check_network_status()
print(status)
```

### Python - تفسير قوة الإشارة
```python
def interpret_signal_strength(csq_value):
    """
    تفسير قيمة CSQ (0-31)
    0-9: ضعيف جداً
    10-14: ضعيف
    15-19: جيد
    20-31: ممتاز
    99: غير معروف
    """
    if csq_value == 99:
        return "غير معروف - لا توجد إشارة"
    elif csq_value < 10:
        return "ضعيف جداً"
    elif csq_value < 15:
        return "ضعيف"
    elif csq_value < 20:
        return "جيد"
    else:
        return "ممتاز"

# استخدام
ser.write(b'AT+CSQ\r\n')
time.sleep(0.5)
response = ser.read_all().decode()
# مثال response: +CSQ: 23,99
csq_value = int(response.split(':')[1].split(',')[0].strip())
print(f"قوة الإشارة: {interpret_signal_strength(csq_value)}")
```

---

## 🔐 إدارة بطاقة SIM

### Python - فحص وإدخال PIN
```python
def check_sim_status():
    """فحص حالة بطاقة SIM"""
    ser.write(b'AT+CPIN?\r\n')
    time.sleep(0.5)
    response = ser.read_all().decode()
    
    if 'READY' in response:
        return "SIM جاهزة"
    elif 'SIM PIN' in response:
        return "تحتاج إلى PIN"
    elif 'SIM PUK' in response:
        return "محظورة - تحتاج إلى PUK"
    else:
        return "خطأ أو SIM غير موجودة"

def unlock_sim(pin_code):
    """إدخال رمز PIN"""
    command = f'AT+CPIN="{pin_code}"'
    ser.write((command + '\r\n').encode())
    time.sleep(1)
    response = ser.read_all().decode()
    return response

# استخدام
print(check_sim_status())
# إذا كانت محمية
# print(unlock_sim('1234'))
```

---

## 🛠️ أدوات مساعدة

### Python - Class كامل للتعامل مع المودم
```python
import serial
import time

class GSMModem:
    def __init__(self, port='/dev/ttyUSB0', baudrate=115200):
        self.ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2)  # انتظار تهيئة المودم
        
    def send_command(self, command, delay=1):
        """إرسال أمر AT وانتظار الرد"""
        self.ser.write((command + '\r\n').encode())
        time.sleep(delay)
        return self.ser.read_all().decode()
    
    def test_connection(self):
        """اختبار الاتصال بالمودم"""
        return self.send_command('AT')
    
    def get_imei(self):
        """الحصول على IMEI"""
        response = self.send_command('AT+CGSN')
        return response.strip()
    
    def get_signal_strength(self):
        """قوة الإشارة"""
        response = self.send_command('AT+CSQ')
        try:
            csq = int(response.split(':')[1].split(',')[0].strip())
            return csq
        except:
            return None
    
    def send_sms(self, phone, message):
        """إرسال SMS"""
        self.send_command('AT+CMGF=1')
        self.send_command(f'AT+CMGS="{phone}"', 0.5)
        self.ser.write(message.encode())
        time.sleep(0.5)
        self.ser.write(bytes([26]))  # Ctrl+Z
        time.sleep(2)
        return self.ser.read_all().decode()
    
    def setup_internet(self, apn):
        """إعداد الاتصال بالإنترنت"""
        self.send_command('AT+CFUN=1')
        self.send_command(f'AT+CGDCONT=1,"IP","{apn}"')
        self.send_command('AT+CGACT=1,1')
        ip = self.send_command('AT+CGPADDR=1')
        return ip
    
    def close(self):
        """إغلاق الاتصال"""
        self.ser.close()

# استخدام الـ Class
modem = GSMModem('/dev/ttyUSB0')
print(modem.test_connection())
print(f"IMEI: {modem.get_imei()}")
print(f"Signal: {modem.get_signal_strength()}")
modem.close()
```

---

## 🎯 نصائح مهمة

### 1. التعامل مع الأخطاء
```python
def safe_send_command(command, max_retries=3):
    """إرسال أمر مع إعادة المحاولة"""
    for i in range(max_retries):
        try:
            response = send_at_command(command)
            if 'OK' in response or 'ERROR' not in response:
                return response
        except Exception as e:
            print(f"محاولة {i+1} فشلت: {e}")
            time.sleep(1)
    return None
```

### 2. انتظار الرد الكامل
```python
def wait_for_response(timeout=5):
    """انتظار الرد الكامل من المودم"""
    start_time = time.time()
    response = ''
    
    while time.time() - start_time < timeout:
        if ser.in_waiting:
            response += ser.read(ser.in_waiting).decode()
            if 'OK' in response or 'ERROR' in response:
                break
        time.sleep(0.1)
    
    return response
```

### 3. إعادة تعيين المودم
```python
def reset_modem():
    """إعادة تعيين المودم للإعدادات الافتراضية"""
    commands = [
        'ATZ',           # إعادة تعيين
        'ATE0',          # إيقاف Echo
        'AT+CMGF=1',     # وضع النص للـ SMS
        'AT+CNMI=2,1'    # إشعارات SMS
    ]
    
    for cmd in commands:
        print(send_at_command(cmd))
        time.sleep(0.5)
```

---

## 📚 مصادر إضافية

- [Quectel AT Commands Manual](https://www.quectel.com/)
- [SIMCom AT Commands Manual](https://simcom.ee/)
- [3GPP Specifications](https://www.3gpp.org/)
- [pySerial Documentation](https://pyserial.readthedocs.io/)

---

**ملاحظة**: تأكد من تعديل منفذ التسلسلي (`/dev/ttyUSB0` أو `COM3`) حسب نظام التشغيل والجهاز المستخدم.
