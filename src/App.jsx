import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Modal } from 'bootstrap'; 

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

function App() {
  const [isAuth, setIsAuth] = useState(false);

  const [products, setProducts] = useState([]);

  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };
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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);

      const { token, expired } = res.data;
      document.cookie = `angelaToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common["Authorization"] = token;

      getProducts();

      setIsAuth(true);
      
    } catch (error) {
      alert("登入失敗");
    }
  };
   //檢查使用者是否已登入
  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);     
      //取得產品資料
      getProducts();
      //登入頁面是根據isAuth來渲染，所以使用setIsAuth(true)，讓使用者登入後即顯示產品頁面
      setIsAuth(true);
     
    } catch (error) {
      console.error(error);
    }
  };
    //只需要執行一次登入驗證API，所以不需要傳入參數，為空陣列
  useEffect(() => {
    //把token存在cookie
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)angelaToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    //將token帶到axios上
    axios.defaults.headers.common['Authorization'] = token;
    //執行checkUserLogin來戳API
    checkUserLogin();
   
  },[])

  //透過 useRef 取得 DOM 元素，預設值為 null
  const productModalRef = useRef(null);

  const delProductModalRef = useRef(null);
  //預設為 null，新增為 create，編輯為 edit
  const [modalMode, setModalMode] = useState(null);
  
  useEffect(() => {
    
    //建立 Modal 實例,可透過 new Modal(ref) 建立
    new Modal(productModalRef.current,{
      //在modal外的空白處點擊不會關閉modal
      backdrop: false
    });
    //撰寫 Modal 開關方法,可透過 Modal.getInstance(ref) 取得實例
    new Modal(delProductModalRef.current,{
      //在modal外的空白處點擊不會關閉modal
      backdrop: false
    })
    
  },[]);

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
    
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  }
 //透過Modal.getInstance(ref).hide來關閉
 const handleCloseproductModal = () => {
  const modalInstance = Modal.getInstance(productModalRef.current);
  modalInstance.hide();
}


const handleOpenDelProductModal = (product) => {
  setTempProduct(product);
  const modalInstance = Modal.getInstance(delProductModalRef.current);
  modalInstance.show();
}

const handleCloseDelProductModal = () => {
  const modalInstance = Modal.getInstance(delProductModalRef.current);
  modalInstance.hide();
}


const [tempProduct, setTempProduct] = useState(defaultModalState);


const handleModalInputChange = (e) => {
  //value：綁定 input 的值，checked：綁定 input 是否勾選的狀態，type：綁定 input 的類型是否為checkbox
  const { value, name, checked, type } = e.target;
  //透過對應的 name 修改欄位的值
  setTempProduct({
    ...tempProduct,
    //若type為checkbox，則將checked的值帶入，否則帶入value的值
    [name]: type === "checkbox" ? checked : value
  })
}

//多筆欄位，需要判斷是哪一筆陣列(副圖)在更新圖片,所以帶入index
const handleImageChange=(e,index)=>{
  const { value } = e.target;
  //將tempProduct.imagesUrl的值複製一份
  const newImages = [...tempProduct.imagesUrl];
  //透過index來更新對應的圖片的值
  newImages[index] = value;
  setTempProduct({
    ...tempProduct,
    imagesUrl: newImages
  })

}
//新增圖片
const handleAddImage=()=>{
  //複製一個Images陣列，並在最後一個位置加入空字串
  const newImages = [...tempProduct.imagesUrl,""];
  
  setTempProduct({
    ...tempProduct,
    imagesUrl: newImages
  })
}

  //取消圖片
  const handleRemoveImage=()=>{
    const newImages = [...tempProduct.imagesUrl];
    
    //從陣列最後一個值移除
    newImages.pop();

    ProductsetTemp({
      ...tempProduct,
      imagesUrl: newImages
    })
}

//新增產品
const createProduct = async()=>{
  try {
    //因為tempProduct外層有data(六角原始API資料格式)，所以要帶入data，並將以下屬性轉為數字型別和判斷是否啟用(上面tempProduct預設為字串)
    const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,
      {data:{
        ...tempProduct,
        origin_price:Number(tempProduct.origin_price),
        price:Number(tempProduct.price),
        is_enabled: tempProduct.is_enabled ? 1 : 0
      }
      });
    console.log(res)
  } catch (error) {
    alert("新增產品失敗")
  }
}
//編輯產品
const updateProduct = async()=>{
  try {
    const res = await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,
      {data:{
        ...tempProduct,
        origin_price:Number(tempProduct.origin_price),
        price:Number(tempProduct.price),
        is_enabled: tempProduct.is_enabled ? 1 : 0
      }
      });
    console.log(res)
  } catch (error) {
    alert("編輯產品失敗")
  }
}

//刪除產品
const deleteProduct = async()=>{
  try {
    const res = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`);
    console.log(res)
  } catch (error) {
    alert("刪除產品失敗")
  }
}

