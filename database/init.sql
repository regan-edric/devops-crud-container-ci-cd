-- Create mahasiswa table
CREATE TABLE IF NOT EXISTS mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(50) NOT NULL,
    angkatan VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON mahasiswa(nim);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_angkatan ON mahasiswa(angkatan);