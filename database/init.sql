-- Create mahasiswa table
CREATE TABLE IF NOT EXISTS mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(50) NOT NULL,
    angkatan VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO mahasiswa (nim, nama, jurusan, angkatan) VALUES
    ('2021001', 'Budi Santoso', 'Teknik Informatika', '2021'),
    ('2021002', 'Ani Wijaya', 'Sistem Informasi', '2021'),
    ('2022001', 'Citra Dewi', 'Teknik Komputer', '2022'),
    ('221110891', 'Regan Edric Onggatta', 'Teknik Informatika', '2022')
ON CONFLICT (nim) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON mahasiswa(nim);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_angkatan ON mahasiswa(angkatan);