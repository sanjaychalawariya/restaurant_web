import React, { useEffect, useState } from 'react'
import './Orders.css'

const Orders = ({ url = 'http://localhost:4000' }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('confirmed')

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const path = statusFilter && statusFilter !== 'all' ? `/api/orders/status/${statusFilter}` : '/api/orders'
      const res = await fetch(`${url}${path}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed to load orders')
      setOrders((data.orders || data) || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${url}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed to update status')
      // refresh list
      fetchOrders()
    } catch (e) {
      alert(e.message)
    }
  }

  const completeOrder = async (orderId) => {
    try {
      const res = await fetch(`${url}/api/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ completePayment: true })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed to complete order')
      fetchOrders()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className='orders-page'><p>Loading orders...</p></div>
  if (error) return <div className='orders-page'><p>{error}</p></div>

  return (
    <div className='orders-page'>
      <div className='orders-header'>
        <h2>Orders</h2>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            {['confirmed','pending','preparing','out_for_delivery','delivered','cancelled','all'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className='btn' onClick={fetchOrders}>Refresh</button>
        </div>
      </div>
      <div className='orders-table'>
        <div className='orders-row orders-row--head'>
          <div>ID</div>
          <div>Customer</div>
          <div>Status</div>
          <div>Total</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        {orders.map(o => (
          <div key={o._id} className='orders-row'>
            <div title={o._id}>#{o._id.slice(-6)}</div>
            <div>{o.userId?.username || 'Guest'}</div>
            <div className={`status ${o.orderStatus}`}>{o.orderStatus}</div>
            <div>${Number(o.finalAmount || o.totalAmount).toFixed(2)}</div>
            <div>{new Date(o.createdAt).toLocaleString()}</div>
            <div className='orders-actions'>
              <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)}>
                {['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button className='btn' onClick={() => completeOrder(o._id)}>Mark Delivered</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
