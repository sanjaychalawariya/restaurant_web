import React, { useEffect, useMemo, useState } from 'react'

const Dashboard = ({ url = 'http://localhost:4000' }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${url}/api/orders`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' }})
        const data = await res.json()
        if (data.success) setOrders(data.orders || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const kpis = useMemo(() => {
    const totalOrders = orders.length
    const confirmed = orders.filter(o => o.orderStatus === 'confirmed').length
    const delivered = orders.filter(o => o.orderStatus === 'delivered').length
    const revenue = orders.reduce((sum, o) => sum + Number(o.finalAmount || o.totalAmount || 0), 0)
    return { totalOrders, confirmed, delivered, revenue }
  }, [orders])

  return (
    <div className='dashboard'>
      <h2>Dashboard</h2>
      {loading ? <p>Loading...</p> : (
        <div className='kpi-grid'>
          <div className='kpi-card'>
            <h3>Total Orders</h3>
            <p>{kpis.totalOrders}</p>
          </div>
          <div className='kpi-card'>
            <h3>Confirmed</h3>
            <p>{kpis.confirmed}</p>
          </div>
          <div className='kpi-card'>
            <h3>Delivered</h3>
            <p>{kpis.delivered}</p>
          </div>
          <div className='kpi-card'>
            <h3>Total Revenue</h3>
            <p>${kpis.revenue.toFixed(2)}</p>
          </div>
        </div>
      )}
      <div className='quick-links'>
        <a className='btn' href='/orders'>View Orders</a>
        <a className='btn' href='/list'>Manage Menu</a>
        <a className='btn' href='/add'>Add Item</a>
      </div>
    </div>
  )
}

export default Dashboard



