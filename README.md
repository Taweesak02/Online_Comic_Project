# Online Comic

ระบบอ่านและจัดการการ์ตูนออนไลน์ ใช้ React และ Vite สำหรับส่วนหน้า (Frontend), Express และ Prisma สำหรับระบบ API (Backend) และ PostgreSQL สำหรับฐานข้อมูล สามารถเปิดทั้งสามบริการด้วยไฟล์ `docker-compose.yml` ที่รากโปรเจกต์

## โครงสร้างโปรเจกต์

| ตำแหน่ง | รายละเอียด |
| --- | --- |
| `FrontEnd/` | หน้าเว็บไซต์สำหรับผู้ใช้งาน |
| `BackEnd/` | ระบบ API การจัดการฐานข้อมูล และไฟล์อัปโหลด |
| `docker-compose.yml` | การตั้งค่าสำหรับเปิดเว็บไซต์ API และฐานข้อมูลร่วมกัน |

## สิ่งที่ต้องเตรียม

- Docker Desktop ที่ใช้ Linux containers หรือ Docker Engine พร้อม Docker Compose
- PowerShell สำหรับรันคำสั่งตัวอย่างด้านล่าง โดยเปิดจากโฟลเดอร์รากของโปรเจกต์

## เริ่มต้นใช้งานด้วย Docker

### 1. เตรียมไฟล์ตั้งค่า

คัดลอกไฟล์ตัวอย่างเฉพาะการติดตั้งครั้งแรก หากมีไฟล์ `.env` ที่ตั้งค่าไว้แล้ว ให้ใช้ไฟล์เดิมเพื่อไม่ให้ค่าถูกเขียนทับ

```powershell
Copy-Item .env.example .env
```

สำหรับ macOS/Linux ใช้ `cp` แทน `Copy-Item`

### 2. กำหนดค่าระบบ

แก้ไข `.env` ที่รากโปรเจกต์ โดยกำหนดค่าต่อไปนี้:

| ตัวแปร | หน้าที่ |
| --- | --- |
| `POSTGRES_DB` | ชื่อฐานข้อมูล |
| `POSTGRES_USER` | ชื่อผู้ใช้ฐานข้อมูล |
| `POSTGRES_PASSWORD` | รหัสผ่านฐานข้อมูล |
| `JWT_SECRET` | ค่าสุ่มสำหรับลงนามโทเคนยืนยันตัวตน |
| `SEED_ADMIN_PASSWORD` | รหัสผ่านของผู้ดูแลระบบที่สร้างครั้งแรก |
| `DB_HOST_PORT` | พอร์ตฐานข้อมูลบนเครื่อง ค่าเริ่มต้นคือ `5432` |
| `APP_PORT` | พอร์ต API บนเครื่อง ค่าเริ่มต้นคือ `3000` |
| `FRONTEND_PORT` | พอร์ตเว็บไซต์บนเครื่อง ค่าเริ่มต้นคือ `8080` |
| `VITE_API_URL` | URL ของ API ที่ browser เข้าถึงได้ |

เปลี่ยนรหัสผ่านตัวอย่างและใช้ `JWT_SECRET` ที่ยาวและสุ่มขึ้นใหม่ หากชื่อผู้ใช้หรือรหัสผ่านฐานข้อมูลมีอักขระพิเศษของ URL ต้องเข้ารหัสอักขระเหล่านั้นในสตริงเชื่อมต่อ สำหรับการตั้งค่า Docker ที่นำค่ามาประกอบ URL โดยตรง ควรใช้ชื่อผู้ใช้และรหัสผ่านที่ประกอบด้วยอักขระที่ปลอดภัยสำหรับ URL

`VITE_API_URL` ต้องเป็นที่อยู่ที่เบราว์เซอร์เข้าถึงได้ หากเปลี่ยน `PORT` ของ API ให้แก้พอร์ตใน URL นี้ด้วย เมื่อนำขึ้นเซิร์ฟเวอร์ให้ใช้ URL ของ API ที่ผู้ใช้งานเข้าถึงได้ และสร้าง Frontend ใหม่ทุกครั้งที่เปลี่ยนค่านี้

เก็บข้อมูลลับไว้ใน `.env` และไม่นำไฟล์ `.env` จริงเข้า Git ให้เก็บเฉพาะ `.env.example` ที่ไม่มีข้อมูลลับ

### 3. สร้างและเปิดบริการ

```powershell
docker compose --env-file .env up -d --build
```

Compose จะรอ PostgreSQL ให้พร้อม จากนั้น service `migrate` จะ deploy Prisma migrations และ seed แบบแยกจาก API ก่อนเปิด Backend ส่วน Frontend จะเริ่มหลังจาก health check ของ API ผ่าน

### 4. เข้าใช้งาน

