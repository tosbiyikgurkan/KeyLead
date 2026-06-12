# KeyLead

Sektör, lokasyon ve anahtar kelime ile potansiyel müşteri lead'lerini keşfedin; iletişim bilgileri, proje lokasyonlarını portföyünüze kaydedin.

## Özellikler

- **Sektör seçimi** — İnşaat, GES, emlak, otel ve daha fazlası
- **81 il + Tüm Türkiye** araması
- **Anahtar kelime** ile filtreleme
- **GES modu** — Güneş santrali konumu, işletmeci şirket, telefon
- **Portföy yönetimi** — Kayıt, proje notları, durum takibi
- **Google Places API** (opsiyonel) veya ücretsiz OpenStreetMap

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Google Places API (opsiyonel)

`.env.local` dosyasına ekleyin:

```
GOOGLE_PLACES_API_KEY=anahtariniz
```

## GitHub'a Yükleme

### 1. GitHub'da repo oluşturun

1. [github.com/new](https://github.com/new) adresine gidin
2. Repository name: `KeyLead`
3. **Public** veya **Private** seçin
4. **Create repository** — README eklemeyin (projede zaten var)

### 2. Projeyi git ile bağlayın

Terminalde proje klasöründe:

```bash
cd /home/gurkan/Desktop/yeni

git init
git add .
git commit -m "Initial commit: KeyLead lead keşif platformu"

git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/KeyLead.git
git push -u origin main
```

`KULLANICI_ADINIZ` yerine kendi GitHub kullanıcı adınızı yazın.

### 3. GitHub CLI ile (alternatif)

```bash
gh auth login
gh repo create KeyLead --public --source=. --remote=origin --push
```

### Önemli güvenlik notları

- `.env.local` dosyası **asla** GitHub'a yüklenmez (`.gitignore`'da)
- API anahtarlarınızı commit etmeyin
- Sadece `.env.example` şablonu repoda kalır

## Teknolojiler

- Next.js 16 + TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- Google Places API / OpenStreetMap

## Lisans

Private proje — kullanım hakları size aittir.
