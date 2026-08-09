import { useParams } from 'react-router-dom'

function ProductDetail() {
  const params = useParams()
  const productId = params.productId
  return (
    <>
      <h1>Product Detail</h1>
      <p>当前产品ID: {productId}</p>
    </>
  )
}

export default ProductDetail