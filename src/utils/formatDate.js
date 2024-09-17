  // 日期格式化為 yyyy-mm-dd
  export function formatDate(date) {
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }