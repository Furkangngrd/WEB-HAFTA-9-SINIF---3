# 🚀 SecScan & Web Security Lab Makale Dokümanları

Bu depo, web güvenliği üzerine hazırlanmış 10 farklı görev (dokümantasyon) ve tam kapsamlı modern bir güvenlik tarayıcı (SecScan) uygulamasını içermektedir. Hem teorik makale dokümanları hem de pratik kod uygulamaları bu depo altında organize edilmiştir.

### 👤 Geliştirici Bilgileri
- **Ad Soyad:** Muhammed Furkan Güngördü
- **Öğrenci No:** 24080410024

---

## 📂 Proje Yapısı

Bu depo iki ana kısımdan oluşmaktadır:

### 1. 📖 Güvenlik Görevleri (Dokümantasyon)
Web uygulamalarında sıkça karşılaşılan zafiyetler ve modern güvenlik kontrolleri üzerine hazırlanmış uygulamalı senaryolardan oluşmaktadır.

* **`gorev-01/`** - **`gorev-10/`**: Web güvenliğinin temellerinden başlayıp SSRF, XSS, SQLi gibi açıkları analiz eden ve çözüm önerileri sunan laboratuvar görevleri.

### 2. 🛡️ SecScan Uygulaması (`secscan/`)
SecScan, modern teknolojilerle geliştirilmiş, modüler ve güvenli bir **Web Security Scanner (Web Güvenlik Tarayıcı)** uygulamasıdır.

- **Frontend (Arayüz):** Modern, duyarlı (responsive) tasarım ve Server-Sent Events (SSE) kullanılarak oluşturulmuş, canlı tarama ilerlemeleri sunan **Next.js & Tailwind CSS** uygulaması.
- **Backend (API):** Hızlı, asenkron modüller çalıştıran ve port, HTTP başlığı, TLS, XSS, SQLi kontrollerini gerçekleştiren **Go & Gin** uygulaması.
- **Konteyner Desteği:** Sistemdeki modüller `docker-compose.yml` kullanılarak kolaylıkla ayağa kaldırılabilir.

---

## 🛠️ SecScan Nasıl Çalıştırılır?

Tüm projeyi anında başlatmak için **Docker Desktop**'ın çalıştığından emin olduktan sonra terminalde aşağıdaki komutları girmeniz yeterlidir:

```bash
cd secscan
docker-compose up --build -d
```
Ardından tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek SecScan arayüzüne ulaşabilirsiniz. (Backend API `8080` portunda yayındadır.)

---

## 🔐 Güvenlik Vurgusu
*SecScan platformu ve buradaki laboratuvar görevleri, tamamen etik hacker'lık prensiplerine uygun, eğitim ve defansif güvenlik sistemleri kurma amacıyla geliştirilmiştir.*
