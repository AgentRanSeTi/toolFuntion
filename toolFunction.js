/**
 * @function filterNonEmptyFields
 * @param {Object} value - 包含表单字段值的对象
 * @returns {Object} 仅包含非空表单字段值的对象
 * @description 该函数接收一个包含表单字段值的对象，并返回一个新对象，其中只包含非空字段值。
 */
export const filterNonEmptyFields = (value) => {
  return Object.entries(value).reduce((acc, [key, value]) => {
    const isTrue = value !== null && value !== undefined && value !== '' && !isNaN(value)
    if (isTrue) {
      acc[key] = value
    }
    return acc
  }, {})
}

/**
 * @function debounce
 * @param {Function} func 目标函数
 * @param {number} wait 延迟执行毫秒数
 * @param {boolean} [immediate] true 表立即执行,false 表非立即执行
 * @desc 函数防抖
 */
export const debounce = (func, wait, immediate) => {
  let timeout, args, context, timestamp, result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为立即执行，则通过新穿构造的 result 来执行函数
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * 将一维数组转换为树形数据结构
 * @function arrToTree
 * @param {Object} params - 转换参数
 * @param {Array} params.data - 原始一维数组
 * @param {string} [params.id='id'] - 用作唯一标识的属性名
 * @param {string} [params.pid='parentId'] - 父级标识的属性名
 * @param {string} [params.children='children'] - 子节点的属性名
 * @param {function|null} [params.callback=null] - 转换过程中的自定义回调函数
 * @returns {Array} - 树形数据结构
 * @description 将一维数组转换为树形数据结构,支持自定义属性名和回调函数。回调函数可用于在转换过程中添加自定义属性值。
 */
export const arrToTree = (params) => {
  const { data, id = 'id', pid = 'parentId', children = 'children', callback = null } = params
  const result = []
  const map = {}

  // 先将数据转换为map结构,并调用回调函数添加自定义值
  data.forEach((item) => {
    const mapItem = { ...item }
    if (typeof callback === 'function') {
      callback(mapItem)
    }
    map[item[id]] = mapItem
  })

  // 遍历数据,将每个节点添加到对应父节点的children中
  data.forEach((item) => {
    const parent = map[item[pid]]
    if (parent) {
      const list = parent[children] || (parent[children] = [])
      list.push(map[item[id]])
    } else {
      result.push(map[item[id]])
    }
  })

  return result
}

/**
 * @function findNodes
 * @param {Array} treeData 树形数据结构
 * @param {Function} matcher 匹配函数,用于判断是否为目标节点
 * @param {String} childrenKey 子节点的属性名
 * @returns {Array} 查找到的节点数组
 * @description 从树形数据结构中查找节点
 */
export const findNodes = (treeData, matcher, childrenKey = 'children') => {
  const result = []

  const traversal = (nodes) => {
    for (let node of nodes) {
      if (matcher(node)) {
        result.push(node)
      }

      if (node[childrenKey]) {
        traversal(node[childrenKey])
      }
    }
  }

  traversal(treeData)
  return result
}

/**
 * @function findNodeParents
 * @param {Array} tree - 树形结构的数据数组
 * @param {Function} callback - 用于判断节点是否满足条件的回调函数
 * @returns {Array} 包含满足条件节点及其父节点路径的数组
 * @description 该函数接收一个树形结构的数据数组和一个回调函数。它使用深度优先搜索（DFS）遍历树，找到满足回调函数条件的节点，并返回一个包含这些节点及其父节点路径的数组。
 */
export const findNodeParents = (tree, callback) => {
  const result = []

  const dfs = (nodes, parents = []) => {
    for (const node of nodes) {
      const currentPath = [...parents, node]
      if (callback(node)) {
        result.push(currentPath)
      }
      if (node.children && node.children.length > 0) {
        dfs(node.children, currentPath)
      }
    }
  }

  dfs(tree)
  return result
}

/**
 * @function getNodeLevel
 * @param {Array} tree - 树形结构的数据数组
 * @param {Function} callback - 用于判断节点是否满足条件的回调函数
 * @returns {number|null} 如果找到满足条件的节点，返回该节点的层级；否则返回 null
 * @description 该函数接收一个树形结构的数据数组和一个回调函数。它使用深度优先搜索（DFS）遍历树，找到第一个满足回调函数条件的节点，并返回该节点所在的层级。如果没有找到满足条件的节点，则返回 null。
 */
export const getNodeLevel = (tree, callback) => {
  const findLevel = (nodes, level = 1) => {
    for (const node of nodes) {
      if (callback(node)) {
        return level
      }

      if (node.children && node.children.length > 0) {
        const childLevel = findLevel(node.children, level + 1)
        if (childLevel !== null) {
          return childLevel
        }
      }
    }

    return null
  }

  return findLevel(tree)
}

/**
 * @function deepClone
 * @param {any} source 要拷贝的源数据
 * @param {Map} [cache] 用于存储循环引用对象的地址
 * @returns {any} 拷贝后的新数据
 * @description 深拷贝函数
 */
export const deepClone = (source, cache = new Map()) => {
  // 判断源数据的类型
  const isObject = (obj) => typeof obj === 'object' && obj !== null

  // 如果是基本数据类型,直接返回
  if (!isObject(source)) return source

  // 如果是日期对象,则返回新的日期对象
  if (source instanceof Date) return new Date(source)

  // 如果是正则对象,则返回新的正则对象
  if (source instanceof RegExp) return new RegExp(source)

  // 如果是函数对象,则返回新的函数对象
  if (typeof source === 'function') return new Function(`return ${source.toString()}`)

  // 处理循环引用
  if (cache.has(source)) {
    return cache.get(source)
  }

  // 获取源数据的构造函数
  const constructor = source.constructor

  // 创建新的目标对象/数组
  const target = new constructor()

  // 缓存源数据,用于处理循环引用
  cache.set(source, target)

  // 如果是 Set 类型,则遍历 Set 拷贝数据
  if (constructor === Set) {
    source.forEach((value) => {
      target.add(deepClone(value, cache))
    })
    return target
  }

  // 如果是 Map 类型,则遍历 Map 拷贝数据
  if (constructor === Map) {
    source.forEach((value, key) => {
      target.set(key, deepClone(value, cache))
    })
    return target
  }

  // 如果是普通对象或数组,则递归拷贝
  for (let key in source) {
    if (Object.hasOwnProperty.call(source, key)) {
      target[key] = deepClone(source[key], cache)
    }
  }

  return target
}

/**
 * @function processNodes
 * @param {Array} nodes - 原始的树形结构数据
 * @param {string} [label='label'] - 用于表示节点标签的属性名
 * @param {string} [value='value'] - 用于表示节点值的属性名
 * @returns {Array} 转换后的树形结构数据
 * @description 将树形结构数据转换为指定的 label 和 value 结构
 */
export const processNodes = (nodes, label = 'label', value = 'value') => {
  // 参数类型检查
  if (!Array.isArray(nodes)) {
    throw new Error('nodes must be an array')
  }
  if (typeof label !== 'string') {
    throw new Error('label must be a string')
  }
  if (typeof value !== 'string') {
    throw new Error('value must be a string')
  }

  // 处理空数组
  if (nodes.length === 0) {
    return []
  }

  const processNode = (node) => {
    // 处理空对象
    if (!node || typeof node !== 'object') {
      return null
    }

    const newNode = {
      value: node[value],
      label: node[label]
    }

    if (node.children && node.children.length > 0) {
      newNode.children = node.children.map(processNode)
    }

    return newNode
  }

  return nodes.map(processNode)
}

/**
 * @function clearObjectValues
 * @param {Object} obj - 要处理的对象
 * @returns {Object} 处理后的对象
 * @description 将对象中的所有值置空
 */
export const clearObjectValues = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(() => null)
  }

  const result = {}
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      result[key] = clearObjectValues(obj[key])
    } else {
      result[key] = null
    }
  }

  return result
}

