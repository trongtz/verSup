import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// 1. Khởi tạo Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [specialCode, setSpecialCode] = useState('')
  const [loading, setLoading] = useState(false)

  // HÀM ĐĂNG KÝ (Lưu trực tiếp vào Supabase)
  const handleSignUp = async () => {
    if (!userId || !password) return alert('Vui lòng nhập đủ ID và Pass')
    
    const { error } = await supabase
      .from('user')
      .insert([{ id: userId, password: password }])
    
    if (error) alert('Lỗi đăng ký: ' + error.message)
    else alert('Đăng ký thành công!')
  }

  // HÀM ĐĂNG NHẬP (Kết hợp Database + Server API)
  const handleLogin = async () => {
    setLoading(true)
    setSpecialCode('')

    // Bước A: Kiểm tra tài khoản trong Database
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      alert('Tài khoản không tồn tại!')
      setLoading(false)
      return
    }

    if (data.password !== password) {
      alert('Sai mật khẩu!')
      setLoading(false)
      return
    }

    // Bước B: Nếu đúng Pass, gọi lên "Server" (Vercel API) để tạo mã đặc biệt
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, password: password })
      });
      
      const result = await response.json()
      if (result.success) {
        setSpecialCode(result.code)
      } else {
        alert('Lỗi server: ' + result.message)
      }
    } catch (err) {
      alert('Không thể kết nối tới Server API!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '50px', maxWidth: '350px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>Hệ Thống Bảo Mật</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>ID người dùng:</label>
        <input 
          type="text" 
          placeholder="Nhập ID..." 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Mật khẩu:</label>
        <input 
          type="password" 
          placeholder="Nhập Password..." 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSignUp} style={{ flex: 1, padding: '10px', cursor: 'pointer' }}>
          Đăng ký
        </button>
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </div>

      {/* HIỂN THỊ KẾT QUẢ TỪ SERVER */}
      {specialCode && (
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
          <strong style={{ color: '#0369a1' }}>Mã xác thực đặc biệt (từ Server):</strong>
          <div style={{ 
            wordBreak: 'break-all', 
            marginTop: '10px', 
            fontSize: '14px', 
            color: '#1e40af',
            fontWeight: 'bold',
            background: 'white',
            padding: '10px'
          }}>
            {specialCode}
          </div>
          <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>
            * Mã này được tạo bằng logic cộng chuỗi trên Server.
          </small>
        </div>
      )}
    </div>
  )
}

export default App