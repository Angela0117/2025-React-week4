//刪除產品 Modal

import { useRef, useEffect } from "react";
import axios from "axios";
import { Modal } from 'bootstrap'; 

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function DelProductModal({
  tempProduct,
  isOpen,
  setIsOpen,
  getProducts,
}){

  const delProductModalRef = useRef(null);

  useEffect(() => {
      //撰寫 Modal 開關方法,可透過 Modal.getInstance(ref) 取得實例
      new Modal(delProductModalRef.current,{
        //在modal外的空白處點擊不會關閉modal
        backdrop: false
      })
      
    },[]);

    useEffect(() => {
      //當isOpen為true時，打開modal

      if(isOpen){
        const modalInstance = Modal.getInstance(delProductModalRef.current);
        modalInstance.show();
      }
    },[isOpen])//當isOpen更新時，判斷需不需要打開modal
  

  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();

    setIsOpen(false);
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
  return(
     
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
  )
}

export default DelProductModal;