/**
 * @function unique
 * @param {Array} data - 要去重的数组
 * @param {string|number|symbol|undefined} [key] - 用于比较的键值,如果不传则使用整个对象进行比较
 * @returns {Array} - 去重后的数组
 * @description 要去重的数组
 */
export const unique = (data, key) => {
  if (!Array.isArray(data) || data.length === 0) {
    return data
  }

  const map = new Map()
  const result = []

  for (const item of data) {
    const itemKey = key ? item[key] : item
    if (!map.has(itemKey)) {
      map.set(itemKey, true)
      result.push(item)
    }
  }

  return result
}

/**
 * @function isEmpty
 * @param {Array|Object} obj - 要检查的数组或对象
 * @returns {boolean} - 如果数组或对象为空,返回 true,否则返回 false
 * @description 检查数组或对象是否为空
 */
export const isEmpty = (obj) => {
  if (Array.isArray(obj)) {
    return obj.length === 0
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).length === 0
  } else {
    return false
  }
}

/**
 * @function getFromLocalStorage
 * @param {string} key - 从 localStorage 中获取数据的键
 * @return {any|null} 从 localStorage 中解析的数据,如果发生错误则返回 null
 * @description 从 localStorage 中获取数据,将其解析为 JSON,并返回解析后的数据。如果发生错误,将记录错误并返回 null。
 */
export const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('从 localStorage 中获取数据时发生错误:', err)
    return null
  }
}

/**
 * @function saveToLocalStorage
 * @param {string} key - 将数据保存到 localStorage 的键
 * @param {any} data - 要保存到 localStorage 的数据
 * @description 将提供的数据保存到 localStorage,并将其序列化为 JSON。如果发生错误,将记录错误信息。
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error('将数据保存到 localStorage 时发生错误:', err)
  }
}

/**
 * @function removeFromLocalStorage
 * @param {string} key - 要从 localStorage 中删除的键名
 * @returns {void}
 * @description 从浏览器的 localStorage 中删除指定的键值对
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error('Error removing item from localStorage:', err)
  }
}

/**
 * @function clearStorage
 * @returns {void}
 * @description 清空当前应用的全部缓存数据
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
    console.log('所有缓存已清空')
  } catch (e) {
    console.error('清空缓存失败:', e)
  }
}