| บริการ | ที่อยู่เริ่มต้น |
| --- | --- |
| เว็บไซต์ | http://localhost:8080 |
| Backend API | http://localhost:3000/api |
| เอกสาร API | http://localhost:3000/api-docs |
| ตรวจสอบสถานะ API | http://localhost:3000/api/health |
| PostgreSQL | `localhost:5432` ใน local override เท่านั้น |

บัญชีผู้ดูแลระบบเริ่มต้นใช้อีเมล `admin@example.com` และรหัสผ่านจาก `SEED_ADMIN_PASSWORD` การเปลี่ยนตัวแปรนี้ภายหลังจะไม่เปลี่ยนรหัสผ่านของบัญชีที่มีอยู่แล้ว

ภายใน Docker ตัว API เชื่อมต่อฐานข้อมูลผ่าน `db:5432` โดย Compose จะกำหนด `DATABASE_URL` และพอร์ตภายใน API เป็น `3000` แทนค่าที่ใช้พัฒนาในเครื่อง ส่วน `DB_HOST_PORT` และ `PORT` ใช้กำหนดพอร์ตที่เปิดให้เข้าถึงจากเครื่องของคุณ

## จัดการบริการ

ตรวจสอบความถูกต้องของการตั้งค่า:

```powershell
docker compose --env-file .env config --quiet
```

ดูสถานะบริการ:

```powershell
docker compose --env-file .env ps
```

ดูบันทึกการทำงานของ API และเว็บไซต์ กด `Ctrl+C` เพื่อออกจากการดูบันทึก:

```powershell
docker compose -p onlinecomic --env-file BackEnd/.env --env-file FrontEnd/.env logs -f app frontend
```

หยุดและนำ container ของโปรเจกต์ออก:

```powershell
docker compose -p onlinecomic --env-file BackEnd/.env --env-file FrontEnd/.env down
```

## การเก็บข้อมูลและการย้ายจากการตั้งค่าเดิม

เมื่อใช้ชื่อโปรเจกต์ `onlinecomic` ตามตัวอย่าง ข้อมูล PostgreSQL จะอยู่ใน volume `onlinecomic_postgres-data` ส่วนไฟล์อัปโหลดอยู่ใน volume `onlinecomic_uploads-data` โดย service `uploads-permissions` จะซ่อมสิทธิ์ของ volume ทุกครั้งก่อนเริ่ม API เพื่อให้ container ที่ทำงานด้วย user ที่ไม่ใช่ root สามารถเขียนไฟล์ได้ รวมถึง volume ที่สร้างจาก deployment เดิม

คำสั่ง `down` ปกติจะเก็บข้อมูลเหล่านี้ไว้ แต่การเพิ่ม `--volumes` จะลบ volume ฐานข้อมูล จึงควรสำรองข้อมูลก่อนใช้

หากเคยเปิดระบบด้วยชื่อโปรเจกต์ `backend` และต้องการใช้ volume เดิม `backend_postgres-data` ให้เปลี่ยน `-p onlinecomic` เป็น `-p backend` ในทุกคำสั่ง หากเคยใช้ชื่ออื่น ให้ใช้ชื่อเดิมนั้นเพื่อเข้าถึง volume เดิม การเปลี่ยนชื่อโปรเจกต์จะทำให้ Compose ใช้ volume คนละชุด

หากยังเปิด Frontend แบบแยกอยู่ ให้หยุด container เดิมก่อนเพื่อหลีกเลี่ยงพอร์ตชนกัน หากใช้ชื่อ container เริ่มต้นเดิม สามารถหยุดได้ด้วย:

```powershell
docker stop frontend-frontend-1
```

## การพัฒนาในเครื่องโดยไม่ใช้ Docker

ดูวิธีติดตั้งและเปิดแต่ละส่วนได้จาก:

- [คู่มือ Backend](BackEnd/README.md)
- [คู่มือ Frontend](FrontEnd/README.md)

แต่ละส่วนมี Dockerfile และไฟล์ตั้งค่าของตนเอง สำหรับการพัฒนาโดยไม่ใช้ Docker ให้ตั้งค่าฐานข้อมูลของ Backend และ URL ของ API ใน Frontend ให้ตรงกับบริการที่เปิดในเครื่อง

## การจัดการซอร์สโค้ด

โปรเจกต์นี้ใช้ Git repository เดียวสำหรับ `FrontEnd/`, `BackEnd/` และการตั้งค่า Docker Compose ให้รันคำสั่ง Git จากโฟลเดอร์ราก และ clone repository เพียงครั้งเดียวเพื่อรับทั้งสองส่วน

หากมีโฟลเดอร์ `.git-backups/` จากการรวม repository เดิม โฟลเดอร์นี้เป็นข้อมูลสำรองในเครื่องและถูกยกเว้นจาก Git จึงไม่ถูกดาวน์โหลดมาด้วยเมื่อ clone ควรเก็บไว้จนกว่าจะไม่ต้องใช้ประวัติเดิมแล้ว