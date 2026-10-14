# Webproject Frontend

เว็บอ่านการ์ตูนภาษาไทย พัฒนาด้วย React และ Vite เชื่อมต่อ backend API สำหรับบัญชีผู้ใช้ การ์ตูน และการซื้อเหรียญ

## ความสามารถหลัก

- ค้นหาการ์ตูนและผู้แต่ง ดูรายละเอียดการ์ตูน และอ่านรายตอน
- ให้คะแนน แสดงความคิดเห็น เพิ่มรายการโปรด และติดตามการ์ตูน
- ดูประวัติการอ่าน การแจ้งเตือน และโปรไฟล์ส่วนตัวหรือสาธารณะ
- เลือกแพ็กเกจเหรียญ ชำระเงินผ่าน QR Code แนบสลิป และดูประวัติเหรียญ
- จัดการการ์ตูนและตอน รวมถึงหน้าผู้ดูแลระบบสำหรับผู้ใช้ แพ็กเกจ และวิธีชำระเงิน

## เทคโนโลยี

React 19, React Router 7, Vite 8, Tailwind CSS 4 และ Axios ใช้ JavaScript แบบ ES modules และตรวจโค้ดด้วย ESLint

## เริ่มต้นใช้งาน

ใช้ Node.js 24 พร้อม npm และเปิด backend API แยกจาก frontend

หากยังไม่มี `.env` ให้คัดลอกจาก `.env.example` ที่รากโปรเจกต์:

```powershell
Copy-Item .env.example .env
```

สำหรับ macOS/Linux ใช้ `cp .env.example .env` จากนั้นติดตั้ง dependencies และเปิด dev server:

```sh
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal โดยทั่วไปคือ `http://localhost:5173`

### ตั้งค่า API

ตั้งค่าใน `.env` ซึ่งใช้ร่วมกันได้ทั้งการพัฒนาในเครื่องและ Docker Compose:

```dotenv
FRONTEND_PORT=8080
VITE_API_URL=http://localhost:3000/api
```

| ตัวแปร | หน้าที่ | ค่าเริ่มต้น |
| --- | --- | --- |
| `FRONTEND_PORT` | พอร์ตบนเครื่องสำหรับ Docker Compose ไม่เปลี่ยนพอร์ต Vite | `8080` |
| `VITE_API_URL` | URL ของ backend API ที่ browser เข้าถึงได้ | `http://localhost:3000/api` |

หลังเปลี่ยนค่าให้เริ่ม dev server ใหม่ ส่วน Docker ต้อง build image ใหม่เมื่อเปลี่ยน URL ของ API
หากมี `.env.local` อยู่ Vite อาจใช้ค่าจากไฟล์นั้นแทน `.env` แต่ Compose ใช้ `.env` ตามค่าเริ่มต้น
ไฟล์ `.env` ถูกละเว้นโดย Git ใช้ `.env.example` เป็นตัวอย่างสำหรับทีม
ตัวแปร `VITE_*` ถูกส่งไปยัง browser จึงใช้สำหรับค่าฝั่ง frontend เช่น URL ไม่ใช่ข้อมูลลับ

API ใช้ Axios client ใน [src/api/client.js](src/api/client.js) โดยส่ง access token และจัดการ refresh token ให้อัตโนมัติ ระบบเก็บ token ใน `localStorage`

ขณะพัฒนา Vite proxy เฉพาะ `/uploads` ไปยัง backend เพื่อโหลดรูป ส่วนคำขอ API ส่งไปยัง `VITE_API_URL` โดยตรง จึงต้องตั้งค่า CORS ฝั่ง backend ให้รองรับ origin ของ frontend

## คำสั่ง

| คำสั่ง | หน้าที่ |
| --- | --- |
| `npm ci` | ติดตั้ง dependency ตาม `package-lock.json` |
| `npm run dev` | เปิด dev server |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |
| `npm test` | รัน unit tests และทดสอบการ render components ด้วย Vitest |
| `npm run build` | สร้างไฟล์ production ใน `dist/` |
| `npm run preview` | เปิดดู production build ในเครื่องหลังสั่ง build |

