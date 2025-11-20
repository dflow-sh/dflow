import axios from 'axios'

const updateRailpack = async () => {
  const res = await axios.get(
    'https://api.github.com/repos/railwayapp/railpack/releases/latest',
  )

  return res.data.tag_name.replace('v', '')
}

export default updateRailpack
