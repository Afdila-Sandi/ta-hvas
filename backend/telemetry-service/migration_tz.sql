-- Migration: Konversi kolom waktu dari TIMESTAMP ke TIMESTAMPTZ
-- Problem: waktu_mulai diinput dalam WIB (UTC+7) tapi disimpan tanpa timezone,
--          sehingga NOW() (UTC) membuat sesi aktif +7 jam lebih lama dari seharusnya.
-- Solusi: Konversi data existing dari asumsi WIB ke UTC, lalu ubah tipe kolom.

-- Konversi data existing dari asumsi WIB ke UTC (kurangi 7 jam)
UPDATE sampling SET waktu_mulai = waktu_mulai - INTERVAL '7 hours' WHERE waktu_mulai IS NOT NULL;
UPDATE sampling SET waktu_selesai = waktu_selesai - INTERVAL '7 hours' WHERE waktu_selesai IS NOT NULL;

-- Ubah tipe kolom ke TIMESTAMPTZ
ALTER TABLE sampling ALTER COLUMN waktu_mulai TYPE TIMESTAMPTZ;
ALTER TABLE sampling ALTER COLUMN waktu_selesai TYPE TIMESTAMPTZ;