รัน `npm test` เพื่อทดสอบการแปลงข้อมูลรายการ Wallet การจัดรูปแบบราคาและวันที่ ข้อมูลการ์ตูน ข้อความข้อผิดพลาด และการ render components โดยใช้ Vitest โหลด JSX สำหรับทดสอบสถานะ loading/error ปุ่มชำระเงิน ฟอร์มค้นหา และ dialog โดยไม่ต้องเปิด backend ก่อนส่งงานให้ตรวจ lint และ build พร้อมลอง flow ที่แก้ไขกับ backend รวมถึงการโฟกัสและปิด dialog ด้วยปุ่ม Escape ใน browser

## SonarQube coverage

Run these steps from the project root, in order:

```sh
npm ci
npm run sonar:prepare
# After the command succeeds, run your existing SonarQube scanner command.
```

`sonar:prepare` runs all tests with coverage and validates `coverage/lcov.info`, the report configured in `sonar-project.properties`. Validation requires covered source lines, checks every source path, and normalizes Windows separators to `/` for Linux/Docker scanners. `npm run test:coverage` performs the same steps. Open `coverage/index.html` for the detailed local report.

Wait for coverage generation to finish before scanning. Vitest clears the previous report when a coverage run starts, so an interrupted or concurrent run can leave the scanner without an LCOV file. `npm test` alone does not generate coverage.

If scanning in Docker, mount the entire project root **including the generated `coverage/` directory** into the scanner workspace. The application Docker image does not contain coverage (`.dockerignore` excludes it). In CI, generate coverage in the scanner job or transfer `coverage/lcov.info` as an artifact before scanning; the report is intentionally not tracked in Git.

Coverage includes all JavaScript and JSX source files, including untested files. The local report measures the whole project; SonarQube's **new coverage** uses its configured new-code baseline and also accounts for conditions. Local line coverage alone does not prove the quality gate passes. The dashboard updates only after a fresh analysis.

If SonarQube still reports 0%, check the scanner log for LCOV import messages, missing report files, or unresolved source paths, and confirm the scanner uses this project root and `sonar.javascript.lcov.reportPaths=coverage/lcov.info`.

## โครงสร้างโปรเจกต์

```text
public/             ไฟล์ static ที่เข้าถึงได้โดยตรง
src/
  api/              API client และ API ที่ใช้ข้ามฟีเจอร์
  assets/           รูปและไฟล์ที่ import ผ่าน bundler
  components/       UI ที่ใช้ร่วมกัน
  pages/            หน้าเว็บ แบ่งตามฟีเจอร์
  utils/            ฟังก์ชันช่วยที่ใช้ร่วมกัน
  App.jsx           Routes และสถานะ session ระดับแอป
  main.jsx          จุดเริ่มต้น React
  index.css         CSS ส่วนกลาง
vite.config.js      Vite plugins และ proxy สำหรับรูปอัปโหลด
Dockerfile          Build ด้วย Node.js และเสิร์ฟ production ด้วย Nginx
docker-compose.yml  กำหนด service frontend, build arguments และพอร์ต
nginx.conf          Static hosting, React Router fallback และ health check
.dockerignore       ตัด dependencies, build เดิม และไฟล์ environment ออกจาก build context
.env.example        ตัวอย่างการตั้งค่า API และพอร์ต Docker
```

อ่านรายละเอียดที่ [โครงสร้าง source](src/README.md) และ [แนวทางจัดไฟล์หน้าเว็บ](src/pages/README.md)

## การชำระเงินในปัจจุบัน

เลือกแพ็กเกจที่ `/coin-purchase` แล้วไป `/payment?packageId=...` เพื่อสร้างรายการและ QR Code ผู้ใช้แนบสลิป ตรวจสอบสถานะ หรือยกเลิกรายการได้

เมื่อออกจากหน้าชำระเงิน ระบบส่งคำขอยกเลิกรายการที่ยัง pending รวมถึงเมื่อ refresh หรือปิดหน้า browser การส่งคำขอขณะปิดหน้าเป็นแบบ best effort จึงขึ้นกับการส่งถึง backend ด้วย การยืนยันผลและการเพิ่มเหรียญเป็นหน้าที่ของ backend

