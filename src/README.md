# โครงสร้าง source

[คู่มือติดตั้งและรันโปรเจกต์](../README.md) · [แนวทางจัดไฟล์หน้าเว็บ](pages/README.md)

## หน้าที่ของแต่ละส่วน

| ตำแหน่ง | หน้าที่ |
| --- | --- |
| `main.jsx` | เริ่มต้น React และโหลด CSS |
| `App.jsx` | ประกาศ routes ตรวจ session และดูแลข้อมูลผู้ใช้กับยอดเหรียญระดับแอป |
| `api/client.js` | Axios instance การแนบ token และ refresh token |
| `api/` | ฟังก์ชันเรียก backend แบ่งตามข้อมูลหรือฟีเจอร์ |
| `components/comics/` | ส่วนแสดงการ์ตูน คะแนน ความคิดเห็น และปุ่มติดตามที่ใช้ร่วมกัน |
| `components/layout/` | Navbar เมนูบัญชี และ layout หน้าจัดการ |
| `components/ui/` | UI พื้นฐาน เช่น Button และ PageHeader |
| `pages/` | หน้าเว็บและไฟล์ที่ใช้เฉพาะฟีเจอร์ |
| `utils/` | ฟังก์ชันช่วย เช่น จัดการ URL รูปและข้อความ error |
| `assets/` | รูปและ static assets ที่ import ในโค้ด |
| `index.css` | รูปแบบส่วนกลาง |

## การแบ่งความรับผิดชอบ

หน้า `*Page.jsx` เรียก hook ของฟีเจอร์เพื่อรับข้อมูลและ handlers แล้วส่งต่อให้ components ส่วน hook จัดการ state, effects และเรียก API ขณะที่ API service ดูแล HTTP request และรูปแบบข้อมูลที่ได้รับ

ตัวอย่างหน้า wallet:

```text
pages/wallet/PaymentPage.jsx
  → pages/wallet/hooks/usePayment.js
    → api/coinPurchaseApi.js
      → api/client.js
```

ใช้ `api/client.js` สำหรับคำขอทั่วไปเพื่อให้การแนบ token และ refresh session ทำงานเหมือนกัน มีข้อยกเว้นสำหรับคำขอยกเลิก payment ตอนปิดหน้า ซึ่งใช้ `fetch` พร้อม `keepalive`

## เลือกตำแหน่งไฟล์

- ใช้เฉพาะฟีเจอร์เดียว: วางใน `pages/<feature>/components`, `hooks`, `services` หรือ `utils`
- ใช้ร่วมกันหลายฟีเจอร์: วางใน `components`, `api` หรือ `utils` ระดับ `src`
- API เฉพาะ auth และ home อยู่ใน `services` ของฟีเจอร์ ส่วน API อื่นที่มีอยู่ใช้ `src/api`
- ตั้งชื่อ component ด้วย PascalCase, hook ด้วย `use` ตามด้วย PascalCase และโฟลเดอร์ฟีเจอร์ด้วย kebab-case

URL ของหน้าเว็บกำหนดใน [App.jsx](App.jsx) แยกจากชื่อโฟลเดอร์ ย้ายไฟล์แล้วต้องปรับ import แต่ไม่จำเป็นต้องเปลี่ยน URL
