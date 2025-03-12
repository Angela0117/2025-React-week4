//分頁功能
function Pagination(){
  return(
    
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
              <li key={index} className={`page-item ${pageInfo.current_page === index+1 ? "active" : ""}`}>
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
  )

}

export default Pagination;