//按確認時，呼叫新增產品API，並綁定在確認按鈕上
const handleUpdateProduct= async () => {
  //因為共用 Modal，所以要先判斷是新增或編輯，再去呼叫相對應的函式
  const apiCall = modalMode ==="create" ? createProduct : updateProduct;
  try{
    await apiCall();
    //新增成功後，重新渲染產品列表
    getProducts();
    //新增成功後，關閉modal
    handleCloseproductModal();

  }catch(error){
    alert("更新產品失敗")
  }
}
//按刪除時，呼叫刪除產品API，並綁定在刪除按鈕上
const handleDeleteProduct= async () => {
  try{
    await deleteProduct();
    //新增成功後，重新渲染產品列表
    getProducts();
    //新增成功後，關閉modal
    handleCloseDelProductModal();

  }catch(error){
    alert("刪除產品失敗")
  }
}

//分頁資訊
const [pageInfo, setPageInfo] = useState({});

const handlePageChange=(page)=>{
  getProducts(page);
}

//圖片上傳
const handleFileChange = async (e) => {
  //可映出input的files資料
  //console.log(e.target.files);
  const file = e.target.files[0];
  
  const formData = new FormData();
  //file-to-upload是六角圖片API的值
  formData.append("file-to-upload", file);
  //console.log(formData);
  //console.log([...formData.entries()]);

  try {
   const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/upload`, formData);
   const uploadedImageUrl = res.data.imageUrl;
   setTempProduct({
    ...tempProduct,
    //注意：這邊是imageUrl不是imagesUrl，否則會因為型態改變(上方imageUrl預設為字串不是陣列)導致imagesUrl的map出錯
    imageUrl: uploadedImageUrl
  })
  console.log(res);
  } 
  catch (error) {

  }

}

  return (
    <>
      {isAuth ? (
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
            {/*分頁功能*/}
            <div className="d-flex justify-content-center">
              <nav>
                <ul className="pagination">
                  {/*當 pageInfo.has_pre 為 false → className="page-item disabled"（按鈕變灰，無法點擊）。*/}
                  <li className={`page-item ${pageInfo.has_pre ? "" : "disabled"}`}>
                    <a onClick={()=>handlePageChange(pageInfo.current_page-1)} className="page-link" href="#">
                      上一頁
                    </a>
                  </li>

                   {/*index+1：因為陣列從0開始，此處的li為目前頁面*/}
                  {Array.from({ length: pageInfo.total_pages }).map((_, index) => (
                     <li className={`page-item ${pageInfo.current_page === index+1 ? "active" : ""}`}>
                     <a onClick={()=>handlePageChange(index+1)} className="page-link" href="#">
                       {index+1}
                     </a>
                   </li>
                  ))}
                  
                  <li className={`page-item ${pageInfo.has_next ? "" : "disabled"}`}>
                    <a onClick={()=>handlePageChange(pageInfo.current_page+1)} className="page-link" href="#">
                      下一頁
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                name="username"
                value={account.username}
                onChange={handleInputChange}
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                name="password"
                value={account.password}
                onChange={handleInputChange}
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}

      {/*產品模板 Modal */}
      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              {/*判斷新增還是編輯modal */}
              <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5>
              {/*將關閉modal加入編輯按鈕的點擊事件 */}
              <button onClick={handleCloseproductModal} type="button" className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                
                {/*圖片上傳模板*/}
                <div className="mb-5">
                  <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="form-control"
                    id="fileInput"
                    onChange={handleFileChange}
                  />
                </div>

                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                      //在各個 input綁上value和監聽事件
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          //帶入綁定Modal多圖事件
                          value={image}
                          onChange={(e) => handleImageChange(e,index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}

                  {/*撰寫產品 Modal 多圖按鈕顯示邏輯 */}
                  <div className="btn-group w-100">
                    {/*新增按鈕顯示條件：- 最後一個欄位有值且未達上限時顯示預設圖片上限為 5張，點擊時對陣列新增一個空字串 */}
                    {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !=="" && (
                        <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button> )}
                    
                    {/*取消按鈕顯示條件：多圖陣列有值且長度大於1時顯示，點擊時對陣列刪除最後一個值 */}
                    {tempProduct.imagesUrl.length > 1 && (<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                  </div>

                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                                   
                    <input
                     //在各個 input綁上value和監聽事件
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                    //在各個 input綁上value和監聽事件
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                    //在各個 input綁上value和監聽事件                   
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                       //在各個 input綁上value和監聽事件
                       value={tempProduct.origin_price}
                       onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                       //在各個 input綁上value和監聽事件
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                    //在各個 input綁上value和監聽事件
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                    //在各個 input綁上value和監聽事件
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                     //在各個 input綁上value和監聽事件
                     //因為是checkbox，所以要用checked來判斷是否勾選
                     checked={tempProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              {/*將關閉modal加入編輯按鈕的點擊事件 */}
              <button onClick={handleCloseproductModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*加入刪除產品 Modal*/}

      <div
      ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
               onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除 
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
              onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDeleteProduct} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>

    
    </>
  );
}


export default App;
