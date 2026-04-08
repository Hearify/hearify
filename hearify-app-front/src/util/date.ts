export function formatDate(date: any) {
  const d = new Date(date);

  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export const formatDateTime = (date: any) => {
  const d = new Date(date);

  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};

export const formatTime = (date: any) => {
  const d = new Date(date);

  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};