## นำขึ้นใช้งาน

ตั้ง `VITE_API_URL` ให้ถูกต้องก่อน `npm run build` แล้วนำไฟล์ใน `dist/` ไปยัง static hosting ค่า environment ถูกใช้ตอน build หากเปลี่ยนปลายทาง API ต้อง build ใหม่

ตั้ง hosting ให้ส่ง `index.html` สำหรับ URL ของหน้าเว็บที่ไม่มีไฟล์ตรงกัน เพื่อรองรับ React Router เช่น การเปิด `/profile` โดยตรง และให้ backend รองรับ CORS กับการโหลดไฟล์อัปโหลดจาก frontend จริง

## รันด้วย Docker Compose

เปิด Docker Desktop ในโหมด Linux containers หรือใช้ Docker Engine พร้อม Compose plugin บน Linux
เตรียม `.env` ตามขั้นตอนด้านบน แล้วรันจากรากโปรเจกต์ คำสั่งนี้ใช้ [docker-compose.yml](docker-compose.yml):

```sh
docker compose up -d --build
```

เข้าเว็บที่ `http://localhost:8080` และหยุดด้วย `docker compose down`
Dockerfile ใช้ Node.js build frontend แล้วใช้ Nginx เสิร์ฟไฟล์ พร้อม fallback สำหรับ React Router และ health check ที่ `/health`

Compose นี้รันเฉพาะ frontend ต้องเปิด backend แยกต่างหาก ค่าเริ่มต้น API คือ `http://localhost:3000/api` ซึ่ง browser เป็นผู้เรียก จึงหมายถึงเครื่องของผู้เปิดเว็บ ไม่ใช่ container ตั้ง CORS ฝั่ง backend ให้รองรับ `http://localhost:8080` และอนุญาตการโหลดรูปอัปโหลดจาก origin นี้

หากนำขึ้นเซิร์ฟเวอร์ ให้แก้ `.env` เป็น URL ของ backend จริง เช่น:

```dotenv
FRONTEND_PORT=8080
VITE_API_URL=https://api.example.com/api
```

ใช้ URL ของ backend ที่ browser เข้าถึงได้ เมื่อเปลี่ยน `VITE_API_URL` ให้รัน `docker compose up -d --build` อีกครั้ง เพราะค่านี้ถูกฝังตอน build ไฟล์ `.env*` ถูกตัดออกจาก build context โดยส่ง URL ผ่าน build argument แทน

| คำสั่ง | หน้าที่ |
| --- | --- |
| `docker compose up -d --build` | Build และเปิด frontend เบื้องหลัง |
| `docker compose ps` | ตรวจสถานะ container และ health check |
| `docker compose logs -f frontend` | ดู log ของ Nginx |
| `docker compose down` | หยุดและลบ container ของ Compose |

ตรวจว่าเว็บทำงานด้วยการเปิด `http://localhost:8080/health` ซึ่งควรแสดง `ok` และลองเปิด `/profile` โดยตรงเพื่อทดสอบ React Router fallback

## แก้ปัญหาเบื้องต้น

- โหลดข้อมูลไม่ได้: ตรวจว่า backend เปิดอยู่ และตรวจ URL กับ CORS ในแท็บ Network
- รูปอัปโหลดไม่ขึ้น: ตรวจ `/uploads` และค่า `VITE_API_URL` ใน [vite.config.js](vite.config.js)
- เปลี่ยน `.env` แล้วยังใช้ค่าเดิม: เริ่ม dev server ใหม่ หรือลอง `docker compose up -d --build` สำหรับ Docker และตรวจว่ามี `.env.local` ทับค่าขณะพัฒนาหรือไม่
- พอร์ต Docker ถูกใช้งาน: เปลี่ยน `FRONTEND_PORT` ใน `.env` แล้วรัน `docker compose up -d` และปรับ CORS ของ backend ให้ตรงกับ origin ใหม่
- Refresh หน้าย่อยแล้วพบ 404 บน hosting: ตรวจการตั้งค่า fallback ไป `index.html`
