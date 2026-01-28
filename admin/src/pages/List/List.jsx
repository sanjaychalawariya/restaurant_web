import React, { useEffect, useState } from 'react'
import './List.css'
import { toast } from 'react-toastify'
import axios from 'axios'

const List = ({url}) => {
  // const API_url = "http://localhost:4000"
  const [list, setList] = useState([])

  // Fetch food list
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`)
      if (response.data.success) {
        setList(response.data.data)
      } else {
        toast.error("Failed to fetch list")
      }
    } catch (error) {
      toast.error("Error fetching data")
      console.error(error)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  // Delete item handler
const handleDelete = async (foodId) => {
  try {
    const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
    if (response.data.success) {
      toast.success("Food removed successfully");
      fetchList();
    } else {
      toast.error("Failed to remove food");
    }
  } catch (error) {
    toast.error("Error removing food");
    console.error(error);
  }
};


  return (
    <div className='list add flex-col'>
      <p>All Food List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item) => (
          <div key={item._id} className="list-table-format">
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.price}</p>
            <p className="delete-btn" onClick={() => handleDelete(item._id)}>X</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default List
