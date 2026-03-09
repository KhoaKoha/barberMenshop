import { useState, useEffect } from "react";
import axios from "axios";

export default function BarberManager() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    status: "active",
    image: null,
  });

  useEffect(() => {
    const fn = async () => {
      await fetchBarbers();
    };
    fn();
  }, []);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      // const res = await axios.get("http://localhost:3001/api/barbers");
      // setBarbers(res.data);
      
      // Mock data for now
      setBarbers([
        { id: 1, name: "Nguyễn Hoàng Phong", phone: "0901234567", status: "active", image: null },
        { id: 2, name: "Trần Minh Tuấn", phone: "0912345678", status: "active", image: null },
        { id: 3, name: "Lê Xuân Vũ", phone: "0923456789", status: "inactive", image: null },
      ]);
    } catch (err) {
      console.error("Error fetching barbers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBarber(null);
    setForm({ name: "", phone: "", status: "active", image: null });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (barber) => {
    setEditingBarber(barber);
    setForm({
      name: barber.name,
      phone: barber.phone,
      status: barber.status,
      image: barber.image || null,
    });
    setImagePreview(barber.image || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thợ cắt tóc này?")) return;

    try {
      // TODO: Replace with actual API endpoint
      // await axios.delete(`http://localhost:3001/api/barbers/${id}`);
      setBarbers(barbers.filter((b) => b.id !== id));
      alert("Xóa thành công");
    } catch (err) {
      alert("Lỗi khi xóa");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setForm({ ...form, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBarber) {
        // TODO: Replace with actual API endpoint
        // await axios.put(`http://localhost:3001/api/barbers/${editingBarber.id}`, form);
        setBarbers(
          barbers.map((b) =>
            b.id === editingBarber.id ? { ...editingBarber, ...form } : b
          )
        );
        alert("Cập nhật thành công");
      } else {
        // TODO: Replace with actual API endpoint
        // const res = await axios.post("http://localhost:3001/api/barbers", form);
        const newBarber = {
          id: barbers.length + 1,
          ...form,
        };
        setBarbers([...barbers, newBarber]);
        alert("Thêm thành công");
      }
      setShowModal(false);
      setImagePreview(null);
    } catch (err) {
      alert("Lỗi khi lưu");
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
        Đang làm việc
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
        Nghỉ việc
      </span>
    );
  };

  const getPlaceholderImage = () => {
    return (
      <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500 text-lg font-semibold">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    );
  };

  const renderBarberImage = (image) => {
    if (image) {
      return (
        <img
          src={image}
          alt="Barber"
          className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
        />
      );
    }
    return getPlaceholderImage();
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý thợ cắt tóc</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-[#d4a441] text-black font-medium rounded-lg hover:bg-[#c49431] transition-colors"
        >
          + Thêm thợ
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider w-20">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Tên thợ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-400">
                    Đang tải...
                  </td>
                </tr>
              ) : barbers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-400">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                barbers.map((barber) => (
                  <tr
                    key={barber.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderBarberImage(barber.image)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {barber.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300">{barber.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(barber.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(barber)}
                          className="text-[#d4a441] hover:text-[#c49431] transition-colors"
                        >
                          Sửa
                        </button>
                        <span className="text-zinc-600">|</span>
                        <button
                          onClick={() => handleDelete(barber.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBarber ? "Sửa thợ cắt tóc" : "Thêm thợ cắt tóc"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                      />
                    ) : (
                      getPlaceholderImage()
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm hover:bg-zinc-700 transition-colors text-center">
                        {imagePreview ? "Đổi ảnh" : "Chọn ảnh"}
                      </div>
                    </label>
                    <p className="text-xs text-zinc-500 mt-1">
                      JPG, PNG (tối đa 5MB)
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tên thợ
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#d4a441]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#d4a441]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#d4a441]"
                >
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Nghỉ việc</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#d4a441] text-black rounded-lg hover:bg-[#c49431] transition-colors font-medium"
                >
                  {editingBarber ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
