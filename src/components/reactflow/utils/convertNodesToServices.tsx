export const convertNodesToServices = (nodes: any[]) => {
  return nodes
    .filter(node => node && node.data)
    .map(({ data }) => {
      const { onClick, ...cleanedData } = data
      return cleanedData
    })
}
