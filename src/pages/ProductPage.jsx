import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";
import DelProductModal from "../components/DelProductModal";


const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

//Modal 狀態的預設值
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};


function ProductPage(){

  const [products, setProducts] = useState([]);
  
  //預設為 null，新增為 create，編輯為 edit
  const [modalMode, setModalMode] = useState(null);


  //控制產品modal是否開啟，預設關閉
  const[isProductModalOpen,setIsProductModalOpen] = useState(false);
  //控制 DelProductMod 控制是否開啟，預設關閉
  const[isDelProductModalOpen,setIsDelProductModalOpen] = useState(false);


  //若沒有帶入參數，則頁碼預設為1，URL也帶入頁碼?page=${page}，page是六角API的參數
  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(res.data.products);
      //pagination是API回傳的物件，裡面有total、per_page、current_page、last_page、from、to等屬性，可以在F12的Components看到
      setPageInfo(res.data.pagination);
      //console.log(res.data)
    } catch (error) {
      alert("取得產品失敗");
    }
  };

  useEffect(() => {
    getProducts();
  },[])
  

const handleOpenDelProductModal = (product) => {
  setTempProduct(product);
  setIsDelProductModalOpen(true);
}

const [tempProduct, setTempProduct] = useState(defaultModalState);

  //透過Modal.getInstance(ref).show來開啟modal
  const handleOpenProductModal = (Mode,product) => {
    //打開modal前就更新(渲染)modal資料，才能接著判斷是新增或編輯產品
    setModalMode(Mode);
    //判斷為新增或編輯按鈕事件，此處用switch也可以用 if else
    switch(Mode){
      case "create":
        setTempProduct(defaultModalState) //若為新增，傳入預設值：空白modal
        break;
      case "edit":
        setTempProduct(product) //若為編輯，傳入該產品的值(資料欄位)，再進行編輯
        break;
      default:
        break
    }
    
    setIsProductModalOpen(true);
  }






  //分頁資訊
  const [pageInfo, setPageInfo] = useState({});

  const handlePageChange=(page)=>{
    getProducts(page);
  }
  return(
    <>
      <div className="container py-5">
        <div className="row">
          <div className="col">
            <div className="d-flex justify-content-between">
            <h2>產品列表</h2>
              {/*產品modal-7：將開啟modal加入點擊事件,因為是新增傳入新增變數
                判斷當前動作是哪個modal-2：帶入參數 */}
            <button onClick={()=>handleOpenProductModal("create")} type="button" className="btn btn-primary">建立新的產品</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>{product.is_enabled ? ( <span className="text-success">啟用</span>) : <span>未啟用</span>}</td>
                    <td>
                      
                    <div className="btn-group">
                    {/*產品modal-7：將開啟modal加入編輯按鈕的點擊事件,因為是編輯傳入編輯變數,
                    判斷當前動作是哪個modal-2：帶入參數 */}
                      <button  onClick={()=>handleOpenProductModal("edit",product)} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                      <button onClick={()=>handleOpenDelProductModal(product)} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                 
        </div>
        <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange}/>

      </div>

     <ProductModal 
        tempProduct={tempProduct} 
        getProducts={getProducts}
        modalMode={modalMode} 
        isOpen={isProductModalOpen} 
        setIsOpen={setIsProductModalOpen}
        
     />
     
     {/* tempProduct={tempProduct}：需要知道刪除哪筆資料 */}
     <DelProductModal 
     tempProduct={tempProduct}
     getProducts={getProducts}
     isOpen={isDelProductModalOpen} 
     setIsOpen={setIsDelProductModalOpen}
     />
    </>
  )
}


export default ProductPage;