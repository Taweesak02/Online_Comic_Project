# โครงสร้างไฟล์หน้าเว็บ

จัดกลุ่มตามฟีเจอร์ เช่น `auth`, `comics`, `profile` และ `wallet`

```text
<feature>/
  ExamplePage.jsx
  components/
    ExampleList.jsx
  hooks/
    useExample.js
  services/
    exampleApi.js
  utils/
    formatters.js
```

- `*Page.jsx`: จุดเข้าของ route จัดโครงหน้าและเงื่อนไขการแสดงผล
- `components/`: ส่วนแสดงผลที่ใช้ภายในฟีเจอร์
- `hooks/`: state, โหลดข้อมูล, effects และ event handlers ของฟีเจอร์
- `services/`: API ที่เป็นของฟีเจอร์โดยเฉพาะ เช่น auth และ home ที่มีอยู่เดิม
- `utils/`: ฟังก์ชันช่วยที่ไม่ขึ้นกับ React

สร้างเฉพาะโฟลเดอร์ที่มีไฟล์ใช้งานจริง หน้าเล็กที่มีแต่การแสดงผลไม่จำเป็นต้องแยกเพิ่ม
ไฟล์ที่ใช้ร่วมกันหลายฟีเจอร์ให้อยู่ใน `src/components`, `src/api` หรือ `src/utils`
คงไฟล์ Page ไว้ที่รากของแต่ละฟีเจอร์ เพื่อให้ import ของ route ใน `App.jsx` หาได้ง่าย

## ฟีเจอร์และ routes

Routes ประกาศใน [App.jsx](../App.jsx)

| โฟลเดอร์ | Routes | หน้าที่ |
| --- | --- | --- |
| `home` | `/` | หน้าแรกและอันดับการ์ตูน |
| `auth` | `/login`, `/register` | เข้าสู่ระบบและสมัครสมาชิก |
| `author-search` | `/authors` | ค้นหาผู้แต่งหรือผู้ใช้ |
| `search` | `/comics` | ค้นหาการ์ตูนและกรองผลลัพธ์ |
| `comics` | `/comics/:comicId`, `/comics/:comicId/chapters/:chapterId` | รายละเอียดการ์ตูนและอ่านตอน |
| `comic-management` | `/comic-management`, `/comic-management/:comicId/chapters` | จัดการการ์ตูนและตอน |
| `admin-management` | `/admin` | จัดการข้อมูลสำหรับผู้ดูแลระบบ |
| `profile` | `/profile`, `/authors/:userId` | โปรไฟล์ส่วนตัวและสาธารณะ |
| `library` | `/favorites`, `/followed`, `/history` | รายการโปรด ติดตาม และประวัติอ่าน |
| `notifications` | `/notifications` | การแจ้งเตือน |
| `wallet` | `/coin-purchase`, `/payment`, `/wallet/transactions` | ซื้อเหรียญ ชำระเงิน และประวัติเหรียญ |

## ตัวอย่างไฟล์ที่แยกแล้ว

- `profile/ProfilePage.jsx` จัดหน้าและแสดงฟอร์ม ส่วน `profile/hooks/useProfile.js` โหลดข้อมูลและส่งการแก้ไข
- `profile/PublicProfilePage.jsx` อ่าน route params และแสดง `components/ProfileContent.jsx` ซึ่งใช้ `hooks/usePublicProfile.js`
- `library/SavedComicsPage.jsx` ตรวจสถานะเข้าสู่ระบบ ก่อนแสดง `components/SavedComicList.jsx`
- `wallet/PaymentPage.jsx` ประกอบ UI จาก `components/` และใช้ `hooks/usePayment.js` จัดการการชำระเงิน

## เพิ่มหน้าใหม่

1. เลือกโฟลเดอร์ฟีเจอร์ที่เกี่ยวข้อง หรือสร้างใหม่หากเป็นฟีเจอร์แยก
2. สร้าง `*Page.jsx` สำหรับจุดเข้าของ route
3. แยก state และ effects ที่มีหลายขั้นตอนไว้ใน `hooks/use*.js`
4. แยกส่วนแสดงผลที่มีหน้าที่ชัดเจนไว้ใน `components/`
5. เพิ่ม import และ route ใน `src/App.jsx` พร้อมส่ง props ที่หน้านั้นต้องใช้
6. ตรวจ `npm run lint` และ `npm run build` แล้วลองเปิดหน้าตรงผ่าน URL และนำทางผ่านเมนู

เมื่อแยกไฟล์ ให้คงการ cleanup ของ effects, dependency arrays และ component keys ที่ควบคุมการ reset state ไว้ ตรวจสถานะกำลังโหลด ข้อผิดพลาด และการเข้าสู่ระบบให้ครบตาม flow เดิม

[กลับไปโครงสร้าง source](../README.md) · [คู่มือโปรเจกต์](../../README.md)
