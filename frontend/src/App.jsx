//App.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "/api";

function App() {
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    jurusan: "",
    angkatan: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const fetchMahasiswa = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/mahasiswa`);
      setMahasiswaList(response.data);
      setError("");
    } catch (err) {
      setError("Gagal mengambil data mahasiswa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editId) {
        await axios.put(`${API_URL}/mahasiswa/${editId}`, formData);
      } else {
        await axios.post(`${API_URL}/mahasiswa`, formData);
      }
      setFormData({ nim: "", nama: "", jurusan: "", angkatan: "" });
      setEditId(null);
      fetchMahasiswa();
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menyimpan data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mahasiswa) => {
    setFormData({
      nim: mahasiswa.nim,
      nama: mahasiswa.nama,
      jurusan: mahasiswa.jurusan,
      angkatan: mahasiswa.angkatan,
    });
    setEditId(mahasiswa.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/mahasiswa/${id}`);
        fetchMahasiswa();
        setError("");
      } catch (err) {
        setError("Gagal menghapus data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ nim: "", nama: "", jurusan: "", angkatan: "" });
    setEditId(null);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📚Daftar Data Mahasiswa</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="form-container">
          <h2>{editId ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>NIM:</label>
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleInputChange}
                required
                placeholder="Masukkan NIM"
              />
            </div>

            <div className="form-group">
              <label>Nama:</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                placeholder="Masukkan Nama"
              />
            </div>

            <div className="form-group">
              <label>Jurusan:</label>
              <input
                type="text"
                name="jurusan"
                value={formData.jurusan}
                onChange={handleInputChange}
                required
                placeholder="Masukkan Jurusan"
              />
            </div>

            <div className="form-group">
              <label>Angkatan:</label>
              <input
                type="text"
                name="angkatan"
                value={formData.angkatan}
                onChange={handleInputChange}
                required
                placeholder="Masukkan Angkatan"
              />
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {editId ? "Update" : "Tambah"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-container">
          <h2>Daftar Mahasiswa</h2>
          {loading && <p>Loading...</p>}
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama</th>
                <th>Jurusan</th>
                <th>Angkatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mahasiswaList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Belum ada data mahasiswa
                  </td>
                </tr>
              ) : (
                mahasiswaList.map((mahasiswa, index) => (
                  <tr key={mahasiswa.id}>
                    <td>{index + 1}</td>
                    <td>{mahasiswa.nim}</td>
                    <td>{mahasiswa.nama}</td>
                    <td>{mahasiswa.jurusan}</td>
                    <td>{mahasiswa.angkatan}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(mahasiswa)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mahasiswa.id)}
                        className="btn-delete"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
