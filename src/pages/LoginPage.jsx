import { useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;


//登入頁面
//因為其他頁面也會用到getProducts，使用 props方式帶入
function LoginPage({ getProducts,setIsAuth}) {

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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);

      const { token, expired } = res.data;
      document.cookie = `angelaToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common["Authorization"] = token;

      //getProducts();

      setIsAuth(true);
      
    } catch (error) {
      alert("登入失敗");
    }
  };

  //檢查使用者是否已登入
  // const checkUserLogin = async () => {
  //   try {
  //     await axios.post(`${BASE_URL}/v2/api/user/check`);     
      //取得產品資料
      // getProducts();
      //登入頁面是根據isAuth來渲染，所以使用setIsAuth(true)，讓使用者登入後即顯示產品頁面
      //setIsAuth(true);
     
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
    //只需要執行一次登入驗證API，所以不需要傳入參數，為空陣列
  //useEffect(() => {
    //把token存在cookie
    // const token = document.cookie.replace(
    //   /(?:(?:^|.*;\s*)angelaToken\s*\=\s*([^;]*).*$)|^.*$/,
    //   "$1",
    // );
    //將token帶到axios上
    //axios.defaults.headers.common['Authorization'] = token;
    //執行checkUserLogin來戳API
  //   checkUserLogin();
   
  // },[])




  return(
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
  )
}

export default LoginPage;