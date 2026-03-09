export default function Services() {
  return (
    <section id="services" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-10 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Dịch Vụ <span className="gold">Cao Cấp</span>
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-20">
          Chúng tôi mang đến những dịch vụ chăm sóc tóc chất lượng nhất,
          giúp quý ông luôn tự tin và phong độ.
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="border border-white/10 p-10 text-left">
            <h3 className="text-2xl font-semibold mb-4">Cắt Tóc Nam</h3>
            <p className="text-gray-400 mb-10">
              Kiểu tóc phù hợp với khuôn mặt và phong cách riêng
            </p>
            <div className="flex justify-between text-sm">
              <span className="gold text-lg font-semibold">70.000đ</span>
              <span className="text-gray-500">30 phút</span>
            </div>
          </div>

          <div className="border border-white/10 p-10 text-left">
            <h3 className="text-2xl font-semibold mb-4">Uốn Tóc</h3>
            <p className="text-gray-400 mb-10">
              Uốn tóc thời trang, giữ nếp lâu và an toàn cho tóc
            </p>
            <div className="flex justify-between text-sm">
              <span className="gold text-lg font-semibold">
                từ 150.000đ
              </span>
              <span className="text-gray-500">60 phút</span>
            </div>
          </div>

          <div className="border border-white/10 p-10 text-left">
            <h3 className="text-2xl font-semibold mb-4">Nhuộm Tóc</h3>
            <p className="text-gray-400 mb-10">
              Nhuộm tóc với màu thời trang, thuốc nhuộm an toàn
            </p>
            <div className="flex justify-between text-sm">
              <span className="gold text-lg font-semibold">
                từ 200.000đ
              </span>
              <span className="text-gray-500">60 phút</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
