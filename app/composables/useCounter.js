export const useCounter = () => {
  const count = useState('count', () => 0)
  return { count }
}
