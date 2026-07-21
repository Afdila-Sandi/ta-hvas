CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    peran VARCHAR(50) CHECK (peran IN ('teknisi', 'admin', 'penyelia')) NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT DEFAULT NULL
);

INSERT INTO users (username, password_hash, nama, peran)
VALUES (
    'admin', 
    '$2b$10$M0gyKlb8zgfPk3OAeriw/ORJ5LR71iZv1sPHty3TXIHh3XqEpZsWS', 
    'Admin', 
    'admin'
) ON CONFLICT (username) DO NOTHING;