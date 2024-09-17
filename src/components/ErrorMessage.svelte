<script>
    export let message = "發生錯誤，請嘗試返回首頁看看。"; // 默認的錯誤訊息
  </script>
  
  <style>
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      font-size: 6rem;
      font-weight: bold;
      color: white; /* 使用 Tailwind 的黃色 */
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-image: url('/images/background.webp'); /* 背景圖片 */
      text-align: center;
    }
  </style>
  
  <p class="error-container">{message}</p>