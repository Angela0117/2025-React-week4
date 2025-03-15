import { useRef, useEffect, useState, use } from "react";
import axios from "axios";
import { Modal } from 'bootstrap'; 

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;


//產品Modal
//參數如果只有在modal中才會用到的不用傳，例：{handleCloseProductModal}、{productModalRef}

function ProductModal({
  modalMode,
  tempProduct,
  isOpen,
  setIsOpen,
  getProducts
}) {

  //避免modal改到temproduct,預設值為tempProduct，再將以下部分原先為tempProduct的部分改為modalData
  const [modalData, setModalData] = useState(tempProduct);
  
  //當tempProduct更新時，將tempProduct的值帶入modalData
  useEffect(() => {
    setModalData({
      ...tempProduct
    });
  }, [tempProduct]);

  //透過 useRef 取得 DOM 元素，預設值為 null
    const productModalRef = useRef(null);

    useEffect(() => {
      
    //建立 Modal 實例,可透過 new Modal(ref) 建立
    new Modal(productModalRef.current,{
      //在modal外的空白處點擊不會關閉modal
      backdrop: false
    });
      
    },[]);

    useEffect(() => {
      //當isOpen為true時，打開modal

      if(isOpen){
        const modalInstance = Modal.getInstance(productModalRef.current);
        modalInstance.show();
      }
    },[isOpen])//當isOpen更新時，判斷需不需要打開modal

  //透過Modal.getInstance(ref).hide來關閉
    const handleCloseProductModal = () => {
      const modalInstance = Modal.getInstance(productModalRef.current);
      modalInstance.hide();

      //因為父層setIsProductModalOpen是true(在ProductPages)，所以透過setIsOpen改為false

      setIsOpen(false);
    }

    const handleModalInputChange = (e) => {
      //value：綁定 input 的值，checked：綁定 input 是否勾選的狀態，type：綁定 input 的類型是否為checkbox
      const { value, name, checked, type } = e.target;
      //透過對應的 name 修改欄位的值
      setModalData({
        ...modalData,
        //若type為checkbox，則將checked的值帶入，否則帶入value的值
        [name]: type === "checkbox" ? checked : value
      })
    }
    
    //多筆欄位，需要判斷是哪一筆陣列(副圖)在更新圖片,所以帶入index
    const handleImageChange=(e,index)=>{
      const { value } = e.target;
      //將modalData.imagesUrl的值複製一份
      const newImages = [...modalData.imagesUrl];
      //透過index來更新對應的圖片的值
      newImages[index] = value;
      setModalData({
        ...modalData,
        imagesUrl: newImages
      })
    
    }
    
    
      //新增圖片
    const handleAddImage=()=>{
      //複製一個Images陣列，並在最後一個位置加入空字串
      const newImages = [...modalData.imagesUrl,""];
      
      setModalData({
        ...modalData,
        imagesUrl: newImages
      })
    }
    
      //取消圖片
      const handleRemoveImage=()=>{
        const newImages = [...modalData.imagesUrl];
        
        //從陣列最後一個值移除
        newImages.pop();
    
        ProductsetTemp({
          ...modalData,
          imagesUrl: newImages
        })
    }
    //新增產品
  const createProduct = async()=>{
    try {
      //因為modalData外層有data(六角原始API資料格式)，所以要帶入data，並將以下屬性轉為數字型別和判斷是否啟用(上面modalData預設為字串)
      const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,
        {data:{
          ...modalData,
          origin_price:Number(modalData.origin_price),
          price:Number(modalData.price),
          is_enabled: modalData.is_enabled ? 1 : 0
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
        const res = await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${modalData.id}`,
          {data:{
            ...modalData,
            origin_price:Number(modalData.origin_price),
            price:Number(modalData.price),
            is_enabled: modalData.is_enabled ? 1 : 0
          }
          });
        console.log(res)
      } catch (error) {
        alert("編輯產品失敗")
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
        handleCloseProductModal();

      }catch(error){
        alert("更新產品失敗")
      }
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
        setModalData({
          ...modalData,
          //注意：這邊是imageUrl不是imagesUrl，否則會因為型態改變(上方imageUrl預設為字串不是陣列)導致imagesUrl的map出錯
          imageUrl: uploadedImageUrl
        })
        console.log(res);
        } 
        catch (error) {
        }
    }
    




  return(
    <>
     <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              {/*判斷新增還是編輯modal */}
              <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5>
              {/*將關閉modal加入編輯按鈕的點擊事件 */}
              <button onClick={handleCloseProductModal} type="button" className="btn-close" aria-label="Close"></button>
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
                        value={modalData.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={modalData.imageUrl}
                      alt={modalData.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {modalData.imagesUrl?.map((image, index) => (
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
                    {modalData.imagesUrl.length < 5 && modalData.imagesUrl[modalData.imagesUrl.length - 1] !=="" && (
                        <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button> )}
                    
                    {/*取消按鈕顯示條件：多圖陣列有值且長度大於1時顯示，點擊時對陣列刪除最後一個值 */}
                    {modalData.imagesUrl.length > 1 && (<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
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
                      value={modalData.title}
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
                      value={modalData.category}
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
                      value={modalData.unit}
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
                        value={modalData.origin_price}
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
                        value={modalData.price}
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
                      value={modalData.description}
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
                      value={modalData.content}
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
                      checked={modalData.is_enabled}
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
              <button onClick={handleCloseProductModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductModal;