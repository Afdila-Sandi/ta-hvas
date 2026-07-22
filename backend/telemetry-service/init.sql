CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    waktu TIMESTAMP WITH TIME ZONE NOT NULL,
    suhu_bme NUMERIC(5,2),
    kelembaban_bme NUMERIC(5,2),
    tekanan NUMERIC(6,2),
    status_pompa VARCHAR(10),
    suhu_dht NUMERIC(5,2),
    kelembaban_dht NUMERIC(5,2),
    kebisingan NUMERIC(5,2)
);

CREATE TABLE IF NOT EXISTS sampling (
    id SERIAL PRIMARY KEY,
    teknisi_id INTEGER NOT NULL,
    nama_teknisi VARCHAR(100) NOT NULL,
    tempat_sampling VARCHAR(255) NOT NULL,
    parameter_uji VARCHAR(255) NOT NULL,
    perusahaan VARCHAR(255) NOT NULL,
    kondisi_cuaca VARCHAR(100) NOT NULL,
    waktu_mulai TIMESTAMPTZ NOT NULL,
    waktu_selesai TIMESTAMPTZ,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);